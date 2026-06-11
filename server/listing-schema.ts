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
    price: z.number().finite().nonnegative().optional(),
    currency: z.string().max(10).optional(),
    area_sqm: z.number().finite().nonnegative().optional(),
    transaction_type: z.string().max(50).optional(),
    furnishing: z.string().max(50).optional(),
    description: z.string().max(20000).optional(),
    images: z.array(z.string().url().max(2000)).max(50).optional(),
    delivery_date: z.string().max(50).optional(),
    parking: z.number().int().nonnegative().optional(),
    price_per_meter: z.number().finite().nonnegative().optional(),
    maintenance_fees: z.number().finite().nonnegative().optional(),
    maintenance_status: z.string().max(50).optional(),
    floor: z.number().int().optional(),
  })
  .strict();

// Updates use the same shape but every field is optional. `.strict()` still
// rejects unknown keys.
export const listingUpdateSchema = listingInsertSchema.partial();
