import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import path from "path";
import ts from "typescript";
import { attr, esc, injectBody, injectMeta } from "../server/seo/html";
import { STATIC_PAGE_META } from "../client/src/lib/page-meta";
import { renderDeveloperBodies } from "./ssr-developers";
import { FAQ_SECTIONS, countQuestionsInSection, faqSampleQuestions } from "../client/src/lib/faq";

// Build-time "meta-only" prerender.
//
// The app is a client-rendered SPA: every route is served the same index.html
// shell, whose <title>/description/canonical are generic. First-pass crawlers
// (and Google's initial render budget) therefore see 32 identical-looking
// developer pages — the cause of "Discovered – currently not indexed" in GSC.
//
// This step does NOT run a browser or render React. For each route with known
// meta, it takes the built dist/public/index.html and rewrites just the head
// tags (title, description, canonical, og:*) to that route's values, writing a
// static dist/public/<route>.html. express.static serves those nested files
// before the SPA catch-all, so crawlers get correct per-page meta on the very
// first fetch. The React app still hydrates and runs normally on top.
//
// The per-route meta is extracted from each page's own source via the
// TypeScript AST — specifically the `useDocumentMeta({ title, description })`
// call and the page's Organization schema (url/logo). That keeps a single
// source of truth: what renders at runtime is what gets baked into the HTML.

const SITE = "https://places-egy.com";
const DEV_PAGES_DIR = path.resolve(process.cwd(), "client/src/pages/developers");
const DIST = path.resolve(process.cwd(), "dist/public");

export interface RouteMeta {
  /** Route path, e.g. /developers/akoya */
  route: string;
  title: string;
  description: string;
  url: string;
  image?: string;
}

// Pull a string-literal value for `key` from an object-literal node.
function getStringProp(obj: ts.ObjectLiteralExpression, key: string): string | undefined {
  for (const prop of obj.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ((ts.isIdentifier(prop.name) && prop.name.text === key) ||
        (ts.isStringLiteral(prop.name) && prop.name.text === key))
    ) {
      const init = prop.initializer;
      if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
        return init.text;
      }
    }
  }
  return undefined;
}

// Extract meta for one developer page file by walking its AST for the
// useDocumentMeta({...}) call (title) and the *OrganizationSchema object
// (description, url, logo).
function extractMeta(slug: string, source: string): RouteMeta | null {
  const sf = ts.createSourceFile(slug + ".tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  let title: string | undefined;
  let schemaDescription: string | undefined;
  let url: string | undefined;
  let image: string | undefined;

  const visit = (node: ts.Node) => {
    // useDocumentMeta({ title, description, url, image })
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "useDocumentMeta" &&
      node.arguments.length === 1 &&
      ts.isObjectLiteralExpression(node.arguments[0])
    ) {
      const arg = node.arguments[0];
      title = getStringProp(arg, "title") ?? title;
    }

    // const xOrganizationSchema = { name, url, logo, description }
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text.endsWith("OrganizationSchema") &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      const obj = node.initializer;
      schemaDescription = getStringProp(obj, "description") ?? schemaDescription;
      url = getStringProp(obj, "url") ?? url;
      image = getStringProp(obj, "logo") ?? image;
    }

    ts.forEachChild(node, visit);
  };
  visit(sf);

  if (!title || !schemaDescription) return null;

  return {
    route: `/developers/${slug}`,
    title,
    description: schemaDescription,
    url: url ?? `${SITE}/developers/${slug}`,
    image,
  };
}

export async function collectDeveloperMeta(): Promise<RouteMeta[]> {
  const files = (await readdir(DEV_PAGES_DIR)).filter((f) => f.endsWith(".tsx"));
  const metas: RouteMeta[] = [];
  for (const f of files) {
    const slug = f.replace(/\.tsx$/, "");
    const src = await readFile(path.join(DEV_PAGES_DIR, f), "utf8");
    const meta = extractMeta(slug, src);
    if (meta) metas.push(meta);
    else console.warn(`[prerender] skipped ${f} — could not extract title/description`);
  }
  return metas;
}

function headingFrom(title: string): string {
  return title.replace(/\s*\|\s*PLACES\s*$/, "").replace(/\s+—\s+Egypt Office FAQs$/, "");
}

// WP content is authored in our own CMS, but strip anything executable anyway.
function sanitizeWpHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|noscript|object|embed|form)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|iframe|object|embed)\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
    // The page template supplies the one <h1>; headings inside the article start at h2.
    .replace(/<(\/?)h1\b/gi, "<$1h2");
}

function simpleBody(meta: RouteMeta): string {
  return `<h1>${esc(headingFrom(meta.title))}</h1><p>${esc(meta.description)}</p>`;
}


