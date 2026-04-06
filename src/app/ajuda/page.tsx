"use client";

import Link from "next/link";
import { useState } from "react";
import SiteShell from "@/app/components/SiteShell";

const faqs = [
  {
    q: "Como me cadastro como prestador de serviços?",
    a: 'Clique em "Anunciar" no topo da página ou acesse /cadastrar. Preencha seus dados em 3 passos simples (nome, WhatsApp, cidade, categoria e uma breve apresentação) e seu perfil é publicado imediatamente, de graça.',
  },
  {
    q: "Como faço para contatar um prestador?",
    a: 'Em cada perfil de prestador há um botão verde "Entrar em contato via WhatsApp". Ao clicar, você é redirecionado direto para a conversa no WhatsApp com o número cadastrado pelo prestador. Não há intermediários.',
  },
  {
    q: "O cadastro e o uso são gratuitos?",
    a: "Sim. Tanto o cadastro de prestadores quanto a busca e o contato são 100% gratuitos. O MercadoRural está em fase de lançamento e não cobra nada de ninguém neste momento.",
  },
  {
    q: "Como funciona o sistema de avaliações?",
    a: 'Qualquer pessoa pode deixar uma avaliação em um perfil de prestador — basta acessar o perfil e clicar em "Deixar avaliação". A nota (1 a 5 estrelas) e o comentário são públicos. A média é recalculada automaticamente a cada nova avaliação.',
  },
  {
    q: "Como posso editar ou remover meu perfil?",
    a: "A área de gerenciamento de perfil está em desenvolvimento. Por enquanto, entre em contato pelo WhatsApp do MercadoRural e faremos a edição ou remoção manualmente para você.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-stone-800 text-sm sm:text-base">{q}</span>
        <span className={`text-stone-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function AjudaPage() {
  return (
    <SiteShell>
      <div className="max-w-screen-md mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <span className="text-5xl mb-3 block">🙋</span>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Central de Ajuda</h1>
          <p className="text-stone-500">Respostas para as dúvidas mais comuns.</p>
        </div>

        <div className="flex flex-col gap-3 mb-10">
          {faqs.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        {/* Still stuck? */}
        <div className="bg-palha border border-verde/20 rounded-2xl px-5 py-6 text-center">
          <p className="font-semibold text-stone-800 mb-1">Não encontrou sua resposta?</p>
          <p className="text-stone-500 text-sm mb-4">
            Fale direto com nossa equipe pelo WhatsApp.
          </p>
          <Link
            href="/contato"
            className="inline-block bg-verde hover:bg-verde-escuro text-white font-semibold px-6 py-2.5 rounded-full transition-colors text-sm"
          >
            Falar com o suporte
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
