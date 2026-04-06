/**
 * MercadoRural — Google Places Scraper for Rural Service Providers
 *
 * HOW TO GET REQUIRED CREDENTIALS
 * ================================
 *
 * 1. GOOGLE_PLACES_API_KEY
 *    - Go to https://console.cloud.google.com/
 *    - Create or select a project
 *    - Navigate to "APIs & Services" → "Library"
 *    - Enable "Places API" (not Places API (New) — use the classic one)
 *    - Go to "APIs & Services" → "Credentials" → "Create Credentials" → "API Key"
 *    - Optionally restrict the key to "Places API" under API restrictions
 *    - Copy the key into your .env.local as GOOGLE_PLACES_API_KEY=...
 *
 * 2. NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *    - Go to https://supabase.com/dashboard and open your project
 *    - Navigate to "Project Settings" → "API"
 *    - Copy "Project URL" → NEXT_PUBLIC_SUPABASE_URL
 *    - Under "Project API Keys", copy the "service_role" key (NOT anon/public)
 *      WARNING: the service_role key bypasses Row Level Security — keep it secret!
 *    - Add both to your .env.local
 *
 * HOW TO RUN
 * ==========
 *    bash scripts/run-scraper.sh
 *
 * Or directly:
 *    npx ts-node --project tsconfig.scripts.json scripts/scrape-providers.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// ─── Config ──────────────────────────────────────────────────────────────────

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GOOGLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "Missing required env vars: GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DELAY_MS = 200;

// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORIES: { query: string; slug: string }[] = [
  { query: "veterinário", slug: "veterinario" },
  { query: "inseminador", slug: "inseminador" },
  { query: "nutricionista animal", slug: "nutricionista-animal" },
  { query: "controle de pragas rural", slug: "controle-pragas" },
  { query: "agrônomo", slug: "agronomo" },
  { query: "cortador de cana", slug: "cortador-cana" },
  { query: "análise de solo", slug: "analise-solo" },
  { query: "pulverização agrícola", slug: "pulverizacao" },
  { query: "mecânico de trator", slug: "mecanico-trator" },
  { query: "eletricista rural", slug: "eletricista-rural" },
  { query: "cercador rural", slug: "cercador" },
  { query: "poço artesiano irrigação", slug: "poco-irrigacao" },
  { query: "terraplanagem rural", slug: "terraplanagem" },
  { query: "diarista rural", slug: "diarista-rural" },
  { query: "vaqueiro peão", slug: "vaqueiro" },
  { query: "carpinteiro rural", slug: "carpinteiro-rural" },
  { query: "pedreiro rural", slug: "pedreiro-rural" },
  { query: "transporte de gado", slug: "transporte-gado" },
  { query: "transporte de grãos", slug: "transporte-graos" },
  { query: "transporte de máquinas agrícolas", slug: "transporte-maquinas" },
  { query: "contador rural", slug: "contador-rural" },
  { query: "topógrafo rural", slug: "topografo" },
  { query: "operador de drone agrícola", slug: "drone" },
  { query: "licença ambiental CAR", slug: "licenca-ambiental" },
];

// ─── Cities ───────────────────────────────────────────────────────────────────

const CITIES: { name: string; state: string }[] = [
  // São Paulo
  { name: "Ribeirão Preto", state: "SP" },
  { name: "Sertãozinho", state: "SP" },
  { name: "Jaboticabal", state: "SP" },
  { name: "Barretos", state: "SP" },
  { name: "Franca", state: "SP" },
  { name: "Bebedouro", state: "SP" },
  { name: "Olímpia", state: "SP" },
  { name: "São Carlos", state: "SP" },
  { name: "Araraquara", state: "SP" },
  { name: "Bauru", state: "SP" },
  { name: "Jaú", state: "SP" },
  { name: "Botucatu", state: "SP" },
  { name: "Presidente Prudente", state: "SP" },
  { name: "Marília", state: "SP" },
  { name: "Araçatuba", state: "SP" },
  { name: "São José do Rio Preto", state: "SP" },
  { name: "Votuporanga", state: "SP" },
  { name: "Fernandópolis", state: "SP" },
  // Minas Gerais
  { name: "Uberaba", state: "MG" },
  { name: "Uberlândia", state: "MG" },
  { name: "Araguari", state: "MG" },
  { name: "Patos de Minas", state: "MG" },
  { name: "Ituiutaba", state: "MG" },
  { name: "Frutal", state: "MG" },
  { name: "Sacramento", state: "MG" },
  { name: "Araxá", state: "MG" },
  { name: "Patrocínio", state: "MG" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Strip country code (+55), spaces, dashes, parentheses.
 * Returns digits only (10 or 11 digits for Brazilian numbers).
 */
