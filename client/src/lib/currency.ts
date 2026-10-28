import type { Listing } from "@/lib/supabase";

// Per-listing currency. Admin sets USD or EGP when creating a listing; the
// price entered IS that currency. Prices are only converted (USD_EGP_RATE below)
// to compare and filter across currencies.
// Older listings created before this field existed have no `currency` value,
// so we default to EGP to preserve their original display.
export type Currency = "EGP" | "USD";

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "EGP", label: "EGP" },
  { value: "USD", label: "USD" },
];

// The currency code to display for a listing, defaulting to EGP for legacy
// rows where the field is null/empty.
export function listingCurrency(listing: Pick<Listing, "currency">): Currency {
  return listing.currency === "USD" ? "USD" : "EGP";
}

// USD -> EGP rate used only to compare and filter prices across currencies
// (listings still display their own currency). Set VITE_USD_EGP_RATE in the
// build environment (Railway variables) and redeploy to change it.
export const DEFAULT_USD_EGP_RATE = 56.09; // 2026-10-28
export const USD_EGP_RATE: number = Number(import.meta.env.VITE_USD_EGP_RATE) || DEFAULT_USD_EGP_RATE;

/** The listing's price normalised to EGP, or null when it has no price. */
export function priceInEgp(listing: Pick<Listing, "price" | "currency">, rate = USD_EGP_RATE): number | null {
  const p = Number(listing.price) || 0;
  if (p <= 0) return null;
  return listingCurrency(listing) === "USD" ? Math.round(p * rate) : p;
}

/** "EGP 1.2M", "EGP 850K" — short form for the "≈ EGP" hint on USD listings. */
export function formatEgpShort(value: number): string {
  if (value >= 1_000_000) return `EGP ${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `EGP ${Math.round(value / 1_000)}K`;
  return `EGP ${value}`;
}