// Per-page meta for the two "index" URLs that Cloudflare rewrites to
// serve from /listings/index.html and /developers/index.html. Without
// this, those files are copies of the SPA shell whose canonical points
// at the homepage — Google Search Console reports "Redirect error"
// because it reads a URL that says it's canonical'd elsewhere. Writing
// proper per-page meta into these two paths fixes that.
//
// Why write foo/index.html specifically: the Cloudflare rewrite rule
// (added when Railway's build cache was serving stale foo.html files)
// rewrites /listings → /listings/index.html at the edge, and same for
// /developers. So the file path we need to author is exactly foo/index.html.
const INDEX_ROUTES: RouteMeta[] = [
  {
    route: "/listings",
    title: "Office Listings in Egypt — Rent or Buy Admin Office Space | PLACES",
    description:
      "Browse verified administrative office listings across Cairo — New Cairo, Sheikh Zayed, 6th October, Downtown, Sheraton, and Maadi. Filter by transaction type, size, developer, and location.",
    url: `${SITE}/listings`,
  },
  {
    route: "/developers",
    title: "Office Developers in Egypt — Trusted Real Estate Partners | PLACES",
    description:
      "PLACES works with 50+ verified office developers across Egypt — Emaar, Marakez, SODIC, Palm Hills, ORA, and more. Browse developer portfolios, projects, and available units.",
    url: `${SITE}/developers`,
  },
  {
    route: "/guides",
    title: "Cairo Office Guides — Renting, Buying & Fit-Out | PLACES",
    description:
      "Practical, data-backed guides on renting, buying, sizing, and fitting out an office in Cairo. Written by PLACES, Egypt's admin-office specialists.",
    url: `${SITE}/guides`,
  },
  {
    route: "/faqs",
    title: "Cairo Office FAQs — Answered by PLACES Advisors",
    description:
      "Every question we get asked about renting, buying, and investing in admin offices in Egypt — organized by topic. Written by PLACES, Cairo's admin-office specialists.",
    url: `${SITE}/faqs`,
  },
  {
    route: "/locations",
    title: "Office Locations Across Egypt — Cairo Business Districts | PLACES",
    description:
      "Browse admin office space in every major Cairo business district — New Cairo, Sheikh Zayed, 6th October, Downtown, Sheraton, and Maadi. Full district guides with rental data + available listings.",
    url: `${SITE}/locations`,
  },
  // /admin — the "Admin Offices" hub. High-intent commercial page for
  // anyone typing "admin office Egypt" into Google. Previously served
  // homepage meta, causing the same 404 flash + no rankings.
  {
    route: "/admin",
    title: "Admin Offices in Egypt — Rent or Buy Admin Office Space | PLACES",
    description:
      "Browse every admin office in Egypt across business parks, business buildings, and mixed-use developments. Verified inventory from PLACES, Cairo's admin-office specialists — rent, buy, or invest.",
    url: `${SITE}/admin`,
  },
  {
    route: "/admin/business-building",
    title: "Business Buildings in Egypt — Corporate Office Towers | PLACES",
    description:
      "Standalone corporate towers with premium addresses and turnkey office floors across Cairo — New Cairo, Sheikh Zayed, 6th October, Downtown. Available for rent or purchase, verified by PLACES.",
    url: `${SITE}/admin/business-building`,
  },
  {
    route: "/admin/business-park",
    title: "Business Parks in Egypt — Corporate Campuses | PLACES",
    description:
      "Integrated corporate communities across Cairo — campus-scale plots, parking, shared amenities. Rent or buy admin office units in Egypt's most established business parks.",
    url: `${SITE}/admin/business-park`,
  },
  {
    route: "/admin/mixed-use",
    title: "Mixed-Use Office Developments in Egypt — Cairo Retail-Adjacent Offices | PLACES",
    description:
      "Office floors stacked above active retail and F&B — built-in foot traffic and premium branding. Browse mixed-use admin office listings across Cairo with PLACES.",
    url: `${SITE}/admin/mixed-use`,
  },
  // Added 2026-10-10: these pages previously served homepage meta because
  // they weren't in INDEX_ROUTES. High-intent trust pages — /why-places +
  // /contact especially — were ranking for nothing.
  {
    route: "/why-places",
    title: "Why PLACES — Cairo's Specialist Admin-Office Broker",
    description:
      "PLACES is Egypt's dedicated administrative-office real estate specialist. Verified inventory, developer-direct relationships, and transparent advisory for buyers, tenants, and investors.",
    url: `${SITE}/why-places`,
  },
  {
    route: "/services",
    title: "Real Estate Services in Egypt — Leasing, Sales & Advisory | PLACES",
    description:
      "Full-service admin-office brokerage in Cairo: leasing, sales, property resale, primary-market advisory, and income-generating investment services. Trusted by 40+ companies.",
    url: `${SITE}/services`,
  },
  {
    route: "/contact",
    title: "Contact PLACES — Talk to a Cairo Office Advisor",
    description:
      "Reach PLACES advisors directly. Admin-office specialists based in Cairo. Call, WhatsApp, or send a message to get a curated office shortlist in 24 hours.",
    url: `${SITE}/contact`,
  },
  {
    route: "/projects",
    title: "Office Projects in Cairo — Business Parks, Buildings & Mixed-Use | PLACES",
    description:
      "Browse every office project PLACES brokers across Cairo — business parks, corporate towers, and mixed-use developments. Find the right project for your company.",
    url: `${SITE}/projects`,
  },
  // /blog hub — WordPress-sourced post list. Added to INDEX_ROUTES so the
  // Cloudflare page-rule rewrite (/blog → /blog/index.html) resolves to a
  // file with proper hub meta instead of the generic SPA shell.
  {
    route: "/blog",
    title: "PLACES Blog — Cairo Office Market Insights, Guides & News",
    description:
      "Latest articles from PLACES on Cairo's admin-office market — rental trends, developer updates, buy-vs-rent analysis, and location deep-dives for business decision makers.",
    url: `${SITE}/blog`,
  },
];

