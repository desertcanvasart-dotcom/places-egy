import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, writeFile, copyFile, mkdir } from "fs/promises";
import { generateSitemap } from "./build-sitemap";
import { prerender } from "./prerender";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  // pdfkit + pdf-lib intentionally NOT bundled — pdfkit reads font metric
  // files (Helvetica.afm etc.) from its own package via a runtime relative
  // path. Bundling breaks that path and the process crashes with ENOENT on
  // first PDF generation. Leaving them external means Railway installs the
  // real node_modules folders where those .afm files live.
  "pg",
  "resend",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

// MapLibre's worker runs in the browser and internally does
// `import "./maplibre-gl-shared.mjs"` at runtime — a relative path
// that resolves to /assets/maplibre-gl-shared.mjs. Vite doesn't emit
// this file on its own, so we copy it from node_modules into the built
// assets dir on every build. If maplibre-gl is upgraded, this pulls
// the fresh shared file automatically. Do NOT remove — without this,
// the map worker silently crashes in prod and every dynamic map
// subsystem stops working (Google Places dropdown, marker updates, etc).
async function copyMapLibreShared() {
  const src = "node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs";
  const destDir = "client/public/assets";
  const dest = `${destDir}/maplibre-gl-shared.mjs`;
  try {
    await mkdir(destDir, { recursive: true });
    await copyFile(src, dest);
    console.log(`[maplibre] copied shared.mjs → ${dest}`);
  } catch (err) {
    console.warn("[maplibre] failed to copy shared.mjs:", err);
  }
}

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  // Copy the maplibre shared runtime BEFORE Vite runs so it lands in
  // the vite-built asset folder verbatim (via public/).
  await copyMapLibreShared();

  console.log("building client...");
  await viteBuild();

  await generateSitemap();

  // Meta-only prerender: write per-route HTML with unique title/description for
  // crawlers. Must run after viteBuild (needs dist/public/index.html). No
  // browser involved, so it's safe on Railway's nixpacks build.
  await prerender();

  // Listing pages and the sitemap's listing/blog entries are generated on
  // request (server/seo), not at build time.

  // Exact SPA routes for the server's 404 check (server/seo/known-routes.ts).
  const appSource = await readFile("client/src/App.tsx", "utf-8");
  const routes = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
  await writeFile("dist/known-routes.json", JSON.stringify(routes, null, 2));
  console.log(`[routes] wrote ${routes.length} known routes`);

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
