import { useEffect, useState } from "react";
import { X, FileText } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { trackEvent } from "@/lib/analytics";

// Variant B — "Inline reveal" as a slide-up bar at the bottom of blog pages.
// Sits fixed at the bottom of the viewport, out of the way, doesn't block
// content. On click, expands into a full form modal that captures the lead
// without navigating away. Dismissible with a 14-day cookie so we don't
// nag people who already said no.
//
// Fires:
//   - blog_magnet_bar_shown (once per page load, after visible + not dismissed)
//   - blog_magnet_bar_open  (when user clicks to expand)
//   - blog_magnet_bar_dismiss (when user clicks X)

const DISMISS_KEY = "magnet_bar_dismissed_at";
const DISMISS_TTL_DAYS = 14;
const SHOW_AFTER_MS = 5000; // don't be annoying — wait 5s after page load

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    const ageDays = (Date.now() - ts) / (1000 * 60 * 60 * 24);
    return ageDays < DISMISS_TTL_DAYS;
  } catch {
    return false;
  }
}

export function BlogSlideUpMagnet() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isDismissed()) return;
    const t = setTimeout(() => {
      setVisible(true);
      trackEvent("blog_magnet_bar_shown", {
        magnet: "cairo_office_market_report_2026",
      });
    }, SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Ignore storage errors — user just gets nagged next visit.
    }
    trackEvent("blog_magnet_bar_dismiss", {
      magnet: "cairo_office_market_report_2026",
    });
    setVisible(false);
    setExpanded(false);
  };

  const open = () => {
    setExpanded(true);
    trackEvent("blog_magnet_bar_open", {
      magnet: "cairo_office_market_report_2026",
    });
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop when expanded — click outside to close (not dismiss). */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-border/40 overflow-hidden">
            {expanded ? (
              // Full form
              <div className="p-6 md:p-8 relative">
                <button
                  onClick={() => setExpanded(false)}
                  aria-label="Close"
                  className="absolute top-4 right-4 text-muted-foreground hover:text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="mb-5 pr-8">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full mb-3">
                    Free · PDF · 2026
                  </span>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-primary mb-1">
                    Cairo Office Market Report 2026
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pricing, supply, and yields across Cairo's six most active
                    districts. We'll email it to you within a few minutes.
                  </p>
                </div>
                <LeadForm
                  leadSource="blog_slide_up"
                  magnet="cairo_office_market_report_2026"
                  submitLabel="Send me the report"
                  showMessage={false}
                  successTitle="You're on the list."
                  successBody="The report will land in your inbox within a few minutes. Check spam if you don't see it."
                />
              </div>
            ) : (
              // Compact CTA bar
              <div className="flex items-center gap-4 p-4 md:p-5">
                <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-semibold text-primary leading-tight">
                    Free: Cairo Office Market Report 2026
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">
                    Pricing benchmarks + yields across every district.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={open}
                  className="inline-flex items-center bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2 rounded-full shrink-0 shadow-md shadow-accent/20"
                >
                  Get it free
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label="Dismiss for 14 days"
                  className="text-muted-foreground hover:text-primary shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
