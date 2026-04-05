import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, type Provider, type Review, type ServiceCategory } from "@/lib/supabase";
import SearchBar from "@/app/components/SearchBar";
import StarRating from "@/app/components/StarRating";
import ReviewSection from "./ReviewSection";

// ─── Data fetching ────────────────────────────────────────────

async function getProvider(id: string): Promise<Provider | null> {
  const { data } = await supabase
    .from("providers")
    .select("*")
    .eq("id", id)
    .single();
  return data ?? null;
}

async function getReviews(providerId: string): Promise<Review[]> {
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

async function getCategory(slug: string | null): Promise<ServiceCategory | null> {
  if (!slug) return null;
  const { data } = await supabase
    .from("service_categories")
    .select("*")
    .eq("slug", slug)
    .single();
  return data ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────

function whatsappHref(number: string) {
  return `https://wa.me/55${number.replace(/\D/g, "")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-verde/10 flex items-center justify-center text-sm">
            👤
          </div>
          <span className="font-semibold text-stone-800 text-sm">{review.author_name}</span>
        </div>
        <time className="text-xs text-stone-400 shrink-0">{formatDate(review.created_at)}</time>
      </div>

      <StarRating rating={review.rating} size="sm" />

      {review.comment && (
        <p className="text-sm text-stone-600 leading-relaxed">{review.comment}</p>
      )}
    </article>
  );
}

function RatingBreakdown({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-stone-900 leading-none">
          {count > 0 ? rating.toFixed(1) : "—"}
        </p>
        <StarRating rating={rating} size="md" />
        <p className="text-xs text-stone-400 mt-1">
          {count === 0 ? "Sem avaliações" : `${count} avaliação${count > 1 ? "ões" : ""}`}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default async function PrestadorPage({
  params,
}: {
  params: { id: string };
}) {
  const [provider, reviews] = await Promise.all([
    getProvider(params.id),
    getReviews(params.id),
  ]);

  if (!provider) notFound();

  const category = await getCategory(provider.category_slug);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="bg-verde text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🌾</span>
            <span className="font-bold text-lg leading-tight">
              Mercado<span className="text-verde-claro">Rural</span>
            </span>
          </Link>

          <SearchBar />

          <Link
            href="/anunciar"
            className="hidden sm:block bg-terra text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-terra-claro transition-colors shrink-0"
          >
            + Anunciar
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-6 pb-36 sm:pb-12">
        {/* Back */}
        <Link
          href="/buscar"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-verde transition-colors mb-5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar aos resultados
        </Link>

        {/* Profile card */}
        <section className="bg-white rounded-2xl border border-stone-200 p-5 mb-5">
          {/* Avatar + name */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-verde/10 flex items-center justify-center text-3xl shrink-0">
              🧑‍🌾
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-xl text-stone-900 leading-tight">{provider.name}</h1>
                {provider.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-verde bg-verde/10 px-2 py-0.5 rounded-full">
                    ✔ Verificado
                  </span>
                )}
              </div>
              <p className="text-stone-500 text-sm mt-0.5">📍 {provider.city}</p>
              {category && (
                <Link
                  href={`/buscar?categoria=${category.slug}`}
                  className="inline-flex items-center gap-1 mt-1.5 bg-palha text-verde-escuro text-xs font-medium px-2.5 py-1 rounded-full hover:bg-palha/70 transition-colors"
                >
                  {category.emoji} {category.name_pt}
                </Link>
              )}
            </div>
          </div>

          {/* Bio */}
          {provider.bio && (
            <p className="text-stone-700 text-sm leading-relaxed mb-4">{provider.bio}</p>
          )}

          {/* Rating summary */}
          <div className="border-t border-stone-100 pt-4 mb-5">
            <RatingBreakdown rating={provider.avg_rating} count={provider.review_count} />
          </div>

          {/* WhatsApp CTA */}
          <a
            href={whatsappHref(provider.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-base py-4 rounded-2xl transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.857L.057 23.882l6.196-1.453A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.792 9.792 0 01-4.988-1.364l-.358-.214-3.714.871.932-3.614-.232-.373A9.78 9.78 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z" />
            </svg>
            Entrar em contato via WhatsApp
          </a>
        </section>

        {/* Reviews */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-stone-900 text-lg">
              Avaliações
              {reviews.length > 0 && (
                <span className="ml-2 text-base font-normal text-stone-400">
                  ({reviews.length})
                </span>
              )}
            </h2>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl flex flex-col items-center gap-3 py-12 px-4 text-center">
              <span className="text-4xl">⭐</span>
              <p className="font-semibold text-stone-700">Sem avaliações ainda</p>
              <p className="text-sm text-stone-400">
                Seja o primeiro a avaliar este profissional.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Review CTA + modal */}
      <ReviewSection providerId={provider.id} providerName={provider.name} />

      {/* Bottom Nav – mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around items-center py-2 z-40">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-medium">Início</span>
        </Link>
        <Link href="/buscar" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">🔍</span>
          <span className="text-[10px] font-medium">Buscar</span>
        </Link>
        <Link href="/anunciar" className="flex flex-col items-center gap-0.5 text-stone-400">
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
