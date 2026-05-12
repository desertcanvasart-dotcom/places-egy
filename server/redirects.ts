import type { Express } from "express";

// Permanent (301) redirects for retired URLs — preserves SEO link equity
// and keeps any external bookmarks landing on a useful page.
const PERMANENT_REDIRECTS: Record<string, string> = {
  "/services/corporate-leasing": "/services/leasing",
  "/admin-offices": "/admin",
  "/admin-offices/business-park": "/admin/business-park",
  "/admin-offices/business-building": "/admin/business-building",
  "/admin-offices/mixed-use": "/admin/mixed-use",
  "/admin-offices/mixed-use-mall": "/admin/mixed-use",
  "/office-spaces": "/",
  // PLACES retired its commercial offering — all /commercial* paths now
  // route to /admin so external links + indexed URLs land on a useful page.
  "/commercial": "/admin",
  "/commercial/mega-mall": "/admin",
  "/commercial/mega-malls": "/admin",
  "/commercial/strip-mall": "/admin",
  "/commercial/strip-malls": "/admin",
  "/commercial/drive-through": "/admin",
  "/commercial/drive-thru": "/admin",
};

// Prefix redirects for path roots that have moved. Anything matching the
// `from` prefix is rewritten to the `to` prefix, preserving the rest of the
// path and the query string. Order matters: longer prefixes first.
const PREFIX_REDIRECTS: { from: string; to: string }[] = [
  { from: "/resources/blog", to: "/blog" },
  { from: "/resources/faqs", to: "/faqs" },
  { from: "/resources/glossary", to: "/glossary" },
];

export function registerRedirects(app: Express) {
  app.use((req, res, next) => {
    if (req.method === "GET" || req.method === "HEAD") {
      const target = PERMANENT_REDIRECTS[req.path];
      if (target) {
        const query = req.url.slice(req.path.length);
        res.redirect(301, target + query);
        return;
      }
      for (const { from, to } of PREFIX_REDIRECTS) {
        if (req.path === from || req.path.startsWith(`${from}/`)) {
          const rest = req.path.slice(from.length);
          const query = req.url.slice(req.path.length);
          res.redirect(301, to + rest + query);
          return;
        }
      }
    }
    next();
  });

  // Trailing-slash 301 redirect — canonicalize every URL to the no-slash form so
  // search engines see one URL per page and link equity stays consolidated.
  // Skips the root path "/" which must keep its slash. Preserves the query string.
  // Applies to GET and HEAD only (HEAD is used by crawlers and link checkers).
  app.use((req, res, next) => {
    if (
      (req.method === "GET" || req.method === "HEAD") &&
      req.path.length > 1 &&
      req.path.endsWith("/")
    ) {
      const trimmed = req.path.replace(/\/+$/, "");
      const query = req.url.slice(req.path.length);
      res.redirect(301, trimmed + query);
      return;
    }
    next();
  });
}
