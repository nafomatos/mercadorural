"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const POPULAR_TAGS = [
  { label: "Veterinário", slug: "veterinario" },
  { label: "Mecânico de trator", slug: "mecanico-de-trator" },
  { label: "Inseminador", slug: "inseminador" },
  { label: "Operador de drone", slug: "operador-de-drone" },
];

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/buscar?q=${encodeURIComponent(q)}`);
    else router.push("/buscar");
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O que você precisa? Ex: veterinário em Ribeirão Preto"
          className="w-full rounded-full py-3.5 pl-5 pr-14 text-stone-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-verde-claro shadow-lg"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-verde text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-verde-escuro transition-colors"
          aria-label="Buscar"
        >
          🔍
        </button>
      </form>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag.slug}
            type="button"
            onClick={() => router.push(`/buscar?categoria=${encodeURIComponent(tag.slug)}`)}
            className="bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm px-3 py-1.5 rounded-full border border-white/30 transition-colors"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
