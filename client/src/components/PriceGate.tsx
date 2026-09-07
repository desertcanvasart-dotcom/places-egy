import { Lock } from "lucide-react";
import { usePriceUnlock, priceRangeLabel } from "@/lib/price-unlock";
import { trackEvent } from "@/lib/analytics";
import type { Currency } from "@/lib/currency";

// Renders either the exact price (if unlocked) or a price range + subtle
// "unlock" hint (if locked). The parent owns the modal — this component is
// purely presentational + fires the click event that tells the parent to
// open the unlock modal.
//
// Two visual variants:
//   size="hero"   — the big price in the top-right of a listing detail page
//   size="card"   — the compact price shown on a listing card in a grid

interface Props {
  price: number;
  currency: Currency;
  transactionType: string | null | undefined;
  size: "hero" | "card";
  listingId?: number;
  onUnlockClick: () => void;
}

export function PriceGate({
  price,
  currency,
  transactionType,
  size,
  listingId,
  onUnlockClick,
}: Props) {
  const { unlocked } = usePriceUnlock();
  const isRent = transactionType?.toLowerCase() === "rent";

  if (unlocked) {
    // Real price — same rendering as before the gate existed.
    if (size === "hero") {
      return (
        <div className="text-left md:text-right shrink-0">
          <span className="text-2xl md:text-4xl font-bold text-primary font-serif">
            {price.toLocaleString()}
          </span>
          <p className="text-sm text-muted-foreground">
            {currency}
            {isRent ? "/month" : ""}
          </p>
        </div>
      );
    }
    return (
      <>
        <span className="text-2xl font-bold text-primary font-serif">
          {price.toLocaleString()}
        </span>
        <p className="text-xs text-muted-foreground">
          {currency}
          {isRent ? "/month" : ""}
        </p>
      </>
    );
  }

  // Locked — show range + a subtle affordance to unlock.
  const range = priceRangeLabel(price, currency, transactionType);
  const handleClick = () => {
    trackEvent("price_gate_click", {
      listing_id: listingId ?? null,
      size,
    });
    onUnlockClick();
  };

  if (size === "hero") {
    // Hero locked state: stack the range price above a proper pill button.
    // Range price gets a "+" suffix so it's obvious this is a floor, not
    // an exact number. Pill button is a real interactive-looking element
    // — accent border + lock icon + subtle background — so it clearly
    // reads as clickable rather than as decorative caption text.
    return (
      <div className="flex flex-col items-start md:items-end shrink-0 gap-2.5">
        <div>
          <span className="text-2xl md:text-4xl font-bold text-primary font-serif leading-none">
            {range}
          </span>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs md:text-sm font-semibold hover:bg-accent hover:text-white hover:border-accent transition-all"
          aria-label="Unlock exact price"
        >
          <Lock className="w-3 h-3 md:w-3.5 md:h-3.5" />
          <span>Unlock exact price</span>
        </button>
      </div>
    );
  }

  // Card locked state: compact stack for grid layouts.
  return (
    <button
      type="button"
      onClick={handleClick}
      className="group text-left"
    >
      <span className="text-lg font-bold text-primary font-serif block leading-none">
        {range}
      </span>
      <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-[10px] font-semibold group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all">
        <Lock className="w-2.5 h-2.5" /> Unlock
      </span>
    </button>
  );
}

// Locked-state renderer for price_per_meter and other derived fields.
// Shows a small "🔒 Unlock" label instead of the real number. Uses the same
// click affordance as the main gate — clicking it opens the same modal.
interface DerivedProps {
  label: string;
  onUnlockClick: () => void;
}
export function DerivedPriceLocked({ label, onUnlockClick }: DerivedProps) {
  return (
    <button
      type="button"
      onClick={onUnlockClick}
      className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
      aria-label={`Unlock ${label}`}
    >
      <Lock className="w-3 h-3" />
      Unlock
    </button>
  );
}
