import { useEffect, useState } from "react";
import { X, FileText, ArrowRight } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { trackEvent } from "@/lib/analytics";

// Corner slide-in for blog pages. Bottom-right, dark primary card with accent
// red button = high-contrast against the light background. Same UX pattern
// used by CornerSlideMagnet on homepage/listings — kept as a separate file
// because blog pages use a longer delay (readers should engage with the post
// first) and a different event slug for GA4 attribution.
//
// Fires:
//   - blog_magnet_shown    (once per mount, after visible + not dismissed)
//   - blog_magnet_open     (user clicked CTA — form expands)
//   - blog_magnet_dismiss  (user clicked X)

const DISMISS_KEY = "blog_magnet_dismissed_at";
const SUBMITTED_KEY = "market_report_submitted_at";
const DISMISS_TTL_DAYS = 14;
const SHOW_AFTER_MS = 12000; // 12s — let readers engage with the post first

function isSuppressed(): boolean {
  try {
    if (localStorage.getItem(SUBMITTED_KEY)) return true;
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isSuppressed()) return;
    const t = setTimeout(() => {
      setMounted(true);
      // Small delay before setting visible so the CSS transition fires.
      requestAnimationFrame(() => setVisible(true));
      trackEvent("blog_magnet_shown", {
        magnet: "cairo_office_market_report_2026",
      });
    }, SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Ignore — user just sees it again next visit.
    }
    trackEvent("blog_magnet_dismiss", {
      magnet: "cairo_office_market_report_2026",
    });
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
      setExpanded(false);
    }, 500);
  };

  const open = () => {
    setExpanded(true);
    trackEvent("blog_magnet_open", {
      magnet: "cairo_office_market_report_2026",
    });
  };

  const handleFormSuccess = () => {
    try {
      localStorage.setItem(SUBMITTED_KEY, String(Date.now()));
    } catch {
      // Ignore — worst case they see the popup again next visit.
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      {expanded ? (
        <div className="w-[min(24rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-2xl border border-primary/10 overflow-hidden">
          <div className="bg-primary text-white px-6 py-5 relative">
            <button
              onClick={() => setExpanded(false)}
              aria-label="Close"
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/15 px-2.5 py-1 rounded-full mb-2">
              Free · PDF · 2026
            </span>
            <h3 className="text-lg font-serif font-bold leading-tight">
              Cairo Office Market Report
            </h3>
            <p className="text-xs text-white/70 mt-1">
              Pricing, supply, yields — sent to your inbox.
            </p>
          </div>
          <div className="p-6">
            <LeadForm
              leadSource="blog_slide_up"
              magnet="cairo_office_market_report_2026"
              submitLabel="Send me the report"
              successTitle="You're on the list."
              successBody="The report will land in your inbox within a few minutes. Check spam if you don't see it."
              onSubmitSuccess={handleFormSuccess}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-stretch bg-primary text-white rounded-2xl shadow-2xl shadow-primary/30 overflow-hidden max-w-sm ring-1 ring-white/10">
          <button
            onClick={open}
            className="flex items-center gap-3 pl-4 pr-3 py-3.5 md:pl-5 md:pr-4 md:py-4 text-left hover:bg-primary/85 transition-colors"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shrink-0 shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent leading-none mb-1">
                Free · 2026
              </p>
              <p className="text-sm font-semibold leading-tight">
                Cairo Office Market Report
              </p>
              <p className="text-xs text-white/60 mt-0.5 inline-flex items-center gap-1">
                Get it free <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </button>
          <button
            onClick={dismiss}
            aria-label="Dismiss for 14 days"
            className="px-2.5 flex items-center text-white/40 hover:text-white/90 border-l border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
