import { trackEvent } from "@/lib/analytics";

// The PLACES Calendly booking link. Used by every "Talk to Us" CTA across
// the site (contact page, mobile bottom bar, desktop float) and by the
// server-side auto-reply emails.
const BASE_CALENDLY_URL = "https://calendly.com/places-egy-info/30min";

// Attach UTM params to the Calendly URL so the client can see (in their
// Calendly dashboard, and via the /admin/bookings webhook sync) exactly
// where each booking came from. Values are ASCII slugs — no spaces or
// special chars — because they need to travel through URL params + GA4
// without encoding surprises.
//
// utm_source  — always the domain, so cross-channel attribution matches GA4
// utm_medium  — always "website" for site clicks (email will pass "email")
// utm_campaign — the placement (contact_page, homepage_hero, market_report,
//                                mobile_bottom_bar, listing_detail, etc.)
// utm_content — the button label (talk_to_us, book_meeting, download_report,
//                                 view_dashboard, etc.)
export function calendlyUrl(opts: {
  campaign: string;
  content?: string;
  medium?: "website" | "email";
}): string {
  const params = new URLSearchParams({
    utm_source: "places-egy.com",
    utm_medium: opts.medium ?? "website",
    utm_campaign: opts.campaign,
  });
  if (opts.content) params.set("utm_content", opts.content);
  return `${BASE_CALENDLY_URL}?${params.toString()}`;
}

// Backwards-compat export — the raw URL for anywhere that hasn't been
// migrated to the tagged version yet. New code should call calendlyUrl(...).
export const CALENDLY_URL = BASE_CALENDLY_URL;

const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";
const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";

interface CalendlyWidget {
  initPopupWidget: (opts: { url: string }) => void;
}
declare global {
  interface Window {
    Calendly?: CalendlyWidget;
  }
}

let loadingPromise: Promise<void> | null = null;

// Inject Calendly's official widget script + styles once, on demand. We don't
// ship these on every page load — they're only fetched the first time a user
// actually clicks "Talk to us", so the booking widget costs nothing until
// it's wanted.
function loadCalendly(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Calendly) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = WIDGET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_JS}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Calendly script failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = WIDGET_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Calendly script failed"));
    document.body.appendChild(script);
  });
  return loadingPromise;
}

// Open the Calendly booking popup with UTM attribution baked in. `source`
// becomes the utm_campaign so bookings that happen off this click can be
// traced back to which placement drove them. Fires both a legacy
// `book_meeting_click` GA4 event (used by existing dashboards) and a
// `calendly_click` event (new — richer payload with the full UTM set).
export async function openCalendly(
  source: string,
  content: string = "talk_to_us",
): Promise<void> {
  const url = calendlyUrl({ campaign: source, content });
  trackEvent("book_meeting_click", { source });
  trackEvent("calendly_click", {
    campaign: source,
    content,
    medium: "website",
  });
  try {
    await loadCalendly();
    // window.Calendly can lag a tick after the script's load event; poll briefly
    // for it before giving up to the fallback.
    for (let i = 0; i < 20 && !window.Calendly; i++) {
      await new Promise((r) => setTimeout(r, 50));
    }
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  } catch {
    // If the widget can't load (offline, blocked), fall back to opening the
    // scheduling page directly so the user can still book.
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
