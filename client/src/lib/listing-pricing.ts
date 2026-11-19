// PLACES pricing rules for indoor + outdoor space (agreed 2026-11-19):
//
//  1. `price` is the INDOOR rent/price: the unit itself (price per m² × area).
//  2. Outdoor space (terrace, roof, garden) is ALWAYS charged, shown separately.
//  3. Outdoor rate = 25% of the indoor rate per m², unless the landlord's
//     written quote says otherwise; the landlord's quote prevails.
//  4. Total = indoor + outdoor. Budget filters and price sorting use the total.
//  5. Maintenance applies to the outdoor area too.
//
// A listing marked "price is a lump sum" (a whole building quoted as one
// figure) already includes everything; no outdoor amount is added.
//
// Keep free of "@/" imports: the server and scripts import this file.

export const OUTDOOR_RATE_SHARE = 0.25;

type Priced = {
  price?: number | null;
  price_per_meter?: number | null;
  area_sqm?: number | null;
  outdoor_area_sqm?: number | null;
  outdoor_price_per_meter?: number | null;
  price_is_lump_sum?: boolean | null;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** The default outdoor rate for an indoor rate: 25% of it. */
export function defaultOutdoorRate(indoorRate: number | null | undefined): number | null {
  const r = Number(indoorRate) || 0;
  return r > 0 ? round2(r * OUTDOOR_RATE_SHARE) : null;
}

/** Outdoor rate in effect: the stored one (landlord's quote) or 25% of the indoor rate. */
export function effectiveOutdoorRate(l: Priced): number | null {
  if (l.outdoor_price_per_meter != null) return Number(l.outdoor_price_per_meter);
  return defaultOutdoorRate(l.price_per_meter);
}

/** Monthly (or sale) amount for the outdoor area, or 0 when none / lump sum / unknown rate. */
export function outdoorAmount(l: Priced): number {
  const area = Number(l.outdoor_area_sqm) || 0;
  if (!area || l.price_is_lump_sum) return 0;
  const rate = effectiveOutdoorRate(l);
  return rate ? Math.round(area * rate) : 0;
}

/** Indoor price + outdoor amount: what the tenant/buyer actually pays. */
export function totalPrice(l: Priced): number {
  const indoor = Number(l.price) || 0;
  return indoor > 0 ? indoor + outdoorAmount(l) : 0;
}

/** Area that maintenance is charged on (indoor + outdoor). */
export function maintenanceArea(l: Priced): number {
  return (Number(l.area_sqm) || 0) + (Number(l.outdoor_area_sqm) || 0);
}
