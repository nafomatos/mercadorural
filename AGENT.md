# MercadoRural — Agent Context

Marketplace de serviços e produtos rurais do Brasil. Mobile-first, tudo em
português (pt-BR). Stack: Next.js 14 App Router · TypeScript · Tailwind CSS ·
Supabase (PostgreSQL).

---

## Repository

- **GitHub:** `nafomatos/mercadorural`
- **Active branch:** `claude/setup-mercadorural-nextjs-QSsmd`
- **`main`:** empty (only original README commit — all app code is on the feature branch)
- **Vercel:** not yet deployed

---

## Environment Variables

### `.env.local` (gitignored — must be set locally and on Vercel)

| Variable | Where used |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase queries (client + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client queries |
| `SUPABASE_SERVICE_ROLE_KEY` | `/api/admin/scrape` route (bypasses RLS) |
| `GOOGLE_PLACES_API_KEY` | `/api/admin/scrape` route (Text Search + Place Details) |

Values for Supabase URL and anon key are already in `.env.local`.
`SUPABASE_SERVICE_ROLE_KEY` and `GOOGLE_PLACES_API_KEY` must still be added.

---

## Key Files

```
src/
├── lib/
│   ├── supabase.ts          # createClient + TypeScript types (Provider, Review, ServiceCategory)
│   └── cities.ts            # CITY_GROUPS (27 cities, SP+MG) + ALL_CITIES flat list
└── app/
    ├── layout.tsx            # Root layout, lang="pt-BR", system font stack
    ├── globals.css           # Tailwind + CSS vars (--verde, --terra, --palha)
    ├── page.tsx              # Homepage — Server Component, fetches categories
    ├── components/
    │   ├── SearchBar.tsx     # "use client" — navigates to /buscar?q=
    │   ├── StarRating.tsx    # SVG stars, props: rating / max / size (sm|md|lg)
    │   ├── CitySelect.tsx    # <select> with SP/MG <optgroup>s
    │   └── SiteShell.tsx     # Shared header + footer + bottom nav (used by placeholder pages)
    ├── buscar/
    │   ├── page.tsx          # Server Component — reads ?q, ?categoria, ?cidade
    │   ├── CategoryFilterBar.tsx  # Server — scrollable category chip links
    │   └── CityFilterSelect.tsx   # "use client" — city dropdown → router.push
    ├── cadastrar/page.tsx    # 3-step registration form ("use client")
    ├── prestador/[id]/
    │   ├── page.tsx          # Server Component — provider profile + reviews
    │   ├── ReviewSection.tsx # "use client" — bottom-sheet modal + star picker
    │   └── actions.ts        # "use server" — submitReview server action
    ├── admin/page.tsx        # Admin panel ("use client") — 4 tabs
    ├── api/admin/scrape/
    │   └── route.ts          # POST streaming route — Google Places scraper
    ├── mensagens/page.tsx    # Placeholder — "Em breve"
    ├── perfil/page.tsx       # Placeholder — "Em breve"
    ├── sobre/page.tsx        # About page
    ├── ajuda/page.tsx        # FAQ accordion ("use client")
    └── contato/page.tsx      # Contact page with WhatsApp link
supabase/migrations/
    ├── 20240101000000_initial_schema.sql    # service_categories, providers, reviews + trigger
    ├── 20240102000000_add_provider_category.sql  # providers.category_slug FK
    └── 20240103000000_add_provider_status.sql    # providers.status column
```

---

## Database Schema (Supabase)

### `service_categories`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| order_index | integer | display order |
| emoji | text | |
| name_pt | text | Portuguese name |
| slug | text UNIQUE | used as FK in providers |

Seeded with 8 rows (insumos, maquinas, pecuaria, graos, servicos, imoveis,
organicos, aves-suinos). **Only 8 seeded — schema supports more.**

### `providers`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| name | text | |
| whatsapp | text | raw digits only (10–11), no +55 |
| bio | text nullable | |
| city | text | must match a city in cities.ts |
| category_slug | text nullable | FK → service_categories(slug) |
| avg_rating | numeric(2,1) | 0–5, auto-updated by trigger |
| review_count | integer | auto-updated by trigger |
| verified | boolean | default false |
| status | text | 'active' \| 'pending' \| 'rejected' (default 'active') |
| created_at | timestamptz | default now() |

Indexes: `category_slug`, `city`, `status`.

### `reviews`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| provider_id | uuid FK | → providers(id) ON DELETE CASCADE |
| author_name | text | |
| rating | integer | 1–5 CHECK |
| comment | text nullable | |
| created_at | timestamptz | |

**Trigger:** `trg_update_provider_rating` — fires AFTER INSERT/UPDATE/DELETE on
`reviews`; recalculates `avg_rating` and `review_count` on parent provider row.

> ⚠️ **Migrations are local SQL files only.** They must be run manually in the
> Supabase SQL Editor — they have NOT been applied via Supabase CLI.

---

## Routes

| Route | Type | Description |
|---|---|---|
| `/` | Server static | Homepage: category grid + hero + CTA |
| `/buscar` | Server dynamic | Search: `?q`, `?categoria`, `?cidade` |
| `/cadastrar` | Client static | 3-step provider registration |
| `/prestador/[id]` | Server dynamic | Provider profile + reviews |
| `/admin` | Client static | Admin panel (no auth — secret URL) |
| `/api/admin/scrape` | API route POST | Google Places streaming scraper |
| `/anuncios` | Redirect 307 | → `/buscar` |
| `/mensagens` | Static | "Em breve" placeholder |
| `/perfil` | Static | "Em breve" placeholder |
| `/sobre` | Static | About page |
| `/ajuda` | Client static | FAQ accordion |
| `/contato` | Static | WhatsApp contact |

---

## Color Palette (Tailwind custom tokens)

| Token | Hex | Usage |
|---|---|---|
| `verde` | `#2d6a4f` | Primary — headers, active states, CTAs |
| `verde-claro` | `#52b788` | Accents, focus rings |
| `verde-escuro` | `#1b4332` | Dark green — footer, hovers |
| `terra` | `#a0522d` | Secondary CTA — "Anunciar" buttons |
| `terra-claro` | `#c8713f` | Terra hover |
| `palha` | `#f5e6c8` | Background accent — info sections, badges |

---

## Scraper API (`POST /api/admin/scrape`)

```json
// Request body (all optional — omit to run all)
{ "category_slug": "pecuaria", "city": "Ribeirão Preto" }
```

- Fetches category list from DB dynamically
- Iterates category × city combinations
- Text Search → Place Details (phone) for top 3 results per combo
- 200ms delay between each API call
- Duplicate check: `name ILIKE + city exact match`
- Inserts with `status='pending', verified=false`
- Returns streaming `text/plain` — one log line per event
- Final line format: `TOTAL:inserted=N,skipped=M` (machine-parseable)
- `export const maxDuration = 300` for Vercel long-running functions

---

## What Is Missing / Not Yet Built

- **No Supabase RLS** — anon key has full table access
- **No admin authentication** — `/admin` is secret-URL only
- **No image upload** — all avatars are emoji placeholders
- **No WhatsApp contact number** — `/contato` has placeholder `5516999999999`
- **No `sitemap.xml` / `robots.txt`**
- **`main` branch is empty** — no PR or merge has happened
- **Vercel not configured** — no live URL, no env vars set in Vercel dashboard
- **`/mensagens` and `/perfil`** are "Em breve" stubs (no real functionality)
- **No pagination** on `/buscar` — returns all matching providers in one query

---

## Commands

```bash
npm run dev      # http://localhost:3000
npm run build    # production build check
npm run lint     # ESLint
git push -u origin claude/setup-mercadorural-nextjs-QSsmd
```
