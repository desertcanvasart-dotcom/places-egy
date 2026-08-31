import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import path from "path";
import ts from "typescript";

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

// Escape a value for safe insertion into an HTML attribute.
function attr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Rewrite the head tags of the shell HTML for one route's meta.
function injectMeta(shell: string, meta: RouteMeta): string {
  let html = shell;
  const t = attr(meta.title);
  const d = attr(meta.description);
  const u = attr(meta.url);

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${d}" />`,
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${u}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${t}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${d}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${u}" />`,
  );
  return html;
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
];

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

// Parse client/src/lib/guides.ts for guide slugs + titles + descriptions and
// bake per-guide static HTML files. Same TS-AST pattern as extractMeta so
// the source is single-truth: what's in the guides.ts array is what gets
// prerendered.
async function collectGuideMeta(): Promise<RouteMeta[]> {
  const guidesPath = path.resolve(process.cwd(), "client/src/lib/guides.ts");
  let src: string;
  try {
    src = await readFile(guidesPath, "utf8");
  } catch {
    return [];
  }
  const out: RouteMeta[] = [];
  // Match every { slug: "...", title: "...", description: "...", ... } block.
  const re = /slug:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]+)"[\s\S]*?imageUrl:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const [, slug, title, description, imageUrl] = m;
    out.push({
      route: `/guides/${slug}`,
      title: `${title} | PLACES`,
      description,
      url: `${SITE}/guides/${slug}`,
      image: imageUrl.startsWith("http") ? imageUrl : `${SITE}${imageUrl}`,
    });
  }
  return out;
}

export async function prerender() {
  const shellPath = path.join(DIST, "index.html");
  const shell = await readFile(shellPath, "utf8");

  const metas = await collectDeveloperMeta();
  let developerWritten = 0;
  let indexWritten = 0;

  for (const meta of metas) {
    const html = injectMeta(shell, meta);
    // Write dist/public/developers/<slug>.html — express.static resolves
    // /developers/<slug> to this file before the SPA catch-all.
    const outPath = path.join(DIST, `${meta.route}.html`);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    developerWritten++;
  }

  // Also write dist/public/{listings,developers,guides}/index.html so the
  // Cloudflare rewrite (and Express's own extensions:["html"] resolver)
  // serves proper per-page meta instead of the raw SPA shell (which has
  // the homepage canonical hardcoded).
  for (const meta of INDEX_ROUTES) {
    const html = injectMeta(shell, meta);
    const outPath = path.join(DIST, meta.route, "index.html");
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    indexWritten++;
  }

  // Per-guide static HTML shells — every /guides/{slug} URL now gets its
  // own real title + meta description + canonical + og:image on the first
  // HTTP response. Critical for AI answer engines (Perplexity, ChatGPT,
  // Claude bots) which don't execute JavaScript before reading meta.
  const guideMetas = await collectGuideMeta();
  let guideWritten = 0;
  for (const meta of guideMetas) {
    const html = injectMeta(shell, meta);
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
  const faqSectionMetas = await collectFaqSectionMeta();
  let faqWritten = 0;
  for (const meta of faqSectionMetas) {
    const html = injectMeta(shell, meta);
    const outPath = path.join(DIST, `${meta.route}.html`);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    faqWritten++;
  }

  console.log(
    `prerendered ${developerWritten} developer pages + ${indexWritten} index shells + ${guideWritten} guides + ${faqWritten} FAQ sections (meta-only)`,
  );
}
