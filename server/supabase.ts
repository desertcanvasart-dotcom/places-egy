import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — admin endpoints will return 500 until configured.",
  );
}

// Server-side Supabase client using the service-role key. Bypasses RLS.
// MUST never be exposed to the browser — keep all usage behind admin auth.
export const supabaseAdmin =
  url && serviceKey
    ? createClient(url, serviceKey, { auth: { persistSession: false } })
    : null;
