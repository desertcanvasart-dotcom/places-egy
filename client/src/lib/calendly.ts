import { trackEvent } from "@/lib/analytics";

// PLACEHOLDER — replace with the real PLACES Calendly link once it exists.
// Get it from Calendly → your event type → "Copy Link". It looks like:
//   https://calendly.com/places-egy/consultation
// For now this points at Calendly's public demo event so the popup actually
// shows a working scheduler when testing the buttons.
export const CALENDLY_URL = "https://calendly.com/d/cmt-x4k-fkm/30-minute-meeting";

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
// actually clicks "Book a meeting", so the booking widget costs nothing until
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

// Open the Calendly booking popup. Lazily loads the widget on first use.
// `source` is passed through to analytics so we can see which CTA drove the
// booking (contact page vs. floating button, etc.).
export async function openCalendly(source: string): Promise<void> {
  trackEvent("book_meeting_click", { source });
  try {
    await loadCalendly();
    // window.Calendly can lag a tick after the script's load event; poll briefly
    // for it before giving up to the fallback.
    for (let i = 0; i < 20 && !window.Calendly; i++) {
      await new Promise((r) => setTimeout(r, 50));
    }
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    } else {
      window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
    }
  } catch {
    // If the widget can't load (offline, blocked), fall back to opening the
    // scheduling page directly so the user can still book.
    window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
  }
}
