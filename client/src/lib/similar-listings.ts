// "Similar units" ranking, shared by the listing page and the server-rendered
// HTML (server/seo/render.ts). Keep free of "@/" imports.

export interface SimilarCandidate {
  id: number;
  transaction_type?: string | null;
  area_sqm?: number | null;
  location?: string | null;
  price?: number | null;
  currency?: string | null;
  rental_status?: string | null;
}

/**
 * Same transaction type, area within ±30% (widened in 30% steps until there
 * are at least 4 matches), then same location first, same currency, and
 * closest price. Excludes the listing itself and rented units.
 */
export function rankSimilar<T extends SimilarCandidate>(listing: SimilarCandidate, pool: T[], limit = 4): T[] {
  const candidates = pool.filter(
    (o) => o.id !== listing.id && o.transaction_type === listing.transaction_type && o.rental_status !== "rented",
  );
  const area = Number(listing.area_sqm) || 0;
  let picked = candidates;
  if (area > 0) {
    for (let band = 0.3; band <= 2.01; band += 0.3) {
      picked = candidates.filter((o) => {
        const a = Number(o.area_sqm) || 0;
        return a > 0 && Math.abs(a - area) <= area * band;
      });
      if (picked.length >= 4) break;
    }
    if (picked.length < 4) picked = candidates;
  }
  const price = Number(listing.price) || 0;
  return [...picked]
    .sort(
      (a, b) =>
        Number(b.location === listing.location) - Number(a.location === listing.location) ||
        Number(b.currency === listing.currency) - Number(a.currency === listing.currency) ||
        Math.abs((Number(a.price) || 0) - price) - Math.abs((Number(b.price) || 0) - price) ||
        b.id - a.id,
    )
    .slice(0, limit);
}
