// Public (anonymous-key) Supabase access is now handled by pgrest — a ~1KB
// hand-rolled PostgREST client (client/src/lib/pgrest.ts) instead of the
// ~100KB @supabase/supabase-js SDK that pulls in auth-js + realtime-js +
// storage-js + their transitive deps. Server-side admin code (server/*)
// still uses the SDK because it needs storage-js for uploads and the
// service-role client for RLS bypass.
//
// This file now only re-exports pgrest under the `supabase` name so existing
// call sites (`supabase.from("listings").select("*")...`) keep working with
// no changes, plus the shared Listing type.

import { pgrest } from "@/lib/pgrest";

export const supabase = pgrest;

export type Listing = {
  id: number;
  title: string;
  property_type: string;
  subtype: string;
  developer: string;
  project: string;
  location: string;
  location_area: string;
  price: number;
  currency: string;
  area_sqm: number;
  transaction_type: string;
  furnishing: string;
  description: string;
  images: string[];
  delivery_date: string;
  parking: number;
  price_per_meter: number;
  maintenance_fees: number;
  maintenance_status: string;
  floor: number;
  latitude: number | null;
  longitude: number | null;
};
