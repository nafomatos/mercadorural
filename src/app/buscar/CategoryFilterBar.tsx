import Link from "next/link";
import type { ServiceCategory } from "@/lib/supabase";

type Props = {
  categories: ServiceCategory[];
  activeSlug: string | null;
  q: string | null;
};

function buildHref(slug: string | null, q: string | null): string {
  const params = new URLSearchParams();
  if (slug) params.set("categoria", slug);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/buscar?${qs}` : "/buscar";
}

export default function CategoryFilterBar({ categories, activeSlug, q }: Props) {
  return (
    <div className="relative">
      {/* fade edges on mobile to hint scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-4 sm:px-0 -mx-4 sm:mx-0 sm:flex-wrap">
        <Link
          href={buildHref(null, q)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors whitespace-nowrap ${
            !activeSlug
              ? "bg-verde text-white border-verde"
              : "bg-white text-stone-600 border-stone-200 hover:border-verde hover:text-verde"
          }`}
        >
          Todos
        </Link>

        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={buildHref(cat.slug, q)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors whitespace-nowrap ${
              activeSlug === cat.slug
                ? "bg-verde text-white border-verde"
                : "bg-white text-stone-600 border-stone-200 hover:border-verde hover:text-verde"
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.name_pt}
          </Link>
        ))}
      </div>
    </div>
  );
}
