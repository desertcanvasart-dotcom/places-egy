// GA4 event helper. Safe to call before gtag has loaded — just no-ops in that
// case (and in environments without window, e.g. SSR).
//
// Events fire even when consent is "denied" because GA4 stores them as
// consent-aware pings; they only become attributable to a user once the user
// accepts cookies via the banner.

type GtagFn = (...args: unknown[]) => void;

function getGtag(): GtagFn | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { gtag?: GtagFn }).gtag;
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  const gtag = getGtag();
  if (typeof gtag === "function") {
    gtag("event", name, params);
  }
}

// Source labels for click events — keeps GA4 reports consistent so you can
// slice "where do calls come from" without typo'd values.
export type ContactSource =
  | "listing_modal"
  | "listing_detail"
  | "contact_page";
