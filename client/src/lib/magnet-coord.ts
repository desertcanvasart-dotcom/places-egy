// Coordination between the concierge widget and the PDF market-report
// magnets so they never fight for attention at the same time.
//
// Rule: if the concierge widget is currently on-screen (bubble showing or
// form expanded), the PDF magnet doesn't appear. If the user dismisses the
// concierge, the PDF magnet fires 15s later as normal.
//
// Uses sessionStorage so the flag clears when the tab closes. Nothing needs
// to persist across visits — the SUBMITTED_KEY constants already do that.

const CONCIERGE_ACTIVE_KEY = "concierge_widget_active_this_session";

export function markConciergeActive(): void {
  try {
    sessionStorage.setItem(CONCIERGE_ACTIVE_KEY, "1");
  } catch {
    // Ignore — worst case both popups show together.
  }
}

export function markConciergeInactive(): void {
  try {
    sessionStorage.removeItem(CONCIERGE_ACTIVE_KEY);
  } catch {
    // Ignore.
  }
}

export function isConciergeActive(): boolean {
  try {
    return sessionStorage.getItem(CONCIERGE_ACTIVE_KEY) === "1";
  } catch {
    return false;
  }
}
