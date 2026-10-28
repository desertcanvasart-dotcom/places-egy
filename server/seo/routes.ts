import type { Express, Request, Response, NextFunction } from "express";
import { renderDeveloper, renderHome, renderListingsIndex, renderLocation, setDistPath } from "./render";

// Server-rendered pages. Registered before express.static so they win over
// build-time files. On any error, fall through to the normal static/SPA path.
export function registerSeoRoutes(app: Express, distPath: string): void {
  setDistPath(distPath);

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
  app.get("/locations/:slug", send((req) => renderLocation(String(req.params.slug))));
  app.get("/developers/:slug", send((req) => renderDeveloper(String(req.params.slug))));
}
