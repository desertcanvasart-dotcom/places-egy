import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "cookie_consent";

type Consent = "accepted" | "rejected" | null;

function getGtag() {
  return (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
}

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Consent;
      setConsent(saved);
    } catch {}
    setHydrated(true);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {}
    const gtag = getGtag();
    if (typeof gtag === "function") {
      gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      });
    }
    // Load Microsoft Clarity now that the user has consented (index.html
    // defines __loadClarity as a no-op if the project ID isn't configured).
    const loadClarity = (window as unknown as { __loadClarity?: () => void }).__loadClarity;
    if (typeof loadClarity === "function") loadClarity();

    trackEvent("cookie_consent", { decision: "accepted" });
    setConsent("accepted");
  };

  const reject = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "rejected");
    } catch {}
    trackEvent("cookie_consent", { decision: "rejected" });
    setConsent("rejected");
  };

  if (!hydrated || consent !== null) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50">
      {/* Mobile — compact single-row layout. Copy is the minimum viable
          consent text, buttons sit inline with the message. Icon removed
          on mobile (adds no info, costs space). Whole thing is ~1/3 the
          height of the previous mobile banner. */}
      <div className="md:hidden bg-white rounded-2xl shadow-2xl border border-border/40 px-3.5 py-3 relative">
        <p className="text-[11px] text-muted-foreground leading-snug pr-2 mb-2.5">
          We use cookies to improve your experience.{" "}
          <Link href="/privacy-policy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            onClick={reject}
            className="flex-1 h-8 text-[11px] font-medium rounded-full border border-border/60 text-primary hover:bg-muted/50 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="flex-1 h-8 text-[11px] font-medium rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>

      {/* Desktop / tablet — the fuller banner. Icon + h3 + paragraph +
          two big buttons. Same as before. */}
      <div className="hidden md:block bg-white rounded-2xl shadow-2xl border border-border/40 p-5 relative">
        <button
          onClick={reject}
          aria-label="Dismiss and reject non-essential cookies"
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3 mb-4 pr-6">
          <div className="w-9 h-9 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
            <Cookie className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1">We value your privacy</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use cookies to analyze site traffic and improve your experience. See our{" "}
              <Link href="/privacy-policy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={reject}
            variant="outline"
            className="flex-1 h-9 text-xs border-border/60"
          >
            Reject
          </Button>
          <Button
            onClick={accept}
            className="flex-1 h-9 text-xs bg-primary hover:bg-primary/90 text-white"
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
