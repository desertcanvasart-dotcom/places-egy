import { formatEgpShort, formatRateDate, useUsdEgpRate } from "@/lib/currency";
import { expectedPriceRange } from "@/lib/listing-checks";
import { areaLabel } from "@/lib/listing-text";

type PriceFields = {
  price?: number | null;
  currency?: string | null;
  price_per_meter?: number | null;
  area_sqm?: number | null;
  outdoor_area_sqm?: number | null;
  outdoor_price_per_meter?: number | null;
  price_is_lump_sum?: boolean | null;
  transaction_type?: string | null;
};

const n = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 });

// Shows the editor exactly what visitors will see on the card before saving,
// so a USD price left on EGP ("20,250 EGP / month" for a $20,250 unit) is
// obvious at a glance.
export function PricePreview({ form }: { form: PriceFields }) {
  const fx = useUsdEgpRate();
  const cur = form.currency === "USD" || form.currency === "EGP" ? form.currency : null;
  const rent = (form.transaction_type ?? "").toLowerCase() === "rent";
  const price = Number(form.price) || 0;
  const ppm = Number(form.price_per_meter) || 0;
  const area = Number(form.area_sqm) || 0;

  const calc =
    !form.price_is_lump_sum && ppm && area
      ? expectedPriceRange(ppm, area, form.outdoor_area_sqm, form.outdoor_price_per_meter)
      : null;

  return (
    <div className="md:col-span-2 rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3 space-y-1.5">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Visitors will see</p>
      {!cur ? (
        <p className="text-sm text-destructive font-medium">Choose the currency the price is quoted in.</p>
      ) : (
        <>
          <p className="text-primary">
            <span className="text-2xl font-bold">{price ? n(price) : "—"}</span>{" "}
            <span className="text-sm text-muted-foreground">
              {cur}
              {rent ? " / month" : ""}
            </span>
            {cur === "USD" && price > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                ≈ {formatEgpShort(Math.round(price * fx.rate))} at {fx.rate.toFixed(2)}
                {formatRateDate(fx.asOf) ? ` (${formatRateDate(fx.asOf)})` : ""}
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {[areaLabel(form) || null, ppm ? `${n(ppm)} ${cur}/m²` : null, form.price_is_lump_sum ? "lump-sum price" : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {calc && (
            <p className="text-xs text-muted-foreground">
              Price per m² × area = {calc[0] === calc[1] ? n(calc[0]) : `${n(calc[0])}–${n(calc[1])} (outdoor rate not set)`} {cur}
              {price && calc[0] === calc[1] && Math.abs(price - calc[0]) / calc[0] > 0.03 ? " — differs from the price above" : ""}
            </p>
          )}
        </>
      )}
    </div>
  );
}
