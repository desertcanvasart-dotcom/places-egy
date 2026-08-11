import { useCallback, useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

// Anonymous favoriting via localStorage. Phase 2 will merge these into a
// signed-in user's Supabase account on first sign-in; Phase 1 is purely
// client-side so people can favorite freely without signing up.
//
// Storage shape: { [listingId: number]: { added_at: ISO string } }
// Kept as an object (not array) so add/remove are O(1) and the localStorage
// write cost stays constant even at 100+ favorites.

const STORAGE_KEY = "places_favorites_v1";
const SIGNUP_NUDGE_KEY = "places_signup_nudge_shown_at";
const NUDGE_THRESHOLD = 2; // Show signup nudge when they hit the 2nd favorite

// Custom event so multiple <FavoriteButton /> instances re-render in sync
// when any one of them mutates localStorage. Same-tab storage events don't
// fire, so we dispatch our own.
const CHANGE_EVENT = "places:favorites-changed";

export type FavoriteMap = Record<number, { added_at: string }>;

function readAll(): FavoriteMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as FavoriteMap;
  } catch {
    // Ignore parse errors — worst case user's list resets.
  }
  return {};
}

function writeAll(next: FavoriteMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / storage-disabled errors.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

// Returns [isFavorited, toggle, count]. The `count` is convenient for the
// navbar heart badge so it can subscribe to changes without a separate hook.
export function useFavorite(listingId: number | null | undefined): {
  isFavorited: boolean;
  toggle: () => boolean; // returns the new state (true = now favorited)
} {
  const [snapshot, setSnapshot] = useState<FavoriteMap>(() => readAll());

  useEffect(() => {
    const sync = () => setSnapshot(readAll());
    window.addEventListener(CHANGE_EVENT, sync);
    // Also listen for cross-tab changes.
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) sync();
    });
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const isFavorited = listingId != null && Boolean(snapshot[listingId]);

  const toggle = useCallback((): boolean => {
    if (listingId == null) return false;
    const current = readAll();
    const wasFavorited = Boolean(current[listingId]);
    if (wasFavorited) {
      delete current[listingId];
    } else {
      current[listingId] = { added_at: new Date().toISOString() };
    }
    writeAll(current);
    trackEvent(wasFavorited ? "listing_unfavorited" : "listing_favorited", {
      listing_id: listingId,
      total_favorites: Object.keys(current).length,
    });
    return !wasFavorited;
  }, [listingId]);

  return { isFavorited, toggle };
}

// Reactive count of all favorites — used by the navbar heart badge.
export function useFavoriteCount(): number {
  const [count, setCount] = useState<number>(() => Object.keys(readAll()).length);

  useEffect(() => {
    const sync = () => setCount(Object.keys(readAll()).length);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  return count;
}

// Reactive list of favorited listing IDs, newest first. Used by /my-favorites.
export function useFavoriteIds(): number[] {
  const [ids, setIds] = useState<number[]>(() => sortNewestFirst(readAll()));

  useEffect(() => {
    const sync = () => setIds(sortNewestFirst(readAll()));
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  return ids;
}

function sortNewestFirst(map: FavoriteMap): number[] {
  return Object.entries(map)
    .sort(
      ([, a], [, b]) =>
        new Date(b.added_at).getTime() - new Date(a.added_at).getTime(),
    )
    .map(([id]) => Number(id));
}

export function clearAllFavorites(): void {
  writeAll({});
}

// ── Signup nudge (Phase 4 will build the modal, Phase 1 just tracks state) ─
// After the user hits NUDGE_THRESHOLD favorites, we show a soft dismissible
// signup prompt. We store when it was last shown so re-prompts space out.
export function shouldShowSignupNudge(): boolean {
  if (typeof window === "undefined") return false;
  const count = Object.keys(readAll()).length;
  if (count < NUDGE_THRESHOLD) return false;
  try {
    const last = localStorage.getItem(SIGNUP_NUDGE_KEY);
    if (!last) return true;
    // Re-prompt at 5 and 10 favorites — checked lazily as `count > lastShownAt`.
    const shownCount = Number(last);
    if (!Number.isFinite(shownCount)) return true;
    if (count >= 10 && shownCount < 10) return true;
    if (count >= 5 && shownCount < 5) return true;
    return false;
  } catch {
    return false;
  }
}

export function markSignupNudgeShown(): void {
  const count = Object.keys(readAll()).length;
  try {
    localStorage.setItem(SIGNUP_NUDGE_KEY, String(count));
  } catch {
    // Ignore.
  }
}
