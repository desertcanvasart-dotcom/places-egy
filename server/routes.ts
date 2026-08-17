import type { Express, Request, Response } from "express";
import { type Server } from "http";
import multer from "multer";
import { supabaseAdmin } from "./supabase";
import { requireAdmin } from "./admin-auth";
import { strictLimiter, adminLimiter, uploadLimiter } from "./rate-limit";
import { listingInsertSchema, listingUpdateSchema } from "./listing-schema";
import { dealInsertSchema, dealUpdateSchema } from "./deal-schema";
import { clientLogoInsertSchema, clientLogoUpdateSchema } from "./client-logo-schema";
import { leadInsertSchema, leadUpdateSchema, conciergeLeadSchema } from "./lead-schema";
import {
  accountSignupSchema,
  addFavoriteSchema,
  bulkFavoritesSchema,
} from "./account-schema";
import {
  generateSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSessionAccount,
  requireAccount,
} from "./account-auth";
import {
  sendMail,
  sendAdminLeadNotification,
  sendMarketReportReply,
  escapeHtml,
} from "./mailer";
import { handleCalendlyWebhook } from "./calendly-webhook";
import { regenerateMarketReportHandler } from "./regenerate-report";
import { registerProjectCoordsRoutes } from "./project-coords-routes";
import {
  handleMilestoneOnFavorite,
  handleManualEmailRequest,
  runDigestSweep,
} from "./favorites-digest";

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
  registerProjectCoordsRoutes(app);

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

  // ── Cron: monthly market report regeneration ────────────────────────────
  // Called externally by a cron scheduler on the 1st of every month.
  // Auth via x-cron-token header. See server/regenerate-report.ts.
  app.post("/api/admin/regenerate-market-report", regenerateMarketReportHandler);

  // ── Cron: favorites digest sweep (every 30 min) ─────────────────────────
  // Finds accounts eligible for the 2h debounced digest (or weekly recap on
  // Mondays) and fires the emails. Same x-cron-token auth as above.
  app.post(
    "/api/admin/send-favorites-digests",
    async (req: Request, res: Response) => {
      const cronToken = process.env.CRON_TOKEN;
      if (!cronToken) {
        return res.status(503).json({ message: "CRON_TOKEN not configured" });
      }
      const provided = req.header("x-cron-token");
      if (!provided || provided !== cronToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      try {
        const result = await runDigestSweep();
        console.log("[digest-sweep] result:", result);
        res.json({ ok: true, ...result });
      } catch (err) {
        console.error("[digest-sweep] failed:", err);
        res.status(500).json({ message: (err as Error).message });
      }
    },
  );

  // ── Manual "Email me my list" from /saved page ──────────────────────────
  // Signed-in user requests an on-demand digest of their current favorites.
  // Ignores debounce + 24h cadence cap since it was user-initiated.
  app.post(
    "/api/accounts/favorites/email-me-now",
    strictLimiter,
    requireAccount,
    async (req: Request, res: Response) => {
      const account = (req as Request & { account: { id: number } }).account;
      const ok = await handleManualEmailRequest(account.id).catch(() => false);
      if (!ok) return res.status(400).json({ message: "No favorites to email" });
      res.json({ ok: true });
    },
  );

  // ── Calendly webhook ─────────────────────────────────────────────────────
  // Public endpoint hit by Calendly on invitee.created + invitee.canceled.
  // Auth is via HMAC signature (see server/calendly-webhook.ts). Every booking
  // ends up in the calendly_bookings table with full UTM attribution + fires
  // an admin@ notification on new bookings.
  app.post("/api/webhooks/calendly", async (req, res) => {
    await handleCalendlyWebhook(req, res);
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
      void sendAdminLeadNotification({
        name: lead.name,
        email: lead.email,
        phone: lead.phone ?? null,
        message: lead.message ?? null,
        lead_source: lead.lead_source,
        magnet: lead.magnet ?? null,
        listing_id: lead.listing_id ?? null,
        page_url: lead.page_url ?? null,
        locations: lead.locations ?? null,
        utm_source: lead.utm_source ?? null,
        utm_medium: lead.utm_medium ?? null,
        utm_campaign: lead.utm_campaign ?? null,
      });

      // Auto-reply to the LEAD themselves when they signed up for the market
      // report magnet. Fire-and-forget — a mailer failure never blocks the
      // response since the lead is already persisted and admin@ already
      // got the notification above.
      if (lead.magnet === "cairo_office_market_report_2026") {
        void sendMarketReportReply({
          toEmail: lead.email,
          toName: lead.name,
          lang: lead.preferred_language ?? "en",
        });
      }

      res.json({ ok: true, id: inserted.id });
    },
  );

  // ── Concierge widget lead capture ────────────────────────────────────────
  // Lightweight lead from the bottom-left "Looking for something specific?"
  // popup. Same `leads` table, but its own schema (no locations required,
  // email OR phone). lead_source hardcoded so admin can filter by it later.
  app.post(
    "/api/leads/concierge",
    strictLimiter,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Backend not configured" });
      }
      const parsed = conciergeLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid submission" });
      }
      const { website: honeypot, intent, message, ...rest } = parsed.data;
      if (honeypot && honeypot.trim().length > 0) {
        return res.json({ ok: true });
      }

      // Compose the message with the intent tag so admin sees intent at a
      // glance in the leads dashboard without needing a new column.
      const intentLabel = {
        buy: "Wants to BUY an office",
        rent: "Wants to RENT an office",
        browsing: "Just browsing",
        other: "Other / undecided",
      }[intent];
      const composedMessage = message
        ? `${intentLabel}\n\n${message}`
        : intentLabel;

      const { data: inserted, error } = await supabaseAdmin
        .from("leads")
        .insert({
          name: rest.name,
          email: rest.email ?? "",
          phone: rest.phone ?? "",
          message: composedMessage,
          locations: [],
          lead_source: "concierge_widget",
          magnet: null,
          page_url: rest.page_url ?? null,
          utm_source: rest.utm_source ?? null,
          utm_medium: rest.utm_medium ?? null,
          utm_campaign: rest.utm_campaign ?? null,
          utm_term: rest.utm_term ?? null,
          utm_content: rest.utm_content ?? null,
          preferred_language: rest.preferred_language ?? null,
          status: "new",
        })
        .select()
        .single();
      if (error) {
        console.error("[concierge] insert failed:", error.message);
        return res.status(500).json({ message: "Could not save submission" });
      }

      void sendAdminLeadNotification({
        name: rest.name,
        email: rest.email ?? "(not provided)",
        phone: rest.phone ?? null,
        message: composedMessage,
        lead_source: "concierge_widget",
        magnet: null,
        listing_id: null,
        page_url: rest.page_url ?? null,
        locations: null,
        utm_source: rest.utm_source ?? null,
        utm_medium: rest.utm_medium ?? null,
        utm_campaign: rest.utm_campaign ?? null,
      });

      res.json({ ok: true, id: inserted.id });
    },
  );

  // ── Accounts (quick-signup + favorites) ──────────────────────────────────
  // Public, cookie-session accounts backing the favorites system. Signup =
  // 3 fields (name, email, phone); no password. On success we mint a session
  // token, store on the account row, set an httpOnly cookie. See
  // server/account-auth.ts for the session model.

  app.post(
    "/api/accounts",
    strictLimiter,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Backend not configured" });
      }
      const parsed = accountSignupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid signup" });
      }
      const { website, ...body } = parsed.data;
      if (website && website.trim().length > 0) {
        // Silently accept bot submissions so scanners get 200 and stop.
        return res.json({ ok: true });
      }

      // If this email already has an account, log them back in instead of
      // erroring (this is a lead-capture form; the person wanting to save
      // favorites shouldn't be blocked by a "you already exist" wall).
      const existing = await supabaseAdmin
        .from("accounts")
        .select("id,name,email,phone,session_token")
        .eq("email", body.email.toLowerCase())
        .maybeSingle();

      const token = generateSessionToken();
      const now = new Date().toISOString();

      if (existing.data) {
        // Rotate session token + refresh any updated contact info the visitor
        // typed. We prefer their latest name/phone in case they changed number.
        // Only overwrite preferred_language if we captured one this time —
        // otherwise keep whatever we recorded on their original signup.
        const update: Record<string, unknown> = {
          name: body.name,
          phone: body.phone,
          session_token: token,
          last_active_at: now,
        };
        if (body.preferred_language) {
          update.preferred_language = body.preferred_language;
        }
        await supabaseAdmin
          .from("accounts")
          .update(update)
          .eq("id", existing.data.id);
        setSessionCookie(res, token);
        return res.json({
          ok: true,
          id: existing.data.id,
          existed: true,
        });
      }

      const { data: inserted, error } = await supabaseAdmin
        .from("accounts")
        .insert({
          name: body.name,
          email: body.email.toLowerCase(),
          phone: body.phone,
          session_token: token,
          last_active_at: now,
          preferred_language: body.preferred_language ?? "en",
        })
        .select("id")
        .single();
      if (error || !inserted) {
        console.error("[accounts] insert failed:", error?.message);
        return res.status(500).json({ message: "Could not create account" });
      }

      setSessionCookie(res, token);

      // Fire notification to admin@ so the team knows a new account signed
      // up — same pattern as lead notifications.
      const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#1a1a1a; max-width:560px;">
          <h2 style="margin:0 0 16px 0;">New account signup — ${escapeHtml(body.name)}</h2>
          <p style="margin:0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></p>
          <p style="margin:0 0 8px 0;"><strong>Phone:</strong> <a href="tel:${escapeHtml(body.phone)}">${escapeHtml(body.phone)}</a></p>
          <p style="margin:24px 0 0 0; font-size:12px; color:#64748b;">
            View + WhatsApp them from <a href="https://places-egy.com/dashboard">/dashboard</a> → Accounts.
          </p>
        </div>
      `;
      void sendMail({
        to: "admin@places-egy.com",
        subject: `New account: ${body.name}`,
        html,
        replyTo: body.email,
      });

      res.json({ ok: true, id: inserted.id, existed: false });
    },
  );

  // Log out — clears cookie. Doesn't invalidate the token server-side (the
  // next signup rotates it anyway); Phase 6 can rotate here too if needed.
  app.post(
    "/api/accounts/logout",
    (_req: Request, res: Response) => {
      clearSessionCookie(res);
      res.json({ ok: true });
    },
  );

  // Who am I? Returns current account + their favorites. If no session
  // cookie or invalid, returns 200 with `account: null` — the client's
  // useAccount() hook uses this to decide whether to show anon or signed-in
  // state. Never 401 here; the /favorites routes will 401 as needed.
  app.get(
    "/api/accounts/me",
    async (req: Request, res: Response) => {
      const account = await getSessionAccount(req);
      if (!account) return res.json({ account: null, favorites: [] });
      if (!supabaseAdmin) return res.json({ account, favorites: [] });
      const { data } = await supabaseAdmin
        .from("account_favorites")
        .select("listing_id,added_at")
        .eq("account_id", account.id)
        .order("added_at", { ascending: false });
      res.json({
        account,
        favorites: (data ?? []).map((r) => ({
          listing_id: r.listing_id,
          added_at: r.added_at,
        })),
      });
    },
  );

  app.post(
    "/api/accounts/favorites",
    strictLimiter,
    requireAccount,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Backend not configured" });
      const account = (req as Request & { account: { id: number } }).account;
      const parsed = addFavoriteSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid" });
      const now = new Date().toISOString();
      // Upsert — silently no-op if already favorited.
      const { error } = await supabaseAdmin
        .from("account_favorites")
        .upsert(
          {
            account_id: account.id,
            listing_id: parsed.data.listing_id,
            added_at: now,
          },
          { onConflict: "account_id,listing_id", ignoreDuplicates: true },
        );
      if (error) return res.status(400).json({ message: error.message });

      // Stamp last_favorite_at so the 2h debounced digest cron knows this
      // account has new activity + when it went quiet. Fire-and-forget.
      void supabaseAdmin
        .from("accounts")
        .update({ last_favorite_at: now })
        .eq("id", account.id);

      // Check if this favorite is the 10th — if so fire the milestone email
      // immediately (bottom-of-funnel signal). Fire-and-forget.
      void handleMilestoneOnFavorite(account.id);

      res.json({ ok: true });
    },
  );

  app.delete(
    "/api/accounts/favorites/:listingId",
    strictLimiter,
    requireAccount,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Backend not configured" });
      const account = (req as Request & { account: { id: number } }).account;
      const listingId = Number(req.params.listingId);
      if (!Number.isFinite(listingId)) return res.status(400).json({ message: "Invalid id" });
      const { error } = await supabaseAdmin
        .from("account_favorites")
        .delete()
        .eq("account_id", account.id)
        .eq("listing_id", listingId);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true });
    },
  );

  // Bulk-merge: called right after signup with the anonymous localStorage
  // favorites the visitor built before creating the account. Idempotent —
  // duplicates are silently ignored.
  app.post(
    "/api/accounts/favorites/bulk",
    strictLimiter,
    requireAccount,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Backend not configured" });
      const account = (req as Request & { account: { id: number } }).account;
      const parsed = bulkFavoritesSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid" });
      if (parsed.data.listing_ids.length === 0) return res.json({ ok: true, merged: 0 });
      const now = new Date().toISOString();
      const rows = parsed.data.listing_ids.map((id) => ({
        account_id: account.id,
        listing_id: id,
        added_at: now,
      }));
      const { error } = await supabaseAdmin
        .from("account_favorites")
        .upsert(rows, {
          onConflict: "account_id,listing_id",
          ignoreDuplicates: true,
        });
      // Stamp last_favorite_at so the digest cron treats these merged
      // favorites as recent activity worth sending a digest about.
      void supabaseAdmin
        .from("accounts")
        .update({ last_favorite_at: now })
        .eq("id", account.id);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true, merged: rows.length });
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
    adminLimiter,
    requireAdmin,
    (_req: Request, res: Response) => {
      res.json({ ok: true });
    },
  );

  app.post(
    "/api/admin/listings",
    adminLimiter,
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
    adminLimiter,
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
    adminLimiter,
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
    adminLimiter,
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
    adminLimiter,
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
    adminLimiter,
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
    adminLimiter,
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
    adminLimiter,
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
    adminLimiter,
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
    adminLimiter,
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
    adminLimiter,
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
    adminLimiter,
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
    adminLimiter,
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
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      // `.select()` after delete returns the deleted rows so we can detect
      // the "policy allowed the call but blocked all rows" case, which
      // Supabase treats as success. If 0 rows come back but no error was
      // raised, RLS is the culprit — surface that to the admin instead of
      // pretending it worked.
      const { data, error } = await supabaseAdmin
        .from("leads")
        .delete()
        .eq("id", id)
        .select();
      if (error) return res.status(400).json({ message: error.message });
      if (!data || data.length === 0) {
        return res.status(404).json({
          message: `Row not deleted (id=${id}). Either the row is gone already or Supabase RLS is blocking deletes for the service role. Check RLS policies on the 'leads' table.`,
        });
      }
      res.json({ ok: true, deleted: data.length });
    },
  );

  // ── Accounts admin (view all signed-up users + their favorites) ──────────
  // Read-only from admin — accounts self-mutate via the public /api/accounts
  // routes above. Bounded to 500 rows same as leads.
  app.get(
    "/api/admin/accounts",
    adminLimiter,
    requireAdmin,
    async (_req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Supabase not configured" });
      // Get accounts + favorite counts in two queries (small tables — this
      // is fine and simpler than a view/RPC).
      const { data: accounts, error } = await supabaseAdmin
        .from("accounts")
        .select("id,name,email,phone,created_at,last_active_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) return res.status(400).json({ message: error.message });
      const { data: favs } = await supabaseAdmin
        .from("account_favorites")
        .select("account_id");
      const countMap = new Map<number, number>();
      for (const f of favs ?? []) {
        countMap.set(f.account_id, (countMap.get(f.account_id) ?? 0) + 1);
      }
      const enriched = (accounts ?? []).map((a) => ({
        ...a,
        favorite_count: countMap.get(a.id) ?? 0,
      }));
      res.json(enriched);
    },
  );

  // Fetch one account + its full favorites list (with joined listing details).
  app.get(
    "/api/admin/accounts/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Supabase not configured" });
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const { data: account, error: accountErr } = await supabaseAdmin
        .from("accounts")
        .select("id,name,email,phone,created_at,last_active_at")
        .eq("id", id)
        .maybeSingle();
      if (accountErr) return res.status(400).json({ message: accountErr.message });
      if (!account) return res.status(404).json({ message: "Not found" });

      const { data: favRows } = await supabaseAdmin
        .from("account_favorites")
        .select("listing_id,added_at")
        .eq("account_id", id)
        .order("added_at", { ascending: false });

      const listingIds = (favRows ?? []).map((r) => r.listing_id);
      let listings: unknown[] = [];
      if (listingIds.length > 0) {
        const { data: ls } = await supabaseAdmin
          .from("listings")
          .select("*")
          .in("id", listingIds);
        // Preserve added_at ordering.
        const map = new Map((ls ?? []).map((l: { id: number }) => [l.id, l]));
        listings = listingIds
          .map((lid) => map.get(lid))
          .filter((l) => l != null);
      }
      res.json({ account, favorites: listings });
    },
  );

  app.delete(
    "/api/admin/accounts/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Supabase not configured" });
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      // account_favorites has ON DELETE CASCADE (see SQL), so favorites go too.
      const { error } = await supabaseAdmin.from("accounts").delete().eq("id", id);
      if (error) return res.status(400).json({ message: error.message });
      res.json({ ok: true });
    },
  );

  // ── Bookings admin (Calendly meetings synced via webhook) ────────────────
  app.get(
    "/api/admin/bookings",
    adminLimiter,
    requireAdmin,
    async (_req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Supabase not configured" });
      const { data, error } = await supabaseAdmin
        .from("calendly_bookings")
        .select("*")
        .order("start_time", { ascending: false })
        .limit(500);
      if (error) return res.status(400).json({ message: error.message });
      res.json(data ?? []);
    },
  );

  app.delete(
    "/api/admin/bookings/:id",
    adminLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) return res.status(503).json({ message: "Supabase not configured" });
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const { error } = await supabaseAdmin.from("calendly_bookings").delete().eq("id", id);
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
