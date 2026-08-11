import nodemailer, { type Transporter } from "nodemailer";

// SMTP mailer for outbound notifications. Wired to Hostinger since that's
// where admin@places-egy.com lives (per DNS: mx1.hostinger.com). Credentials
// come from env — never hard-coded.
//
// If EMAIL_SMTP_PASSWORD is missing (dev or misconfigured prod), sendMail()
// no-ops with a warning instead of crashing the request. Lead saves still
// succeed; only the notification is skipped.

const SMTP_HOST = process.env.EMAIL_SMTP_HOST ?? "smtp.hostinger.com";
const SMTP_PORT = Number(process.env.EMAIL_SMTP_PORT ?? 465);
const SMTP_USER = process.env.EMAIL_SMTP_USER ?? "admin@places-egy.com";
const SMTP_PASSWORD = process.env.EMAIL_SMTP_PASSWORD;
const FROM = process.env.EMAIL_FROM ?? `"PLACES Website" <${SMTP_USER}>`;

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!SMTP_PASSWORD) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // TLS on 465, STARTTLS on 587
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return transporter;
}

export type MailOptions = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendMail(opts: MailOptions): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.warn(
      "[mailer] EMAIL_SMTP_PASSWORD not set — skipping send. Subject:",
      opts.subject,
    );
    return;
  }
  try {
    const info = await t.sendMail({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    console.log(`[mailer] sent "${opts.subject}" → ${opts.to} (${info.messageId})`);
  } catch (err) {
    // Don't rethrow — we never want a mail hiccup to fail the user's API
    // call. Log so it shows up in Railway.
    console.error("[mailer] send failed:", err);
  }
}

// Simple HTML escape for values that arrive from users (name, message, etc.)
// before dropping them into an email template.
export function escapeHtml(s: string | null | undefined): string {
  if (!s) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