// Parse client/src/lib/location-content.ts for the 6 location slugs +
// displayNames + subtitles, and bake per-location static HTML. Locations
// are the site's highest-intent commercial pages ("office for rent new
// cairo" is the exact query a buyer types) — before this ran, every
// /locations/{slug} URL served the homepage's <title>, description, and
// canonical to /, effectively deindexing the money pages.
//
// The location file has 6 top-level entries in a Record<string, LocationContent>.
// Each entry is fingerprinted by a `slug:` field that matches the object key,
// a `displayName:` string, and a `subtitle:` string. We match all three in a
// single regex — falls apart cleanly if the file's shape changes so the build
// fails loudly rather than shipping wrong meta.
async function collectLocationMeta(): Promise<RouteMeta[]> {
  const locPath = path.resolve(process.cwd(), "client/src/lib/location-content.ts");
  let src: string;
  try {
    src = await readFile(locPath, "utf8");
  } catch {
    return [];
  }
  const out: RouteMeta[] = [];
  // Match `slug: "…"`, then look forward within the entry (any characters,
  // dot-all mode via [\s\S]) for the displayName + subtitle strings. Subtitle
  // spans a template-like multi-line quoted string, so match until the next
  // `,\n` inside quotes.
  const re = /slug:\s*"([^"]+)",\s*displayName:\s*"([^"]+)"[\s\S]*?subtitle:\s*\n?\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const [, slug, displayName, subtitle] = m;
    out.push({
      route: `/locations/${slug}`,
      title: `Offices in ${displayName} — Rent & Buy Admin Office Space | PLACES`,
      description: subtitle,
      url: `${SITE}/locations/${slug}`,
    });
  }
  return out;
}

// Parse client/src/lib/faq.ts for FAQ section slugs + titles and bake per-
// section static HTML. Descriptions are composed the same way the runtime
// SectionView composes them, so what Google sees on first HTTP matches what
// React would render post-hydration.
//
// The faq.ts file is ~2000 lines with deeply nested subsections; we don't
// need to parse the whole tree. Just grep the top-level FAQ_SECTIONS entries
// (each starts with `id: "..."`, `number: N`, `title: "..."`) and count the
// items across their subsections for the questionCount in the description.
async function collectFaqSectionMeta(): Promise<RouteMeta[]> {
  const faqPath = path.resolve(process.cwd(), "client/src/lib/faq.ts");
  let src: string;
  try {
    src = await readFile(faqPath, "utf8");
  } catch {
    return [];
  }
  const out: RouteMeta[] = [];
  // Top-level section entries follow: id: "slug", number: N, title: "Title"
  // We scan for the id/number/title triple. The `number:` field only exists
  // on top-level sections (not nested subsections), so it's the right filter
  // to distinguish sections from subsections in one regex.
  const sectionRe = /id:\s*"([^"]+)",\s*number:\s*\d+,\s*title:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(src)) !== null) {
    const [, slug, title] = m;
    // Cheap question count: match every `q: "..."` under this section by
    // slicing from this section's start to the next section's start.
    const startIdx = m.index;
    sectionRe.lastIndex = m.index + m[0].length;
    const nextMatch = sectionRe.exec(src);
    const endIdx = nextMatch ? nextMatch.index : src.length;
    // Reset lastIndex so we don't skip the next section on the outer loop.
    sectionRe.lastIndex = m.index + m[0].length;
    const sectionBody = src.slice(startIdx, endIdx);
    const questionCount = (sectionBody.match(/^\s*q:\s*"/gm) ?? []).length;

    out.push({
      route: `/faqs/${slug}`,
      title: `${title} — Egypt Office FAQs | PLACES`,
      description: `${questionCount} answered questions about ${title.toLowerCase()} for buying, renting, or investing in admin offices in Egypt. Written by PLACES advisors.`,
      url: `${SITE}/faqs/${slug}`,
    });
  }
  return out;
}

// Extended shape used only for guide prerender — we need the raw guide
// title (without the " | PLACES" suffix that we add to <title>) for the
// Article schema `headline` field, plus publishedAt + readMinutes for
// datePublished + timeRequired. The base RouteMeta shape is preserved.
export interface GuideRouteMeta extends RouteMeta {
  rawTitle: string;
  publishedAt: string;
  readMinutes: number;
}

// Parse client/src/lib/guides.ts for guide slugs + titles + descriptions and
// bake per-guide static HTML files. Same TS-AST pattern as extractMeta so
// the source is single-truth: what's in the guides.ts array is what gets
// prerendered.
async function collectGuideMeta(): Promise<GuideRouteMeta[]> {
  const guidesPath = path.resolve(process.cwd(), "client/src/lib/guides.ts");
  let src: string;
  try {
    src = await readFile(guidesPath, "utf8");
  } catch {
    return [];
  }
  const out: GuideRouteMeta[] = [];
  // Match every full { slug, title, description, readMinutes, publishedAt, imageUrl }
  // block. Fields kept in the order they appear in guides.ts. readMinutes is
  // a number (no quotes); publishedAt is an ISO date string.
  const re = /slug:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]+)"[\s\S]*?readMinutes:\s*(\d+)[\s\S]*?publishedAt:\s*"([^"]+)"[\s\S]*?imageUrl:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const [, slug, title, description, readMinutesStr, publishedAt, imageUrl] = m;
    out.push({
      route: `/guides/${slug}`,
      title: `${title} | PLACES`,
      rawTitle: title,
      description,
      url: `${SITE}/guides/${slug}`,
      image: imageUrl.startsWith("http") ? imageUrl : `${SITE}${imageUrl}`,
      publishedAt,
      readMinutes: parseInt(readMinutesStr, 10),
    });
  }
  return out;
}

