// Shape of a row in the Supabase `deal_posters` table. Mirrors
// server/deal-poster-schema.ts. Each row is one Canva-designed poster image
// that renders in the homepage "Latest Closed Deals" carousel.
export interface DealPoster {
  id: number;
  poster_url: string;
  caption: string | null;
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
}