function cleanPhone(raw: string): string | null {
  // Remove all non-digit characters
  let digits = raw.replace(/\D/g, "");

  // Remove leading country code 55
  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }

  // Accept only 10 or 11 digit numbers
  if (digits.length === 10 || digits.length === 11) {
    return digits;
  }

  return null;
}

// ─── Google Places API ───────────────────────────────────────────────────────

interface PlaceSearchResult {
  place_id: string;
  name: string;
}

interface PlaceDetails {
  name: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
}

async function textSearch(
  query: string
): Promise<PlaceSearchResult[]> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/textsearch/json"
  );
  url.searchParams.set("query", query);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("key", GOOGLE_API_KEY!);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Text Search HTTP ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    status: string;
    results: PlaceSearchResult[];
    error_message?: string;
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(
      `Text Search API error: ${data.status} — ${data.error_message ?? ""}`
    );
  }

  return data.results ?? [];
}

async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,formatted_phone_number,international_phone_number");
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("key", GOOGLE_API_KEY!);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Place Details HTTP ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    status: string;
    result?: PlaceDetails;
    error_message?: string;
  };

  if (data.status !== "OK") {
    // Not found or no details — skip silently
    return null;
  }

  return data.result ?? null;
}

// ─── Database helpers ─────────────────────────────────────────────────────────

async function providerExists(name: string, city: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("providers")
    .select("id")
    .eq("name", name)
    .eq("city", city)
    .limit(1);

  if (error) {
    throw new Error(`Supabase select error: ${error.message}`);
  }

  return (data?.length ?? 0) > 0;
}

async function insertProvider(record: {
  name: string;
  city: string;
  whatsapp: string;
  category_slug: string;
  bio: string;
  status: string;
  verified: boolean;
  avg_rating: number;
  review_count: number;
}): Promise<void> {
  const { error } = await supabase.from("providers").insert(record);
  if (error) {
    throw new Error(`Supabase insert error: ${error.message}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function scrape(): Promise<void> {
  let total = 0;
  let skipped = 0;
  let errors = 0;

  for (const city of CITIES) {
    for (const category of CATEGORIES) {
      const searchQuery = `${category.query} ${city.name} ${city.state}`;

      try {
        const places = await textSearch(searchQuery);
        await sleep(DELAY_MS);

        for (const place of places) {
          try {
            // Check for duplicate before fetching details (saves API quota)
            const exists = await providerExists(place.name, city.name);
            if (exists) {
              skipped++;
              continue;
            }

            // Fetch phone number from Place Details
            const details = await getPlaceDetails(place.place_id);
            await sleep(DELAY_MS);

            const rawPhone =
              details?.formatted_phone_number ??
              details?.international_phone_number ??
              "";

            const whatsapp = cleanPhone(rawPhone);
            if (!whatsapp) {
              // No usable phone — skip
              continue;
            }

            await insertProvider({
              name: place.name,
              city: city.name,
              whatsapp,
              category_slug: category.slug,
              bio: "",
              status: "pending",
              verified: false,
              avg_rating: 0,
              review_count: 0,
            });

            console.log(
              `✓ ${place.name} — ${category.query} — ${city.name}`
            );
            total++;
          } catch (placeErr) {
            errors++;
            console.error(
              `  ✗ Error processing "${place.name}" (${city.name}):`,
              (placeErr as Error).message
            );
          }
        }
      } catch (comboErr) {
        errors++;
        console.error(
          `✗ Failed combination [${category.slug}] × [${city.name}]:`,
          (comboErr as Error).message
        );
      }
    }
  }

  console.log(
    `\nDone. Inserted: ${total} | Skipped duplicates: ${skipped} | Errors: ${errors}`
  );
}

scrape().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
