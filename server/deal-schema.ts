import { z } from "zod";

// Whitelist of columns the admin API may write to the `deals` table. Mirrors the
// listing-schema pattern: .strict() rejects unknown keys (prevents mass-assign).
// Keep in sync with the Deal type in client/src/lib/deals.ts and the Supabase
// `deals` table.
export const dealInsertSchema = z
  .object({
    client_name: z.string().min(1).max(200),
    client_logo: z.string().max(2000).nullable().optional(),
    sqm: z.number().int().nonnegative().nullable().optional(),
    location: z.string().max(300).nullable().optional(),
    space_type: z.string().max(100).nullable().optional(),
    lease_format: z.string().max(100).nullable().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().nullable().optional(),
  })
  .strict();

// Updates: same shape, all optional. .strict() still rejects unknown keys.
export const dealUpdateSchema = dealInsertSchema.partial();
