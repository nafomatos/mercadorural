/**
 * Provider schema as defined in Supabase migrations:
 * - supabase/migrations/20240101000000_initial_schema.sql
 * - supabase/migrations/20240102000000_add_provider_category.sql
 * - supabase/migrations/20240103000000_add_provider_status.sql
 * - supabase/migrations/20240104000000_add_provider_website.sql
 */

export interface Provider {
  id?: string;            // UUID, auto-generated
  name: string;
  whatsapp: string;
  city: string;
  category_slug: string | null;
  bio: string | null;
  verified: boolean;
  status: "active" | "pending" | "rejected";
  website: string | null;
  avg_rating?: number;    // auto-generated, defaults to 0.0
  review_count?: number;  // auto-generated, defaults to 0
  created_at?: string;    // auto-generated
}
