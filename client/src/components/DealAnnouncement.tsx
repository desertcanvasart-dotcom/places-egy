import { useState } from "react";
import { MapPin, X } from "lucide-react";

// Deal Announcement — a full-bleed "Done Deal" strip that deliberately breaks
// the boxed-card rhythm of the homepage so a freshly-closed deal reads as an
// announcement, not another content card. Charcoal ground with a JUST CLOSED
// corner stamp, the leased-SQM hero metric (animated count-up), three
// category-encoded tags, the client logo as a sign-off, and a translucent ghost
// of the SQM figure bleeding off the right edge.
//
// Adding a new deal is data-only — pass a DealAnnouncementProps object.

export interface DealAnnouncementProps {
  clientName: string;
  /** Image URL — a light/white logo, to sit on the dark ground. */
  clientLogo: string;
  /** Leased area; also drives the ghost figure. */
  sqm: number | string;
  /** District / business park — never hardcoded; always per deal. */
  location: string;
  /** Nature of the space, e.g. "Administrative HQ". */
  spaceType: string;
  /** Commercial structure, e.g. "Long-term lease", "Sale". */
  leaseFormat: string;
  /** Show a dismiss control (for a persistent strip). */
  dismissible?: boolean;
}

function formatSqm(sqm: number | string): string {
  if (typeof sqm === "number") return sqm.toLocaleString("en-US");
  return sqm;
}

export function DealAnnouncement({
  clientName,
  clientLogo,
  sqm,
  location,
  spaceType,
  leaseFormat,
  dismissible = false,
}: DealAnnouncementProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const sqmLabel = formatSqm(sqm);

  return (
    <section
      aria-label={`Latest closed deal: ${sqmLabel} square metres leased to ${clientName} in ${location}`}
      className="group relative overflow-hidden rounded-2xl border border-[#ECE7D8]/10 bg-[#16161A] text-[#ECE7D8] shadow-lg shadow-black/20 motion-safe:animate-[dealBreathe_3s_ease-in-out_infinite] motion-safe:will-change-transform"
    >
      {/* Animated coral hue — a soft radial wash that drifts/pulses behind the
          content, giving the dark banner a living glow. motion-safe gated. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motion-safe:animate-[dealHue_6s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(120% 140% at 20% 0%, rgba(232,64,74,0.22), transparent 55%)",
        }}
      />

      {/* Subtle grain over the charcoal, echoing the deck slides. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* 'Alive' sweep — a slow diagonal sheen drifting across the dark surface.
          motion-safe only, so reduced-motion users see a static strip. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motion-safe:animate-[dealSweep_7s_linear_infinite] opacity-60"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(236,231,216,0.06) 50%, transparent 60%)",
          backgroundSize: "250% 100%",
        }}
      />

      {/* Ghost SQM figure, bleeding off the right edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none font-serif font-bold leading-none text-[#ECE7D8]/[0.045] text-[40vw] md:text-[15rem]"
      >
        {sqmLabel}
      </span>

      {/* 'JUST CLOSED' diagonal corner ribbon (top-right). The bar is wider than
          the corner and rotated 45°, with its ends tucking under the card edges
          so overflow-hidden clips the ENDS, not the text — keeping the words
          fully readable. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[52px] top-[22px] z-20 hidden w-[180px] rotate-45 bg-accent py-1 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-accent-foreground shadow-md sm:block"
      >
        Just Closed
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss deal announcement"
          className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full text-[#ECE7D8]/50 transition-colors hover:bg-[#ECE7D8]/10 hover:text-[#ECE7D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Content row — kept compact so the card stays a slim announcement, not
          a tall slab. */}
      <div className="relative z-20 flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-7 md:p-6">
        {/* Eyebrow + hero metric */}
        <div className="flex items-center gap-4 shrink-0">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            New Deal
          </span>
          <div className="flex items-baseline gap-2">
            {/* Static number with a gentle zoom pulse to draw the eye, instead
                of a count-up. inline-block so the scale transform applies; gated
                by motion-safe for reduced-motion users. */}
            <span className="font-serif text-4xl font-bold leading-none tracking-tight text-[#ECE7D8] md:text-5xl">
              {sqmLabel}
            </span>
            <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.2em] text-[#ECE7D8]/55">
              SQM
              <br />
              Leased
            </span>
          </div>
        </div>

        {/* Hairline divider between the metric and the supporting detail. */}
        <div aria-hidden className="hidden h-10 w-px bg-[#ECE7D8]/15 md:block" />

        {/* Three category-encoded tags. */}
        <div className="flex flex-wrap items-center gap-2.5">
          <DealTag category="Location" value={location} variant="outline" icon={<MapPin className="h-3 w-3" />} />
          <DealTag category="Space Type" value={spaceType} variant="filled" />
          <DealTag category="Term" value={leaseFormat} variant="outline" />
        </div>

        {/* Client logo — sign-off, sits close to the tags. Right padding keeps
            it clear of the diagonal JUST CLOSED ribbon in the top-right corner. */}
        {clientLogo && (
          <div className="flex shrink-0 items-center md:border-l md:border-[#ECE7D8]/15 md:pl-4 md:pr-10">
            <img
              src={clientLogo}
              alt={`${clientName} logo`}
              loading="lazy"
              decoding="async"
              className="h-14 w-auto max-w-[220px] object-contain opacity-95 brightness-0 invert md:h-16"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function DealTag({
  category,
  value,
  variant,
  icon,
}: {
  category: string;
  value: string;
  variant: "filled" | "outline";
  icon?: React.ReactNode;
}) {
  const skin =
    variant === "filled"
      ? "bg-[#ECE7D8] text-[#0E0E0F]"
      : "border border-[#ECE7D8]/20 text-[#ECE7D8]";
  const labelTone = variant === "filled" ? "text-[#0E0E0F]/55" : "text-[#ECE7D8]/45";

  if (!value) return null;

  return (
    <div className={`flex flex-col gap-0.5 rounded-lg px-3 py-1.5 ${skin}`}>
      <span className={`text-[9px] font-bold uppercase tracking-[0.18em] ${labelTone}`}>
        {category}
      </span>
      <span className="flex items-center gap-1.5 text-sm font-semibold leading-tight">
        {icon}
        {value}
      </span>
    </div>
  );
}