// Build Article + BreadcrumbList JSON-LD blocks for a guide and return them
// as a single <script> tag string ready to inject into <head>. Google reads
// these on the first crawl, no JS execution needed — unlocks Article rich
// results (carousel, top-stories) and the breadcrumb line in the SERP
// snippet. Matches the shape produced at runtime by client/src/lib/schema.ts's
// articleSchema() + breadcrumbSchema() so pre- and post-hydration are
// consistent (Google won't flag a schema mismatch).
function buildGuideJsonLd(meta: GuideRouteMeta): string {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${meta.url}#article`,
    headline: meta.rawTitle,
    description: meta.description,
    url: meta.url,
    mainEntityOfPage: { "@type": "WebPage", "@id": meta.url },
    datePublished: meta.publishedAt,
    dateModified: meta.publishedAt,
    inLanguage: "en",
    timeRequired: `PT${meta.readMinutes}M`,
    author: {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "PLACES",
    },
    publisher: { "@id": `${SITE}/#organization` },
    image: { "@type": "ImageObject", url: meta.image ?? `${SITE}/images/offices-hero.jpg` },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE}/guides` },
      { "@type": "ListItem", position: 3, name: meta.rawTitle, item: meta.url },
    ],
  };
  // JSON-encode + escape any `</script` sequences that would prematurely
  // close the wrapping <script> tag. Standard defense for inlining JSON.
  const encode = (obj: unknown) =>
    JSON.stringify(obj).replace(/<\/script/gi, "<\\/script");
  return (
    `<script type="application/ld+json">${encode(article)}</script>` +
    `<script type="application/ld+json">${encode(breadcrumb)}</script>`
  );
}

// Inject the built JSON-LD block just before </head>. Idempotent — running
// twice would inject twice, so we only call it once per prerender.
function injectJsonLd(html: string, jsonLd: string): string {
  return html.replace(/<\/head>/i, `${jsonLd}</head>`);
}

// Build Article JSON-LD for a WordPress blog post. AI engines (Perplexity,
// ChatGPT, Claude, Google AI Overviews) use Article schema to decide which
// source to cite — a post without it is often skipped in favor of a
// competitor's structured article.
function buildBlogArticleJsonLd(
  post: BlogPostMeta,
  url: string,
  lang: "en" | "ar",
): string {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: lang,
    author: {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "PLACES",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "PLACES",
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/opengraph.jpg`,
      },
    },
    image: {
      "@type": "ImageObject",
      url: post.featuredImage ?? `${SITE}/opengraph.jpg`,
    },
  };
  const encoded = JSON.stringify(article).replace(/<\/script/gi, "<\\/script");
  return `<script type="application/ld+json">${encoded}</script>`;
}

// Enriched RealEstateAgent + LocalBusiness JSON-LD for the /contact page.
// Pulls brand facts from the runtime schema in client/src/lib/schema.ts and
// extends with openingHoursSpecification + areaServed so AI engines can
// cite PLACES as a Cairo office advisory with concrete business hours.
function buildContactJsonLd(): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE}/#organization`,
    name: "PLACES",
    url: SITE,
    logo: {
      "@type": "ImageObject",
      url: `${SITE}/opengraph.jpg`,
      width: 1280,
      height: 720,
    },
    image: `${SITE}/opengraph.jpg`,
    telephone: "+201063618217",
    email: "admin@places-egy.com",
    description:
      "PLACES specializes in administrative office real estate across Egypt — buy, lease, or resell with trusted developers.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cairo",
      addressRegion: "Cairo Governorate",
      addressCountry: "EG",
    },
    areaServed: [
      { "@type": "Place", name: "New Cairo" },
      { "@type": "Place", name: "Sheikh Zayed" },
      { "@type": "Place", name: "6th October" },
      { "@type": "Place", name: "Downtown Cairo" },
      { "@type": "Place", name: "Sheraton" },
      { "@type": "Place", name: "Maadi" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
        ],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    sameAs: [
      "https://www.instagram.com/places.egy",
      "https://www.facebook.com/share/1CMGKrymLB/",
      "https://www.linkedin.com/company/places-egy/",
      "https://www.tiktok.com/@places.eg",
    ],
  };
  const encoded = JSON.stringify(schema).replace(/<\/script/gi, "<\\/script");
  return `<script type="application/ld+json">${encoded}</script>`;
}

