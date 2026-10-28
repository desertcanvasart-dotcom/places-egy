// Appends every published WordPress blog post to the built sitemap so Google
// can discover and index posts. Runs after `vite build` against the file in
// `dist/public/sitemap.xml` (which vite copies from `client/public/sitemap.xml`).
//
// Failures here do NOT fail the build — if WordPress is briefly unreachable
// during deploy, we'd rather ship the static sitemap than block the deploy.

import { readFile, writeFile } from "fs/promises";
import path from "path";

const WP_API = "https://cms.places-egy.com/wp-json/wp/v2";
const SITE_ORIGIN = "https://places-egy.com";
const SITEMAP_PATH = path.resolve("dist/public/sitemap.xml");
const BLOG_CHANGEFREQ = "monthly";
const BLOG_PRIORITY = "0.6";
const GUIDE_CHANGEFREQ = "monthly";
const GUIDE_PRIORITY = "0.8"; // evergreen SEO content — higher than blog

export type WpPost = {
  id: number;
  slug: string;
  modified: string;
  // Polylang exposes translation pairs as { en: id, ar: id }. Only present
  // when the WP snippet enables it; if missing we skip the hreflang pair
  // for that specific post.
  translations?: Record<string, number>;
};

export async function fetchAllPosts(lang: "en" | "ar"): Promise<WpPost[]> {
  const all: WpPost[] = [];
  let page = 1;
  const perPage = 100;
  // Polylang returns every language when lang is omitted, which put AR posts under /blog/.
  const langParam = `&lang=${lang}`;

  // Loop until WP returns an empty page or signals we've passed the last page.
  while (true) {
    const url = `${WP_API}/posts?per_page=${perPage}&page=${page}&_fields=id,slug,modified,translations${langParam}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });

    // WP returns 400 once `page` is past the last page of results.
    if (res.status === 400) break;
    if (!res.ok) {
      throw new Error(`WP /posts returned ${res.status} ${res.statusText}`);
    }

    const batch = (await res.json()) as WpPost[];
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);

    const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? 1);
    if (page >= totalPages) break;
    page += 1;
  }

  return all;
}

// Build sitemap entries for a set of blog posts. When cross-language
// translation IDs are provided, each URL emits <xhtml:link rel="alternate"
// hreflang="…"> entries per Google's multilingual sitemap spec — the
// canonical way to tell Google that /blog/foo (EN) and /ar/blog/bar (AR)
// are language variants of the same content. Without these tags Google
// treats them as unrelated pages and may drop one as a duplicate.
//
// `lang` sets the URL prefix ("" for EN → /blog/, "/ar" for AR → /ar/blog/).
// `translationSlugs` is a Map<postId, slug> lookup for the OTHER language,
// so a post can point at its counterpart.
export function buildPostEntries(
  posts: WpPost[],
  opts: {
    lang: "en" | "ar";
    translationSlugs: Map<number, string>; // opposite-language post ID → slug
  },
): string {
  const selfPrefix = opts.lang === "ar" ? "/ar/blog" : "/blog";
  const otherPrefix = opts.lang === "ar" ? "/blog" : "/ar/blog";
  const selfHreflang = opts.lang;
  const otherHreflang = opts.lang === "ar" ? "en" : "ar";
  return posts
    .map((p) => {
      const lastmod = p.modified
        ? new Date(p.modified).toISOString().split("T")[0]
        : "";
      const lastmodLine = lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : "";
      // Find the translation counterpart if Polylang exposed one.
      const otherId = p.translations?.[otherHreflang];
      const otherSlug = otherId ? opts.translationSlugs.get(otherId) : undefined;
      const selfUrl = `${SITE_ORIGIN}${selfPrefix}/${p.slug}`;
      const selfAlt = `    <xhtml:link rel="alternate" hreflang="${selfHreflang}" href="${selfUrl}"/>\n`;
      const otherAlt = otherSlug
        ? `    <xhtml:link rel="alternate" hreflang="${otherHreflang}" href="${SITE_ORIGIN}${otherPrefix}/${otherSlug}"/>\n`
        : "";
      // x-default points at the English version (or self if no English pair).
      const xDefaultUrl =
        opts.lang === "en"
          ? selfUrl
          : otherSlug
            ? `${SITE_ORIGIN}${otherPrefix}/${otherSlug}`
            : selfUrl;
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultUrl}"/>\n`;
      return (
        `  <url>\n` +
        `    <loc>${selfUrl}</loc>\n` +
        lastmodLine +
        selfAlt +
        otherAlt +
        xDefault +
        `    <changefreq>${BLOG_CHANGEFREQ}</changefreq>\n` +
        `    <priority>${BLOG_PRIORITY}</priority>\n` +
        `  </url>`
      );
    })
    .join("\n");
}

