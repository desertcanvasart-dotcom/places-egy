import { z } from "zod";
import { createHash } from "node:crypto";

// Whitelist of columns the admin API may write to the `popups` table. Mirrors
// the deal-schema / client-logo-schema pattern: .strict() rejects unknown keys.
// Keep in sync with the Popup type in client/src/lib/popups.ts and the Supabase
// popups table.
//
// content_hash is computed server-side on insert/update (not sent by the
// client), so it's intentionally omitted from these schemas.
export const popupInsertSchema = z
  .object({
    headline_top: z.string().max(80),
    headline_bottom: z.string().max(80),
    body_paragraph: z.string().max(2000),
    project_logo_url: z
      .string()
      .max(2000)
      .refine(
        (v) => v === "" || /^https?:\/\//.test(v) || v.startsWith("/"),
        "project_logo_url must be a full URL or a site-relative path (or empty)",
      )
      .nullable()
      .optional(),
    stat_label: z.string().max(120).nullable().optional(),
    stat_value: z.string().max(60).nullable().optional(),
    stat_unit: z.string().max(20).nullable().optional(),
    footer_caption: z.string().max(2000).nullable().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().nullable().optional(),
  })
  .strict();

// Updates: same shape, all optional. .strict() still rejects unknown keys.
export const popupUpdateSchema = popupInsertSchema.partial();

// Fields that participate in the content hash. Editing any of these = "new
// version" for dismissal purposes (previously-dismissed devices see the new
// popup once). Toggling is_active or changing sort_order does NOT change the
// hash, so scheduling a popup off/on doesn't re-annoy dismissed users.
type HashableFields = {
  headline_top?: string;
  headline_bottom?: string;
  body_paragraph?: string;
  project_logo_url?: string | null;
  stat_label?: string | null;
  stat_value?: string | null;
  stat_unit?: string | null;
  footer_caption?: string | null;
};

// Compute the SHA-256 content hash for a popup. Called by the POST/PATCH
// handlers after zod-validating the payload. Returns a 64-char hex string.
export function computeContentHash(fields: HashableFields): string {
  const canonical = JSON.stringify({
    headline_top: fields.headline_top ?? "",
    headline_bottom: fields.headline_bottom ?? "",
    body_paragraph: fields.body_paragraph ?? "",
    project_logo_url: fields.project_logo_url ?? "",
    stat_label: fields.stat_label ?? "",
    stat_value: fields.stat_value ?? "",
    stat_unit: fields.stat_unit ?? "",
    footer_caption: fields.footer_caption ?? "",
  });
  return createHash("sha256").update(canonical).digest("hex");
}