// AST-based extraction of Q/A pairs per FAQ section from client/src/lib/faq.ts.
// Regex isn't safe here because Q + A strings routinely contain quotes,
// apostrophes, and multi-line prose. Walking the TypeScript AST is the only
// way to get the raw string values back verbatim regardless of quoting style.
// Returns { sectionSlug -> [{q, a}] } so the FAQ loop can look up its own
// items in O(1) when building the schema.
interface FaqQAPair {
  q: string;
  a: string;
}
async function collectFaqItems(): Promise<Record<string, FaqQAPair[]>> {
  const faqPath = path.resolve(process.cwd(), "client/src/lib/faq.ts");
  const src = await readFile(faqPath, "utf8");
  const sf = ts.createSourceFile("faq.ts", src, ts.ScriptTarget.Latest, true);

  const out: Record<string, FaqQAPair[]> = {};

  // Find the FAQ_SECTIONS array literal, then walk each top-level section
  // object (id + number + title + subsections). For each section, walk each
  // subsection's items array collecting q + a. The `number:` property is the
  // unique fingerprint that identifies top-level sections vs nested ones.
  const stringPropValue = (
    obj: ts.ObjectLiteralExpression,
    key: string,
  ): string | undefined => {
    for (const prop of obj.properties) {
      if (
        ts.isPropertyAssignment(prop) &&
        ts.isIdentifier(prop.name) &&
        prop.name.text === key
      ) {
        const init = prop.initializer;
        if (
          ts.isStringLiteral(init) ||
          ts.isNoSubstitutionTemplateLiteral(init)
        ) {
          return init.text;
        }
      }
    }
    return undefined;
  };
  const arrayPropValue = (
    obj: ts.ObjectLiteralExpression,
    key: string,
  ): ts.ArrayLiteralExpression | undefined => {
    for (const prop of obj.properties) {
      if (
        ts.isPropertyAssignment(prop) &&
        ts.isIdentifier(prop.name) &&
        prop.name.text === key &&
        ts.isArrayLiteralExpression(prop.initializer)
      ) {
        return prop.initializer;
      }
    }
    return undefined;
  };

  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "FAQ_SECTIONS" &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const sectionNode of node.initializer.elements) {
        if (!ts.isObjectLiteralExpression(sectionNode)) continue;
        const slug = stringPropValue(sectionNode, "id");
        if (!slug) continue;
        const subs = arrayPropValue(sectionNode, "subsections");
        if (!subs) continue;
        const items: FaqQAPair[] = [];
        for (const subNode of subs.elements) {
          if (!ts.isObjectLiteralExpression(subNode)) continue;
          const subItems = arrayPropValue(subNode, "items");
          if (!subItems) continue;
          for (const itemNode of subItems.elements) {
            if (!ts.isObjectLiteralExpression(itemNode)) continue;
            const q = stringPropValue(itemNode, "q");
            const a = stringPropValue(itemNode, "a");
            if (q && a) items.push({ q, a });
          }
        }
        out[slug] = items;
      }
      return; // Don't descend further after finding the array
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

// Build FAQPage JSON-LD for one section. Google renders this as an
// expandable accordion in the SERP snippet when it likes the answers —
// takes up 3-4x the vertical space of a plain result, huge CTR lift.
// Matches the shape of client/src/lib/schema.ts's faqSchema() so the
// pre-hydration and post-hydration copies dedupe cleanly by structure.
function buildFaqJsonLd(items: FaqQAPair[]): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a,
      },
    })),
  };
  const encoded = JSON.stringify(schema).replace(
    /<\/script/gi,
    "<\\/script",
  );
  return `<script type="application/ld+json">${encoded}</script>`;
}

// Fetch the list of Arabic blog posts from WordPress at build time so we
// can prerender each /ar/blog/{slug} with real meta.
//
// Why this exists: without prerendering, Arabic blog URLs serve the SPA
// shell whose <title>, description and canonical hardcode the English
// homepage — Google indexed every Arabic post as a duplicate of the
// homepage and dropped them. Baking real per-post Arabic meta at build
// time solves it without any client-side change.
//
// Fails gracefully — if the CMS is unreachable during the Railway build,
// we log and skip rather than crashing the whole deploy.
interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  featuredImage: string | null;
  // Slug of this post's translation in the opposite language. Populated
  // via Polylang's translations pointer when available. Null when the
  // counterpart isn't published or Polylang doesn't expose it.
  otherLangSlug: string | null;
  heading: string;
  excerpt: string;
  bodyHtml: string;
}

