import { z } from "zod";

// Whitelist of columns the admin API may write to the `deal_posters` table.
// Mirrors the client-logo-schema / deal-schema pattern: .strict() rejects
// unknown keys. Keep in sync with the DealPoster type in
// client/src/lib/deal-posters.ts and the Supabase deal_posters table.
//
// Deal Posters are just image files the team designs in Canva and uploads —
// no per-poster text editing on the site. Poster designs live entirely in
// Canva; the site just renders the PNG.
export const dealPosterInsertSchema = z
  .object({
    // Accept either a full https:// URL (Supabase Storage — where posters
    // uploaded via the admin dashboard go) OR a site-relative path (in case
    // a poster ever lives under /images/).
    poster_url: z
      .string()
      .min(1)
      .max(2000)
      .refine(
        (v) => /^https?:\/\//.test(v) || v.startsWith("/"),
        "poster_url must be a full URL or a site-relative path",
      ),
    caption: z.string().max(200).nullable().optional(),
    sort_order: z.number().int().nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .strict();

export const dealPosterUpdateSchema = dealPosterInsertSchema.partial();
