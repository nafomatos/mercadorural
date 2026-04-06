"use client";

import { useRouter } from "next/navigation";
import { CITY_GROUPS } from "@/lib/cities";

type Props = {
  q: string | null;
  categoria: string | null;
  cidade: string | null;
};

export default function CityFilterSelect({ q, categoria, cidade }: Props) {
  const router = useRouter();

  function handleChange(city: string) {
    const params = new URLSearchParams();
    if (q)        params.set("q", q);
    if (categoria) params.set("categoria", categoria);
    if (city)     params.set("cidade", city);
    const qs = params.toString();
    router.push(qs ? `/buscar?${qs}` : "/buscar");
  }

  return (
    <select
      value={cidade ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="border border-stone-200 rounded-full px-4 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-verde/30 focus:border-verde transition"
      aria-label="Filtrar por cidade"
    >
      <option value="">📍 Todas as cidades</option>
      {CITY_GROUPS.map((g) => (
        <optgroup key={g.state} label={g.state}>
          {g.cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
