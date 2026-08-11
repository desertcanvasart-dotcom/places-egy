// Shape of a row in the Supabase `leads` table. Mirrors server/lead-schema.ts
// plus the DB-managed columns (id, created_at, status). Keep in sync when
// either side changes.
export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export interface Lead {
  id: number;
  created_at: string;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  lead_source: string;
  magnet: string | null;
  listing_id: number | null;
  page_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  notes: string | null;
}

// Payload that the public POST /api/leads accepts. Everything except name +
// email is optional. Wrapper components fill in `lead_source` (and `magnet`
// / `listing_id` when applicable) — visitors only fill the visible fields.
export type LeadSubmitInput = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  lead_source: string;
  magnet?: string;
  listing_id?: number;
  page_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  website?: string; // honeypot
};

export async function submitLead(input: LeadSubmitInput): Promise<{ id: number }> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? "Submission failed");
  }
  return res.json();
}

// Grab UTM parameters from the current URL. Returns only the keys that were
// actually present so we don't overwrite server-side defaults with empty
// strings. Attached automatically by <LeadForm /> — wrapper components don't
// need to think about it.
export function readUtmFromLocation(): Partial<LeadSubmitInput> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out: Partial<LeadSubmitInput> = {};
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
  for (const k of keys) {
    const v = params.get(k);
    if (v && v.length > 0 && v.length <= 80) out[k] = v;
  }
  return out;
}
