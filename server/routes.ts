import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const WP_API = process.env.WORDPRESS_API_URL;

if (!WP_API) {
  console.warn(
    "[blog] WORDPRESS_API_URL is not set — blog endpoints will return 500 until configured.",
  );
}

// Forwards a fetch to WordPress and returns its JSON + a couple of headers
// we need on the client (pagination headers, content-type).
async function proxyToWp(path: string, res: Response) {
  if (!WP_API) {
    return res.status(500).json({ error: "WORDPRESS_API_URL not configured" });
  }

  try {
    const url = `${WP_API}${path}`;
    const wpRes = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!wpRes.ok) {
      const text = await wpRes.text();
      return res.status(wpRes.status).json({
        error: "Upstream WordPress error",
        status: wpRes.status,
        body: text.slice(0, 500),
      });
    }

    // Forward pagination headers so the client can read total/totalPages.
    const total = wpRes.headers.get("X-WP-Total");
    const totalPages = wpRes.headers.get("X-WP-TotalPages");
    if (total) res.setHeader("X-WP-Total", total);
    if (totalPages) res.setHeader("X-WP-TotalPages", totalPages);

    // Cache for 60s on the edge / browser. Tune later if you want.
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

    const data = await wpRes.json();
    return res.json(data);
  } catch (err) {
    console.error("[blog] WP proxy error:", err);
    return res.status(502).json({ error: "Failed to reach WordPress" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // GET /api/blog/posts?page=1&per_page=9&category=market-insights
  app.get("/api/blog/posts", async (req: Request, res: Response) => {
    const params = new URLSearchParams();
    params.set("_embed", "true");
    params.set("page", String(req.query.page ?? 1));
    params.set("per_page", String(req.query.per_page ?? 9));
    if (req.query.category) {
      // Frontend passes category SLUG, but WP /posts expects category ID.
      // Resolve slug → id first.
      const catRes = await fetch(
        `${WP_API}/categories?slug=${encodeURIComponent(String(req.query.category))}`,
      );
      const cats = (await catRes.json()) as Array<{ id: number }>;
      if (cats.length > 0) params.set("categories", String(cats[0].id));
    }
    return proxyToWp(`/posts?${params.toString()}`, res);
  });

  // GET /api/blog/posts/:slug — single post by slug
  app.get("/api/blog/posts/:slug", async (req: Request, res: Response) => {
    const slug = encodeURIComponent(String(req.params.slug));
    return proxyToWp(`/posts?slug=${slug}&_embed=true`, res);
  });

  // GET /api/blog/categories — list of all categories
  app.get("/api/blog/categories", async (_req: Request, res: Response) => {
    return proxyToWp(`/categories?per_page=100&hide_empty=true`, res);
  });

  return httpServer;
}