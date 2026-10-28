import type { Express, Request, Response, NextFunction } from "express";
import { renderDeveloper, renderHome, renderLanding, renderListing, renderListingsIndex, renderLocation, renderNotFound, setDistPath } from "./render";
import { getListingById } from "./data";
import { registerSitemapRoutes } from "./sitemap";

// Server-rendered pages. Registered before express.static so they win over
// build-time files. On any error, fall through to the normal static/SPA path.
export function registerSeoRoutes(app: Express, distPath: string): void {
  setDistPath(distPath);

  // Cloudflare's page rule rewrites /listings to "//listings/index.html"
  // (double slash), which no route matches. Collapse leading slashes first.
  app.use((req, _res, next) => {
    if (req.url.startsWith("//")) req.url = req.url.replace(/^\/+/, "/");
    next();
  });

  registerSitemapRoutes(app);

  const send = (render: (req: Request) => Promise<string | null>) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const html = await render(req);
        if (html === null) return next();
        res.setHeader("Cache-Control", "no-cache");
        res.type("html").send(html);
      } catch (err) {
        console.warn(`[seo] render failed for ${req.path}:`, err);
        next();
      }
    };

  app.get(["/", "/index.html"], send(() => renderHome()));
  // Cloudflare's page rule rewrites /listings to /listings/index.html at the edge.
  app.get(["/listings", "/listings/index.html"], send(() => renderListingsIndex(1)));
  app.get("/listings/page/:n", (req, res, next) => {
    const n = Number(req.params.n);
    if (!Number.isInteger(n) || String(n) !== req.params.n) return next();
    if (n === 1) return res.redirect(301, "/listings");
    return send(() => renderListingsIndex(n))(req, res, next);
  });
  // listing-redirect.ts runs first: unknown ids and non-canonical slugs never get here.
  app.get(
    "/listings/:idSlug",
    send(async (req) => {
      const id = Number(String(req.params.idSlug).split("-")[0]);
      if (!Number.isInteger(id) || id <= 0) return null;
      const listing = await getListingById(id);
      if (!listing || listing.path !== req.path) return null;
      return renderListing(listing);
    }),
  );
  app.get("/locations/:slug", send((req) => renderLocation(String(req.params.slug))));
  app.get("/developers/:slug", send((req) => renderDeveloper(String(req.params.slug))));
  // Search landing pages (/rent/new-cairo, /buy/new-cairo, …). A page exists only
  // while it has enough available units; otherwise it's a real 404.
  app.get(["/rent/:loc", "/buy/:loc", "/income-property/:loc"], async (req, res, next) => {
    try {
      const html = await renderLanding(req.path.split("/")[1], String(req.params.loc));
      res.setHeader("Cache-Control", "no-cache");
      if (html === null) return res.status(404).type("html").send(renderNotFound("404"));
      res.type("html").send(html);
    } catch (err) {
      console.warn(`[seo] render failed for ${req.path}:`, err);
      next();
    }
  });
}