// Fetch a language's blog posts from WordPress at build time. Used for
// both /ar/blog/* and /blog/* prerendering. Returns [] on any failure so
// deploys ship even when the CMS is briefly unreachable.
async function collectBlogPosts(lang: "en" | "ar"): Promise<BlogPostMeta[]> {
  const CMS = "https://cms.places-egy.com";
  const url = `${CMS}/wp-json/wp/v2/posts?lang=${lang}&per_page=100&_embed=true`;
  try {
    // A single slow CMS response used to drop every post's prerender (homepage meta).
    let res: Response | undefined;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        res = await fetch(url, { signal: AbortSignal.timeout(45000) });
        if (res.ok) break;
      } catch (err) {
        if (attempt === 3) throw err;
      }
      console.warn(`[prerender] ${lang.toUpperCase()} blog fetch attempt ${attempt} failed — retrying`);
      await new Promise((r) => setTimeout(r, 3000));
    }
    if (!res) throw new Error("no response");
    if (!res.ok) {
      console.warn(`[prerender] ${lang.toUpperCase()} blog fetch failed: HTTP ${res.status} — skipping`);
      return [];
    }
    // WP REST post shape. `translations` is a Polylang addition (only
    // present when our WP snippet enables it); when missing we ship the
    // page without a cross-language hreflang pair.
    type WpPost = {
      slug: string;
      title: { rendered: string };
      excerpt: { rendered: string };
      content: { rendered: string };
      date: string;
      translations?: Record<string, number>;
      yoast_head_json?: { title?: string; description?: string };
      meta?: Record<string, unknown>;
      _embedded?: {
        "wp:featuredmedia"?: Array<{ source_url?: string }>;
      };
    };
    const raw = (await res.json()) as WpPost[];
    // Resolve counterpart-lang post IDs to slugs in one bulk lookup.
    const otherLang = lang === "ar" ? "en" : "ar";
    const otherIds = raw
      .map((p) => p.translations?.[otherLang])
      .filter((id): id is number => typeof id === "number");
    const otherSlugMap = new Map<number, string>();
    if (otherIds.length > 0) {
      try {
        const otherRes = await fetch(
          `${CMS}/wp-json/wp/v2/posts?include=${otherIds.join(",")}&per_page=100&_fields=id,slug&lang=${otherLang}`,
          { signal: AbortSignal.timeout(15000) },
        );
        if (otherRes.ok) {
          const otherData = (await otherRes.json()) as Array<{ id: number; slug: string }>;
          for (const p of otherData) otherSlugMap.set(p.id, p.slug);
        }
      } catch (err) {
        console.warn(`[prerender] ${otherLang.toUpperCase()} translation slug lookup failed:`, err);
      }
    }
    return raw.map((p): BlogPostMeta => {
      const meta = p.meta ?? {};
      const seoTitle =
        (meta.rank_math_title as string | undefined) ||
        p.yoast_head_json?.title ||
        p.title.rendered;
      const seoDescription =
        (meta.rank_math_description as string | undefined) ||
        p.yoast_head_json?.description ||
        p.excerpt.rendered.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 240);
      const otherId = p.translations?.[otherLang];
      return {
        slug: p.slug,
        title: decodeEntitiesServer(seoTitle),
        description: decodeEntitiesServer(seoDescription),
        publishedAt: p.date,
        featuredImage: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
        otherLangSlug: otherId ? otherSlugMap.get(otherId) ?? null : null,
        heading: decodeEntitiesServer(p.title.rendered),
        excerpt: decodeEntitiesServer(
          p.excerpt.rendered.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(),
        ),
        bodyHtml: sanitizeWpHtml(p.content?.rendered ?? ""),
      };
    });
  } catch (err) {
    console.warn(`[prerender] ${lang.toUpperCase()} blog fetch threw — skipping:`, err);
    return [];
  }
}

