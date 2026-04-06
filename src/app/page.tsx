import Link from "next/link";
import { supabase, type Provider, type ServiceCategory } from "@/lib/supabase";
import SearchBar from "./components/SearchBar";
import HeroSearch from "./components/HeroSearch";

// Always fetch fresh data
export const dynamic = "force-dynamic";

// ─── Data fetching ──────────────────────────────────────────────

async function getCategorias(): Promise<ServiceCategory[]> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Erro ao buscar categorias:", error.message);
    return [];
  }
  return data ?? [];
}

async function getFeaturedProviders(): Promise<Provider[]> {
  const { data } = await supabase
    .from("providers")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);
  return data ?? [];
}

// ─── Category groups ────────────────────────────────────────────

const CATEGORY_GROUPS = [
  {
    title: "Saúde Animal",
    slugs: ["veterinario", "inseminador", "nutricionista-animal"],
  },
  {
    title: "Solo e Plantio",
    slugs: ["agronomo", "analise-de-solo", "pulverizacao", "controle-de-pragas", "cortador-de-cana"],
  },
  {
    title: "Infraestrutura e Manutenção",
    slugs: ["mecanico-de-trator", "eletricista-rural", "cercador", "poco-artesiano-irrigacao", "terraplanagem", "carpinteiro-rural", "pedreiro-rural"],
  },
  {
    title: "Transporte",
    slugs: ["transporte-de-gado", "transporte-de-graos", "transporte-de-maquinas"],
  },
  {
    title: "Serviços Especializados",
    slugs: ["contador-rural", "topografo", "operador-de-drone", "licenca-ambiental-car"],
  },
  {
    title: "Mão de Obra",
    slugs: ["diarista-rural", "vaqueiro-peao"],
  },
];

// ─── Helpers ────────────────────────────────────────────────────

