"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialValue?: string;
};

export default function SearchBar({ initialValue = "" }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/buscar?q=${encodeURIComponent(q)}`);
    else router.push("/buscar");
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-md">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar produtos e serviços..."
          className="w-full rounded-full py-2 pl-4 pr-10 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-verde-claro"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500"
          aria-label="Buscar"
        >
          🔍
        </button>
      </div>
    </form>
  );
}
