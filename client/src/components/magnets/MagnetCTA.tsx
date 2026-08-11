import { Link } from "wouter";
import { ArrowRight, FileText } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

// Variant A — "Redirect" style CTA card. Compact card with a headline and a
// button that navigates to the standalone /resources/market-report landing
// page. Use in Nav, Footer, and homepage's lower CTA row — anywhere we
// don't need the user to stay on the current page.
//
// The <a> vs <Link> distinction: this is an in-app route so we use wouter's
// <Link> and trackEvent onClick so GA4 knows which placement referred them.

type Props = {
  placement: string; // e.g. "homepage_cta", "footer", "nav"
  compact?: boolean;
};

export function MagnetCTA({ placement, compact = false }: Props) {
  const onClick = () => {
    trackEvent("magnet_cta_click", {
      placement,
      magnet: "cairo_office_market_report_2026",
      variant: "redirect",
    });
  };

  if (compact) {
    // Text-link style — for footer / nav dropdowns.
    return (
      <Link
        href="/resources/market-report"
        onClick={onClick}
        className="inline-flex items-center gap-2 text-sm text-primary/80 hover:text-accent transition-colors"
      >
        <FileText className="w-4 h-4" />
        Free Market Report
      </Link>
    );
  }

  // Full card — for homepage lower section.
  return (
    <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-primary to-primary/90 p-8 md:p-10 text-center shadow-lg shadow-primary/10">
      <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full mb-4">
        Free · PDF · 2026
      </span>
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 leading-tight">
        Cairo Office Market Report 2026
      </h2>
      <p className="text-white/70 text-base max-w-xl mx-auto mb-6">
        Pricing trends, supply pipeline, and yield analysis across Cairo's six
        most active office districts — from the PLACES advisory team.
      </p>
      <Link href="/resources/market-report" onClick={onClick}>
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-medium px-6 py-3 rounded-full text-sm transition-colors shadow-lg shadow-accent/30 hover:scale-105 transition-transform duration-200"
        >
          Get the free report <ArrowRight className="w-4 h-4" />
        </button>
      </Link>
    </div>
  );
}
