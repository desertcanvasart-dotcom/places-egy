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

// ── Lead-magnet auto-reply ──────────────────────────────────────────────────
// Sent to the LEAD (the person who filled the form), not to admin. Delivers
// the market report PDF link + a "Book A Meeting" CTA. Fire-and-forget from
// the /api/leads route right after the admin notification.
//
// firstNameOf("John Doe")  = "John"
// firstNameOf("john")       = "John"
function firstNameOf(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export async function sendMarketReportReply(opts: {
  toEmail: string;
  toName: string;
}): Promise<void> {
  const first = firstNameOf(opts.toName);
  const downloadBlock = MARKET_REPORT_URL
    ? `
        <p style="margin:0 0 12px 0; font-size:15px; line-height:1.5;">
          Your free copy of the <strong>Cairo Office Market Report 2026</strong>
          is ready to download:
        </p>
        <p style="margin:0 0 28px 0;">
          <a href="${MARKET_REPORT_URL}"
             style="display:inline-block; background:#e11d48; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px;">
            Download the PDF →
          </a>
        </p>`
    : `
        <p style="margin:0 0 20px 0; font-size:15px; line-height:1.5;">
          Thanks for requesting the <strong>Cairo Office Market Report 2026</strong>.
          We're putting the final polish on the 2026 edition — a PLACES advisor
          will personally send you the report within the next 24 hours, plus
          answer any questions you have about the market.
        </p>`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <p style="margin:0 0 24px 0; font-size:15px;">Hi ${escapeHtml(first)},</p>

      ${downloadBlock}

      <div style="margin: 32px 0; padding: 20px 24px; background:#f8fafc; border-left: 3px solid #e11d48; border-radius: 6px;">
        <p style="margin:0 0 12px 0; font-size:14px; font-weight:600; color:#0f172a;">
          Prefer to talk it through?
        </p>
        <p style="margin:0 0 14px 0; font-size:14px; line-height:1.5; color:#475569;">
          Book a free 15-minute call with a PLACES advisor — we'll walk you
          through what's happening in the districts you're interested in.
        </p>
        <p style="margin:0;">
          <a href="${CALENDLY_URL}"
             style="display:inline-block; background:#0f172a; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
            Book a Meeting →
          </a>
        </p>
      </div>

      <p style="margin:24px 0 8px 0; font-size:14px; line-height:1.6; color:#334155;">
        If any of this raises questions, just reply to this email — it goes
        straight to our advisory team.
      </p>
      <p style="margin:16px 0 0 0; font-size:14px; color:#334155;">
        — The PLACES Team
      </p>

      <hr style="border:0; border-top:1px solid #e5e7eb; margin: 32px 0 16px 0;">
      <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5;">
        PLACES · Egypt's specialized partner for administrative office real estate<br>
        <a href="https://places-egy.com" style="color:#94a3b8;">places-egy.com</a>
        · <a href="mailto:admin@places-egy.com" style="color:#94a3b8;">admin@places-egy.com</a>
      </p>
    </div>
  `;

  return sendMail({
    to: opts.toEmail,
    subject: "Your Cairo Office Market Report 2026 — from PLACES",
    html,
    replyTo: "admin@places-egy.com",
  });
}
