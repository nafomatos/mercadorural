import Link from "next/link";
import { supabase, type Provider, type ServiceCategory } from "@/lib/supabase";
import SearchBar from "@/app/components/SearchBar";
import CategoryFilterBar from "./CategoryFilterBar";
import CityFilterSelect from "./CityFilterSelect";

// Always fetch fresh data — never serve a stale cached page
export const dynamic = "force-dynamic";

// ─── Data fetching ──────────────────────────────────────────────

async function getCategories(): Promise<ServiceCategory[]> {
  const { data } = await supabase
    .from("service_categories")
    .select("*")
    .order("order_index");
  return data ?? [];
}

async function getProviders(
  q: string | null,
  categoria: string | null,
  cidade: string | null
): Promise<Provider[]> {
  let query = supabase.from("providers").select("*").eq("status", "active");

  if (categoria) query = query.eq("category_slug", categoria);
  if (cidade)    query = query.eq("city", cidade);
  if (q) {
    query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,bio.ilike.%${q}%`);
  }

  const { data, error } = await query.order("avg_rating", { ascending: false });

  if (error) {
    // Surface the error so it appears in Vercel/server logs — helps diagnose schema cache issues
    throw new Error(`Supabase query failed: ${error.message} (code: ${error.code})`);
  }
  return data ?? [];
}

// ─── Helpers ────────────────────────────────────────────────────

function buildPageTitle(
  q: string | null,
  categoria: string | null,
  cidade: string | null,
  categories: ServiceCategory[]
): string {
  const cat = categories.find((c) => c.slug === categoria);
  const parts: string[] = [];
  if (cat) parts.push(cat.name_pt);
  if (q)   parts.push(`"${q}"`);
  const base = parts.length ? parts.join(" · ") : "Todos os Profissionais";
  return cidade ? `${base} em ${cidade}` : base;
}

function whatsappHref(number: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/55${digits}`;
}

// ─── Sub-components ─────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "text-yellow-400" : "text-stone-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <article className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 rounded-full bg-verde/10 flex items-center justify-center text-xl shrink-0">
            🧑‍🌾
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-semibold text-stone-900 text-base leading-tight">
                {provider.name}
              </h2>
              {provider.verified && (
                <span
                  className="text-verde text-xs font-medium flex items-center gap-0.5"
                  title="Perfil verificado"
                >
                  ✔ Verificado
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">📍 {provider.city}</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      {provider.bio && (
        <p className="text-sm text-stone-600 line-clamp-2">{provider.bio}</p>
      )}

      {/* Rating row */}
      <div className="flex items-center gap-2">
        <StarRating rating={provider.avg_rating} />
        <span className="text-sm font-semibold text-stone-700">
          {provider.avg_rating > 0 ? provider.avg_rating.toFixed(1) : "—"}
        </span>
        <span className="text-xs text-stone-400">
          {provider.review_count === 0
            ? "Sem avaliações"
            : `${provider.review_count} avaliação${provider.review_count > 1 ? "ões" : ""}`}
        </span>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={whatsappHref(provider.whatsapp)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold text-sm py-2.5 rounded-full transition-colors"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.857L.057 23.882l6.196-1.453A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.792 9.792 0 01-4.988-1.364l-.358-.214-3.714.871.932-3.614-.232-.373A9.78 9.78 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z" />
        </svg>
        Chamar no WhatsApp
      </a>
    </article>
  );
}

function EmptyState({ q, categoria }: { q: string | null; categoria: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-4">
      <span className="text-5xl">🌾</span>
      <p className="text-stone-700 font-semibold text-lg">
        Nenhum profissional encontrado nessa região ainda.
      </p>
      <p className="text-stone-400 text-sm max-w-xs">
        {q || categoria
          ? "Tente uma busca diferente ou explore outras categorias."
          : "Seja o primeiro a se cadastrar no MercadoRural!"}
      </p>
      <Link
        href="/cadastrar"
        className="bg-verde text-white font-semibold px-6 py-2.5 rounded-full hover:bg-verde-escuro transition-colors text-sm"
      >
        Anunciar Grátis
      </Link>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────

type SearchParams = { q?: string; categoria?: string; cidade?: string };

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q        = searchParams.q?.trim() || null;
  const categoria = searchParams.categoria || null;
  const cidade   = searchParams.cidade || null;

  const [providers, categories] = await Promise.all([
    getProviders(q, categoria, cidade),
    getCategories(),
  ]);

  const pageTitle = buildPageTitle(q, categoria, cidade, categories);
  const activeCategory = categories.find((c) => c.slug === categoria) ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-verde text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🌾</span>
            <span className="font-bold text-lg leading-tight">
              Mercado<span className="text-verde-claro">Rural</span>
            </span>
          </Link>

          <SearchBar initialValue={q ?? ""} />

          <Link
            href="/cadastrar"
            className="hidden sm:block bg-terra text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-terra-claro transition-colors shrink-0"
          >
            + Anunciar
          </Link>
          <Link
            href="/cadastrar"
            className="sm:hidden bg-terra text-white px-3 py-2 rounded-full text-sm font-semibold hover:bg-terra-claro transition-colors shrink-0"
          >
            + Anunciar
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-screen-lg mx-auto w-full px-4 py-6 pb-24 sm:pb-6">
        {/* Active filter label */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-stone-900">{pageTitle}</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {providers.length > 0
              ? `${providers.length} profissional${providers.length > 1 ? "is" : ""} encontrado${providers.length > 1 ? "s" : ""}`
              : "Nenhum resultado"}
          </p>
        </div>

        {/* Category filter chips */}
        <div className="mb-4">
          <CategoryFilterBar
            categories={categories}
            activeSlug={categoria}
            q={q}
          />
        </div>

        {/* City filter */}
        <div className="flex items-center gap-2 mb-5">
          <CityFilterSelect q={q} categoria={categoria} cidade={cidade} />
          {cidade && (
            <Link
              href={`/buscar${(() => { const p = new URLSearchParams(); if (q) p.set("q", q); if (categoria) p.set("categoria", categoria); const s = p.toString(); return s ? `?${s}` : ""; })()}`}
              className="text-xs text-stone-400 hover:text-terra transition-colors"
              aria-label="Remover filtro de cidade"
            >
              ✕ {cidade}
            </Link>
          )}
        </div>

        {/* Active category badge */}
        {activeCategory && (
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 bg-palha text-verde-escuro text-sm font-medium px-3 py-1 rounded-full border border-verde/20">
              {activeCategory.emoji} {activeCategory.name_pt}
              <Link
                href={q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar"}
                className="ml-1 text-stone-400 hover:text-terra transition-colors leading-none"
                aria-label="Remover filtro de categoria"
              >
                ✕
              </Link>
            </span>
          </div>
        )}

        {/* Results */}
        {providers.length === 0 ? (
          <EmptyState q={q} categoria={categoria} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Nav – mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around items-center py-2 z-50">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-medium">Início</span>
        </Link>
        <Link href="/buscar" className="flex flex-col items-center gap-0.5 text-verde">
          <span className="text-xl">🔍</span>
          <span className="text-[10px] font-medium">Buscar</span>
        </Link>
        <Link href="/cadastrar" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">➕</span>
          <span className="text-[10px] font-medium">Anunciar</span>
        </Link>
        <Link href="/mensagens" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">💬</span>
          <span className="text-[10px] font-medium">Mensagens</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
