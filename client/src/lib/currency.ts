import type { Listing } from "@/lib/supabase";

// Per-listing currency. Admin sets USD or EGP when creating a listing; the
// price entered IS that currency — there is no conversion or exchange rate.
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
