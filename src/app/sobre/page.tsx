import Link from "next/link";
import SiteShell from "@/app/components/SiteShell";

export const metadata = {
  title: "Sobre – MercadoRural",
  description: "Conheça o MercadoRural, o marketplace de serviços rurais do Brasil.",
};

const pilares = [
  {
    icon: "🤝",
    title: "Conexão direta",
    desc: "Produtores falam diretamente com prestadores via WhatsApp, sem intermediários.",
  },
  {
    icon: "⭐",
    title: "Avaliações reais",
    desc: "Cada prestador é avaliado por quem contratou. Transparência do começo ao fim.",
  },
  {
    icon: "🌱",
    title: "Gratuito para começar",
    desc: "Cadastro e contato são sempre gratuitos. O campo merece acesso simples à tecnologia.",
  },
  {
    icon: "📍",
    title: "Foco regional",
    desc: "Começamos no interior de São Paulo e Triângulo Mineiro — onde o agro pulsa.",
  },
];

export default function SobrePage() {
  return (
    <SiteShell>
      <div className="max-w-screen-md mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <span className="text-5xl mb-4 block">🌾</span>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">Sobre o MercadoRural</h1>
          <p className="text-stone-500 text-lg max-w-lg mx-auto leading-relaxed">
            O marketplace que conecta o campo brasileiro.
          </p>
        </div>

        {/* Mission */}
        <section className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-stone-900 mb-3">Nossa missão</h2>
          <p className="text-stone-600 leading-relaxed">
            O MercadoRural nasceu para resolver um problema simples: encontrar um bom veterinário,
            um mecânico de trator ou um serviço de pulverização no interior do Brasil ainda depende
            de indicações boca a boca. Queremos mudar isso.
          </p>
          <p className="text-stone-600 leading-relaxed mt-3">
            Somos um marketplace de serviços e produtos rurais, onde produtores encontram
            prestadores locais de confiança — e prestadores ganham visibilidade sem precisar
            de site próprio ou investimento em anúncios.
          </p>
        </section>

        {/* Pilares */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-stone-900 mb-4">Como funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pilares.map((p) => (
              <div key={p.title} className="bg-white border border-stone-200 rounded-2xl p-5 flex gap-4">
                <span className="text-3xl shrink-0">{p.icon}</span>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-1">{p.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-verde-escuro to-verde rounded-2xl text-white text-center px-6 py-8">
          <p className="font-bold text-xl mb-2">Faça parte do campo digital</p>
          <p className="text-green-100 text-sm mb-5">
            Cadastre seu serviço gratuitamente e comece a receber contatos hoje.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cadastrar"
              className="bg-terra hover:bg-terra-claro text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Cadastrar meu serviço
            </Link>
            <Link
              href="/buscar"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Ver prestadores
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
