// Post-deploy SEO check. Crawls the sitemap and verifies every URL, then
// checks 404 behaviour and crawlable listing links.
//
//   npx tsx scripts/seo-check.ts                         # production
//   npx tsx scripts/seo-check.ts http://localhost:5055   # local build
//
// Exits 1 if any check fails.

const HOST = (process.argv[2] ?? "https://places-egy.com").replace(/\/$/, "");
const SITE = "https://places-egy.com";
const UA = "Mozilla/5.0 (compatible; PLACES-seo-check/1.0)";
const CONCURRENCY = 6;

type Page = { url: string; status: number; title: string; canonical: string | null; h1: number; robots: string | null; html: string };

const failures: string[] = [];
const fail = (msg: string) => failures.push(msg);

const toHost = (u: string) => u.replace(SITE, HOST);
const norm = (u: string | null) =>
  (u ?? "").replace(/%[0-9A-F]{2}/gi, (m) => m.toLowerCase()).replace(/\/$/, "");

async function get(url: string): Promise<Page> {
  const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": UA } });
  const html = res.status === 200 ? await res.text() : "";
  return {
    url,
    status: res.status,
    html,
    title: html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? "",
    canonical: html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? null,
    h1: (html.match(/<h1[\s>]/g) ?? []).length,
    robots: html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? null,
  };
}

async function sitemapUrls(url: string): Promise<string[]> {
  const xml = await (await fetch(toHost(url), { headers: { "User-Agent": UA } })).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (/<sitemapindex/.test(xml)) return (await Promise.all(locs.map(sitemapUrls))).flat();
  return locs;
}

async function pool<T, R>(items: T[], fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < items.length) {
        const n = i++;
        out[n] = await fn(items[n]);
      }
    }),
  );
  return out;
}

async function main() {
  const urls = [...new Set(await sitemapUrls(`${SITE}/sitemap.xml`))];
  console.log(`Sitemap: ${urls.length} URLs (checking against ${HOST})`);

  const home = await get(`${HOST}/`);
  const pages = await pool(urls, (u) => get(toHost(u)));

  const titles = new Map<string, string[]>();
  for (const p of pages) {
    const sitemapUrl = p.url.replace(HOST, SITE);
    if (p.status !== 200) {
      fail(`status ${p.status}: ${sitemapUrl}`);
      continue;
    }
    const isHome = sitemapUrl === `${SITE}/`;
    if (!p.title) fail(`no <title>: ${sitemapUrl}`);
    else if (!isHome && p.title === home.title) fail(`homepage title: ${sitemapUrl}`);
    titles.set(p.title, [...(titles.get(p.title) ?? []), sitemapUrl]);
    if (norm(p.canonical) !== norm(sitemapUrl)) fail(`canonical ${p.canonical ?? "(none)"} != ${sitemapUrl}`);
    if (p.h1 !== 1) fail(`${p.h1} <h1> in raw HTML: ${sitemapUrl}`);
    if (p.robots && /noindex/i.test(p.robots)) fail(`noindex in sitemap URL: ${sitemapUrl}`);
  }
  for (const [title, list] of titles) {
    if (title && list.length > 1) fail(`duplicate title "${title}" on ${list.length} URLs: ${list.slice(0, 3).join(", ")}`);
  }

  // 404 behaviour
  const missing = await get(`${HOST}/zz-not-real-${Date.now()}`);
  if (missing.status !== 404) fail(`unknown route returned ${missing.status}, expected 404`);
  const missingBody = await (await fetch(`${HOST}/zz-not-real-${Date.now()}`, { headers: { "User-Agent": UA } })).text();
  if (!/<meta name="robots" content="[^"]*noindex/.test(missingBody)) fail("404 page is missing robots noindex");
  if (/<link rel="canonical"/.test(missingBody)) fail("404 page still has a canonical");

  // Crawlable listing links
  const listingUrls = new Set(urls.filter((u) => /\/listings\/\d+-/.test(u)).map((u) => u.replace(SITE, "")));
  const linked = new Set<string>();
  for (let n = 1; n < 100; n++) {
    const p = await get(`${HOST}${n === 1 ? "/listings" : `/listings/page/${n}`}`);
    if (p.status !== 200) break;
    for (const m of p.html.matchAll(/href="(\/listings\/\d+-[^"]*)"/g)) linked.add(m[1]);
    if (!p.html.includes(`href="/listings/page/${n + 1}"`)) break;
  }
  const unlinked = [...listingUrls].filter((u) => !linked.has(u));
  if (unlinked.length) fail(`${unlinked.length} sitemap listings not linked from /listings pages, e.g. ${unlinked.slice(0, 3).join(", ")}`);
  for (const loc of urls.filter((u) => /\/locations\/[^/]+$/.test(u))) {
    const p = await get(toHost(loc));
    const count = (p.html.match(/href="\/listings\/\d+-/g) ?? []).length;
    if (count === 0) fail(`no listing links on ${loc}`);
  }

  console.log(`Checked ${pages.length} pages, ${listingUrls.size} listings (${linked.size} linked from /listings pages).`);
  if (failures.length) {
    console.log(`\nFAILED: ${failures.length} problem(s)`);
    for (const f of failures.slice(0, 200)) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log("All checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
