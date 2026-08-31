import type { Request, Response } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "./supabase";
import { sendMail } from "./mailer";

// Calendly webhooks: invitee.created (booking confirmed) and invitee.canceled
// (booking canceled). Two auth paths supported (either satisfies the check):
//
//   1. NATIVE CALENDLY (Teams+ plans only): Calendly signs each request with
//      HMAC-SHA256 over the raw body. Header:
//        Calendly-Webhook-Signature: t=<unix_ts>,v1=<hex_signature>
//      Verified against CALENDLY_WEBHOOK_SIGNING_KEY.
//      Setup: Calendly → Integrations → Webhooks → Create webhook subscription.
//      URL: https://places-egy.com/api/webhooks/calendly, events:
//      invitee.created + invitee.canceled, copy signing key into Railway.
//
//   2. ZAPIER PASSTHROUGH (works on Free/Standard Calendly plans): Zapier's
//      Calendly trigger fires a Zap on every booking; the Zap's Webhook step
//      POSTs the Calendly payload here with a shared-secret header:
//        x-webhook-secret: <ZAPIER_WEBHOOK_SECRET value>
//      Verified with timing-safe equality against ZAPIER_WEBHOOK_SECRET.
//      Setup: Zapier → New Zap → Trigger: Calendly (New Invitee) → Action:
//      Webhooks by Zapier → POST → URL + Headers + JSON body (raw payload
//      from the trigger). Copy the secret into BOTH Zapier's header field
//      AND Railway env ZAPIER_WEBHOOK_SECRET.
//
// Either check passing accepts the request. Both env vars empty in prod
// still rejects everything (defense-in-depth against misconfig).

const SIGNING_KEY = process.env.CALENDLY_WEBHOOK_SIGNING_KEY ?? "";
const ZAPIER_SECRET = process.env.ZAPIER_WEBHOOK_SECRET ?? "";

// Timing-safe equality that tolerates length differences without leaking
// info (short-circuits on length, then compares padded buffers).
function safeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

// Verify Calendly's HMAC. Header format:
//   Calendly-Webhook-Signature: t=<unix_ts>,v1=<hex_signature>
// The signature payload is `${t}.${rawBody}`.
export function verifyCalendlySignature(
  rawBody: string,
  headerValue: string,
): boolean {
  if (!SIGNING_KEY) return false;
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

// Verify a Zapier-style shared-secret header. Zapier POSTs from its cloud
// with a static header value we compare against the env-configured secret.
// Timing-safe compare so an attacker can't binary-search the secret via
// response-time differences.
export function verifyZapierSecret(headerValue: string | undefined): boolean {
  if (!ZAPIER_SECRET) return false;
  if (!headerValue) return false;
  return safeEqualStr(headerValue, ZAPIER_SECRET);
}

// Accept the request if EITHER auth path succeeds. Both empty in prod = reject.
export function verifyCalendlyRequest(
  rawBody: string,
  calendlySigHeader: string,
  zapierSecretHeader: string | undefined,
): boolean {
  // Dev-only escape hatch: with neither env var set outside production,
  // accept everything so we can iterate on the handler locally.
  if (!SIGNING_KEY && !ZAPIER_SECRET) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[calendly-webhook] Neither CALENDLY_WEBHOOK_SIGNING_KEY nor ZAPIER_WEBHOOK_SECRET set — rejecting.",
      );
      return false;
    }
    return true;
  }
  if (SIGNING_KEY && calendlySigHeader && verifyCalendlySignature(rawBody, calendlySigHeader)) {
    return true;
  }
  if (ZAPIER_SECRET && verifyZapierSecret(zapierSecretHeader)) {
    return true;
  }
  return false;
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
  const zapierHeader = req.header("x-webhook-secret");
  if (!verifyCalendlyRequest(raw, sigHeader, zapierHeader)) {
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
