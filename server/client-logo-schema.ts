import { z } from "zod";

// Whitelist of columns the admin API may write to the `client_logos` table.
// Mirrors the deal-schema / listing-schema pattern: .strict() rejects unknown
// keys (prevents mass-assign). Keep in sync with the ClientLogo type in
// client/src/lib/client-logos.ts and the Supabase client_logos table.
export const clientLogoInsertSchema = z
  .object({
    name: z.string().min(1).max(200),
    // Either a full URL (Supabase Storage — for logos uploaded via the admin
    // dashboard) OR a relative path starting with / (for legacy hardcoded
    // logos migrated from client/public/images/clients/*). Both need to be
    // acceptable so existing rows can still be edited.
    logo_url: z
      .string()
      .min(1)
      .max(2000)
      .refine(
        (v) => /^https?:\/\//.test(v) || v.startsWith("/"),
        "logo_url must be a full URL or a site-relative path",
      ),
    sort_order: z.number().int().nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .strict();

// Updates: same shape, all optional. .strict() still rejects unknown keys.
export const clientLogoUpdateSchema = clientLogoInsertSchema.partial();
