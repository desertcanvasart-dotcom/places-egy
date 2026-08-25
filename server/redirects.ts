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
  // Favorites/saved-listings page was briefly built as /my-favorites and
  // /favorites in early drafts. Canonical URL is now /saved (matches Redfin
  // convention). Preserve any accidentally-shared bookmarks by 301'ing both
  // legacy variants forward.
  "/my-favorites": "/saved",
  "/favorites": "/saved",
  "/wishlist": "/saved",
  // PLACES retired its commercial offering — all /commercial* paths now
  // route to the homepage so external links + indexed URLs land on a
  // useful page that reflects the new admin-only positioning.
  "/commercial": "/",
  "/commercial/mega-mall": "/",
  "/commercial/mega-malls": "/",
  "/commercial/strip-mall": "/",
  "/commercial/strip-malls": "/",
  "/commercial/drive-through": "/",
  "/commercial/drive-thru": "/",
  // Developer rename: Milcon → Mercon (2026-08-25). Preserves link equity
  // from any external references to the old /developers/milcon URL.
  "/developers/milcon": "/developers/mercon",
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
      // Blog category URL cleanup + legacy → clean conversion.
      //  - Legacy /blog?category=foo → /blog/category/foo (301, clean URLs)
      //  - Legacy /blog?category=uncategorized-* → real replacement category
      //    (English → admin-offices, Arabic → المكاتب-الإدارية)
      // Also handles the path-form /blog/category/uncategorized* by redirecting
      // to the same replacement.
      const isBlogEn = req.path === "/blog";
      const isBlogAr = req.path === "/ar/blog";
      const isBlogEnCat = req.path.startsWith("/blog/category/");
      const isBlogArCat = req.path.startsWith("/ar/blog/category/");

      // Resolve the category slug from either query or path.
      let catRaw: string | null = null;
      let base = "";
      if ((isBlogEn || isBlogAr) && typeof req.query.category === "string") {
        catRaw = req.query.category;
        base = isBlogAr ? "/ar/blog" : "/blog";
      } else if (isBlogEnCat) {
        catRaw = decodeURIComponent(req.path.slice("/blog/category/".length));
        base = "/blog";
      } else if (isBlogArCat) {
        catRaw = decodeURIComponent(req.path.slice("/ar/blog/category/".length));
        base = "/ar/blog";
      }

      if (catRaw != null && base) {
        const catLower = catRaw.toLowerCase();
        const isUncategorized =
          catLower === "uncategorized" ||
          catLower === "uncategorised" ||
          catLower.startsWith("uncategorized-") ||
          catLower.startsWith("uncategorised-") ||
          catRaw === "غير-مصنف";

        // Uncategorized → the real replacement category per language.
        if (isUncategorized) {
          const replacement =
            base === "/ar/blog" ? "المكاتب-الإدارية" : "admin-offices";
          res.redirect(301, `${base}/category/${encodeURIComponent(replacement)}`);
          return;
        }

        // Retired "Guides and Tips" WP category → admin-offices. Same reason
        // as the uncategorized shim above: prevents 404s from any external
        // links or GSC-indexed URLs pointing at the old slug. Covers the
        // common WordPress slug variants for this category name.
        const isRetiredGuidesTips =
          catLower === "guides-and-tips" ||
          catLower === "guides-tips" ||
          catLower === "guides" ||
          catLower === "tips" ||
          catLower === "guides-tips-en" ||
          // Arabic variants. WP usually slugifies "أدلة ونصائح" by
          // replacing the space with a hyphen but keeps the original
          // characters in the URL when someone links to it uncleaned.
          // Match both forms.
          catRaw === "أدلة ونصائح" ||
          catRaw === "أدلة-ونصائح" ||
          catRaw === "الأدلة-والنصائح" ||
          catRaw === "الأدلة والنصائح" ||
          catRaw === "نصائح" ||
          catRaw === "أدلة";
        if (isRetiredGuidesTips) {
          const replacement =
            base === "/ar/blog" ? "المكاتب-الإدارية" : "admin-offices";
          res.redirect(301, `${base}/category/${encodeURIComponent(replacement)}`);
          return;
        }

        // Legacy query-string form → clean path form (only when the request
        // came in via ?category=; already-clean path URLs are left alone).
        if (isBlogEn || isBlogAr) {
          res.redirect(
            301,
            `${base}/category/${encodeURIComponent(catRaw)}`,
          );
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
