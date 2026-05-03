// URL helpers for the per-listing detail pages at `/listings/{id}-{slug}`.
//
// Why id+slug? The id is the canonical identifier (used to fetch from Supabase).
// The slug is purely cosmetic + SEO — keywords from the title go in the URL so
// Google ranks deep listing pages for long-tail searches like
// "200 sqm office in Mivida Business Park". If the title changes, the slug
// changes, but the id stays the same so old links keep working.

import type { Listing } from "@/lib/supabase";
import { slugify } from "@/lib/faq";

// Build the canonical URL for a given listing.
// Falls back to `{type}-{location}-{area}sqm` if the title is empty so the
// URL still has some keyword content even for poorly-titled rows.
export function listingUrl(listing: Pick<Listing, "id" | "title" | "property_type" | "location" | "area_sqm">): string {
  const titleSlug = slugify(listing.title || "");
  if (titleSlug) return `/listings/${listing.id}-${titleSlug}`;

  const fallbackParts = [
    listing.property_type,
    listing.location,
    listing.area_sqm ? `${listing.area_sqm}sqm` : null,
  ].filter(Boolean).join(" ");
  const fallbackSlug = slugify(fallbackParts);
  return fallbackSlug ? `/listings/${listing.id}-${fallbackSlug}` : `/listings/${listing.id}`;
}

// Parse the `:idSlug` URL param back into a numeric Supabase id.
// Returns null if the URL is malformed (no leading number).
export function parseListingId(idSlug: string | undefined): number | null {
  if (!idSlug) return null;
  const idStr = idSlug.split("-")[0];
  const id = Number.parseInt(idStr, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}
