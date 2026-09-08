import type { Request, Response } from "express";
import { supabaseAdmin } from "./supabase";
import { sendMail } from "./mailer";
import { fetchGa4WeeklyTraffic, type GA4WeeklyTraffic } from "./ga4-client";

// Weekly Monday-morning admin email report.
//
// Fired by an external cron (cron-job.org, same shared secret as the other
// crons) every Monday at 09:00 Cairo time. The endpoint queries Supabase
// directly for the last-7-days vs previous-7-days snapshot, formats the
// numbers into a branded email, and sends to admin@places-egy.com.
//
// Deliberately DOES NOT depend on GA4 for traffic numbers — GA4 doesn't
// have a server-side Node SDK we can drive from cron, and the value of
// this report is the lead pulse (which we DO own in Supabase) not the
// traffic pulse (which admin can check in GA4 anytime).
//
// Data shown:
//   - Leads this week vs previous 7-day window (count + delta %)
//   - Top lead source this week
//   - Top page / listing that produced leads this week
//   - Deals shipped this week (Supabase `deals` table)
//   - Calendly bookings this week (Supabase `calendly_bookings` — falls
//     back to empty section if the table is empty since Zapier bridge
//     isn't yet wired)
//   - 3 hottest leads (highest-priority sources, last 7 days) with names

interface WeeklyMetrics {
  leadsThisWeek: number;
  leadsPrevWeek: number;
  leadsDeltaPct: number | null; // null if prev = 0 (can't divide)
  topSource: { name: string; count: number } | null;
  topPage: { path: string; count: number } | null;
  dealsThisWeek: number;
  bookingsThisWeek: number;
  hotLeads: Array<{
    name: string;
    email: string | null;
    phone: string | null;
    source: string;
    listing_id: number | null;
    created_at: string;
  }>;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  // Traffic block from GA4 — null if the service account isn't configured
  // yet OR the fetch failed. Report still ships in that case, just
  // without the traffic KPIs.
  ga4: GA4WeeklyTraffic | null;
}

