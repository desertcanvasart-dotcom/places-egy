import type { Express, Request, Response } from "express";
import { type Server } from "http";
import multer from "multer";
import { supabaseAdmin } from "./supabase";
import { requireAdmin } from "./admin-auth";
import { strictLimiter, uploadLimiter } from "./rate-limit";
import { listingInsertSchema, listingUpdateSchema } from "./listing-schema";
import { dealInsertSchema, dealUpdateSchema } from "./deal-schema";
import { clientLogoInsertSchema, clientLogoUpdateSchema } from "./client-logo-schema";
import { leadInsertSchema, leadUpdateSchema } from "./lead-schema";
import { sendMail, escapeHtml } from "./mailer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

const SUPABASE_BUCKET = "listings-images";

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
      // Log the upstream body server-side but don't reflect it to the client —
      // WP error responses can leak plugin/version info.
      const text = await wpRes.text();
      console.error(
        `[blog] WP upstream ${wpRes.status} for ${path}: ${text.slice(0, 500)}`,
      );
      return res.status(wpRes.status).json({
        error: "Upstream WordPress error",
        status: wpRes.status,
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
  // GET /api/blog/posts?page=1&per_page=9&category=market-insights&lang=en|ar
  // The `lang` param is Polylang's language filter — exposed to the REST API
  // by our custom snippet in WP's Code Snippets plugin. Only "en" or "ar"
  // reach WP; anything else is stripped so we never leak arbitrary params.
  app.get("/api/blog/posts", async (req: Request, res: Response) => {
    const params = new URLSearchParams();
    params.set("_embed", "true");
    params.set("page", String(req.query.page ?? 1));
    params.set("per_page", String(req.query.per_page ?? 9));
    const lang = String(req.query.lang ?? "");
    if (lang === "en" || lang === "ar") params.set("lang", lang);
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

  // GET /api/blog/posts/:slug?lang=en|ar — single post by slug
  app.get("/api/blog/posts/:slug", async (req: Request, res: Response) => {
    const slug = encodeURIComponent(String(req.params.slug));
    const lang = String(req.query.lang ?? "");
    const langParam = lang === "en" || lang === "ar" ? `&lang=${lang}` : "";
    return proxyToWp(`/posts?slug=${slug}&_embed=true${langParam}`, res);
  });

  // GET /api/blog/categories?lang=en|ar — list of categories, optionally
  // filtered by Polylang language via the same custom snippet that exposes
  // ?lang= on /posts. Blank/missing lang returns everything (legacy behavior).
  app.get("/api/blog/categories", async (req: Request, res: Response) => {
    const lang = String(req.query.lang ?? "");
    const langParam = lang === "en" || lang === "ar" ? `&lang=${lang}` : "";
    return proxyToWp(
      `/categories?per_page=100&hide_empty=true${langParam}`,
      res,
    );
  });

  // GET /api/deals — public. The homepage deal carousel reads the active deals
  // (max 3) ordered by sort_order then newest. Uses the service-role client but
  // only ever returns active rows, so it's safe to expose unauthenticated.
  app.get("/api/deals", async (_req: Request, res: Response) => {
    if (!supabaseAdmin) return res.json([]);
    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return res.status(500).json({ message: error.message });
    res.json(data ?? []);
  });

  // ── Leads (public capture + admin management) ────────────────────────────
  // POST /api/leads — public form submission from any capture point (contact
  // page, lead magnet CTAs, listing inquiries, footer, exit popup). Rate
  // limited via strictLimiter (5/min per IP) to blunt bot floods. Honeypot
  // field silently discards obvious bot submissions.
  app.post(
    "/api/leads",
    strictLimiter,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Backend not configured" });
      }
      const parsed = leadInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid submission" });
      }
      const { website: honeypot, ...lead } = parsed.data;
      // Silently accept + discard bot submissions so scanners get 200 and
      // stop retrying, but the row never lands in the DB.
      if (honeypot && honeypot.trim().length > 0) {
        return res.json({ ok: true });
      }

      const { data: inserted, error } = await supabaseAdmin
        .from("leads")
        .insert({ ...lead, status: "new" })
        .select()
        .single();
      if (error) {
        console.error("[leads] insert failed:", error.message);
        return res.status(500).json({ message: "Could not save submission" });
      }

      // Fire the admin notification email. Doesn't block the response —
      // even if mail fails, the lead is already persisted so PLACES sees it
      // in the dashboard.
      const magnetLine = lead.magnet
        ? `<p style="margin:0 0 12px 0"><strong>Magnet:</strong> ${escapeHtml(lead.magnet)}</p>`
        : "";
      const listingLine = lead.listing_id
        ? `<p style="margin:0 0 12px 0"><strong>Listing #:</strong> ${lead.listing_id}</p>`
        : "";
      const utmParts = [
        lead.utm_source && `source=${lead.utm_source}`,
        lead.utm_medium && `medium=${lead.utm_medium}`,
        lead.utm_campaign && `campaign=${lead.utm_campaign}`,
      ].filter(Boolean);
      const utmLine =
        utmParts.length > 0
          ? `<p style="margin:0 0 12px 0"><strong>Campaign:</strong> ${escapeHtml(utmParts.join(" · "))}</p>`
          : "";
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; color: #1a1a1a; max-width: 560px;">
          <h2 style="margin:0 0 16px 0; color:#0f172a;">New lead — ${escapeHtml(lead.name)}</h2>
          <p style="margin:0 0 8px 0"><strong>Email:</strong> <a href="mailto:${escapeHtml(lead.email)}" style="color:#e11d48">${escapeHtml(lead.email)}</a></p>
          ${lead.phone ? `<p style="margin:0 0 8px 0"><strong>Phone:</strong> <a href="tel:${escapeHtml(lead.phone)}" style="color:#e11d48">${escapeHtml(lead.phone)}</a></p>` : ""}
          <p style="margin:0 0 16px 0"><strong>Source:</strong> ${escapeHtml(lead.lead_source)}</p>
          ${magnetLine}
          ${listingLine}
          ${utmLine}
          ${
            lead.message
              ? `<div style="margin-top:16px; padding:12px 16px; background:#f8fafc; border-left:3px solid #e11d48; border-radius:6px;">
                  <p style="margin:0; white-space:pre-wrap; line-height:1.5;">${escapeHtml(lead.message)}</p>
                </div>`
              : ""
          }
          <p style="margin-top:24px; padding-top:16px; border-top:1px solid #e5e7eb; font-size:12px; color:#64748b;">
            Landing page: ${escapeHtml(lead.page_url ?? "(unknown)")}<br>
            View + manage all leads: <a href="https://places-egy.com/dashboard" style="color:#e11d48">/dashboard</a> → Leads
          </p>
        </div>
      `;
      void sendMail({
        to: "admin@places-egy.com",
        subject: `New lead: ${lead.name}${lead.magnet ? ` (${lead.magnet})` : ""}`,
        html,
        replyTo: lead.email,
      });

      res.json({ ok: true, id: inserted.id });
    },
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Admin endpoints. All gated by requireAdmin + strictLimiter. Use the
  // service-role Supabase client which bypasses RLS — never expose this key.
  // ──────────────────────────────────────────────────────────────────────────

  // POST /api/admin/login — verify the admin password without exposing it on
  // a write path. Returns 200/401. Used by the dashboard login screen.
  app.post(
    "/api/admin/login",
    strictLimiter,
    requireAdmin,
    (_req: Request, res: Response) => {
      res.json({ ok: true });
    },
  );

  app.post(
    "/api/admin/listings",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const parsed = listingInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid listing payload" });
      }
      const { error, data } = await supabaseAdmin
        .from("listings")
        .insert(parsed.data)
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );

  app.patch(
    "/api/admin/listings/:id",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const parsed = listingUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid listing payload" });
      }
      const { error, data } = await supabaseAdmin
        .from("listings")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );

  app.delete(
    "/api/admin/listings/:id",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const { error } = await supabaseAdmin
        .from("listings")
        .delete()
        .eq("id", id);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true });
    },
  );

  // ── Deals admin CRUD (mirrors the listings routes) ────────────────────────
  app.get(
    "/api/admin/deals",
    strictLimiter,
    requireAdmin,
    async (_req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      // Admin view: all deals (incl. inactive), in display order.
      const { data, error } = await supabaseAdmin
        .from("deals")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) return res.status(400).json({ message: error.message });
      res.json(data ?? []);
    },
  );

  app.post(
    "/api/admin/deals",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const parsed = dealInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid deal payload" });
      }
      const { error, data } = await supabaseAdmin
        .from("deals")
        .insert(parsed.data)
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );

  app.patch(
    "/api/admin/deals/:id",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const parsed = dealUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid deal payload" });
      }
      const { error, data } = await supabaseAdmin
        .from("deals")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );

  app.delete(
    "/api/admin/deals/:id",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const { error } = await supabaseAdmin.from("deals").delete().eq("id", id);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true });
    },
  );

  // ── Client logos ─────────────────────────────────────────────────────────
  // Renders on the /why-places "Companies We've Placed" strip. Public GET
  // returns only active logos in display order; admin CRUD mirrors the deals
  // pattern exactly.

  app.get("/api/client-logos", async (_req: Request, res: Response) => {
    if (!supabaseAdmin) return res.json([]);
    const { data, error } = await supabaseAdmin
      .from("client_logos")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) return res.status(500).json({ message: error.message });
    res.json(data ?? []);
  });

  app.get(
    "/api/admin/client-logos",
    strictLimiter,
    requireAdmin,
    async (_req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      // Admin view: all logos (incl. inactive), in display order.
      const { data, error } = await supabaseAdmin
        .from("client_logos")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) return res.status(400).json({ message: error.message });
      res.json(data ?? []);
    },
  );

  app.post(
    "/api/admin/client-logos",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const parsed = clientLogoInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid client logo payload" });
      }
      const { error, data } = await supabaseAdmin
        .from("client_logos")
        .insert(parsed.data)
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );

  app.patch(
    "/api/admin/client-logos/:id",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const parsed = clientLogoUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid client logo payload" });
      }
      const { error, data } = await supabaseAdmin
        .from("client_logos")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );

  app.delete(
    "/api/admin/client-logos/:id",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const { error } = await supabaseAdmin.from("client_logos").delete().eq("id", id);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true });
    },
  );

  // ── Leads admin CRUD ─────────────────────────────────────────────────────
  // List every submission. Newest first — that's the working view for the
  // team ("who did we get in the last hour?"). Bounded to 500 rows so a
  // runaway list doesn't hang the dashboard; add pagination if we ever hit
  // that ceiling in practice.
  app.get(
    "/api/admin/leads",
    strictLimiter,
    requireAdmin,
    async (_req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const { data, error } = await supabaseAdmin
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) return res.status(400).json({ message: error.message });
      res.json(data ?? []);
    },
  );

  // Update lead status or notes (e.g. mark contacted, add follow-up notes).
  app.patch(
    "/api/admin/leads/:id",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const parsed = leadUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid lead update" });
      }
      const { error, data } = await supabaseAdmin
        .from("leads")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );

  app.delete(
    "/api/admin/leads/:id",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const { error } = await supabaseAdmin.from("leads").delete().eq("id", id);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true });
    },
  );

  app.post(
    "/api/admin/listings-images",
    uploadLimiter,
    requireAdmin,
    upload.single("file"),
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file) return res.status(400).json({ message: "No file uploaded" });
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "File must be an image" });
      }
      const ext = file.originalname.split(".").pop() || "bin";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from(SUPABASE_BUCKET)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });
      if (upErr) return res.status(400).json({ message: upErr.message });
      const { data } = supabaseAdmin.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(fileName);
      res.json({ publicUrl: data.publicUrl });
    },
  );

  return httpServer;
}