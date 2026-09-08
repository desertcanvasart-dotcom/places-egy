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
//   - Contacted leads this week (leads with status='contacted' in the
//     admin dashboard, created this week) — the sales-progress signal
//   - 3 hottest leads (highest-priority sources, last 7 days) with names

interface WeeklyMetrics {
  leadsThisWeek: number;
  leadsPrevWeek: number;
  leadsDeltaPct: number | null; // null if prev = 0 (can't divide)
  topSource: { name: string; count: number } | null;
  topPage: { path: string; count: number } | null;
  contactedThisWeek: number;
  hotLeads: Array<{
    name: string;
    email: string | null;
    phone: string | null;
    source: string;
    listing_id: number | null;
    created_at: string;
  }>;
  // Top 5 lead sources with counts — powers the "Leads by source" bar chart
  // in the email. Same source labeling as the topSource single-value field.
  leadsBySource: Array<{ name: string; value: number }>;
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
  const sortedSources = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]);
  const topSourceEntry = sortedSources[0];
  const topSource = topSourceEntry ? { name: topSourceEntry[0], count: topSourceEntry[1] } : null;
  const leadsBySource = sortedSources.slice(0, 5).map(([name, value]) => ({ name, value }));

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

  // ── Contacted leads this week (status='contacted' in admin dashboard) ───
  // Counts leads that were CREATED this week AND have been marked as
  // "contacted" (or beyond) in the admin dashboard — a follow-up signal
  // showing how many of this week's leads have actually been actioned.
  const { data: contactedThisWeek } = await supabaseAdmin
    .from("leads")
    .select("id")
    .in("status", ["contacted", "qualified", "won"])
    .gte("created_at", weekStart.toISOString())
    .lt("created_at", weekEnd.toISOString());

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
    contactedThisWeek: contactedThisWeek?.length ?? 0,
    hotLeads,
    leadsBySource,
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

// Charts are rendered as HTML tables + colored <div>s, NOT inline SVG.
// Gmail (both web + mobile) strips <svg> from email bodies, which was
// leaving the report with labeled-but-empty chart cards. HTML tables +
// background-color divs render identically in Gmail, Apple Mail, and
// Outlook web with zero external image requests.

