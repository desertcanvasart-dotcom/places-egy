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

// Static (non-developer, non-listing) routes that need per-page meta. Keep in
// lockstep with the runtime page's title/description if you edit them — the
// crawler-visible copy comes from here at build time, the browser-visible copy
// comes from the page. Adding a new static route is one entry: hardcoded title
// + description + url. When we outgrow this, refactor to a useDocumentMeta
// hook and extract via AST like collectDeveloperMeta does.
const STATIC_ROUTES: RouteMeta[] = [
  {
    route: "/why-places",
    title: "Why PLACES — Egypt's Administrative Office Real Estate Specialists",
    description:
      "Meet the team and mission behind PLACES — Egypt's specialized partner for administrative office real estate across Cairo, New Cairo, Sheikh Zayed, 6th October, Downtown Cairo, Sheraton, and Maadi.",
    url: `${SITE}/why-places`,
  },
  {
    route: "/services",
    title: "Services — Office Leasing, Sales, Resale & Investment | PLACES",
    description:
      "PLACES delivers full-cycle office real estate services in Egypt: leasing, primary property purchases, resale transactions, investment consultation, and income-generating property advisory.",
    url: `${SITE}/services`,
  },
  {
    route: "/services/leasing",
    title: "Office Leasing in Cairo & Egypt — Corporate Leasing | PLACES",
    description:
      "End-to-end office leasing across Cairo's key business districts. PLACES handles market surveys, shortlisting, due diligence, and negotiation for HQs, growing companies, and multinationals.",
    url: `${SITE}/services/leasing`,
  },
  {
    route: "/services/primary-property",
    title: "Primary Property Purchase — Buy Directly from Developers | PLACES",
    description:
      "Buy office units directly from Egypt's top developers, with developer-verified pricing, incentives, and payment plans. PLACES represents you at the primary transaction.",
    url: `${SITE}/services/primary-property`,
  },
  {
    route: "/services/property-resale",
    title: "Office Resale — Buy & Sell Existing Units in Egypt | PLACES",
    description:
      "Buy or sell office units on the resale market across Cairo. PLACES matches sellers with qualified buyers and handles pricing, marketing, and negotiation end-to-end.",
    url: `${SITE}/services/property-resale`,
  },
  {
    route: "/services/investment-consultation",
    title: "Office Real Estate Investment Consultation | PLACES",
    description:
      "Investment consultation for office real estate in Egypt — yield analysis, market timing, exit strategy, and portfolio structuring for corporate buyers and private investors.",
    url: `${SITE}/services/investment-consultation`,
  },
  {
    route: "/services/income-generating-property",
    title: "Income-Generating Office Property in Egypt | PLACES",
    description:
      "Acquire pre-leased office assets in Cairo for immediate rental income. PLACES sources yield-ready units with verified tenants, lease terms, and service charge history.",
    url: `${SITE}/services/income-generating-property`,
  },
  {
    route: "/locations",
    title: "Office Real Estate Locations — New Cairo, Sheikh Zayed, 6th October, Downtown, Sheraton, Maadi | PLACES",
    description:
      "PLACES operates across Cairo's six most active commercial and administrative districts — each with its own demand profile, tenant mix, and investment dynamics.",
    url: `${SITE}/locations`,
  },
  {
    route: "/glossary",
    title: "Real Estate Glossary — Office Leasing & Investment Terms | PLACES",
    description:
      "A working glossary of administrative real estate terms — leasing, financing, contracts, unit specs — used by PLACES and Egypt's office market professionals.",
    url: `${SITE}/glossary`,
  },
  {
    route: "/faqs",
    title: "Office Real Estate FAQs — Buying, Leasing & Investing in Egypt | PLACES",
    description:
      "Answers to the questions Egyptian office buyers, tenants, and investors ask most — from early-stage thinking to contracts, developer selection, and location strategy.",
    url: `${SITE}/faqs`,
  },
  {
    route: "/contact",
    title: "Contact PLACES — Talk to an Office Real Estate Advisor",
    description:
      "Get in touch with PLACES for office leasing, sales, or investment advice across Egypt. Direct line, WhatsApp, or Calendly — same-day response.",
    url: `${SITE}/contact`,
  },
  {
    route: "/developers",
    title: "Office Developers in Egypt — Trusted Real Estate Partners | PLACES",
    description:
      "PLACES works with 50+ verified office developers across Egypt — Emaar, Marakez, SODIC, Palm Hills, ORA, and more. Browse projects, credentials, and available units.",
    url: `${SITE}/developers`,
  },
  {
    route: "/projects",
    title: "Office Projects in Cairo — Business Parks, Buildings & Mixed-Use | PLACES",
    description:
      "Explore administrative office projects across Cairo — business parks, standalone buildings, and mixed-use developments. Curated by PLACES, updated as new projects break ground.",
    url: `${SITE}/projects`,
  },
];

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
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${t}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${d}" />`,
  );
  return html;
}

export async function prerender() {
  const shellPath = path.join(DIST, "index.html");
  const shell = await readFile(shellPath, "utf8");

  // Developer pages — extracted from source via AST so meta stays in lockstep
  // with what runtime useDocumentMeta renders.
  const devMetas = await collectDeveloperMeta();

  // Static pages — hardcoded above; simpler and adequate while the set is small.
  const allMetas: RouteMeta[] = [...devMetas, ...STATIC_ROUTES];

  let written = 0;
  for (const meta of allMetas) {
    const html = injectMeta(shell, meta);
    // Write dist/public/<route>.html — express.static resolves /<route> to
    // this file before the SPA catch-all.
    const outPath = path.join(DIST, `${meta.route}.html`);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    written++;
  }

  console.log(
    `prerendered ${written} pages (${devMetas.length} developers + ${STATIC_ROUTES.length} static, meta-only)`,
  );
}
