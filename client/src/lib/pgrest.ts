// Tiny PostgREST client. Replaces @supabase/supabase-js on the public
// (anonymous-key) side of the site — auth-js, realtime-js, storage-js, and
// their transitive deps together weigh ~100 KB gzipped in the main bundle,
// and we never call any of those features publicly. All we need is
// authenticated GETs against /rest/v1/<table>?...
//
// The chained builder mirrors the exact subset of the Supabase SDK the app
// used previously (.eq, .neq, .order, .limit, .maybeSingle) so call sites
// change from `supabase.from(...)` → `pgrest.from(...)` and nothing else.
// Any filter/modifier the app doesn't use is intentionally omitted; adding
// them later is one method each.
//
// Server-side (admin) code still uses @supabase/supabase-js because Storage
// uploads and the service-role auth wrapper depend on it. That stays as-is.

const BASE = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Supabase's default API "max rows" setting.
const PAGE_SIZE = 1000;

// Array queries (via .then): success = non-null data, failure = null data + Error.
// Call sites `if (error) throw error; return data;` get `data` narrowed to T[].
export type ArrayResult<T> =
  | { data: T; error: null }
  | { data: null; error: Error };

// .maybeSingle() also allows the successful "no row" case (both null).
export type MaybeSingleResult<T> =
  | { data: T; error: null }
  | { data: null; error: null }
  | { data: null; error: Error };

class Query<T> {
  private filters: string[] = [];
  private modifiers: string[] = [];
  private single = false;
  private table: string;
  private select_ = "*";

  constructor(table: string) {
    this.table = table;
  }

  select(cols: string) {
    this.select_ = cols;
    return this;
  }

  eq(col: string, value: string | number | boolean) {
    this.filters.push(`${encodeURIComponent(col)}=eq.${encodeURIComponent(String(value))}`);
    return this;
  }

  neq(col: string, value: string | number | boolean) {
    this.filters.push(`${encodeURIComponent(col)}=neq.${encodeURIComponent(String(value))}`);
    return this;
  }

  order(col: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.modifiers.push(`order=${encodeURIComponent(col)}.${ascending ? "asc" : "desc"}`);
    return this;
  }

  limit(n: number) {
    this.modifiers.push(`limit=${n}`);
    return this;
  }

  // Returns { data: row | null, error }. Matches Supabase JS's maybeSingle():
  // no row → data: null (not an error). 2+ rows → error.
  maybeSingle(): Promise<MaybeSingleResult<T>> {
    this.single = true;
    return this.exec() as Promise<MaybeSingleResult<T>>;
  }

  // Awaitable via .then() so callers can `await` the builder directly,
  // matching the Supabase SDK ergonomics: `await pgrest.from(...).select(...).eq(...)`
  then<TResult1 = ArrayResult<T[]>, TResult2 = never>(
    onfulfilled?: ((value: ArrayResult<T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return (this.exec() as Promise<ArrayResult<T[]>>).then(onfulfilled, onrejected);
  }

  private async exec(): Promise<ArrayResult<T | T[]> | MaybeSingleResult<T>> {
    if (!BASE || !KEY) {
      return { data: null, error: new Error("Supabase env not configured") };
    }
    const params = [
      `select=${encodeURIComponent(this.select_)}`,
      ...this.filters,
      ...this.modifiers,
    ].join("&");
    const url = `${BASE}/rest/v1/${this.table}?${params}`;
    const headers: Record<string, string> = {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      Accept: "application/json",
    };
    // Ask PostgREST for singular JSON when maybeSingle() was called. Any other
    // count (0 or 2+) causes a 406 which we translate: 0 → null, 2+ → error.
    if (this.single) headers["Accept"] = "application/vnd.pgrst.object+json";

    let res: Response;
    try {
      res = await fetch(url, { headers });
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }

    if (this.single && res.status === 406) {
      // 406 with details=Results contain 0 rows → no match, return null
      // 406 with details=Results contain N rows (N>1) → real error
      const body = await res.text();
      if (/0 rows/i.test(body)) return { data: null, error: null };
      return { data: null, error: new Error(`Expected 1 row, got multiple`) };
    }

    if (!res.ok) {
      const body = await res.text();
      return {
        data: null,
        error: new Error(`${res.status} ${res.statusText}: ${body.slice(0, 200)}`),
      };
    }

    const data = (await res.json()) as T | T[];

    // Supabase caps responses at 1000 rows ("max rows"). Unlimited list queries
    // keep paging so the site never silently drops rows past 1000.
    const unlimited = !this.single && !this.modifiers.some((m) => m.startsWith("limit="));
    if (unlimited && Array.isArray(data) && data.length === PAGE_SIZE) {
      const rows = [...data];
      for (let offset = PAGE_SIZE; ; offset += PAGE_SIZE) {
        try {
          const next = await fetch(`${url}&limit=${PAGE_SIZE}&offset=${offset}`, { headers });
          if (!next.ok) {
            const body = await next.text();
            return { data: null, error: new Error(`${next.status} ${next.statusText}: ${body.slice(0, 200)}`) };
          }
          const page = (await next.json()) as T[];
          rows.push(...page);
          if (page.length < PAGE_SIZE) break;
        } catch (err) {
          return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
        }
      }
      return { data: rows, error: null };
    }
    return { data, error: null };
  }
}

export const pgrest = {
  from<T = unknown>(table: string) {
    return new Query<T>(table);
  },
};