// Node-side HTML entity decoder (there's no `document` at build time).
// Handles the common WP-emitted entities: &amp; &#8217; &#8220; etc.
function decodeEntitiesServer(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function prerender() {
  const shellPath = path.join(DIST, "index.html");
  const shell = await readFile(shellPath, "utf8");

  const metas = await collectDeveloperMeta();
  let developerWritten = 0;
  let indexWritten = 0;

  // Fetched up front: the /blog hub (an INDEX_ROUTE) lists every post.
  const [enPosts, arPosts] = await Promise.all([
    collectBlogPosts("en"),
    collectBlogPosts("ar"),
  ]);
  const faqSectionMetas = await collectFaqSectionMeta();

  const blogListBody = (heading: string, intro: string, posts: BlogPostMeta[], base: string) =>
    `<h1>${esc(heading)}</h1><p>${esc(intro)}</p><ul>` +
    posts
      .map(
        (p) =>
          `<li><h2><a href="${base}/${attr(p.slug)}">${esc(p.heading)}</a></h2><p>${esc(p.excerpt)}</p></li>`,
      )
      .join("") +
    `</ul>`;

  const blogPostBody = (p: BlogPostMeta) =>
    `<article><h1>${esc(p.heading)}</h1>` +
    `<p><time datetime="${attr(p.publishedAt)}">${esc(p.publishedAt.slice(0, 10))}</time></p>` +
    `<div class="blog-content">${p.bodyHtml}</div></article>`;

  // Full page content for each developer, rendered from its React component.
  const developerBodies = await renderDeveloperBodies();
  for (const meta of metas) {
    const slug = meta.route.replace(/^\/developers\//, "");
    const html = injectBody(injectMeta(shell, meta), developerBodies[slug] ?? simpleBody(meta));
    // Write dist/public/developers/<slug>.html — express.static resolves
    // /developers/<slug> to this file before the SPA catch-all.
    const outPath = path.join(DIST, `${meta.route}.html`);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    developerWritten++;
  }

  // Routes with a Cloudflare page-rule rewrite: /listings → /listings/
  // index.html at the edge, same for /developers and /blog. These three
  // need BOTH the flat .html file (served by server/static.ts middleware
  // for direct visitors + crawlers that bypass Cloudflare) AND the
  // directory index.html (what Cloudflare's edge rewrite resolves to).
  // Without the directory index, Cloudflare serves the stale generic
  // index.html SPA shell with homepage canonical.
  const CLOUDFLARE_REWRITTEN_ROUTES = new Set(["/listings", "/developers", "/blog"]);

  // Q&As per FAQ section. Each section page is the only page that carries its
  // Q&As and FAQPage markup; /faqs is a table of contents. (Repeating every
  // question on /faqs made Google treat the section pages as duplicates:
  // "Crawled - currently not indexed".)
  const faqItemsBySlugForHub = await collectFaqItems();

  const staticRoutes: RouteMeta[] = Object.entries(STATIC_PAGE_META).map(([route, m]) => ({
    route,
    ...m,
  }));
  for (const meta of [...INDEX_ROUTES, ...staticRoutes]) {
    let html =
      meta.route === "/blog"
        ? injectMeta(shell, meta, {
            alternates: [
              { hreflang: "en", url: `${SITE}/blog` },
              { hreflang: "ar", url: `${SITE}/ar/blog` },
              { hreflang: "x-default", url: `${SITE}/blog` },
            ],
          })
        : injectMeta(shell, meta);
    // Route-specific JSON-LD: /contact gets the enriched RealEstateAgent with opening hours.
    if (meta.route === "/contact") {
      html = injectJsonLd(html, buildContactJsonLd());
    }

    if (meta.route === "/blog" && enPosts.length > 0) {
      html = injectBody(html, blogListBody("PLACES Blog", meta.description, enPosts, "/blog"));
    } else if (meta.route === "/faqs") {
      const sections = FAQ_SECTIONS.map((sec) => {
        const count = countQuestionsInSection(sec);
        const samples = faqSampleQuestions(sec)
          .map((q) => `<li><a href="/faqs/${sec.id}#${q.slug}">${esc(q.q)}</a></li>`)
          .join("");
        return (
          `<section><h2><a href="/faqs/${sec.id}">${esc(sec.title)}</a></h2><p>${esc(sec.intro)}</p>` +
          `<ul>${samples}</ul><p><a href="/faqs/${sec.id}">All ${count} questions on ${esc(sec.shortTitle ?? sec.title)}</a></p></section>`
        );
      }).join("");
      html = injectBody(html, `<h1>${esc(headingFrom(meta.title))}</h1><p>${esc(meta.description)}</p>${sections}`);
    } else {
      html = injectBody(html, simpleBody(meta));
    }
    const flatOut = path.join(DIST, `${meta.route}.html`);
    await mkdir(path.dirname(flatOut), { recursive: true });
    await writeFile(flatOut, html, "utf8");

    // If this route has a Cloudflare rewrite rule, ALSO write the
    // directory-form index.html so the edge rewrite finds the right
    // content. Only for the 3 routes above — don't resurrect the Sep 21
    // redirect-loop bug for admin/business-park etc. that don't have CF
    // rewrites.
    if (CLOUDFLARE_REWRITTEN_ROUTES.has(meta.route)) {
      const dirIndexOut = path.join(DIST, meta.route, "index.html");
      await mkdir(path.dirname(dirIndexOut), { recursive: true });
      await writeFile(dirIndexOut, html, "utf8");
    }

    indexWritten++;
  }

  // Per-guide static HTML shells — every /guides/{slug} URL now gets its
  // own real title + meta description + canonical + og:image on the first
  // HTTP response. Critical for AI answer engines (Perplexity, ChatGPT,
  // Claude bots) which don't execute JavaScript before reading meta.
  //
  // Guides also get Article + BreadcrumbList JSON-LD injected pre-hydration
  // so Google can consider them for article-carousel + top-stories rich
  // results and render breadcrumbs in the SERP snippet. The React runtime
  // ALSO mounts the same schemas via SchemaMarkup — that duplication is
  // safe (Google dedupes on @id) and gives us defense in depth.
  const guideMetas = await collectGuideMeta();
  let guideWritten = 0;
  for (const meta of guideMetas) {
    let html = injectBody(injectMeta(shell, meta), simpleBody(meta));
    html = injectJsonLd(html, buildGuideJsonLd(meta));
    // Write dist/public/guides/<slug>.html — express.static resolves
    // /guides/<slug> to this file before the SPA catch-all thanks to
    // the extensions:["html"] option on express.static.
    const outPath = path.join(DIST, `${meta.route}.html`);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    guideWritten++;
  }

  // Per-FAQ-section static HTML shells. GSC was reporting these under
  // "Crawled - currently not indexed" because the SPA shell they were
  // served with had homepage <title>, meta description, AND canonical
  // pointing at "/" — telling Google the pages were the homepage. Baking
  // real per-section meta here fixes that at the wire-response level.
  //
  // Each section also gets a FAQPage JSON-LD block covering every Q/A pair
  // in that section (parsed via TS AST from client/src/lib/faq.ts). Google
  // uses this to render the SERP accordion — a Q&A dropdown right in the
  // search result — which takes 3-4x the vertical space of a plain result
  // and lifts CTR meaningfully. The React runtime ALSO mounts faqSchema()
  // via SchemaMarkup; identical structure so Google dedupes cleanly.
  const faqItemsBySlug = faqItemsBySlugForHub;
  let faqWritten = 0;
  for (const meta of faqSectionMetas) {
    // meta.route is "/faqs/<slug>", strip the "/faqs/" prefix to get the slug
    // for the items lookup.
    const slug = meta.route.replace(/^\/faqs\//, "");
    const items = faqItemsBySlug[slug] ?? [];
    const qa = items
      .map(
        (it) =>
          `<h2>${esc(it.q)}</h2>` +
          it.a.split(/\n\s*\n/).map((para) => `<p>${esc(para.trim())}</p>`).join(""),
      )
      .join("");
    let html = injectBody(
      injectMeta(shell, meta),
      `<h1>${esc(headingFrom(meta.title))}</h1><p>${esc(meta.description)}</p>${qa}` +
        `<p><a href="/faqs">All FAQs</a></p>`,
    );
    if (items.length > 0) {
      html = injectJsonLd(html, buildFaqJsonLd(items));
    }
    const outPath = path.join(DIST, `${meta.route}.html`);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    faqWritten++;
  }

  // Per-location static HTML shells. Same fix as guides + FAQ sections
  // for the 6 /locations/{slug} pages — the highest-intent commercial
  // URLs on the site. SEO audit 2026-09-04 confirmed all 6 were serving
  // homepage meta + canonical to /.
  const locationMetas = await collectLocationMeta();
  let locationWritten = 0;
  for (const meta of locationMetas) {
    const html = injectBody(injectMeta(shell, meta), simpleBody(meta));
    const outPath = path.join(DIST, `${meta.route}.html`);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    locationWritten++;
  }

  // Blog posts in both languages. Each post ships as its own static HTML
  // with real per-post <title>, description, self-canonical, reciprocal
  // hreflang alternates, and (for Arabic) <html lang="ar" dir="rtl">.
  // Fixes the "every /ar/blog/* serves homepage meta" bug and does the
  // same for English posts (previously also SPA-shell-only).
  let enBlogWritten = 0;
  let arBlogWritten = 0;

  // English blog posts — /blog/{slug}.html per post.
  for (const post of enPosts) {
    const meta: RouteMeta = {
      route: `/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      url: `${SITE}/blog/${post.slug}`,
      image: post.featuredImage ?? undefined,
    };
    const alternates: Array<{ hreflang: string; url: string }> = [
      { hreflang: "en", url: `${SITE}/blog/${post.slug}` },
    ];
    if (post.otherLangSlug) {
      alternates.push({ hreflang: "ar", url: `${SITE}/ar/blog/${post.otherLangSlug}` });
    }
    alternates.push({ hreflang: "x-default", url: `${SITE}/blog/${post.slug}` });
    let html = injectBody(injectMeta(shell, meta, { lang: "en", alternates }), blogPostBody(post), "en");
    html = injectJsonLd(html, buildBlogArticleJsonLd(post, meta.url, "en"));
    const outPath = path.join(DIST, `${meta.route}.html`);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    enBlogWritten++;
  }

  // Arabic blog posts + the /ar/blog hub.
  if (arPosts.length > 0) {
    const hubMeta: RouteMeta = {
      route: "/ar/blog",
      title: "المدونة — رؤى وأدلة PLACES",
      description:
        "أحدث المقالات والأدلة من PLACES عن سوق المكاتب الإدارية في مصر — القاهرة الجديدة، الشيخ زايد، 6 أكتوبر، والمناطق التجارية الرئيسية.",
      url: `${SITE}/ar/blog`,
    };
    const hubHtml = injectBody(
      injectMeta(shell, hubMeta, {
        lang: "ar",
        alternates: [
          { hreflang: "ar", url: `${SITE}/ar/blog` },
          { hreflang: "en", url: `${SITE}/blog` },
          { hreflang: "x-default", url: `${SITE}/blog` },
        ],
      }),
      blogListBody("مدونة PLACES", hubMeta.description, arPosts, "/ar/blog"),
      "ar",
    );
    // server/static.ts serves /ar/blog from ar/blog.html; the directory index
    // alone fell through to the SPA shell (homepage canonical).
    const hubOut = path.join(DIST, "ar/blog", "index.html");
    await mkdir(path.dirname(hubOut), { recursive: true });
    await writeFile(hubOut, hubHtml, "utf8");
    await writeFile(path.join(DIST, "ar", "blog.html"), hubHtml, "utf8");
    arBlogWritten++;

    for (const post of arPosts) {
      const meta: RouteMeta = {
        route: `/ar/blog/${post.slug}`,
        title: post.title,
        description: post.description,
        url: `${SITE}/ar/blog/${post.slug}`,
        image: post.featuredImage ?? undefined,
      };
      const alternates: Array<{ hreflang: string; url: string }> = [
        { hreflang: "ar", url: `${SITE}/ar/blog/${post.slug}` },
      ];
      if (post.otherLangSlug) {
        alternates.push({ hreflang: "en", url: `${SITE}/blog/${post.otherLangSlug}` });
        alternates.push({ hreflang: "x-default", url: `${SITE}/blog/${post.otherLangSlug}` });
      }
      let html = injectBody(injectMeta(shell, meta, { lang: "ar", alternates }), blogPostBody(post), "ar");
      html = injectJsonLd(html, buildBlogArticleJsonLd(post, meta.url, "ar"));
      const outPath = path.join(DIST, `${meta.route}.html`);
      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, html, "utf8");
      arBlogWritten++;
    }
  }

  console.log(
    `prerendered ${developerWritten} developer pages + ${indexWritten} index shells + ${guideWritten} guides + ${faqWritten} FAQ sections + ${locationWritten} locations + ${enBlogWritten} EN blog + ${arBlogWritten} AR blog (meta + body)`,
  );
}
