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
];

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

  // Also write dist/public/{listings,developers}/index.html so the Cloudflare
  // rewrite serves proper per-page meta instead of the raw SPA shell (which
  // has the homepage canonical hardcoded).
  for (const meta of INDEX_ROUTES) {
    const html = injectMeta(shell, meta);
    const outPath = path.join(DIST, meta.route, "index.html");
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    indexWritten++;
  }

  console.log(
    `prerendered ${developerWritten} developer pages + ${indexWritten} index shells (meta-only)`,
  );
}
