import { Resend } from "resend";

// Outbound email via Resend HTTP API. We moved off nodemailer + Hostinger SMTP
// because Railway's egress blocks outbound port 465/587 and doesn't have IPv6
// routes to Hostinger's SMTP — every send was timing out. Resend uses HTTPS
// (443) which is always open, and the emails still come FROM
// admin@places-egy.com since we verified the domain in Resend
// (DKIM/SPF/MX records live in Cloudflare — see resend._domainkey, send.).
//
// If RESEND_API_KEY is missing (dev or misconfigured prod), sendMail() logs a
// warning and no-ops — API calls still return 200 to the client.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "PLACES <admin@places-egy.com>";

// PLACES advisory Calendly link (same as openCalendly() in the client).
// Overridable via env in case the URL ever changes without a deploy.
const CALENDLY_URL =
  process.env.CALENDLY_URL ?? "https://calendly.com/places-egy/consultation";

// Public URL of the market report PDF. Placeholder until PLACES finalizes the
// actual PDF and uploads it to Supabase Storage or elsewhere. When set, the
// auto-reply includes a real download button; when unset (or set to the
// placeholder), the auto-reply politely says an advisor will send within 24h.
const MARKET_REPORT_URL = process.env.MARKET_REPORT_URL ?? null;

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (client) return client;
  client = new Resend(RESEND_API_KEY);
  return client;
}

export type MailOptions = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendMail(opts: MailOptions): Promise<void> {
  const c = getClient();
  if (!c) {
    console.warn(
      "[mailer] RESEND_API_KEY not set — skipping send. Subject:",
      opts.subject,
    );
    return;
  }
  try {
    const { data, error } = await c.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    if (error) {
      console.error("[mailer] Resend returned error:", error);
      return;
    }
    console.log(`[mailer] sent "${opts.subject}" → ${opts.to} (${data?.id})`);
  } catch (err) {
    // Never rethrow — the caller's API request already succeeded on the DB
    // side; a mailer hiccup shouldn't 500 to the visitor.
    console.error("[mailer] send failed:", err);
  }
}