// Build the /ar/blog hub entry with EN counterpart. Small standalone
// helper because the hub isn't a WP post — it's a static page from the
// prerender step.
function buildArBlogHubEntry(): string {
  const today = new Date().toISOString().split("T")[0];
  return (
    `  <url>\n` +
    `    <loc>${SITE_ORIGIN}/ar/blog</loc>\n` +
    `    <lastmod>${today}</lastmod>\n` +
    `    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_ORIGIN}/ar/blog"/>\n` +
    `    <xhtml:link rel="alternate" hreflang="en" href="${SITE_ORIGIN}/blog"/>\n` +
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/blog"/>\n` +
    `    <changefreq>weekly</changefreq>\n` +
    `    <priority>0.7</priority>\n` +
    `  </url>`
  );
}

// Inject the /guides hub + every guide slug from lib/guides.ts into the
// sitemap. Read the source file rather than importing it so this script
// stays plain TS (no Vite aliases to resolve).
async function readGuideSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const src = await readFile(
      path.resolve("client/src/lib/guides.ts"),
      "utf-8",
    );
    // Very small parser — matches every { slug: "...", ..., updatedAt: "..." }
    // block. Both are simple string literals in the source of truth.
    const slugs = [...src.matchAll(/slug:\s*"([^"]+)"[\s\S]*?updatedAt:\s*"([^"]+)"/g)];
    return slugs.map((m) => ({ slug: m[1], updatedAt: m[2] }));
  } catch (err) {
    console.warn("[sitemap] failed to read guides source:", err);
    return [];
  }
}

function buildGuideEntries(
  hubDate: string,
  guides: { slug: string; updatedAt: string }[],
): string {
  const hubEntry =
    `  <url>\n` +
    `    <loc>${SITE_ORIGIN}/guides</loc>\n` +
    `    <lastmod>${hubDate}</lastmod>\n` +
    `    <changefreq>${GUIDE_CHANGEFREQ}</changefreq>\n` +
    `    <priority>0.9</priority>\n` +
    `  </url>`;
  const per = guides
    .map(
      (g) =>
        `  <url>\n` +
        `    <loc>${SITE_ORIGIN}/guides/${g.slug}</loc>\n` +
        `    <lastmod>${g.updatedAt}</lastmod>\n` +
        `    <changefreq>${GUIDE_CHANGEFREQ}</changefreq>\n` +
        `    <priority>${GUIDE_PRIORITY}</priority>\n` +
        `  </url>`,
    )
    .join("\n");
  return hubEntry + (per ? "\n" + per : "");
}

