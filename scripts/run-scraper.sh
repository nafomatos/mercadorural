#!/usr/bin/env bash
# Run the MercadoRural Google Places scraper.
# Make sure .env.local contains:
#   GOOGLE_PLACES_API_KEY
#   NEXT_PUBLIC_SUPABASE_URL
#   SUPABASE_SERVICE_ROLE_KEY
set -euo pipefail

cd "$(dirname "$0")/.."

npx ts-node --project tsconfig.scripts.json scripts/scrape-providers.ts