async function fetchMetrics(): Promise<WeeklyMetrics> {
  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekEnd = now;
  const prevWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const prevWeekEnd = weekStart;

  // ── Leads this week + previous week ─────────────────────────────────────
  const { data: leadsThisWeek } = await supabaseAdmin
    .from("leads")
    .select("id,name,email,phone,lead_source,utm_source,page_url,listing_id,created_at,magnet")
    .gte("created_at", weekStart.toISOString())
    .lt("created_at", weekEnd.toISOString())
    .order("created_at", { ascending: false });

  const { data: leadsPrevWeek } = await supabaseAdmin
    .from("leads")
    .select("id")
    .gte("created_at", prevWeekStart.toISOString())
    .lt("created_at", prevWeekEnd.toISOString());

  const thisCount = leadsThisWeek?.length ?? 0;
  const prevCount = leadsPrevWeek?.length ?? 0;
  const deltaPct = prevCount === 0 ? null : Math.round(((thisCount - prevCount) / prevCount) * 100);

  // ── Top source (by utm_source if set, else lead_source) ─────────────────
  const sourceCounts = new Map<string, number>();
  for (const l of leadsThisWeek ?? []) {
    const key = (l.utm_source as string | null) ?? (l.lead_source as string) ?? "direct";
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
  }
  const topSourceEntry = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topSource = topSourceEntry ? { name: topSourceEntry[0], count: topSourceEntry[1] } : null;

  // ── Top page (by page_url) ──────────────────────────────────────────────
  const pageCounts = new Map<string, number>();
  for (const l of leadsThisWeek ?? []) {
    const raw = l.page_url as string | null;
    if (!raw) continue;
    // Strip origin + query so we group by pathname only. Falls back to raw
    // if URL parsing throws (malformed page_urls).
    let path: string;
    try {
      path = new URL(raw).pathname;
    } catch {
      path = raw;
    }
    pageCounts.set(path, (pageCounts.get(path) ?? 0) + 1);
  }
  const topPageEntry = [...pageCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topPage = topPageEntry ? { path: topPageEntry[0], count: topPageEntry[1] } : null;

  // ── Deals shipped this week (created_at within window) ──────────────────
  const { data: dealsThisWeek } = await supabaseAdmin
    .from("deals")
    .select("id")
    .gte("created_at", weekStart.toISOString())
    .lt("created_at", weekEnd.toISOString());

  // ── Bookings this week (from calendly_bookings) ─────────────────────────
  // Bookings table may not exist if Calendly Zapier hasn't been wired yet
  // (as of 2026-09-07 it's paused). Fail open (0 bookings) rather than
  // break the whole report.
  let bookingsCount = 0;
  try {
    const { data: bookings } = await supabaseAdmin
      .from("calendly_bookings")
      .select("id")
      .gte("created_at", weekStart.toISOString())
      .lt("created_at", weekEnd.toISOString());
    bookingsCount = bookings?.length ?? 0;
  } catch {
    // Table doesn't exist — leave at 0.
  }

  // ── Hot leads: top 3 by "warm signal" this week ─────────────────────────
  // Simple heuristic: leads with a magnet (price_unlock, market_report,
  // developer_survey) are hotter than plain contact-form leads because
  // they explicitly asked for something. Then by created_at desc.
  const HOT_MAGNETS = new Set([
    "price_unlock",
    "cairo_office_market_report_2026",
    "developer_survey",
  ]);
  type LeadRow = {
    name: string;
    email: string | null;
    phone: string | null;
    lead_source: string;
    utm_source: string | null;
    listing_id: number | null;
    created_at: string;
    magnet: string | null;
  };
  const hotLeads = (leadsThisWeek ?? [])
    .map((l) => l as unknown as LeadRow)
    .sort((a, b) => {
      const aHot = a.magnet && HOT_MAGNETS.has(a.magnet) ? 1 : 0;
      const bHot = b.magnet && HOT_MAGNETS.has(b.magnet) ? 1 : 0;
      if (aHot !== bHot) return bHot - aHot;
      return b.created_at.localeCompare(a.created_at);
    })
    .slice(0, 3)
    .map((l) => ({
      name: l.name,
      email: l.email,
      phone: l.phone,
      source: l.utm_source ?? l.lead_source,
      listing_id: l.listing_id,
      created_at: l.created_at,
    }));

  // GA4 traffic in parallel — fire-and-await but not blocking on failure.
  const ga4 = await fetchGa4WeeklyTraffic();

  return {
    leadsThisWeek: thisCount,
    leadsPrevWeek: prevCount,
    leadsDeltaPct: deltaPct,
    topSource,
    topPage,
    dealsThisWeek: dealsThisWeek?.length ?? 0,
    bookingsThisWeek: bookingsCount,
    hotLeads,
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: weekEnd.toISOString().split("T")[0],
    ga4,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

function renderReport(m: WeeklyMetrics): string {
  const deltaLine =
    m.leadsDeltaPct === null
      ? m.leadsThisWeek > 0
        ? `<span style="color:#059669; font-weight:600;">+${m.leadsThisWeek}</span> vs 0 previous week`
        : `<span style="color:#6b7280;">— no leads either week</span>`
      : m.leadsDeltaPct > 0
        ? `<span style="color:#059669; font-weight:600;">+${m.leadsDeltaPct}%</span> vs previous 7 days`
        : m.leadsDeltaPct < 0
          ? `<span style="color:#dc2626; font-weight:600;">${m.leadsDeltaPct}%</span> vs previous 7 days`
          : `<span style="color:#6b7280;">flat</span> vs previous 7 days`;

  const kpiCell = (label: string, value: string | number, extra?: string) => `
    <td valign="top" style="width:25%; padding:16px 12px; background:#F8F5F1; border-radius:12px; text-align:center; vertical-align:top;">
      <p style="margin:0 0 6px 0; font-size:10px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:1.5px;">${escapeHtml(label)}</p>
      <p style="margin:0; font-size:28px; font-weight:700; color:#171717; font-family:Georgia,serif; line-height:1;">${value}</p>
      ${extra ? `<p style="margin:6px 0 0 0; font-size:11px; color:#64748B;">${extra}</p>` : ""}
    </td>
  `;

  const hotLeadsRows = m.hotLeads.length
    ? m.hotLeads
        .map(
          (l) => `
        <tr>
          <td style="padding:12px 16px; border-bottom:1px solid #EAE4DA; font-size:14px; color:#171717;">
            <div style="font-weight:600;">${escapeHtml(l.name)}</div>
            <div style="font-size:12px; color:#64748B; margin-top:2px;">
              ${l.email ? `<a href="mailto:${escapeHtml(l.email)}" style="color:#64748B; text-decoration:none;">${escapeHtml(l.email)}</a>` : ""}
              ${l.email && l.phone ? " · " : ""}
              ${l.phone ? `<a href="tel:${escapeHtml(l.phone)}" style="color:#64748B; text-decoration:none;">${escapeHtml(l.phone)}</a>` : ""}
            </div>
          </td>
          <td style="padding:12px 16px; border-bottom:1px solid #EAE4DA; font-size:12px; color:#64748B; white-space:nowrap;">
            <span style="background:#E11D48; color:#ffffff; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">${escapeHtml(l.source)}</span>
            <div style="margin-top:4px; color:#94A3B8;">${fmtDate(l.created_at)}</div>
          </td>
        </tr>`,
        )
        .join("")
    : `<tr><td colspan="2" style="padding:24px 16px; text-align:center; font-size:13px; color:#94A3B8;">No hot leads this week.</td></tr>`;

  const body = `
    <p style="margin:0 0 8px 0; font-size:11px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:3px;">
      Weekly Report
    </p>
    <h1 style="margin:0 0 4px 0; font-size:24px; font-weight:700; color:#171717; line-height:1.2;">
      PLACES — ${fmtDate(m.weekStart)} to ${fmtDate(m.weekEnd)}
    </h1>
    <p style="margin:0 0 24px 0; font-size:14px; color:#64748B;">
      ${deltaLine}
    </p>

    <table role="presentation" cellpadding="0" cellspacing="6" width="100%" style="margin-bottom:24px;">
      <tr>
        ${kpiCell("Leads", m.leadsThisWeek, m.leadsPrevWeek > 0 ? `${m.leadsPrevWeek} prev week` : "—")}
        ${kpiCell("Deals shipped", m.dealsThisWeek, m.dealsThisWeek === 1 ? "1 published" : `${m.dealsThisWeek} published`)}
        ${kpiCell("Bookings", m.bookingsThisWeek, "via Calendly")}
        ${kpiCell("Hot leads", m.hotLeads.length, "high-intent this week")}
      </tr>
    </table>

    ${m.ga4
      ? `<table role="presentation" cellpadding="0" cellspacing="6" width="100%" style="margin-bottom:24px;">
          <tr>
            ${kpiCell(
              "Sessions",
              m.ga4.sessions.toLocaleString(),
              m.ga4.sessionsDeltaPct === null
                ? m.ga4.sessions > 0
                  ? `+${m.ga4.sessions} vs 0`
                  : "—"
                : m.ga4.sessionsDeltaPct > 0
                  ? `<span style="color:#059669;">+${m.ga4.sessionsDeltaPct}%</span> vs prev`
                  : m.ga4.sessionsDeltaPct < 0
                    ? `<span style="color:#dc2626;">${m.ga4.sessionsDeltaPct}%</span> vs prev`
                    : "flat",
            )}
            ${kpiCell("Users", m.ga4.users.toLocaleString(), "unique visitors")}
            ${kpiCell(
              "Key events",
              m.ga4.keyEvents.toLocaleString(),
              m.ga4.conversionRatePct === null
                ? "conversion tracking"
                : `${m.ga4.conversionRatePct}% conv rate`,
            )}
            ${kpiCell(
              "Top channel",
              `<span style="font-size:16px;">${m.ga4.topChannel ? escapeHtml(m.ga4.topChannel.name) : "—"}</span>`,
              m.ga4.topChannel ? `${m.ga4.topChannel.sessions.toLocaleString()} sessions` : "",
            )}
          </tr>
        </table>

        ${m.ga4.topLandingPage
          ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
              <tr>
                <td valign="top" style="padding:16px; background:#F8F5F1; border-radius:12px; vertical-align:top;">
                  <p style="margin:0 0 6px 0; font-size:10px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">Top landing page (traffic)</p>
                  <p style="margin:0; font-size:14px; font-weight:600; color:#171717; font-family:monospace; word-break:break-all;">${escapeHtml(m.ga4.topLandingPage.path)}</p>
                  <p style="margin:4px 0 0 0; font-size:12px; color:#64748B;">${m.ga4.topLandingPage.sessions.toLocaleString()} session${m.ga4.topLandingPage.sessions === 1 ? "" : "s"} · from GA4</p>
                </td>
              </tr>
            </table>`
          : ""}`
      : `<div style="margin-bottom:24px; padding:12px 16px; background:#F8F5F1; border-radius:8px; font-size:12px; color:#64748B;">
          GA4 traffic data unavailable this week. Check GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_JSON env vars in Railway.
        </div>`}

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td valign="top" style="padding:16px; background:#F8F5F1; border-radius:12px; vertical-align:top;">
          <p style="margin:0 0 6px 0; font-size:10px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">Top source</p>
          <p style="margin:0; font-size:16px; font-weight:600; color:#171717;">${m.topSource ? escapeHtml(m.topSource.name) : "—"}</p>
          ${m.topSource ? `<p style="margin:4px 0 0 0; font-size:12px; color:#64748B;">${m.topSource.count} lead${m.topSource.count === 1 ? "" : "s"}</p>` : ""}
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td valign="top" style="padding:16px; background:#F8F5F1; border-radius:12px; vertical-align:top;">
          <p style="margin:0 0 6px 0; font-size:10px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">Top converting page</p>
          <p style="margin:0; font-size:14px; font-weight:600; color:#171717; font-family:monospace; word-break:break-all;">${m.topPage ? escapeHtml(m.topPage.path) : "—"}</p>
          ${m.topPage ? `<p style="margin:4px 0 0 0; font-size:12px; color:#64748B;">${m.topPage.count} lead${m.topPage.count === 1 ? "" : "s"} originated here</p>` : ""}
        </td>
      </tr>
    </table>

    <h2 style="margin:32px 0 12px 0; font-size:16px; font-weight:700; color:#171717;">Hot leads to reach out to</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff; border:1px solid #EAE4DA; border-radius:12px; overflow:hidden;">
      ${hotLeadsRows}
    </table>

    <div style="margin:32px 0 8px 0; padding:16px 20px; background:#171717; border-radius:12px; text-align:center;">
      <a href="https://places-egy.com/dashboard" style="display:inline-block; color:#ffffff; text-decoration:none; font-weight:600; font-size:14px;">
        Open the leads dashboard →
      </a>
    </div>

    <p style="margin:24px 0 0 0; font-size:12px; color:#94A3B8; text-align:center;">
      Auto-generated every Monday. Reply to this email to hand off feedback on what to add.
    </p>
  `;

  // Minimal wrapper — no need for the marketing brandedShell here since
  // this is an internal report, not a customer-facing email. Just a clean
  // Gmail-safe container.
  return `<!doctype html>
    <html><body style="margin:0; padding:0; background:#F8F5F1; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F8F5F1;">
      <tr><td align="center" style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; background:#ffffff; border-radius:16px; padding:32px;">
          <tr><td>${body}</td></tr>
        </table>
      </td></tr>
    </table>
    </body></html>`;
}

// The exported cron handler. Called by the same cron-job.org config that
// runs the other weekly jobs. Auth via x-cron-token header, same shared
// secret pattern as regenerate-report + send-favorites-digests.
export async function weeklyReportHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const cronToken = process.env.CRON_TOKEN;
  if (!cronToken) {
    res.status(503).json({ message: "CRON_TOKEN not configured" });
    return;
  }
  const provided = req.header("x-cron-token");
  if (!provided || provided !== cronToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const metrics = await fetchMetrics();
    const html = renderReport(metrics);
    // Subject line includes sessions when GA4 data is available so admin
    // can scan the inbox and know the traffic pulse at a glance.
    const sessionsBit = metrics.ga4
      ? `, ${metrics.ga4.sessions.toLocaleString()} sessions`
      : "";
    await sendMail({
      to: "admin@places-egy.com",
      subject: `PLACES weekly — ${metrics.leadsThisWeek} leads, ${metrics.dealsThisWeek} deals${sessionsBit}`,
      html,
    });
    console.log(
      `[weekly-report] sent for ${metrics.weekStart} to ${metrics.weekEnd}:`,
      metrics.leadsThisWeek,
      "leads,",
      metrics.dealsThisWeek,
      "deals",
    );
    res.json({ ok: true, ...metrics });
  } catch (err) {
    console.error("[weekly-report] failed:", err);
    res.status(500).json({ message: (err as Error).message });
  }
}
