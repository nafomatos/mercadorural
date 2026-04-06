import { createClient } from "@supabase/supabase-js";
import { CITY_GROUPS } from "@/lib/cities";

// Allow up to 5-minute execution on Vercel Pro/Enterprise
export const maxDuration = 300;

// ─── Category slug → Portuguese search query ──────────────────

const CATEGORY_QUERIES: Record<string, string> = {
  insumos:       "loja insumos agrícolas agropecuária",
  maquinas:      "revendedora máquinas implementos agrícolas tratores",
  pecuaria:      "veterinário pecuária fazenda bovinos",
  graos:         "armazém cereais grãos cooperativa agrícola",
  servicos:      "serviços rurais agropecuária assistência técnica",
  imoveis:       "imóveis rurais fazendas sítios corretor",
  organicos:     "agricultura orgânica produtos orgânicos fazenda",
  "aves-suinos": "avicultura suinocultura granja aves suínos",
};

// ─── City → state abbreviation ─────────────────────────────────

const CITY_STATE: Record<string, string> = {};
for (const g of CITY_GROUPS) {
  const abbr = g.state === "São Paulo" ? "SP" : "MG";
  for (const c of g.cities) CITY_STATE[c] = abbr;
}

// ─── Supabase admin client (service role, bypasses RLS) ────────

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Helpers ───────────────────────────────────────────────────

function cleanPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.replace(/\D/g, "");
  // Strip Brazilian country code if present (55 + 10/11 digits = 12/13 digits total)
  if (d.startsWith("55") && d.length > 11) d = d.slice(2);
  if (d.length < 10 || d.length > 11) return null;
  return d;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Google Places API calls ────────────────────────────────────

async function textSearch(
  query: string,
  apiKey: string
): Promise<Array<{ place_id: string; name: string }>> {
  const url =
    `https://maps.googleapis.com/maps/api/place/textsearch/json` +
    `?query=${encodeURIComponent(query)}&key=${apiKey}&language=pt-BR&region=br`;

  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    results?: Array<{ place_id: string; name: string }>;
  };

  if (data.status === "ZERO_RESULTS") return [];
  if (data.status !== "OK") {
    throw new Error(
      `${data.status}${data.error_message ? ": " + data.error_message : ""}`
    );
  }
  // Cap at 3 results per query
  return (data.results ?? []).slice(0, 3).map((r) => ({
    place_id: r.place_id,
    name: r.name,
  }));
}

async function getPlacePhone(
  placeId: string,
  apiKey: string
): Promise<string | null> {
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=formatted_phone_number,international_phone_number` +
    `&key=${apiKey}&language=pt-BR`;

  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json()) as {
    status: string;
    result?: {
      formatted_phone_number?: string;
      international_phone_number?: string;
    };
  };

  if (data.status !== "OK") return null;
  return (
    data.result?.formatted_phone_number ??
    data.result?.international_phone_number ??
    null
  );
}

// ─── POST handler ───────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({})) as {
    category_slug?: string;
    city?: string;
  };

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return new Response(
      "✗ GOOGLE_PLACES_API_KEY não configurada no ambiente.\n",
      { status: 500 }
    );
  }

  const db = getAdminClient();

  // Resolve which category slugs to run
  const { data: catRows } = await db
    .from("service_categories")
    .select("slug, name_pt")
    .order("order_index");

  const allCats = (catRows ?? []) as { slug: string; name_pt: string }[];
  const catsToRun = body.category_slug
    ? allCats.filter((c) => c.slug === body.category_slug)
    : allCats;

  // Resolve which cities to run
  const citiesToRun = body.city ? [body.city] : Object.keys(CITY_STATE);

  // Build job list
  type Job = { query: string; slug: string; city: string; catName: string };
  const jobs: Job[] = [];
  for (const { slug, name_pt } of catsToRun) {
    const queryTerm = CATEGORY_QUERIES[slug] ?? name_pt;
    for (const city of citiesToRun) {
      const state = CITY_STATE[city] ?? "";
      jobs.push({
        query: `${queryTerm} ${city} ${state}`.trim(),
        slug,
        city,
        catName: name_pt,
      });
    }
  }

  const enc = new TextEncoder();
  let inserted = 0;
  let skipped = 0;

  const stream = new ReadableStream({
    async start(ctrl) {
      const log = (line: string) =>
        ctrl.enqueue(enc.encode(line + "\n"));

      try {
        log(`→ ${jobs.length} combinações agendadas · máx. ${jobs.length * 3} prestadores`);
        log(`────────────────────────────────────────`);

        for (const job of jobs) {
          log(`\n→ Buscando: "${job.query}"`);

          let places: Array<{ place_id: string; name: string }>;
          try {
            places = await textSearch(job.query, apiKey);
            await delay(200);
          } catch (err) {
            log(`✗ Erro API: ${err}`);
            continue;
          }

          if (places.length === 0) {
            log(`ℹ Sem resultados.`);
            continue;
          }
          log(`ℹ ${places.length} resultado(s).`);

          for (const place of places) {
            // Place Details → phone number
            let rawPhone: string | null = null;
            try {
              rawPhone = await getPlacePhone(place.place_id, apiKey);
              await delay(200);
            } catch {
              // ignore — phone stays null
            }

            const phone = cleanPhone(rawPhone);
            if (!phone) {
              log(`✗ ${place.name} — sem telefone válido`);
              skipped++;
              continue;
            }

            // Duplicate check: same name (case-insensitive) + same city
            const { data: dup } = await db
              .from("providers")
              .select("id")
              .ilike("name", place.name)
              .eq("city", job.city)
              .maybeSingle();

            if (dup) {
              log(`⚠ Skipped: ${place.name} — duplicado`);
              skipped++;
              continue;
            }

            // Insert as pending
            const { error } = await db.from("providers").insert({
              name:          place.name,
              whatsapp:      phone,
              city:          job.city,
              category_slug: job.slug,
              bio:           null,
              verified:      false,
              status:        "pending",
            });

            if (error) {
              log(`✗ Erro ao inserir ${place.name}: ${error.message}`);
              skipped++;
            } else {
              log(`✓ ${place.name} — ${job.catName} — ${job.city}`);
              inserted++;
            }
          }
        }

        log(`\n────────────────────────────────────────`);
        log(`TOTAL:inserted=${inserted},skipped=${skipped}`);
        log(`✓ Concluído: ${inserted} inserido(s), ${skipped} ignorado(s).`);
      } catch (err) {
        log(`\n✗ Erro inesperado: ${err}`);
        log(`TOTAL:inserted=${inserted},skipped=${skipped}`);
      } finally {
        ctrl.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no", // disable nginx/proxy buffering
    },
  });
}
