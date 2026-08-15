import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";
import { generateSitemap } from "./build-sitemap";
import { prerender } from "./prerender";
import { buildListingsSeo } from "./build-listings-seo";

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

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  await generateSitemap();

  // Meta-only prerender: write per-route HTML with unique title/description for
  // crawlers. Must run after viteBuild (needs dist/public/index.html). No
  // browser involved, so it's safe on Railway's nixpacks build.
  await prerender();

  // Dynamic listing pages: add their URLs to the sitemap and prerender per-
  // listing meta from Supabase. Runs after prerender() (same dist/index.html
  // shell) and never fails the build if Supabase is unreachable.
  await buildListingsSeo();

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
