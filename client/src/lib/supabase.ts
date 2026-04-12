import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Listing = {
  id: number;
  title: string;
  property_type: string;
  subtype: string;
  developer: string;
  project: string;
  location: string;
  price: number;
  area_sqm: number;
  transaction_type: string;
  furnishing: string;
  description: string;
  images: string[];
  handover_date: string;
  view: string;
  parking: string;
};