export function escapeHtml(s: string | null | undefined): string {
  if (!s) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function firstNameOf(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

// ── Shared branded email shell ──────────────────────────────────────────────
// All PLACES emails share this frame: black header with PLACES wordmark,
// white body, muted footer. Body is a raw HTML string the caller composes.
// Kept small and inline-styled because email clients strip <style> tags.
function brandedShell(opts: { preheader: string; body: string }): string {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0; padding:0; background:#F5F1EA; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <!-- Preheader: shown in inbox previews but hidden in the email body -->
    <div style="display:none; max-height:0; overflow:hidden; color:transparent;">
      ${escapeHtml(opts.preheader)}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F5F1EA;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 16px rgba(15,23,42,0.06);">
            <tr>
              <td style="background:#171717; padding:24px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <span style="color:#E11D48; font-size:12px; font-weight:700; letter-spacing:3px;">PLACES</span>
                    </td>
                    <td align="right">
                      <span style="color:rgba(255,255,255,0.5); font-size:11px;">Cairo · Egypt</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${opts.body}
              </td>
            </tr>
            <tr>
              <td style="background:#F8F5F1; padding:20px 32px; border-top:1px solid #EAE4DA;">
                <p style="margin:0 0 4px 0; font-size:12px; color:#64748B; line-height:1.5;">
                  PLACES · Egypt's specialized partner for administrative office real estate
                </p>
                <p style="margin:0; font-size:12px; color:#94A3B8;">
                  <a href="https://places-egy.com" style="color:#94A3B8; text-decoration:none;">places-egy.com</a>
                  · <a href="mailto:admin@places-egy.com" style="color:#94A3B8; text-decoration:none;">admin@places-egy.com</a>
                  · <a href="tel:+201063618217" style="color:#94A3B8; text-decoration:none;">+20 106 361 8217</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ── Admin: new lead notification ────────────────────────────────────────────
// Clean scannable summary the PLACES team can act on in 5 seconds.
export type AdminLeadEmailOptions = {
  name: string;
  email: string;
  phone: string | null | undefined;
  message?: string | null;
  lead_source: string;
  magnet?: string | null;
  listing_id?: number | null;
  page_url?: string | null;
  locations?: string[] | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
};

function renderAdminLeadHtml(lead: AdminLeadEmailOptions): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0; width:120px; vertical-align:top;">
        <span style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:1px;">${escapeHtml(label)}</span>
      </td>
      <td style="padding:8px 0; vertical-align:top; font-size:14px; color:#171717;">
        ${value}
      </td>
    </tr>
  `;

  const locationsRow = lead.locations && lead.locations.length > 0
    ? row("Interested in", escapeHtml(lead.locations.join(", ")))
    : "";
  const magnetRow = lead.magnet
    ? row("Lead magnet", escapeHtml(lead.magnet))
    : "";
  const listingRow = lead.listing_id
    ? row("Listing #", String(lead.listing_id))
    : "";
  const utmParts = [
    lead.utm_source && `source: ${lead.utm_source}`,
    lead.utm_medium && `medium: ${lead.utm_medium}`,
    lead.utm_campaign && `campaign: ${lead.utm_campaign}`,
  ].filter(Boolean);
  const utmRow = utmParts.length > 0
    ? row("Campaign", escapeHtml(utmParts.join(" · ")))
    : "";
  const pageRow = lead.page_url ? row("From page", escapeHtml(lead.page_url)) : "";

  const messageBlock = lead.message
    ? `
      <div style="margin-top:24px; padding:16px 20px; background:#F8F5F1; border-left:3px solid #E11D48; border-radius:8px;">
        <p style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:1px;">
          What they said
        </p>
        <p style="margin:0; font-size:14px; line-height:1.6; color:#171717; white-space:pre-wrap;">${escapeHtml(lead.message)}</p>
      </div>`
    : "";

  return `
    <p style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
      NEW LEAD
    </p>
    <h1 style="margin:0 0 8px 0; font-size:24px; color:#171717; font-weight:700; line-height:1.2;">
      ${escapeHtml(lead.name)}
    </h1>
    <p style="margin:0 0 24px 0; font-size:13px; color:#64748B;">
      Source: ${escapeHtml(lead.lead_source)}
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
      ${row("Email", `<a href="mailto:${escapeHtml(lead.email)}" style="color:#E11D48; text-decoration:none;">${escapeHtml(lead.email)}</a>`)}
      ${lead.phone ? row("Phone", `<a href="tel:${escapeHtml(lead.phone)}" style="color:#E11D48; text-decoration:none;">${escapeHtml(lead.phone)}</a>`) : ""}
      ${locationsRow}
      ${magnetRow}
      ${listingRow}
      ${utmRow}
      ${pageRow}
    </table>

    ${messageBlock}

    <div style="margin-top:32px; padding-top:20px; border-top:1px solid #EAE4DA;">
      <a href="https://places-egy.com/dashboard"
         style="display:inline-block; background:#171717; color:#ffffff; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:600; font-size:14px;">
        View in dashboard →
      </a>
    </div>
  `;
}

export async function sendAdminLeadNotification(
  lead: AdminLeadEmailOptions,
): Promise<void> {
  const body = renderAdminLeadHtml(lead);
  const html = brandedShell({
    preheader: `${lead.name} · ${lead.email}${lead.phone ? " · " + lead.phone : ""}`,
    body,
  });
  return sendMail({
    to: "admin@places-egy.com",
    subject: `New lead: ${lead.name}${lead.magnet ? ` (${lead.magnet})` : ""}`,
    html,
    replyTo: lead.email,
  });
}

// ── User: market report auto-reply with PDF ─────────────────────────────────
// Structure (top → bottom):
//   1. Greeting
//   2. Hero download card — big prominent CTA above the fold
//   3. "What's inside" — 4 concrete bullets so they know why to open it
//   4. Divider
//   5. Talk to Us CTA (secondary, softer)
//   6. Sign-off
function bulletRow(icon: string, title: string, desc: string): string {
  return `
    <tr>
      <td valign="top" style="padding:10px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td valign="top" style="width:36px; padding-right:12px;">
              <div style="width:32px; height:32px; background:#FEE2E7; border-radius:999px; text-align:center; line-height:32px; font-size:16px;">
                ${icon}
              </div>
            </td>
            <td valign="top">
              <p style="margin:0 0 3px 0; font-size:14px; font-weight:700; color:#171717;">
                ${title}
              </p>
              <p style="margin:0; font-size:13px; line-height:1.5; color:#64748B;">
                ${desc}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

export async function sendMarketReportReply(opts: {
  toEmail: string;
  toName: string;
}): Promise<void> {
  const first = firstNameOf(opts.toName);
  const monthYear = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const downloadHero = MARKET_REPORT_URL
    ? `
      <div style="margin:0 0 28px 0; padding:28px 24px; background:linear-gradient(135deg,#171717 0%,#2A2A2A 100%); border-radius:14px; text-align:center;">
        <p style="margin:0 0 10px 0; font-size:11px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:3px;">
          📄 Your report is ready
        </p>
        <h2 style="margin:0 0 6px 0; font-size:22px; font-weight:700; color:#ffffff; line-height:1.3;">
          Cairo Office Market Report 2026
        </h2>
        <p style="margin:0 0 22px 0; font-size:13px; color:rgba(255,255,255,0.6);">
          Free · PDF · Updated ${monthYear}
        </p>
        <a href="${MARKET_REPORT_URL}"
           style="display:inline-block; background:#E11D48; color:#ffffff; padding:14px 32px; border-radius:999px; text-decoration:none; font-weight:700; font-size:15px; box-shadow:0 4px 12px rgba(225,29,72,0.4);">
          Download the PDF →
        </a>
      </div>`
    : `
      <div style="margin:0 0 28px 0; padding:24px; background:#F8F5F1; border-radius:12px;">
        <p style="margin:0 0 8px 0; font-size:11px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
          Coming to your inbox soon
        </p>
        <p style="margin:0; font-size:15px; line-height:1.6; color:#171717;">
          Thanks for requesting the <strong>Cairo Office Market Report 2026</strong>.
          A PLACES advisor will personally send you the report within the next
          24 hours.
        </p>
      </div>`;

  const body = `
    <p style="margin:0 0 20px 0; font-size:16px; color:#171717;">Hi ${escapeHtml(first)}, 👋</p>

    <p style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#171717;">
      Thanks for downloading the <strong>Cairo Office Market Report 2026</strong>.
      Here's your copy — plus a preview of what you'll find inside.
    </p>

    ${downloadHero}

    <p style="margin:0 0 12px 0; font-size:12px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:2px;">
      What's inside
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      ${bulletRow(
        "📊",
        "Pricing benchmarks by district",
        "Live buy and lease rates per square metre across New Cairo, Sheikh Zayed, 6th October, Downtown, Sheraton, and Maadi.",
      )}
      ${bulletRow(
        "🏢",
        "Supply pipeline",
        "Which developments are delivering in 2026–2027 and how that shifts availability in your target area.",
      )}
      ${bulletRow(
        "📈",
        "Where the smart money is going",
        "Yield analysis, absorption rates, and the shortlist of districts our advisors are watching this year.",
      )}
      ${bulletRow(
        "🏗️",
        "Top developers by activity",
        "The developers most represented in Cairo's active office pipeline — a proxy for where the deals are actually happening.",
      )}
    </table>

    <hr style="border:0; border-top:1px solid #EAE4DA; margin:32px 0 24px 0;">

    <div style="margin:0 0 8px 0; padding:24px; background:#F8F5F1; border-radius:12px;">
      <p style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
        Want a personalised read?
      </p>
      <p style="margin:0 0 14px 0; font-size:14px; line-height:1.5; color:#171717;">
        Book a free 15-minute call and a PLACES advisor will walk you through
        the districts and price bands you care about most — no pressure, no
        pitch.
      </p>
      <a href="${CALENDLY_URL}"
         style="display:inline-block; background:#171717; color:#ffffff; padding:11px 22px; border-radius:999px; text-decoration:none; font-weight:600; font-size:14px;">
        Talk to Us →
      </a>
    </div>

    <p style="margin:24px 0 8px 0; font-size:14px; line-height:1.6; color:#64748B;">
      Questions? Just reply to this email — it goes straight to our advisory team.
    </p>
    <p style="margin:16px 0 0 0; font-size:14px; color:#171717;">
      — The PLACES Team
    </p>
  `;

  const html = brandedShell({
    preheader: `Your Cairo Office Market Report 2026 is inside — pricing, supply, and yields across every district.`,
    body,
  });

  return sendMail({
    to: opts.toEmail,
    subject: "Your Cairo Office Market Report 2026 — from PLACES",
    html,
    replyTo: "admin@places-egy.com",
  });
}