// Vertical bar chart for the daily-sessions series. Each day is a table
// column; the bar is a background-colored <div> whose height is set as
// an inline percentage of the tallest day. The value sits above each bar.
function renderSessionsLineChart(
  daily: Array<{ date: string; sessions: number }>,
): string {
  if (daily.length === 0) return "";
  const max = Math.max(...daily.map((d) => d.sessions), 1);
  const CHART_H = 100;
  const cells = daily
    .map((d) => {
      const dayLabel = new Date(d.date).toLocaleDateString("en-US", { weekday: "short" });
      const heightPx = Math.max(Math.round((d.sessions / max) * CHART_H), d.sessions > 0 ? 4 : 0);
      const valueLabel = d.sessions > 0
        ? `<div style="font-size:11px; font-weight:700; color:#171717; margin-bottom:4px; line-height:1;">${d.sessions}</div>`
        : `<div style="font-size:11px; color:#CBD5E1; margin-bottom:4px; line-height:1;">0</div>`;
      return `
        <td valign="bottom" align="center" style="padding:0 4px; vertical-align:bottom;">
          <div style="height:${CHART_H}px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center;">
            ${valueLabel}
            <div style="width:100%; max-width:48px; height:${heightPx}px; background:#E11D48; border-radius:4px 4px 0 0;"></div>
          </div>
          <div style="font-size:10px; color:#94A3B8; margin-top:6px; text-transform:uppercase; letter-spacing:0.5px;">${dayLabel}</div>
        </td>
      `;
    })
    .join("");
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;">
      <tr>${cells}</tr>
    </table>
  `;
}

// Horizontal bar chart — one row per series. Rendered as a 3-column
// table: [label] [bar] [value]. The bar itself is a colored <div>
// inside a light-gray track <div>, width set as inline percentage.
function renderHorizontalBars(
  data: Array<{ name: string; value: number }>,
  opts: { color?: string } = {},
): string {
  if (data.length === 0) return "";
  const color = opts.color ?? "#E11D48";
  const max = Math.max(...data.map((d) => d.value), 1);
  const rows = data
    .map((d) => {
      const widthPct = Math.max((d.value / max) * 100, d.value > 0 ? 2 : 0);
      return `
        <tr>
          <td style="padding:6px 12px 6px 0; font-size:12px; color:#475569; white-space:nowrap; vertical-align:middle; width:130px;">
            ${escapeHtml(d.name)}
          </td>
          <td style="padding:6px 0; vertical-align:middle;">
            <div style="background:#F1F5F9; border-radius:4px; height:14px; overflow:hidden;">
              <div style="background:${color}; width:${widthPct}%; height:14px; border-radius:4px;"></div>
            </div>
          </td>
          <td style="padding:6px 0 6px 8px; font-size:12px; font-weight:700; color:#171717; text-align:right; white-space:nowrap; vertical-align:middle; width:60px;">
            ${d.value.toLocaleString()}
          </td>
        </tr>
      `;
    })
    .join("");
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${rows}
    </table>
  `;
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
        ${kpiCell(
          "Contacted",
          m.contactedThisWeek,
          m.leadsThisWeek > 0
            ? `${Math.round((m.contactedThisWeek / m.leadsThisWeek) * 100)}% of leads`
            : "—",
        )}
        ${kpiCell("Hot leads", m.hotLeads.length, "high-intent this week")}
      </tr>
    </table>

    ${m.ga4
      ? `<table role="presentation" cellpadding="0" cellspacing="6" width="100%" style="margin-bottom:12px;">
          <tr>
            ${kpiCell("Active users", m.ga4.activeUsers.toLocaleString(), "last 7 days")}
            ${kpiCell("New users", m.ga4.newUsers.toLocaleString(), "first-time visitors")}
            ${kpiCell(
              "Avg engagement",
              (() => {
                const s = m.ga4.avgEngagementTimeSec;
                const mins = Math.floor(s / 60);
                const secs = s % 60;
                return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
              })(),
              "per active user",
            )}
            ${kpiCell("Event count", m.ga4.eventCount.toLocaleString(), "total events")}
          </tr>
        </table>
        <table role="presentation" cellpadding="0" cellspacing="6" width="100%" style="margin-bottom:24px;">
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
          </tr>
        </table>

        <!-- Daily sessions sparkline — inline SVG, works in every email client -->
        <div style="margin-bottom:24px; padding:16px; background:#ffffff; border:1px solid #EAE4DA; border-radius:12px;">
          <p style="margin:0 0 8px 0; font-size:10px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
            Sessions · last 7 days
          </p>
          ${renderSessionsLineChart(m.ga4.dailySessions)}
        </div>

<!-- Audience: new vs returning + device split, side-by-side -->
        ${m.ga4.newUsers + m.ga4.returningUsers > 0 || m.ga4.deviceBreakdown.length > 0
          ? `<table role="presentation" cellpadding="0" cellspacing="6" width="100%" style="margin-bottom:24px;">
              <tr>
                ${m.ga4.newUsers + m.ga4.returningUsers > 0
                  ? `<td valign="top" style="width:50%; padding:16px; background:#ffffff; border:1px solid #EAE4DA; border-radius:12px; vertical-align:top;">
                      <p style="margin:0 0 8px 0; font-size:10px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
                        New vs returning
                      </p>
                      ${renderHorizontalBars(
                        [
                          { name: "New", value: m.ga4.newUsers },
                          { name: "Returning", value: m.ga4.returningUsers },
                        ],
                        { color: "#171717" },
                      )}
                      <p style="margin:8px 0 0 0; font-size:11px; color:#64748B;">
                        ${(() => {
                          const total = m.ga4.newUsers + m.ga4.returningUsers;
                          const newPct = total === 0 ? 0 : Math.round((m.ga4.newUsers / total) * 100);
                          return `${newPct}% new visitors · ${100 - newPct}% returning`;
                        })()}
                      </p>
                    </td>`
                  : ""}
                ${m.ga4.deviceBreakdown.length > 0
                  ? `<td valign="top" style="width:50%; padding:16px; background:#ffffff; border:1px solid #EAE4DA; border-radius:12px; vertical-align:top;">
                      <p style="margin:0 0 8px 0; font-size:10px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
                        Device split
                      </p>
                      ${renderHorizontalBars(
                        m.ga4.deviceBreakdown.map((d) => ({ name: d.name, value: d.sessions })),
                        { color: "#E11D48" },
                      )}
                    </td>`
                  : ""}
              </tr>
            </table>`
          : ""}

        <!-- Key events breakdown: what specifically fired + how many times -->
        ${m.ga4.keyEventBreakdown.length > 0
          ? `<div style="margin-bottom:24px; padding:16px; background:#ffffff; border:1px solid #EAE4DA; border-radius:12px;">
              <p style="margin:0 0 8px 0; font-size:10px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
                Key events by name
              </p>
              ${renderHorizontalBars(
                m.ga4.keyEventBreakdown.map((e) => ({ name: e.name, value: e.count })),
                { color: "#171717" },
              )}
            </div>`
          : ""}

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

    ${m.leadsBySource.length > 0
      ? `<div style="margin-bottom:24px; padding:16px; background:#ffffff; border:1px solid #EAE4DA; border-radius:12px;">
          <p style="margin:0 0 8px 0; font-size:10px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
            Leads by source
          </p>
          ${renderHorizontalBars(m.leadsBySource, { color: "#171717" })}
        </div>`
      : ""}

    <table role="presentation" cellpadding="0" cellspacing="6" width="100%" style="margin-bottom:24px;">
      <tr>
        <td valign="top" style="width:50%; padding:16px; background:#F8F5F1; border-radius:12px; vertical-align:top;">
          <p style="margin:0 0 6px 0; font-size:10px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">Top source</p>
          <p style="margin:0; font-size:16px; font-weight:600; color:#171717;">${m.topSource ? escapeHtml(m.topSource.name) : "—"}</p>
          ${m.topSource ? `<p style="margin:4px 0 0 0; font-size:12px; color:#64748B;">${m.topSource.count} lead${m.topSource.count === 1 ? "" : "s"}</p>` : ""}
        </td>
        <td valign="top" style="width:50%; padding:16px; background:#F8F5F1; border-radius:12px; vertical-align:top;">
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
    // Subject line: framed as a weekly summary, leads first, then the two
    // most-useful traffic numbers from GA4 (sessions + key events). If GA4
    // isn't back yet we just ship the leads number.
    // Example: "PLACES weekly summary · 11 leads · 1,240 sessions · 34 events"
    const parts: string[] = [
      `${metrics.leadsThisWeek} lead${metrics.leadsThisWeek === 1 ? "" : "s"}`,
    ];
    if (metrics.ga4) {
      parts.push(`${metrics.ga4.sessions.toLocaleString()} sessions`);
      parts.push(
        `${metrics.ga4.keyEvents.toLocaleString()} event${metrics.ga4.keyEvents === 1 ? "" : "s"}`,
      );
    }
    // Recipients: admin inbox + Mohamed Safwat. Both receive the same
    // report; sent as separate emails so mailer errors on one don't
    // block the other.
    const recipients = ["admin@places-egy.com", "mohamed.safwat@places-egy.com"];
    await Promise.all(
      recipients.map((to) =>
        sendMail({
          to,
          subject: `PLACES weekly summary · ${parts.join(" · ")}`,
          html,
        }),
      ),
    );
    console.log(
      `[weekly-report] sent for ${metrics.weekStart} to ${metrics.weekEnd}:`,
      metrics.leadsThisWeek,
      "leads,",
      metrics.contactedThisWeek,
      "contacted",
    );
    res.json({ ok: true, ...metrics });
  } catch (err) {
    console.error("[weekly-report] failed:", err);
    res.status(500).json({ message: (err as Error).message });
  }
}
