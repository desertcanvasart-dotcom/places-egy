import { readFileSync, existsSync } from "fs";
import path from "path";
import { getBlogSlugSets } from "../redirects";

// Which SPA paths are real pages. Exact routes come from client/src/App.tsx
// (extracted at build into dist/known-routes.json); dynamic ones are checked
// against live data. Paths with a built .html file never reach this check.

let exact: Set<string> | null = null;

export function loadKnownRoutes(distRoot: string): boolean {
  const file = path.join(distRoot, "known-routes.json");
  if (!existsSync(file)) return false;
  const routes = JSON.parse(readFileSync(file, "utf8")) as string[];
  exact = new Set(routes.filter((r) => !r.includes(":")));
  return true;
}

const BLOG_CATEGORY_TTL = 10 * 60_000;
let categories: { at: number; slugs: Set<string> } | null = null;

async function blogCategories(): Promise<Set<string>> {
  if (categories && Date.now() - categories.at < BLOG_CATEGORY_TTL) return categories.slugs;
  const api = process.env.WORDPRESS_API_URL;
  if (!api) return new Set();
  try {
    const res = await fetch(`${api}/categories?per_page=100&_fields=slug`, { signal: AbortSignal.timeout(4000) });
    const rows = (await res.json()) as Array<{ slug: string }>;
    categories = { at: Date.now(), slugs: new Set(rows.map((r) => decodeURIComponent(r.slug).toLowerCase())) };
  } catch {
    categories = { at: Date.now() - BLOG_CATEGORY_TTL + 60_000, slugs: categories?.slugs ?? new Set() };
  }
  return categories.slugs;
}

const decode = (s: string) => {
  try {
    return decodeURIComponent(s).toLowerCase();
  } catch {
    return s.toLowerCase();
  }
};

/** null = route list unavailable, so callers should fail open (serve 200). */
export async function isKnownRoute(rawPath: string): Promise<boolean | null> {
  if (!exact) return null;
  const p = rawPath.replace(/\/+$/, "") || "/";
  if (exact.has(p)) return true;

  const blog = p.match(/^\/(ar\/)?blog\/([^/]+)$/);
  if (blog) {
    const { en, ar } = await getBlogSlugSets();
    const slug = decode(blog[2]);
    return (blog[1] ? ar : en).has(slug);
  }
  const category = p.match(/^\/(?:ar\/)?blog\/category\/([^/]+)$/);
  if (category) return (await blogCategories()).has(decode(category[1]));

  return false;
}
