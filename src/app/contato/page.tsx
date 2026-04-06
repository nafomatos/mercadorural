import SiteShell from "@/app/components/SiteShell";

export const metadata = {
  title: "Contato – MercadoRural",
};

const WHATSAPP_NUMBER = "5516999999999"; // substituir pelo número real da equipe

const channels = [
  {
    icon: "💬",
    title: "WhatsApp",
    desc: "A forma mais rápida de falar com a equipe. Respondemos em até 24h nos dias úteis.",
    action: {
      label: "Chamar no WhatsApp",
      href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá, vim pelo MercadoRural e preciso de ajuda.")}`,
      style: "bg-[#25D366] hover:bg-[#1ebe5d] text-white",
    },
  },
  {
    icon: "❓",
    title: "Central de Ajuda",
    desc: "Veja respostas para as dúvidas mais frequentes antes de entrar em contato.",
    action: {
      label: "Ver perguntas frequentes",
      href: "/ajuda",
      style: "bg-verde hover:bg-verde-escuro text-white",
    },
  },
];

export default function ContatoPage() {
  return (
    <SiteShell>
      <div className="max-w-screen-sm mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <span className="text-5xl mb-3 block">📬</span>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Fale com a gente</h1>
          <p className="text-stone-500">
            Dúvidas, sugestões ou problemas com seu cadastro — estamos aqui.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {channels.map((ch) => (
            <div key={ch.title} className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{ch.icon}</span>
                <div>
                  <h2 className="font-bold text-stone-900">{ch.title}</h2>
                  <p className="text-sm text-stone-500">{ch.desc}</p>
                </div>
              </div>
              <a
                href={ch.action.href}
                target={ch.action.href.startsWith("http") ? "_blank" : undefined}
                rel={ch.action.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`flex items-center justify-center font-semibold py-3 rounded-full transition-colors text-sm ${ch.action.style}`}
              >
                {ch.action.label}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-stone-400 mt-8">
          MercadoRural · Interior de São Paulo e Triângulo Mineiro
        </p>
      </div>
    </SiteShell>
  );
}
