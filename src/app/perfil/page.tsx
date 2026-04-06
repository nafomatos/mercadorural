import Link from "next/link";
import SiteShell from "@/app/components/SiteShell";

export const metadata = {
  title: "Meu Perfil – MercadoRural",
};

export default function PerfilPage() {
  return (
    <SiteShell activeNav="perfil">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-5">
        <span className="text-6xl">👤</span>
        <h1 className="text-2xl font-bold text-stone-900">Área do prestador</h1>
        <p className="text-stone-500 max-w-sm">
          Em breve: gerencie seu perfil, visualize avaliações recebidas e acompanhe
          seus contatos — tudo em um só lugar.
        </p>
        <span className="inline-block bg-palha text-verde-escuro text-sm font-semibold px-4 py-2 rounded-full border border-verde/20">
          Em breve
        </span>
        <p className="text-stone-400 text-sm">
          Por enquanto,{" "}
          <Link href="/cadastrar" className="text-verde font-medium hover:underline">
            cadastre-se gratuitamente
          </Link>{" "}
          para aparecer nas buscas.
        </p>
      </div>
    </SiteShell>
  );
}
