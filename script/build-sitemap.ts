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

type WpPost = {
  slug: string;
  modified: string;
};

async function fetchAllPosts(): Promise<WpPost[]> {
  const all: WpPost[] = [];
  let page = 1;
  const perPage = 100;

  // Loop until WP returns an empty page or signals we've passed the last page.
  while (true) {
    const url = `${WP_API}/posts?per_page=${perPage}&page=${page}&_fields=slug,modified`;
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

function buildPostEntries(posts: WpPost[]): string {
  return posts
    .map((p) => {
      const lastmod = p.modified
        ? new Date(p.modified).toISOString().split("T")[0]
        : "";
      const lastmodLine = lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : "";
      return (
        `  <url>\n` +
        `    <loc>${SITE_ORIGIN}/blog/${p.slug}</loc>\n` +
        lastmodLine +
        `    <changefreq>${BLOG_CHANGEFREQ}</changefreq>\n` +
        `    <priority>${BLOG_PRIORITY}</priority>\n` +
        `  </url>`
      );
    })
    .join("\n");
}

export async function generateSitemap(): Promise<void> {
  console.log("[sitemap] fetching posts from WordPress...");

  let posts: WpPost[];
  try {
    posts = await fetchAllPosts();
  } catch (err) {
    console.warn(
      "[sitemap] WordPress unreachable — sitemap will ship without blog posts:",
      err instanceof Error ? err.message : err,
    );
    return;
  }

  if (posts.length === 0) {
    console.log("[sitemap] no posts found, skipping injection");
    return;
  }

  const xml = await readFile(SITEMAP_PATH, "utf-8");
  if (!xml.includes("</urlset>")) {
    console.warn("[sitemap] could not find </urlset> in built sitemap, skipping");
    return;
  }

  const insertion = "\n" + buildPostEntries(posts) + "\n";
  const updated = xml.replace("</urlset>", insertion + "</urlset>");

  await writeFile(SITEMAP_PATH, updated, "utf-8");
  console.log(
    `[sitemap] injected ${posts.length} blog post URL${posts.length === 1 ? "" : "s"} into ${SITEMAP_PATH}`,
  );
}
