/**
 * Provider schema as defined in Supabase migrations:
 * - supabase/migrations/20240101000000_initial_schema.sql
 * - supabase/migrations/20240102000000_add_provider_category.sql
 * - supabase/migrations/20240103000000_add_provider_status.sql
 *
 * Use this type to ensure consistency and catch missing columns early.
 */

export interface Provider {
  id?: string; // UUID, auto-generated
  name: string;
  whatsapp: string;
  city: string;
  category_slug: string | null;
  bio: string | null;
  verified: boolean;
  status: "active" | "pending" | "rejected";
  avg_rating?: number; // auto-generated, defaults to 0.0
  review_count?: number; // auto-generated, defaults to 0
  created_at?: string; // auto-generated
}

/**
 * Validates that an object has all required Provider fields.
 * Useful for catching schema mismatches before sending to Supabase.
 */
export function validateProviderData(data: any): data is Omit<Provider, "id" | "avg_rating" | "review_count" | "created_at"> {
  const required = ["name", "whatsapp", "city", "category_slug", "bio", "verified", "status"];
  return required.every((key) => key in data);
}
