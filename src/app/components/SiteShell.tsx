import Link from "next/link";
import SearchBar from "./SearchBar";

type NavItem = "home" | "buscar" | "cadastrar" | "mensagens" | "perfil";

type Props = {
  children: React.ReactNode;
  activeNav?: NavItem;
};

const navItems = [
  { id: "home",      href: "/",          icon: "🏠", label: "Início"    },
  { id: "buscar",    href: "/buscar",     icon: "🔍", label: "Buscar"    },
  { id: "cadastrar", href: "/cadastrar",  icon: "➕", label: "Anunciar"  },
  { id: "mensagens", href: "/mensagens",  icon: "💬", label: "Mensagens" },
  { id: "perfil",    href: "/perfil",     icon: "👤", label: "Perfil"    },
] as const;

export default function SiteShell({ children, activeNav }: Props) {
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
            href="/cadastrar"
            className="hidden sm:block bg-terra text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-terra-claro transition-colors shrink-0"
          >
            + Anunciar
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-24 sm:pb-0">
        {children}
      </main>

      {/* Footer – desktop only */}
      <footer className="hidden sm:block bg-verde-escuro text-green-100 px-4 py-8 text-sm">
        <div className="max-w-screen-lg mx-auto grid grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌾</span>
              <span className="font-bold text-white text-lg">MercadoRural</span>
            </div>
            <p className="text-green-300 text-xs">Conectando o campo brasileiro desde 2026.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Navegação</h3>
            <ul className="space-y-1">
              <li><Link href="/buscar"    className="hover:text-white transition-colors">Prestadores</Link></li>
              <li><Link href="/cadastrar" className="hover:text-white transition-colors">Anunciar</Link></li>
              <li><Link href="/sobre"     className="hover:text-white transition-colors">Sobre</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Contato</h3>
            <ul className="space-y-1">
              <li><Link href="/ajuda"   className="hover:text-white transition-colors">Central de Ajuda</Link></li>
              <li><Link href="/contato" className="hover:text-white transition-colors">Fale Conosco</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-screen-lg mx-auto mt-6 pt-4 border-t border-green-800 text-center text-green-400 text-xs">
          © 2026 MercadoRural. Todos os direitos reservados.
        </div>
      </footer>

      {/* Bottom nav – mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around items-center py-2 z-50">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 ${
              activeNav === item.id ? "text-verde" : "text-stone-400"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
