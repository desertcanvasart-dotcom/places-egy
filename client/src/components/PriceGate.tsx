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
    return (
      <button
        type="button"
        onClick={handleClick}
        className="group text-left md:text-right shrink-0"
      >
        <span className="text-xl md:text-3xl font-bold text-primary font-serif">
          {range}
        </span>
        <p className="text-xs md:text-sm text-accent font-semibold mt-1 inline-flex items-center gap-1 group-hover:underline">
          <Lock className="w-3 h-3" /> Unlock exact price
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group text-left"
    >
      <span className="text-lg font-bold text-primary font-serif block">
        {range}
      </span>
      <p className="text-[11px] text-accent font-semibold inline-flex items-center gap-1 group-hover:underline mt-0.5">
        <Lock className="w-2.5 h-2.5" /> Unlock exact price
      </p>
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
