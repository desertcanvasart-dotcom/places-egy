import { useQuery, useQueryClient } from "@tanstack/react-query";

// Session model:
//   - Anonymous: no `places_session` cookie set, /me returns { account: null }
//   - Signed in: cookie set → /me returns { account, favorites[] }
// Signup mints the cookie server-side; logout clears it. React Query caches
// the /me response and revalidates on window focus so multiple tabs stay in
// sync (a signup in tab A logs tab B in automatically).

export type Account = {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
};

export type ServerFavorite = {
  listing_id: number;
  added_at: string;
};

export type MeResponse = {
  account: Account | null;
  favorites: ServerFavorite[];
};

async function fetchMe(): Promise<MeResponse> {
  const res = await fetch("/api/accounts/me", { credentials: "include" });
  if (!res.ok) return { account: null, favorites: [] };
  return res.json();
}

export function useAccount(): {
  account: Account | null;
  serverFavorites: ServerFavorite[];
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<MeResponse>({
    queryKey: ["account-me"],
    queryFn: fetchMe,
    staleTime: 30 * 1000, // 30 s — session data changes rarely
    refetchOnWindowFocus: true,
  });
  return {
    account: data?.account ?? null,
    serverFavorites: data?.favorites ?? [],
    isLoading,
    refresh: async () => {
      await qc.invalidateQueries({ queryKey: ["account-me"] });
    },
  };
}

// Signup POST — used by the signup modal. Sets a session cookie on success,
// then the caller should refresh useAccount() and merge localStorage favs.
export async function signupAccount(input: {
  name: string;
  email: string;
  phone: string;
  preferred_language?: "en" | "ar";
  website?: string; // honeypot
}): Promise<{ id: number; existed: boolean }> {
  const res = await fetch("/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const body = (await res.json().catch(() => ({}))) as {
    id?: number;
    existed?: boolean;
    message?: string;
  };
  if (!res.ok) throw new Error(body.message ?? "Signup failed");
  return { id: body.id ?? 0, existed: Boolean(body.existed) };
}

export async function logoutAccount(): Promise<void> {
  await fetch("/api/accounts/logout", {
    method: "POST",
    credentials: "include",
  });
}

// Server favorites CRUD — signed-in only. If 401, caller should trigger a
// re-check of session (usually means cookie expired or someone logged out
// in another tab).
export async function addServerFavorite(listingId: number): Promise<void> {
  const res = await fetch("/api/accounts/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ listing_id: listingId }),
  });
  if (!res.ok) throw new Error("Could not save favorite");
}

export async function removeServerFavorite(listingId: number): Promise<void> {
  const res = await fetch(`/api/accounts/favorites/${listingId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Could not remove favorite");
}

export async function bulkMergeFavorites(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  await fetch("/api/accounts/favorites/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ listing_ids: ids }),
  });
}
