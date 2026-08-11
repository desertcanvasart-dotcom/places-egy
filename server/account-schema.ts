import { z } from "zod";

// Payload for POST /api/accounts (public signup). No password — Option B
// quick-signup lets a visitor go from "wants to save 3rd listing" to
// "has account + all favorites persisted" in ~15 seconds. The account is
// really a lead-capture form dressed up as an account so PLACES can WhatsApp
// them later with matched listings.
export const accountSignupSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(4).max(40),
    // Honeypot: real users leave blank, bots fill everything.
    website: z.string().max(200).optional(),
  })
  .strict();

// Payload for POST /api/accounts/favorites (add a single favorite).
export const addFavoriteSchema = z
  .object({
    listing_id: z.number().int().positive(),
  })
  .strict();

// Payload for POST /api/accounts/favorites/bulk (merge anonymous localStorage
// favorites into an account right after signup).
export const bulkFavoritesSchema = z
  .object({
    listing_ids: z.array(z.number().int().positive()).max(200),
  })
  .strict();
