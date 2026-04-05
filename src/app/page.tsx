import Link from "next/link";
import { supabase, type ServiceCategory } from "@/lib/supabase";
import SearchBar from "./components/SearchBar";


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

export default async function Home() {
  const categorias = await getCategorias();

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

          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium shrink-0">
            <Link
              href="/cadastrar"
              className="bg-terra text-white px-4 py-2 rounded-full hover:bg-terra-claro transition-colors"
            >
              + Anunciar
            </Link>
          </nav>

          <Link
            href="/cadastrar"
            className="sm:hidden bg-terra text-white px-3 py-2 rounded-full text-sm font-semibold hover:bg-terra-claro transition-colors shrink-0"
          >
            + Anunciar
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-verde-escuro via-verde to-verde-claro text-white px-4 py-10 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 text-balance">
            O Marketplace do Campo Brasileiro
          </h1>
          <p className="text-base sm:text-lg text-green-100 mb-6 max-w-xl mx-auto">
            Conectamos produtores, prestadores de serviços e compradores do agronegócio em todo o Brasil.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/anuncios"
              className="bg-white text-verde font-semibold px-6 py-3 rounded-full hover:bg-palha transition-colors"
            >
              Ver Anúncios
            </Link>
            <Link
              href="/cadastrar"
              className="bg-terra text-white font-semibold px-6 py-3 rounded-full hover:bg-terra-claro transition-colors"
            >
              Anunciar Grátis
            </Link>
          </div>
        </section>

        {/* Categorias */}
        <section className="max-w-screen-lg mx-auto px-4 py-8">
          <h2 className="text-lg font-bold text-stone-800 mb-4">Categorias</h2>

          {categorias.length === 0 ? (
            <p className="text-stone-400 text-sm">Nenhuma categoria disponível no momento.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {categorias.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/buscar?categoria=${cat.slug}`}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white border border-stone-200 hover:border-verde hover:shadow-sm transition-all text-center"
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-xs font-medium text-stone-700 leading-tight">{cat.name_pt}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CTA Anunciar */}
        <section className="bg-palha px-4 py-10 text-center">
          <h2 className="text-xl font-bold text-stone-800 mb-2">
            Quer vender ou oferecer serviços?
          </h2>
          <p className="text-stone-600 mb-6 max-w-md mx-auto">
            Alcance milhares de produtores rurais em todo o Brasil. Crie seu anúncio gratuitamente.
          </p>
          <Link
            href="/cadastrar"
            className="bg-verde text-white font-semibold px-8 py-3 rounded-full hover:bg-verde-escuro transition-colors inline-block"
          >
            Criar Anúncio Grátis
          </Link>
        </section>
      </main>

      {/* Bottom Nav – mobile */}
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
        <Link href="/mensagens" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">💬</span>
          <span className="text-[10px] font-medium">Mensagens</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </nav>

      {/* Footer */}
      <footer className="hidden sm:block bg-verde-escuro text-green-100 px-4 py-8 text-sm">
        <div className="max-w-screen-lg mx-auto grid grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌾</span>
              <span className="font-bold text-white text-lg">MercadoRural</span>
            </div>
            <p className="text-green-300 text-xs">
              Conectando o campo brasileiro desde 2026.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Navegação</h3>
            <ul className="space-y-1">
              <li><Link href="/anuncios" className="hover:text-white transition-colors">Anúncios</Link></li>
              <li><Link href="/cadastrar" className="hover:text-white transition-colors">Anunciar</Link></li>
              <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Contato</h3>
            <ul className="space-y-1">
              <li><Link href="/ajuda" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
              <li><Link href="/contato" className="hover:text-white transition-colors">Fale Conosco</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-screen-lg mx-auto mt-6 pt-4 border-t border-green-800 text-center text-green-400 text-xs">
          © 2026 MercadoRural. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
