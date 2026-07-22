// Shape of a row in the Supabase `popups` table. Mirrors
// server/popup-schema.ts. content_hash is computed server-side and returned to
// the client so it can be stored in localStorage on dismiss.
export interface Popup {
  id: number;
  headline_top: string;
  headline_bottom: string;
  body_paragraph: string;
  project_logo_url: string | null;
  stat_label: string | null;
  stat_value: string | null;
  stat_unit: string | null;
  footer_caption: string | null;
  content_hash: string;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
}

// localStorage key holding the set of content_hashes the user has already
// dismissed. Stored as a JSON array so we can quickly check membership.
export const DISMISSED_POPUPS_KEY = "places_popup_dismissed_hashes";

export function getDismissedHashes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DISMISSED_POPUPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function markPopupDismissed(contentHash: string): void {
  if (typeof window === "undefined") return;
  const current = getDismissedHashes();
  if (current.includes(contentHash)) return;
  // Cap at 20 entries so the list doesn't grow forever.
  const next = [contentHash, ...current].slice(0, 20);
  try {
    localStorage.setItem(DISMISSED_POPUPS_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota errors — worst case the popup shows again next visit.
  }
}
