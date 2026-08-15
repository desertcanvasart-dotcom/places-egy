import { z } from "zod";

// Public POST /api/leads payload. Kept small on purpose — asking for less =
// higher conversion rate. Only name + email are required. Everything else
// (phone, message, source, magnet, listing_id, utm_*) is optional context
// the client should attach when available.
//
// The API layer is the trust boundary: any field not in this schema is
// dropped silently. Length limits keep the DB / email templates safe from
// arbitrary blobs, and the honeypot field short-circuits obvious bots.
export const leadInsertSchema = z
  .object({
    // Required
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),

    // Phone is required for the market-report magnet (real-estate leads must
    // be reachable). Server enforces min length so a blank isn't accepted.
    phone: z.string().trim().min(4).max(40),

    // Free-text field where the visitor can name a project or ask a specific
    // question. Optional — never gate the form on this.
    message: z.string().trim().max(2000).nullable().optional(),

    // Locations the visitor is interested in. Multi-select from the 6
    // canonical Cairo districts we serve. At least one is required.
    locations: z
      .array(
        z.enum([
          "new-cairo",
          "sheikh-zayed",
          "6th-october",
          "downtown-cairo",
          "sheraton",
          "maadi",
        ]),
      )
      .min(1, "Pick at least one location")
      .max(6),

    // Where the lead came from. Slug-y string set by the wrapper component
    // (e.g. "contact_page", "market_report", "listing_inquiry", "footer",
    // "exit_intent"). We restrict format so it stays greppable in the DB.
    lead_source: z
      .string()
      .trim()
      .min(1)
      .max(60)
      .regex(/^[a-z0-9_-]+$/i, "lead_source must be slug-format"),

    // Which magnet was offered (for A/B tracking + follow-up automation).
    // Free string, but slug-format so it's greppable. Null for plain contact.
    magnet: z
      .string()
      .trim()
      .max(60)
      .regex(/^[a-z0-9_-]+$/i)
      .nullable()
      .optional(),

    // Contextual metadata (all optional). listing_id links inquiries to a
    // specific listing; page_url captures where the form lived; utm_* keeps
    // marketing-channel attribution.
    listing_id: z.number().int().positive().nullable().optional(),
    page_url: z.string().max(500).nullable().optional(),
    utm_source: z.string().max(80).nullable().optional(),
    utm_medium: z.string().max(80).nullable().optional(),
    utm_campaign: z.string().max(80).nullable().optional(),
    utm_term: z.string().max(80).nullable().optional(),
    utm_content: z.string().max(80).nullable().optional(),

    // Language preference — captured from browser + URL path at submit time.
    // Used to render the market-report auto-reply email in the visitor's
    // language. Optional; server falls back to 'en'.
    preferred_language: z.enum(["en", "ar"]).optional(),

    // Honeypot: real users leave this blank; bots fill every field. If it
    // arrives non-empty we accept the request with 200 (so bots don't retry)
    // but never persist. Handled in the route, not the schema.
    website: z.string().max(200).optional(),
  })
  .strict();

// Admin-only PATCH for updating a lead (mark followed-up, add notes, change
// status). No new leads allowed here — inserts always come through the
// public POST route above.
export const leadUpdateSchema = z
  .object({
    status: z
      .enum(["new", "contacted", "qualified", "won", "lost"])
      .optional(),
    notes: z.string().max(5000).nullable().optional(),
  })
  .strict();
