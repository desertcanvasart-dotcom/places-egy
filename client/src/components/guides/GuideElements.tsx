import type { ReactNode } from "react";

// Reusable editorial building blocks for /guides/* content. Each element
// is designed to earn its place — used sparingly (2-5 per guide) so guides
// feel produced rather than cluttered. Voice matches PLACES brand: serif
// numbers, accent-red highlights, cream backgrounds, primary-dark on white.
//
// Import in any guide page:
//   import { HighlightNumber, StatCallout, KeyInsight, PullQuote,
//            PriceRangeBar, ProgressStep, ProgressTimeline,
//            ComparisonPanel } from "@/components/guides/GuideElements";

// ─── Inline number highlight ────────────────────────────────────────────
// Wrap a number in prose to make it visually pop:
//   <HighlightNumber>EGP 24 million</HighlightNumber>
// Renders in accent red with tabular numbers. Use for any specific figure
// the reader should remember.
export function HighlightNumber({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-accent font-bold not-italic"
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {children}
    </span>
  );
}

// ─── Stat callout ───────────────────────────────────────────────────────
// Big pull-out number that anchors a section visually. Use at key data
// reveals (e.g. "the headline rental range"), 3-5 times per guide max.
//
//   <StatCallout value="EGP 700 – 1,400" label="Prime New Cairo, per m² / month" />
export function StatCallout({
  value,
  label,
  caption,
}: {
  value: string;
  label: string;
  caption?: string;
}) {
  return (
    <div className="not-prose my-8 border-y border-accent/20 py-6 md:py-8 grid md:grid-cols-[auto_1fr] items-center gap-4 md:gap-8">
      <div
        className="font-serif font-bold text-accent leading-none"
        style={{
          fontVariantNumeric: "tabular-nums",
          fontSize: "clamp(2.25rem, 5vw, 3.25rem)",
        }}
      >
        {value}
      </div>
      <div>
        <p className="text-sm font-semibold text-primary uppercase tracking-widest">
          {label}
        </p>
        {caption && (
          <p className="text-sm text-primary/60 mt-1 leading-relaxed">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Key insight callout ────────────────────────────────────────────────
// A branded aside for "wait, this matters" moments. Cream background,
// accent bar left. Use 2-3 per guide, sparingly.
//
//   <KeyInsight>
//     Watch out for service-charge inflation — landlords have raised…
//   </KeyInsight>
export function KeyInsight({
  children,
  label = "Key insight",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <aside className="not-prose my-8 rounded-2xl bg-[#FDFBF8] border border-accent/15 p-6 relative overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-1 bg-accent" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">
        {label}
      </p>
      <div className="text-primary text-base leading-relaxed">{children}</div>
    </aside>
  );
}

// ─── Pull quote ─────────────────────────────────────────────────────────
// A big italic quote with a left accent bar. Use for the ONE most important
// takeaway per guide — max 1-2 per guide.
export function PullQuote({
  children,
  attribution,
}: {
  children: ReactNode;
  attribution?: string;
}) {
  return (
    <blockquote className="not-prose my-10 border-l-4 border-accent pl-6 md:pl-8">
      <p className="font-serif text-xl md:text-2xl italic text-primary leading-snug">
        {children}
      </p>
      {attribution && (
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-primary/60">
          — {attribution}
        </p>
      )}
    </blockquote>
  );
}

// ─── Price range bar ────────────────────────────────────────────────────
// Small SVG bar chart showing a rent range within a global market min-max.
// Used in the pricing guide to visualize each district's spread. All bars
// share the same scale so districts read comparatively at a glance.
//
//   <PriceRangeBar
//     rows={[
//       { label: "New Cairo (Fifth Settlement)", min: 700, max: 1400 },
//       { label: "Sheikh Zayed", min: 500, max: 1100 },
//       ...
//     ]}
//     unit="EGP/m²"
//   />
type RangeRow = { label: string; min: number; max: number };
export function PriceRangeBar({
  rows,
  unit,
  format = (n: number) => new Intl.NumberFormat("en-US").format(n),
}: {
  rows: RangeRow[];
  unit: string;
  format?: (n: number) => string;
}) {
  const globalMin = Math.min(...rows.map((r) => r.min));
  const globalMax = Math.max(...rows.map((r) => r.max));
  const span = globalMax - globalMin || 1;

  return (
    <div className="not-prose my-8 rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-primary/60">
          Rental range · by district
        </p>
        <p
          className="text-xs text-primary/60 font-medium"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {unit}
        </p>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const leftPct = ((row.min - globalMin) / span) * 100;
          const widthPct = ((row.max - row.min) / span) * 100;
          return (
            <div key={row.label}>
              <div className="flex items-baseline justify-between mb-1.5">
                <p className="text-sm font-semibold text-primary">
                  {row.label}
                </p>
                <p
                  className="text-xs font-medium text-primary/70"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {format(row.min)} – {format(row.max)}
                </p>
              </div>
              <div className="relative h-2.5 rounded-full bg-primary/5 overflow-hidden">
                <div
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-accent/70 to-accent"
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(widthPct, 2)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scale ticks */}
      <div
        className="mt-4 flex justify-between text-[10px] font-medium text-primary/50"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        <span>{format(globalMin)}</span>
        <span>{format(Math.round((globalMin + globalMax) / 2))}</span>
        <span>{format(globalMax)}</span>
      </div>
    </div>
  );
}

// ─── Progress timeline ──────────────────────────────────────────────────
// A vertical numbered timeline. Turns "step 1 → step 7" numbered lists
// into a visual journey. Use in the "how to rent" guide.
//
//   <ProgressTimeline>
//     <ProgressStep n={1} title="Nail down your requirements">…</ProgressStep>
//     <ProgressStep n={2} title="Shortlist districts">…</ProgressStep>
//   </ProgressTimeline>
export function ProgressTimeline({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-8 relative">
      <div
        className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-accent/40 via-accent/20 to-transparent"
        aria-hidden="true"
      />
      <div className="space-y-6">{children}</div>
    </div>
  );
}

export function ProgressStep({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="relative pl-14">
      <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-serif font-bold text-sm shadow-md shadow-primary/20">
        {n}
      </div>
      <h4 className="font-serif text-lg font-bold text-primary leading-tight mb-2">
        {title}
      </h4>
      <div className="text-base text-primary/85 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

// ─── Comparison panel ───────────────────────────────────────────────────
// Two-column side-by-side comparison with distinct headline colors + icon
// bullets. Use for "buy vs rent," "serviced vs traditional," etc.
//
//   <ComparisonPanel
//     left={{ label: "Rent", tone: "neutral", points: ["A", "B"] }}
//     right={{ label: "Buy", tone: "accent", points: ["C", "D"] }}
//   />
type ComparisonSide = {
  label: string;
  points: string[];
  tone?: "neutral" | "accent";
};
export function ComparisonPanel({
  left,
  right,
}: {
  left: ComparisonSide;
  right: ComparisonSide;
}) {
  const sides = [left, right];
  return (
    <div className="not-prose my-8 grid md:grid-cols-2 gap-4">
      {sides.map((side, i) => {
        const isAccent = side.tone === "accent";
        return (
          <div
            key={i}
            className={`rounded-2xl p-6 md:p-7 border ${
              isAccent
                ? "bg-primary text-white border-primary"
                : "bg-white text-primary border-border/60"
            }`}
          >
            <p
              className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${
                isAccent ? "text-accent" : "text-accent"
              }`}
            >
              {side.label}
            </p>
            <ul className="space-y-2.5">
              {side.points.map((p, idx) => (
                <li key={idx} className="flex gap-2.5 text-sm leading-relaxed">
                  <span
                    className={`shrink-0 mt-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                      isAccent ? "bg-accent" : "bg-accent"
                    }`}
                  />
                  <span className={isAccent ? "text-white/90" : "text-primary/85"}>
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ─── Budget breakdown ───────────────────────────────────────────────────
// Stacked horizontal bar visualizing % breakdown by category. Used for
// fit-out costs guide's "where the money goes" section.
//
//   <BudgetBreakdown
//     total="EGP 2.1M for a 300m² fit-out"
//     rows={[
//       { label: "HVAC + MEP", pct: 18, color: "#E8404A" },
//       { label: "Partitions & doors", pct: 17, color: "#171717" },
//       ...
//     ]}
//   />
export function BudgetBreakdown({
  total,
  rows,
}: {
  total: string;
  rows: { label: string; pct: number; color?: string }[];
}) {
  const palette = ["#E8404A", "#171717", "#4A4A4A", "#8A6C50", "#B8956B", "#6B7A88", "#A85A66"];
  return (
    <div className="not-prose my-8 rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary/60">
          Budget breakdown
        </p>
        <p
          className="text-xs font-medium text-primary"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {total}
        </p>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-5 shadow-inner">
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              width: `${r.pct}%`,
              backgroundColor: r.color ?? palette[i % palette.length],
            }}
            title={`${r.label}: ${r.pct}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm text-primary">
            <span
              className="h-2.5 w-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: r.color ?? palette[i % palette.length] }}
            />
            <span className="flex-1 leading-tight">{r.label}</span>
            <span
              className="font-semibold text-primary/70"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {r.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
