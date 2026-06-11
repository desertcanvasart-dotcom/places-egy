import { z } from "zod";

// Whitelist of columns the admin API is allowed to write. Anything not in this
// schema is silently dropped — prevents mass-assignment via req.body.
//
// Keep in sync with the `Listing` type in client/src/lib/supabase.ts. The DB
// owns the `id` column; we never accept it from the client.
export const listingInsertSchema = z
  .object({
    title: z.string().min(1).max(300),
    property_type: z.string().max(100).optional(),
    subtype: z.string().max(100).optional(),
    developer: z.string().max(200).optional(),
    project: z.string().max(200).optional(),
    location: z.string().max(200).optional(),
    location_area: z.string().max(200).optional(),
    // Numeric fields accept null: the admin form sends null for any number
    // input left blank (an unfilled stat is omitted, not stored as 0). Title is
    // the only hard-required field server-side; price is enforced as required
    // by the dashboard's save-button gate, kept optional here so legacy rows
    // without a price can still be edited.
    price: z.number().finite().nonnegative().nullable().optional(),
    currency: z.string().max(10).optional(),
    area_sqm: z.number().finite().nonnegative().nullable().optional(),
    transaction_type: z.string().max(50).optional(),
    furnishing: z.string().max(50).optional(),
    description: z.string().max(20000).optional(),
    images: z.array(z.string().url().max(2000)).max(50).optional(),
    delivery_date: z.string().max(50).optional(),
    parking: z.number().int().nonnegative().nullable().optional(),
    price_per_meter: z.number().finite().nonnegative().nullable().optional(),
    maintenance_fees: z.number().finite().nonnegative().nullable().optional(),
    maintenance_status: z.string().max(50).optional(),
    floor: z.number().int().nullable().optional(),
  })
  .strict();

// Updates use the same shape but every field is optional. `.strict()` still
// rejects unknown keys.
export const listingUpdateSchema = listingInsertSchema.partial();
