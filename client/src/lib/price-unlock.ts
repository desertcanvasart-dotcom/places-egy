import { useEffect, useState } from "react";
import type { Currency } from "@/lib/currency";

// Price-gate lead magnet. Visitors see a price RANGE ("EGP 2M – 5M") instead
// of the exact number until they submit an email/phone/name. Once submitted,
// a localStorage flag persists forever on their device and every listing on
// the site shows the real price from that point on.
//
// Zero server-side state change: reuses POST /api/leads (which already has
// zod validation + strictLimiter + honeypot) with lead_source="price_unlock"
// so submissions land in the same /dashboard → Leads table alongside every
// other lead magnet. No new endpoints, no session cookies, no account link.

const UNLOCK_KEY = "places_price_unlocked";

// Fixed price buckets used to show a range instead of the exact number.
// Order matters — first bucket whose ceiling exceeds `price` wins.
const BUCKETS_EGP: { ceiling: number; label: string }[] = [
  { ceiling: 1_000_000, label: "Under EGP 1M" },
  { ceiling: 2_000_000, label: "EGP 1M – 2M" },
  { ceiling: 5_000_000, label: "EGP 2M – 5M" },
  { ceiling: 10_000_000, label: "EGP 5M – 10M" },
  { ceiling: 20_000_000, label: "EGP 10M – 20M" },
  { ceiling: 50_000_000, label: "EGP 20M – 50M" },
  { ceiling: Infinity, label: "EGP 50M+" },
];

const BUCKETS_USD: { ceiling: number; label: string }[] = [
  { ceiling: 25_000, label: "Under $25K" },
  { ceiling: 50_000, label: "$25K – $50K" },
  { ceiling: 100_000, label: "$50K – $100K" },
  { ceiling: 250_000, label: "$100K – $250K" },
  { ceiling: 500_000, label: "$250K – $500K" },
  { ceiling: 1_000_000, label: "$500K – $1M" },
  { ceiling: Infinity, label: "$1M+" },
];

// Rent listings need tighter ranges — a rent price of 50k EGP/month is not
// comparable to a 5M EGP purchase price.
const RENT_BUCKETS_EGP: { ceiling: number; label: string }[] = [
  { ceiling: 20_000, label: "Under EGP 20K/mo" },
  { ceiling: 50_000, label: "EGP 20K – 50K/mo" },
  { ceiling: 100_000, label: "EGP 50K – 100K/mo" },
  { ceiling: 200_000, label: "EGP 100K – 200K/mo" },
  { ceiling: 500_000, label: "EGP 200K – 500K/mo" },
  { ceiling: Infinity, label: "EGP 500K+/mo" },
];

const RENT_BUCKETS_USD: { ceiling: number; label: string }[] = [
  { ceiling: 500, label: "Under $500/mo" },
  { ceiling: 1_500, label: "$500 – $1.5K/mo" },
  { ceiling: 5_000, label: "$1.5K – $5K/mo" },
  { ceiling: 15_000, label: "$5K – $15K/mo" },
  { ceiling: Infinity, label: "$15K+/mo" },
];

export function priceRangeLabel(
  price: number,
  currency: Currency,
  transactionType: string | null | undefined,
): string {
  const isRent = transactionType?.toLowerCase() === "rent";
  const buckets = isRent
    ? currency === "USD"
      ? RENT_BUCKETS_USD
      : RENT_BUCKETS_EGP
    : currency === "USD"
      ? BUCKETS_USD
      : BUCKETS_EGP;
  const bucket = buckets.find((b) => price < b.ceiling) ?? buckets[buckets.length - 1];
  return bucket.label;
}

function readUnlockedRaw(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    // localStorage disabled (Safari private mode, etc.) — fall back to "locked"
    // so the visitor still sees the gate. They can still unlock via cookies
    // during the current session even if it doesn't persist.
    return false;
  }
}

function writeUnlocked(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(UNLOCK_KEY, "1");
    // Fire a custom event so all hook subscribers on this tab update at once.
    // Cross-tab updates ride on the native `storage` event.
    window.dispatchEvent(new CustomEvent("places-price-unlocked"));
  } catch {
    // ignore
  }
}

// Reactive hook: returns whether the visitor has unlocked exact pricing on
// this device, plus a `markUnlocked()` callback the modal calls after a
// successful lead submission. Subscribes to both cross-tab `storage` events
// and same-tab custom events so every mounted <PriceGate> updates in unison
// the moment the visitor unlocks.
export function usePriceUnlock(): {
  unlocked: boolean;
  markUnlocked: () => void;
} {
  const [unlocked, setUnlocked] = useState<boolean>(() => readUnlockedRaw());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const refresh = () => setUnlocked(readUnlockedRaw());
    window.addEventListener("storage", refresh);
    window.addEventListener("places-price-unlocked", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("places-price-unlocked", refresh);
    };
  }, []);

  return {
    unlocked,
    markUnlocked: () => {
      writeUnlocked();
      setUnlocked(true);
    },
  };
}
