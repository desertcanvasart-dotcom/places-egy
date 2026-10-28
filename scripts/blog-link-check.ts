// Checks every internal link inside WordPress post content (EN + AR).
// A link is broken if it ends in a 404/410, the homepage shell, or a bounce
// to /blog or /ar/blog. For broken blog links it suggests the real article.
//
//   npx tsx scripts/blog-link-check.ts [host] [--json out.json]
//
// Exits 1 if any broken links remain (after server redirects).

import { writeFileSync } from "fs";

const HOST = (process.argv[2]?.startsWith("http") ? process.argv[2] : "https://places-egy.com").replace(/\/$/, "");
const JSON_OUT = process.argv.includes("--json") ? process.argv[process.argv.indexOf("--json") + 1] : null;
const WP = "https://cms.places-egy.com/wp-json/wp/v2";
const SITE = "https://places-egy.com";
const UA = "Mozilla/5.0 (compatible; PLACES-link-check/1.0)";

type Post = { id: number; slug: string; lang: "en" | "ar"; link: string; content: { rendered: string } };

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

async function posts(lang: "en" | "ar"): Promise<Post[]> {
  const out: Post[] = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${WP}/posts?lang=${lang}&per_page=100&page=${page}&_fields=id,slug,link,content`);
    if (res.status === 400) break;
    const batch = (await res.json()) as Post[];
    out.push(...batch.map((p) => ({ ...p, lang })));
    if (batch.length < 100) break;
  }
  return out;
}

function internalLinks(html: string): string[] {
  const hrefs = [...html.matchAll(/href\s*=\s*["']([^"'#]+)/gi)].map((m) => m[1].trim());
  return hrefs
    .map((h) => h.replace(/^https?:\/\/(www\.)?places-egy\.com/i, ""))
    .filter((h) => h.startsWith("/") && !h.startsWith("//"))
    .map((h) => h.replace(/\/+$/, "") || "/");
}

async function resolve(path: string, homeTitle: string): Promise<{ final: string; status: number; reason: string | null }> {
  let url = `${HOST}${path}`;
  for (let hop = 0; hop < 5; hop++) {
    const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": UA } });
    if (res.status >= 300 && res.status < 400) {
      url = new URL(res.headers.get("location") ?? "/", url).toString();
      continue;
    }
    const final = new URL(url).pathname;
    if (res.status === 404 || res.status === 410) return { final, status: res.status, reason: `HTTP ${res.status}` };
    if (/^\/(ar\/)?blog$/.test(final) && !/^\/(ar\/)?blog$/.test(path)) return { final, status: res.status, reason: "redirects to the blog hub" };
    const html = await res.text();
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    if (final !== "/" && title === homeTitle) return { final, status: res.status, reason: "homepage shell" };
    return { final, status: res.status, reason: null };
  }
  return { final: url, status: 0, reason: "redirect loop" };
}

function suggest(path: string, slugs: { en: string[]; ar: string[] }): { to: string; score: number } | null {
  const m = path.match(/^\/(ar\/)?blog\/([^/]+)$/);
  if (!m) return null;
  const isAr = Boolean(m[1]) || /[؀-ۿ]/.test(decode(m[2]));
  const words = new Set(decode(m[2]).toLowerCase().split("-").filter(Boolean));
  let best: { to: string; score: number } | null = null;
  for (const slug of isAr ? slugs.ar : slugs.en) {
    const other = new Set(decode(slug).toLowerCase().split("-").filter(Boolean));
    const common = [...words].filter((w) => other.has(w)).length;
    const score = common / new Set([...words, ...other]).size;
    if (!best || score > best.score) best = { to: `${isAr ? "/ar/blog" : "/blog"}/${slug}`, score };
  }
  return best && best.score >= 0.5 ? best : null;
}

async function main() {
  const [en, ar] = await Promise.all([posts("en"), posts("ar")]);
  const slugs = { en: en.map((p) => p.slug), ar: ar.map((p) => p.slug) };
  const homeTitle = (await (await fetch(`${HOST}/`, { headers: { "User-Agent": UA } })).text()).match(/<title>([^<]*)<\/title>/)?.[1] ?? "";

  const uses = new Map<string, Array<{ post: Post; href: string }>>();
  for (const post of [...en, ...ar]) {
    for (const href of internalLinks(post.content.rendered)) {
      const key = decode(href).toLowerCase();
      uses.set(key, [...(uses.get(key) ?? []), { post, href }]);
    }
  }

  const broken: Array<{ link: string; reason: string; final: string; suggestion: string | null; score: number | null; posts: string[] }> = [];
  for (const [, list] of uses) {
    const href = list[0].href;
    const r = await resolve(href, homeTitle);
    if (!r.reason) continue;
    const s = suggest(href, slugs);
    broken.push({
      link: decode(href),
      reason: r.reason,
      final: decode(r.final),
      suggestion: s ? decode(s.to) : null,
      score: s ? Math.round(s.score * 100) / 100 : null,
      posts: [...new Set(list.map((u) => `${u.post.lang}:${u.post.id} ${decode(u.post.slug)}`))],
    });
  }

  console.log(`Posts: ${en.length} EN + ${ar.length} AR. Internal links: ${uses.size} unique. Checked against ${HOST}.`);
  if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(broken, null, 2));
  if (broken.length === 0) {
    console.log("0 broken internal links.");
    return;
  }
  console.log(`${broken.length} broken internal link(s):`);
  for (const b of broken) {
    console.log(`- ${b.link}  [${b.reason}${b.final !== b.link ? ` -> ${b.final}` : ""}]`);
    console.log(`    suggested: ${b.suggestion ?? "(no confident match)"}${b.score ? ` (match ${b.score})` : ""}`);
    console.log(`    in: ${b.posts.join("; ")}`);
  }
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