function whatsappHref(number: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/55${digits}`;
}

// ─── Page ───────────────────────────────────────────────────────

export default async function Home() {
  const [categorias, providers] = await Promise.all([
    getCategorias(),
    getFeaturedProviders(),
  ]);

  // Build a map for quick category lookup
  const catMap = new Map(categorias.map((c) => [c.slug, c]));

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

          <SearchBar />

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

      <main className="flex-1">
        {/* ═══ 1. HERO with search ═══ */}
        <section className="bg-gradient-to-br from-verde-escuro via-verde to-verde-claro text-white px-4 py-12 sm:py-16 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 text-balance">
            O Marketplace do Campo Brasileiro
          </h1>
          <p className="text-base sm:text-lg text-green-100 mb-8 max-w-xl mx-auto">
            Encontre profissionais rurais na sua região. Contato direto via WhatsApp.
          </p>

          <HeroSearch />

          <div className="mt-6">
            <Link
              href="/cadastrar"
              className="inline-block bg-terra text-white font-semibold px-6 py-2.5 rounded-full hover:bg-terra-claro transition-colors text-sm"
            >
              Anunciar Grátis
            </Link>
          </div>
        </section>

        {/* ═══ 2. SOCIAL PROOF stats bar ═══ */}
        <section className="bg-palha/50 border-y border-stone-200">
          <div className="max-w-screen-lg mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">📋</span>
              <span className="text-sm font-bold text-stone-800">24+ Categorias</span>
              <span className="text-xs text-stone-500">de serviços</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">📍</span>
              <span className="text-sm font-bold text-stone-800">30+ Cidades</span>
              <span className="text-xs text-stone-500">atendidas</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">💰</span>
              <span className="text-sm font-bold text-stone-800">100% Gratuito</span>
              <span className="text-xs text-stone-500">para profissionais</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">📱</span>
              <span className="text-sm font-bold text-stone-800">WhatsApp</span>
              <span className="text-xs text-stone-500">contato direto</span>
            </div>
          </div>
        </section>

        {/* ═══ 3. CATEGORIES grouped ═══ */}
        <section id="categorias" className="max-w-screen-lg mx-auto px-4 py-10">
          <h2 className="text-xl font-bold text-stone-800 mb-6">Categorias de Serviços</h2>

          {categorias.length === 0 ? (
            <p className="text-stone-400 text-sm">Nenhuma categoria disponível no momento.</p>
          ) : (
            <div className="space-y-6">
              {(() => {
                const groupedSlugs = new Set(CATEGORY_GROUPS.flatMap((g) => g.slugs));
                const ungrouped = categorias.filter((c) => !groupedSlugs.has(c.slug));
                const allGroups = ungrouped.length > 0
                  ? [...CATEGORY_GROUPS, { title: "Outros", slugs: ungrouped.map((c) => c.slug) }]
                  : CATEGORY_GROUPS;

                return allGroups.map((group) => {
                  const cats = group.slugs
                    .map((s) => catMap.get(s))
                    .filter((c): c is ServiceCategory => !!c);
                  if (cats.length === 0) return null;
                  return (
                    <div key={group.title}>
                      <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">
                        {group.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {cats.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/buscar?categoria=${cat.slug}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-stone-200 hover:border-verde hover:shadow-sm transition-all text-sm"
                          >
                            <span>{cat.emoji}</span>
                            <span className="font-medium text-stone-700">{cat.name_pt}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </section>

        {/* ═══ 4. PROFISSIONAIS EM DESTAQUE ═══ */}
        <section className="bg-stone-100 px-4 py-10">
          <div className="max-w-screen-lg mx-auto">
            <h2 className="text-xl font-bold text-stone-800 mb-6">Profissionais em Destaque</h2>

            {providers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((p) => {
                  const cat = catMap.get(p.category_slug ?? "");
                  return (
                    <article
                      key={p.id}
                      className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-verde/10 flex items-center justify-center text-lg shrink-0">
                          {cat?.emoji ?? "🧑‍🌾"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-stone-900 text-sm leading-tight">
                            {p.name}
                          </h3>
                          <p className="text-xs text-stone-500">
                            {cat ? `${cat.emoji} ${cat.name_pt}` : ""} — 📍 {p.city}
                          </p>
                        </div>
                      </div>
                      <a
                        href={whatsappHref(p.whatsapp)}
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
                })}
              </div>
            ) : (
              /* Empty state when no providers exist */
              <div className="text-center py-10">
                <p className="text-stone-600 text-sm mb-3">
                  Seja o primeiro profissional da sua região no MercadoRural!
                </p>
                <Link
                  href="/cadastrar"
                  className="inline-block bg-verde text-white font-semibold px-6 py-2.5 rounded-full hover:bg-verde-escuro transition-colors text-sm"
                >
                  Cadastre-se grátis
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ═══ 5. COMO FUNCIONA ═══ */}
        <section id="como-funciona" className="max-w-screen-lg mx-auto px-4 py-10">
          <h2 className="text-xl font-bold text-stone-800 mb-8 text-center">Como Funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-verde/10 flex items-center justify-center text-2xl">
                🔍
              </div>
              <h3 className="font-bold text-stone-800">Busque o serviço</h3>
              <p className="text-sm text-stone-500 max-w-xs">
                Encontre o profissional que você precisa na sua região
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-verde/10 flex items-center justify-center text-2xl">
                👤
              </div>
              <h3 className="font-bold text-stone-800">Veja o perfil</h3>
              <p className="text-sm text-stone-500 max-w-xs">
                Confira categoria, cidade e avaliações do profissional
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-verde/10 flex items-center justify-center text-2xl">
                📱
              </div>
              <h3 className="font-bold text-stone-800">Chame no WhatsApp</h3>
              <p className="text-sm text-stone-500 max-w-xs">
                Entre em contato direto, sem intermediários
              </p>
            </div>
          </div>
        </section>

        {/* ═══ 6. PROVIDER CTA ═══ */}
        <section className="bg-palha px-4 py-10">
          <div className="max-w-screen-md mx-auto text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-4">
              Profissional do campo? Apareça para quem precisa de você
            </h2>
            <div className="flex flex-col items-start gap-3 text-left max-w-sm mx-auto mb-6">
              <p className="flex items-start gap-2 text-sm text-stone-700">
                <span className="text-verde mt-0.5">✅</span>
                Seu WhatsApp visível para produtores da região
              </p>
              <p className="flex items-start gap-2 text-sm text-stone-700">
                <span className="text-verde mt-0.5">✅</span>
                Cadastro 100% gratuito, sem mensalidade
              </p>
              <p className="flex items-start gap-2 text-sm text-stone-700">
                <span className="text-verde mt-0.5">✅</span>
                Pronto em menos de 2 minutos
              </p>
              <p className="flex items-start gap-2 text-sm text-stone-700">
                <span className="text-verde mt-0.5">✅</span>
                Você escolhe suas categorias e área de atuação
              </p>
            </div>
            <Link
              href="/cadastrar"
              className="inline-block bg-verde text-white font-semibold px-8 py-3 rounded-full hover:bg-verde-escuro transition-colors"
            >
              Criar Anúncio Grátis
            </Link>
          </div>
        </section>
      </main>

      {/* ═══ 7. MOBILE BOTTOM NAV ═══ */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around items-center py-2 z-50">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-verde">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-medium">Início</span>
        </Link>
        <Link href="/buscar" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">🔍</span>
          <span className="text-[10px] font-medium">Buscar</span>
        </Link>
        <Link href="/cadastrar" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">➕</span>
          <span className="text-[10px] font-medium">Anunciar</span>
        </Link>
        <Link href="/#categorias" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">📂</span>
          <span className="text-[10px] font-medium">Categorias</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </nav>

      {/* ═══ 8. FOOTER ═══ */}
      <footer className="hidden sm:block bg-verde-escuro text-green-100 px-4 py-8 text-sm">
        <div className="max-w-screen-lg mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌾</span>
              <span className="font-bold text-white text-lg">MercadoRural</span>
            </div>
            <p className="text-green-300 text-xs leading-relaxed">
              MercadoRural conecta profissionais e produtores rurais do interior
              de São Paulo e Triângulo Mineiro. Nosso objetivo é facilitar a vida
              de quem trabalha no campo.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Navegação</h3>
            <ul className="space-y-1">
              <li><Link href="/buscar" className="hover:text-white transition-colors">Prestadores</Link></li>
              <li><Link href="/cadastrar" className="hover:text-white transition-colors">Anunciar</Link></li>
              <li><Link href="/#como-funciona" className="hover:text-white transition-colors">Como Funciona</Link></li>
              <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Contato</h3>
            <ul className="space-y-1">
              <li><Link href="/ajuda" className="hover:text-white transition-colors">Perguntas Frequentes</Link></li>
              <li><Link href="/contato" className="hover:text-white transition-colors">Fale Conosco</Link></li>
              <li>
                <a
                  href="https://wa.me/5516999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  📱 +55 16 99999-9999
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-screen-lg mx-auto mt-6 pt-4 border-t border-green-800 text-center text-green-400 text-xs">
          Feito com 🌾 para o campo brasileiro — © 2026 MercadoRural
        </div>
      </footer>
    </div>
  );
}
