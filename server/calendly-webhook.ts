import type { Request, Response } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "./supabase";
import { sendMail } from "./mailer";

// Calendly webhooks: invitee.created (booking confirmed) and invitee.canceled
// (booking canceled). Signed by Calendly with an HMAC-SHA256 over the raw
// body using a shared signing key from Calendly's webhook subscription config.
//
// Setup in Calendly (account owner: info@places-egy.com):
//   1. Calendly → Integrations → Webhooks → Create webhook subscription
//   2. URL: https://places-egy.com/api/webhooks/calendly
//   3. Events: invitee.created, invitee.canceled
//   4. Scope: user (or organization if PLACES has multi-user)
//   5. Copy the signing key into Railway env: CALENDLY_WEBHOOK_SIGNING_KEY

const SIGNING_KEY = process.env.CALENDLY_WEBHOOK_SIGNING_KEY ?? "";

// Verify Calendly's HMAC. Header format:
//   Calendly-Webhook-Signature: t=<unix_ts>,v1=<hex_signature>
// The signature payload is `${t}.${rawBody}`.
export function verifyCalendlySignature(
  rawBody: string,
  headerValue: string,
): boolean {
  if (!SIGNING_KEY) {
    // In dev with no key configured, accept everything so we can iterate.
    // In prod without a key we log a warning and REJECT (safer than accepting).
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[calendly-webhook] CALENDLY_WEBHOOK_SIGNING_KEY not set — rejecting.",
      );
      return false;
    }
    return true;
  }
  const parts = headerValue.split(",").reduce<Record<string, string>>((acc, kv) => {
    const [k, v] = kv.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  const expected = createHmac("sha256", SIGNING_KEY)
    .update(`${t}.${rawBody}`)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
  } catch {
    return false;
  }
}

// Extract UTM params from Calendly tracking payload. Calendly passes through
// URL query params from the scheduling link's landing (utm_source, utm_medium,
// utm_campaign, utm_content, utm_term) inside `payload.tracking`.
type CalendlyTracking = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  salesforce_uuid?: string | null;
};

type CalendlyInviteePayload = {
  event: string; // "invitee.created" | "invitee.canceled"
  created_at: string;
  payload: {
    uri?: string;
    name?: string;
    email?: string;
    text_reminder_number?: string;
    scheduled_event?: {
      uri?: string;
      name?: string;
      start_time?: string;
      end_time?: string;
      event_type?: string;
      location?: { location?: string } | null;
    };
    tracking?: CalendlyTracking;
    questions_and_answers?: Array<{ question: string; answer: string; position: number }>;
    cancellation?: { canceled_by?: string; reason?: string } | null;
    status?: string; // "active" | "canceled"
  };
};

export async function handleCalendlyWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  const raw = (req as Request & { rawBody?: string }).rawBody ?? "";
  const sigHeader = req.header("Calendly-Webhook-Signature") ?? "";
  if (!verifyCalendlySignature(raw, sigHeader)) {
    res.status(401).json({ message: "Bad signature" });
    return;
  }

  let body: CalendlyInviteePayload;
  try {
    body = typeof raw === "string" && raw.length > 0 ? JSON.parse(raw) : (req.body as CalendlyInviteePayload);
  } catch {
    res.status(400).json({ message: "Bad JSON" });
    return;
  }

  if (!supabaseAdmin) {
    console.warn("[calendly-webhook] Supabase not configured — dropping event.");
    res.json({ ok: true });
    return;
  }

  const eventType = body.event;
  const payload = body.payload;
  if (!payload || !payload.uri) {
    res.status(400).json({ message: "Missing payload" });
    return;
  }

  // Attempt to match the UTM campaign to a phone number if we captured one
  // from the visitor's earlier form submission. Not required for the booking
  // to save — just enrichment.
  const t = payload.tracking ?? {};
  const scheduled = payload.scheduled_event ?? {};

  const row = {
    calendly_uri: payload.uri,
    event_uri: scheduled.uri ?? null,
    event_type: scheduled.event_type ?? scheduled.name ?? null,
    invitee_name: payload.name ?? null,
    invitee_email: payload.email ?? null,
    invitee_phone: payload.text_reminder_number ?? null,
    start_time: scheduled.start_time ?? null,
    end_time: scheduled.end_time ?? null,
    location:
      typeof scheduled.location === "object" && scheduled.location
        ? (scheduled.location.location ?? null)
        : null,
    status: eventType === "invitee.canceled" ? "canceled" : (payload.status ?? "active"),
    cancellation_reason: payload.cancellation?.reason ?? null,
    utm_source: t.utm_source ?? null,
    utm_medium: t.utm_medium ?? null,
    utm_campaign: t.utm_campaign ?? null,
    utm_content: t.utm_content ?? null,
    utm_term: t.utm_term ?? null,
    // Store the full raw payload as JSON for future inspection / debugging.
    raw_payload: body,
  };

  const { error } = await supabaseAdmin
    .from("calendly_bookings")
    .upsert(row, { onConflict: "calendly_uri", ignoreDuplicates: false });
  if (error) {
    console.error("[calendly-webhook] upsert failed:", error.message);
    res.status(500).json({ message: "DB error" });
    return;
  }

  // Notify admin@ on new bookings (not on cancellations — those are already
  // in the Calendly cancellation email flow).
  if (eventType === "invitee.created") {
    const utmLine =
      t.utm_campaign
        ? `<p style="margin:0 0 8px 0;"><strong>Campaign:</strong> ${escapeStr(t.utm_campaign)}${t.utm_content ? " · " + escapeStr(t.utm_content) : ""}</p>`
        : "";
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#171717; max-width:560px;">
        <p style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
          NEW BOOKING
        </p>
        <h2 style="margin:0 0 16px 0; font-size:20px;">${escapeStr(payload.name ?? "(no name)")}</h2>
        <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${escapeStr(payload.email ?? "")}</p>
        ${payload.text_reminder_number ? `<p style="margin:0 0 8px 0;"><strong>Phone:</strong> ${escapeStr(payload.text_reminder_number)}</p>` : ""}
        <p style="margin:0 0 8px 0;"><strong>Event:</strong> ${escapeStr(scheduled.name ?? scheduled.event_type ?? "")}</p>
        <p style="margin:0 0 8px 0;"><strong>When:</strong> ${escapeStr(scheduled.start_time ?? "")}</p>
        ${utmLine}
        <p style="margin-top:24px; padding-top:16px; border-top:1px solid #EAE4DA; font-size:12px; color:#64748B;">
          View all bookings: <a href="https://places-egy.com/dashboard" style="color:#E11D48;">/dashboard</a> → Bookings
        </p>
      </div>
    `;
    void sendMail({
      to: "admin@places-egy.com",
      subject: `📅 New booking: ${payload.name ?? "someone"} (${scheduled.name ?? "meeting"})`,
      html,
      replyTo: payload.email,
    });
  }

  res.json({ ok: true });
}

function escapeStr(s: string): string {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
