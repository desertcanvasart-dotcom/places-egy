import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trackEvent } from "@/lib/analytics";
import {
  useAccount,
  addServerFavorite,
  removeServerFavorite,
} from "@/lib/account";

// Anonymous favoriting via localStorage. Phase 2 will merge these into a
// signed-in user's Supabase account on first sign-in; Phase 1 is purely
// client-side so people can favorite freely without signing up.
//
// Storage shape: { [listingId: number]: { added_at: ISO string } }
// Kept as an object (not array) so add/remove are O(1) and the localStorage
// write cost stays constant even at 100+ favorites.

const STORAGE_KEY = "places_favorites_v1";

// Hard gate: anonymous users can favorite exactly 1 listing. Attempting a
// 2nd triggers the signup modal instead of adding. Once signed in, the
// server takes over favorite storage (with no cap). Rationale: hearting one
// thing is browsing; hearting a second is a comparison, which is real
// intent — that's the moment to capture their info.
export const ANON_FAVORITES_CAP = 1;

// Custom event so multiple <FavoriteButton /> instances re-render in sync
// when any one of them mutates localStorage. Same-tab storage events don't
// fire, so we dispatch our own.
const CHANGE_EVENT = "places:favorites-changed";

// Signup modal state — a global bus so any FavoriteButton can trigger the
// modal without prop-drilling. The <SignupGateModal /> mounted at App root
// listens to this event.
const SIGNUP_MODAL_EVENT = "places:signup-modal-open";

export function openSignupModal(reason: {
  pendingListingId?: number;
  trigger: "favorite_cap" | "navbar_heart_signed_out";
}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SIGNUP_MODAL_EVENT, { detail: reason }),
  );
}

export function onSignupModalRequested(
  handler: (detail: {
    pendingListingId?: number;
    trigger: "favorite_cap" | "navbar_heart_signed_out";
  }) => void,
): () => void {
  const listener = (e: Event) => handler((e as CustomEvent).detail);
  window.addEventListener(SIGNUP_MODAL_EVENT, listener);
  return () => window.removeEventListener(SIGNUP_MODAL_EVENT, listener);
}

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

// Account-aware favorite toggler.
//   - Signed in: source of truth is server. Optimistic client update, then
//     API call, then invalidate account-me cache. Falls back to server state
//     on failure so nothing gets "stuck" favorited.
//   - Anonymous, below cap: source of truth is localStorage. Instant.
//   - Anonymous, at cap and trying to add: opens the signup modal instead of
//     adding, remembers the pending listing so it can be added post-signup.
export function useFavorite(listingId: number | null | undefined): {
  isFavorited: boolean;
  toggle: () => boolean; // returns the new state (true = now favorited)
} {
  const [snapshot, setSnapshot] = useState<FavoriteMap>(() => readAll());
  const { account, serverFavorites } = useAccount();
  const qc = useQueryClient();

  useEffect(() => {
    const sync = () => setSnapshot(readAll());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) sync();
    });
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const isFavorited =
    listingId != null &&
    (account
      ? serverFavorites.some((f) => f.listing_id === listingId)
      : Boolean(snapshot[listingId]));

  const toggle = useCallback((): boolean => {
    if (listingId == null) return false;

    if (account) {
      // Signed-in: hit the server.
      const wasFavorited = serverFavorites.some((f) => f.listing_id === listingId);
      const promise = wasFavorited
        ? removeServerFavorite(listingId)
        : addServerFavorite(listingId);
      // Fire-and-forget with cache invalidation on completion.
      void promise.finally(() => {
        void qc.invalidateQueries({ queryKey: ["account-me"] });
      });
      trackEvent(wasFavorited ? "listing_unfavorited" : "listing_favorited", {
        listing_id: listingId,
        account: true,
      });
      return !wasFavorited;
    }

    // Anonymous path.
    const current = readAll();
    const wasFavorited = Boolean(current[listingId]);
    if (wasFavorited) {
      delete current[listingId];
      writeAll(current);
      trackEvent("listing_unfavorited", { listing_id: listingId, account: false });
      return false;
    }
    // Cap check — trying to ADD past the cap. Open the signup modal instead
    // of persisting, and remember which listing they were trying to save.
    if (Object.keys(current).length >= ANON_FAVORITES_CAP) {
      openSignupModal({ pendingListingId: listingId, trigger: "favorite_cap" });
      trackEvent("signup_gate_shown", {
        pending_listing_id: listingId,
        trigger: "favorite_cap",
      });
      return false; // stayed unfavorited
    }
    current[listingId] = { added_at: new Date().toISOString() };
    writeAll(current);
    trackEvent("listing_favorited", {
      listing_id: listingId,
      total_favorites: Object.keys(current).length,
      account: false,
    });
    return true;
  }, [listingId, account, serverFavorites, qc]);

  return { isFavorited, toggle };
}

// Reactive count of all favorites — used by the navbar heart badge.
// Uses server list when signed in, localStorage when anonymous.
export function useFavoriteCount(): number {
  const { account, serverFavorites } = useAccount();
  const [anonCount, setAnonCount] = useState<number>(() => Object.keys(readAll()).length);

  useEffect(() => {
    const sync = () => setAnonCount(Object.keys(readAll()).length);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  return account ? serverFavorites.length : anonCount;
}

// Reactive list of favorited listing IDs, newest first. Used by /saved.
export function useFavoriteIds(): number[] {
  const { account, serverFavorites } = useAccount();
  const [anonIds, setAnonIds] = useState<number[]>(() => sortNewestFirst(readAll()));

  useEffect(() => {
    const sync = () => setAnonIds(sortNewestFirst(readAll()));
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  if (account) {
    return serverFavorites.map((f) => f.listing_id);
  }
  return anonIds;
}

// Snapshot of anonymous localStorage favorites — used by the signup modal
// right after signup to bulk-merge into the new account.
export function readAnonymousFavoriteIds(): number[] {
  return sortNewestFirst(readAll());
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

// Called by the signup modal after successful signup + bulk-merge — wipes
// the anonymous localStorage list so we don't double-count. The server list
// is now the source of truth.
export function clearAnonymousFavorites(): void {
  writeAll({});
}