// Refresh every stale <lastmod> in the built sitemap to today's build date.
// The static client/public/sitemap.xml has hardcoded 2026-07-10 dates on
// almost every URL, which Google reads as "nothing has changed since July"
// and lowers recrawl priority. Since the site content actually changes
// frequently (new listings, new copy, schema updates), we want Google to
// see fresh timestamps on every deploy.
//
// Deliberately does NOT touch <lastmod> that already have a different date
// — guide URLs get their real updatedAt from lib/guides.ts, blog URLs get
// their WordPress modified date, and future PR-driven date updates on
// specific URLs are preserved.
async function refreshStaleLastmod(): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    let xml = await readFile(SITEMAP_PATH, "utf-8");
    const before = (xml.match(/<lastmod>2026-07-10<\/lastmod>/g) ?? []).length;
    if (before === 0) return;
    xml = xml.replace(/<lastmod>2026-07-10<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
    await writeFile(SITEMAP_PATH, xml, "utf-8");
    console.log(
      `[sitemap] refreshed ${before} stale 2026-07-10 lastmod entries to ${today}`,
    );
  } catch (err) {
    console.warn("[sitemap] failed to refresh lastmod:", err);
  }
}

export async function generateSitemap(): Promise<void> {
  // ── Refresh stale lastmod dates on the static sitemap ─────────────────
  await refreshStaleLastmod();

  // ── /guides hub + individual guide URLs ────────────────────────────────
  const guides = await readGuideSlugs();
  if (guides.length > 0) {
    try {
      let xml = await readFile(SITEMAP_PATH, "utf-8");
      if (xml.includes("</urlset>") && !xml.includes(`${SITE_ORIGIN}/guides<`)) {
        const latest = guides
          .map((g) => g.updatedAt)
          .sort()
          .pop() as string;
        const insertion = "\n" + buildGuideEntries(latest, guides) + "\n";
        xml = xml.replace("</urlset>", insertion + "</urlset>");
        await writeFile(SITEMAP_PATH, xml, "utf-8");
        console.log(
          `[sitemap] injected /guides hub + ${guides.length} guide URLs`,
        );
      }
    } catch (err) {
      console.warn("[sitemap] failed to inject guides:", err);
    }
  }

  console.log("[sitemap] fetching posts from WordPress (en + ar)...");

  let enPosts: WpPost[];
  let arPosts: WpPost[];
  try {
    [enPosts, arPosts] = await Promise.all([
      fetchAllPosts("en"),
      fetchAllPosts("ar"),
    ]);
  } catch (err) {
    console.warn(
      "[sitemap] WordPress unreachable — sitemap will ship without blog posts:",
      err instanceof Error ? err.message : err,
    );
    return;
  }

  if (enPosts.length === 0 && arPosts.length === 0) {
    console.log("[sitemap] no posts found, skipping injection");
    return;
  }

  // Build lookup: post ID → slug so a post's translation pointer can
  // resolve to the counterpart's URL.
  const enSlugs = new Map<number, string>();
  for (const p of enPosts) enSlugs.set(p.id, p.slug);
  const arSlugs = new Map<number, string>();
  for (const p of arPosts) arSlugs.set(p.id, p.slug);

  let xml = await readFile(SITEMAP_PATH, "utf-8");
  if (!xml.includes("</urlset>")) {
    console.warn("[sitemap] could not find </urlset> in built sitemap, skipping");
    return;
  }

  // Ensure the <urlset> tag declares the xhtml namespace so xhtml:link
  // tags are valid. Idempotent — only injects if missing.
  if (!xml.includes('xmlns:xhtml=')) {
    xml = xml.replace(
      /<urlset\b([^>]*)>/,
      (_m, attrs) => `<urlset${attrs} xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    );
  }

  const chunks: string[] = [];
  if (enPosts.length > 0) {
    chunks.push(buildPostEntries(enPosts, { lang: "en", translationSlugs: arSlugs }));
  }
  if (arPosts.length > 0) {
    chunks.push(buildArBlogHubEntry());
    chunks.push(buildPostEntries(arPosts, { lang: "ar", translationSlugs: enSlugs }));
  }
  const insertion = "\n" + chunks.join("\n") + "\n";
  const updated = xml.replace("</urlset>", insertion + "</urlset>");

  await writeFile(SITEMAP_PATH, updated, "utf-8");
  console.log(
    `[sitemap] injected ${enPosts.length} EN + ${arPosts.length} AR blog URLs (with hreflang alternates)`,
  );
}
