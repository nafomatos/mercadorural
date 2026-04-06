import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the database tables
export type ServiceCategory = {
  id: number;
  order_index: number;
  emoji: string;
  name_pt: string;
  slug: string;
};

export type Provider = {
  id: string;
  name: string;
  whatsapp: string;
  bio: string | null;
  city: string;
  category_slug: string | null;
  website: string | null;
  avg_rating: number;
  review_count: number;
  verified: boolean;
  status: "active" | "pending" | "rejected";
  created_at: string;
};

export type Review = {
  id: string;
  provider_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};
