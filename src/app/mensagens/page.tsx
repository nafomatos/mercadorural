import SiteShell from "@/app/components/SiteShell";

export const metadata = {
  title: "Mensagens – MercadoRural",
};

export default function MensagensPage() {
  return (
    <SiteShell activeNav="mensagens">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-5">
        <span className="text-6xl">💬</span>
        <h1 className="text-2xl font-bold text-stone-900">Mensagens diretas</h1>
        <p className="text-stone-500 max-w-sm">
          Em breve: sistema de mensagens diretas entre produtores e prestadores de serviços,
          sem precisar sair do MercadoRural.
        </p>
        <span className="inline-block bg-palha text-verde-escuro text-sm font-semibold px-4 py-2 rounded-full border border-verde/20">
          Em breve
        </span>
      </div>
    </SiteShell>
  );
}
