// Shape of a row in the Supabase `client_logos` table. Mirrors
// server/client-logo-schema.ts.
export interface ClientLogo {
  id: number;
  name: string;
  logo_url: string;
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
}
