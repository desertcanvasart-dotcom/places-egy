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

// PLACES advisory Calendly link (mirrors openCalendly() in the client).
// Overridable via env in case the URL ever changes without a deploy.
const CALENDLY_URL =
  process.env.CALENDLY_URL ?? "https://calendly.com/places-egy-info/30min";

// Tag any Calendly URL sent from the server with UTMs so the client's
// Calendly dashboard shows exactly which email + button drove each booking.
// Same shape as client/src/lib/calendly.ts's calendlyUrl() — keep them in
// sync when either changes.
export function taggedCalendlyUrl(opts: {
  campaign: string;
  content?: string;
}): string {
  const params = new URLSearchParams({
    utm_source: "places-egy.com",
    utm_medium: "email",
    utm_campaign: opts.campaign,
  });
  if (opts.content) params.set("utm_content", opts.content);
  const sep = CALENDLY_URL.includes("?") ? "&" : "?";
  return `${CALENDLY_URL}${sep}${params.toString()}`;
}

// Public URL of the market report PDF. Placeholder until PLACES finalizes the
// actual PDF and uploads it to Supabase Storage or elsewhere. When set, the
// auto-reply includes a real download button; when unset (or set to the
// placeholder), the auto-reply politely says an advisor will send within 24h.
const MARKET_REPORT_URL = process.env.MARKET_REPORT_URL ?? null;

// The Cairo Developer Price Survey PDF lives in Supabase Storage (public
// bucket 'developer-survey'). We hardcode the public URL as a fallback so
// the survey magnet works even without an env var set, but DEVELOPER_
// SURVEY_URL lets ops rotate the file / bucket if needed.
const DEVELOPER_SURVEY_URL =
  process.env.DEVELOPER_SURVEY_URL ??
  "https://dgfzlouwonrxuieilqxb.supabase.co/storage/v1/object/public/developer-survey/cairo-developer-survey-2026.pdf";

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

// ── i18n ────────────────────────────────────────────────────────────────────
// Every user-facing email supports English + Arabic. Language is stored per
// account (accounts.preferred_language) or captured at lead-submit time
// (leads.preferred_language). Never say "listings" — always "offices" /
// "units" per PLACES copy rule.
export type Lang = "en" | "ar";

// Copy dictionary — one canonical bilingual translation per key. Keep this
// dictionary sorted by section so future editors can find things.
export const T = {
  common: {
    footerTagline: {
      en: "PLACES · Egypt's specialized partner for administrative office real estate",
      ar: "PLACES · شريكك المتخصص للعقارات الإدارية في مصر",
    },
    cairoEgypt: { en: "Cairo · Egypt", ar: "القاهرة · مصر" },
    talkToUs: { en: "Talk to Us", ar: "تحدث معنا" },
    viewOffice: { en: "View office →", ar: "عرض المكتب →" },
    hi: { en: "Hi", ar: "أهلاً" },
    signOff: { en: "— The PLACES Team", ar: "— فريق PLACES" },
    similarOffices: {
      en: "Similar offices you might like",
      ar: "مكاتب مشابهة قد تعجبك",
    },
    perSqm: { en: "sqm", ar: "م²" },
    forRent: { en: "For rent", ar: "للإيجار" },
    forSale: { en: "For sale", ar: "للبيع" },
    reply: {
      en: "Questions? Reply to this email — it goes straight to our advisors.",
      ar: "أسئلة؟ رد على هذا البريد — يصل مباشرة لمستشارينا.",
    },
  },
  digest2h: {
    subject: {
      en: "The offices you loved",
      ar: "المكاتب التي أعجبتك",
    },
    heading: {
      en: "Your saved offices are ready",
      ar: "المكاتب التي حفظتها جاهزة",
    },
    intro: {
      en: "You saved {count} offices on PLACES. Here's a quick recap — tap any card to see the full details.",
      ar: "لقد حفظت {count} من المكاتب على PLACES. إليك ملخص سريع — اضغط على أي بطاقة لعرض التفاصيل الكاملة.",
    },
    ctaLabel: { en: "Ready to talk it through?", ar: "مستعد للتحدث؟" },
    ctaBody: {
      en: "Book a 15-minute call and a PLACES advisor will walk you through the ones you're leaning toward.",
      ar: "احجز مكالمة 15 دقيقة وسيقوم مستشار PLACES بمساعدتك في المكاتب التي تفكر بها.",
    },
  },
  digestWeekly: {
    subject: {
      en: "Your PLACES weekly recap",
      ar: "ملخصك الأسبوعي من PLACES",
    },
    heading: {
      en: "Here's what you saved this week",
      ar: "إليك ما حفظته هذا الأسبوع",
    },
    intro: {
      en: "Your saved list from the past week — {count} offices in total.",
      ar: "قائمة مكاتبك المحفوظة من الأسبوع الماضي — {count} مكتب في المجموع.",
    },
  },
  digestMilestone: {
    subject: {
      en: "You've been busy — let's help you narrow it down",
      ar: "أنت جادّ في البحث — دعنا نساعدك في الاختيار",
    },
    heading: {
      en: "10 offices saved — that's a real shortlist",
      ar: "10 مكاتب محفوظة — قائمة اختيار حقيقية",
    },
    intro: {
      en: "You've saved 10 offices with PLACES. That's a strong shortlist. A quick call with one of our advisors will save you hours of research — we know these buildings inside out.",
      ar: "لقد حفظت 10 مكاتب على PLACES. هذه قائمة قوية. مكالمة سريعة مع أحد مستشارينا ستوفر عليك ساعات من البحث — نحن نعرف هذه المباني جيداً.",
    },
    ctaLabel: { en: "Book a 15-minute call", ar: "احجز مكالمة 15 دقيقة" },
    ctaBody: {
      en: "No pressure, no sales pitch — just an honest advisor conversation about the offices you shortlisted.",
      ar: "بدون ضغط أو عروض بيع — فقط محادثة صادقة مع مستشار عن المكاتب التي اخترتها.",
    },
  },
  marketReport: {
    subject: {
      en: "Your Cairo Office Market Report 2026 — from PLACES",
      ar: "تقرير سوق المكاتب في القاهرة 2026 — من PLACES",
    },
    intro: {
      en: "Thanks for downloading the Cairo Office Market Report 2026. Here's your copy — plus a preview of what you'll find inside.",
      ar: "شكراً لطلبك تقرير سوق المكاتب في القاهرة 2026. إليك نسختك — بالإضافة إلى معاينة لما ستجده في الداخل.",
    },
    downloadCta: { en: "Download the PDF →", ar: "تحميل PDF →" },
    reportReady: {
      en: "Your report is ready",
      ar: "تقريرك جاهز",
    },
    whatsInside: { en: "What's inside", ar: "ما بداخل التقرير" },
  },
} as const;

// Helper: get a string in the requested language, falling back to English.
export function t(
  key: { en: string; ar: string },
  lang: Lang = "en",
): string {
  return key[lang] ?? key.en;
}

// Format a number with per-locale grouping (English commas / Arabic-Indic).
export function formatNumber(n: number, lang: Lang = "en"): string {
  return new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US").format(n);
}

// ── Shared branded email shell (bilingual) ──────────────────────────────────
// Body is a raw HTML string composed by the caller with the right language.
// The shell handles direction (RTL for Arabic) + font-family + footer copy.
function brandedShell(opts: {
  preheader: string;
  body: string;
  lang?: Lang;
}): string {
  const lang: Lang = opts.lang ?? "en";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const font =
    lang === "ar"
      ? "'Segoe UI', Tahoma, Arial, sans-serif" // Segoe UI + Tahoma have excellent Arabic glyphs; email clients don't reliably load Cairo/Tajawal web fonts.
      : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const cairoLabelAlign = lang === "ar" ? "left" : "right";
  const wordmarkAlign = lang === "ar" ? "right" : "left";
  return `
<!doctype html>
<html dir="${dir}" lang="${lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0; padding:0; background:#F5F1EA; font-family:${font}; direction:${dir};">
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
                    <td align="${wordmarkAlign}">
                      <span style="color:#E11D48; font-size:12px; font-weight:700; letter-spacing:3px;">PLACES</span>
                    </td>
                    <td align="${cairoLabelAlign}">
                      <span style="color:rgba(255,255,255,0.5); font-size:11px;">${escapeHtml(t(T.common.cairoEgypt, lang))}</span>
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
                  ${escapeHtml(t(T.common.footerTagline, lang))}
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

// Human-facing labels for the internal slugs stored in leads.lead_source,
// leads.magnet, leads.locations, and leads.page_url. The DB keeps the raw
// slug (greppable, filterable), the email shows the friendly form. When
// adding a new lead source or magnet slug, add its label here too — anything
// unknown gracefully falls back to a title-cased version of the slug.
const LEAD_SOURCE_LABELS: Record<string, string> = {
  corner_popup: "Homepage popup",
  blog_slide_up: "Blog popup",
  footer: "Footer button",
  market_report_page: "Market report page",
  concierge_widget: "Concierge chat widget",
  contact_page: "Contact page",
  listing_inquiry: "Listing inquiry form",
  exit_intent: "Exit-intent popup",
  favorites_email_me_now: "'Email my saved list' button",
  developer_survey_popup: "Developer survey popup (guide page)",
  developer_survey_inline: "Developer survey inline card (guide page)",
};

const MAGNET_LABELS: Record<string, string> = {
  cairo_office_market_report_2026: "Cairo Office Market Report (2026)",
  cairo_developer_survey_2026: "Cairo Developer Price Survey (2026)",
};

const LOCATION_LABELS: Record<string, string> = {
  "new-cairo": "New Cairo",
  "sheikh-zayed": "Sheikh Zayed",
  "6th-october": "6th October",
  "downtown-cairo": "Downtown Cairo",
  sheraton: "Sheraton",
  maadi: "Maadi",
};

// Title-case a slug as a graceful fallback ("some_slug-here" → "Some Slug Here").
function humanizeSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function friendlyLeadSource(slug: string): string {
  return LEAD_SOURCE_LABELS[slug] ?? humanizeSlug(slug);
}
function friendlyMagnet(slug: string): string {
  return MAGNET_LABELS[slug] ?? humanizeSlug(slug);
}
function friendlyLocations(locations: string[]): string {
  return locations.map((l) => LOCATION_LABELS[l] ?? humanizeSlug(l)).join(", ");
}
// Convert URL paths to readable page names. "/" → "Homepage",
// "/listings/123-mivida-tower" → "Listing detail (Mivida Tower)", etc.
function friendlyPageUrl(pageUrl: string): string {
  if (!pageUrl || pageUrl === "/") return "Homepage";
  if (pageUrl === "/listings") return "Listings page";
  if (pageUrl.startsWith("/listings/")) {
    const rest = pageUrl.slice("/listings/".length);
    // Format: <id>-<slug>
    const dashIdx = rest.indexOf("-");
    const nameSlug = dashIdx >= 0 ? rest.slice(dashIdx + 1) : rest;
    const readable = humanizeSlug(nameSlug);
    return readable ? `Listing detail (${readable})` : "Listing detail";
  }
  if (pageUrl.startsWith("/blog/")) return `Blog post: ${humanizeSlug(pageUrl.slice("/blog/".length))}`;
  if (pageUrl === "/blog") return "Blog";
  if (pageUrl.startsWith("/guides/")) return `Guide: ${humanizeSlug(pageUrl.slice("/guides/".length))}`;
  if (pageUrl === "/guides") return "Guides hub";
  if (pageUrl.startsWith("/services/")) return `Service: ${humanizeSlug(pageUrl.slice("/services/".length))}`;
  if (pageUrl === "/services") return "Services page";
  if (pageUrl === "/contact") return "Contact page";
  if (pageUrl === "/why-places") return "Why PLACES";
  if (pageUrl.startsWith("/admin/")) return `Office type: ${humanizeSlug(pageUrl.slice("/admin/".length))}`;
  if (pageUrl.startsWith("/developers/")) return `Developer: ${humanizeSlug(pageUrl.slice("/developers/".length))}`;
  if (pageUrl === "/saved") return "Saved list";
  if (pageUrl === "/resources/market-report") return "Market report landing page";
  // Fallback — strip leading slash + humanize.
  return humanizeSlug(pageUrl.replace(/^\//, "")) || pageUrl;
}

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
    ? row("Interested in", escapeHtml(friendlyLocations(lead.locations)))
    : "";
  const magnetRow = lead.magnet
    ? row("Lead magnet", escapeHtml(friendlyMagnet(lead.magnet)))
    : "";
  const listingRow = lead.listing_id
    ? row("Listing #", String(lead.listing_id))
    : "";
  // Humanize UTM values individually so 'gbp' → 'GBP', 'cpc' → 'CPC', etc.
  const utmParts = [
    lead.utm_source && `Source: ${humanizeSlug(lead.utm_source)}`,
    lead.utm_medium && `Medium: ${humanizeSlug(lead.utm_medium)}`,
    lead.utm_campaign && `Campaign: ${humanizeSlug(lead.utm_campaign)}`,
  ].filter(Boolean);
  const utmRow = utmParts.length > 0
    ? row("Campaign", escapeHtml(utmParts.join(" · ")))
    : "";
  const pageRow = lead.page_url
    ? row("Submitted from", escapeHtml(friendlyPageUrl(lead.page_url)))
    : "";

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
      From: ${escapeHtml(friendlyLeadSource(lead.lead_source))}
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
  // Subject line: friendly + scannable. Shows the person's name first (what
  // the admin actually cares about), then a short context tag so multiple
  // leads in the inbox don't look identical. Examples:
  //   "New lead — Nancy Eslam · Market Report"
  //   "New lead — Sarah · Concierge chat widget"
  const subjectTag = lead.magnet
    ? friendlyMagnet(lead.magnet)
    : friendlyLeadSource(lead.lead_source);
  return sendMail({
    to: "admin@places-egy.com",
    subject: `New lead — ${lead.name} · ${subjectTag}`,
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
  lang?: Lang;
}): Promise<void> {
  const lang: Lang = opts.lang ?? "en";
  const isAr = lang === "ar";
  const first = firstNameOf(opts.toName);
  const monthYear = new Date().toLocaleDateString(
    isAr ? "ar-EG" : "en-GB",
    { month: "long", year: "numeric" },
  );

  const downloadPdfUrl = MARKET_REPORT_URL
    ? `${MARKET_REPORT_URL}${MARKET_REPORT_URL.includes("?") ? "&" : "?"}utm_source=places-egy.com&utm_medium=email&utm_campaign=email_market_report&utm_content=download_pdf`
    : "";

  const downloadHero = MARKET_REPORT_URL
    ? `
      <div style="margin:0 0 28px 0; padding:28px 24px; background:linear-gradient(135deg,#171717 0%,#2A2A2A 100%); border-radius:14px; text-align:center;">
        <p style="margin:0 0 10px 0; font-size:11px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:3px;">
          📄 ${escapeHtml(t(T.marketReport.reportReady, lang))}
        </p>
        <h2 style="margin:0 0 6px 0; font-size:22px; font-weight:700; color:#ffffff; line-height:1.3;">
          ${isAr ? "تقرير سوق المكاتب في القاهرة 2026" : "Cairo Office Market Report 2026"}
        </h2>
        <p style="margin:0 0 22px 0; font-size:13px; color:rgba(255,255,255,0.6);">
          ${isAr ? `مجاني · PDF · محدث ${monthYear}` : `Free · PDF · Updated ${monthYear}`}
        </p>
        <a href="${downloadPdfUrl}"
           style="display:inline-block; background:#E11D48; color:#ffffff; padding:14px 32px; border-radius:999px; text-decoration:none; font-weight:700; font-size:15px; box-shadow:0 4px 12px rgba(225,29,72,0.4);">
          ${escapeHtml(t(T.marketReport.downloadCta, lang))}
        </a>
      </div>`
    : `
      <div style="margin:0 0 28px 0; padding:24px; background:#F8F5F1; border-radius:12px;">
        <p style="margin:0; font-size:15px; line-height:1.6; color:#171717;">
          ${isAr ? "شكراً لطلبك تقرير سوق المكاتب في القاهرة 2026. سيقوم مستشار PLACES بإرساله لك خلال 24 ساعة." : "Thanks for requesting the Cairo Office Market Report 2026. A PLACES advisor will personally send you the report within the next 24 hours."}
        </p>
      </div>`;

  const bullets = isAr
    ? [
        ["📊", "معايير الأسعار حسب المنطقة", "أسعار الشراء والإيجار الحية لكل متر مربع في التجمع الخامس، الشيخ زايد، 6 أكتوبر، وسط البلد، شيراتون، والمعادي."],
        ["🏢", "خط إمدادات المشاريع", "أي المشاريع سيتم تسليمها في 2026-2027 وكيف يؤثر ذلك على التوافر في منطقتك."],
        ["📈", "أين يذهب المال الذكي", "تحليل العوائد ومعدلات الامتصاص والمناطق التي يراقبها مستشارونا هذا العام."],
        ["🏗️", "أبرز المطورين نشاطاً", "المطورون الأكثر تمثيلاً في خط إمدادات المكاتب في القاهرة — مؤشر على أين تحدث الصفقات فعلاً."],
      ]
    : [
        ["📊", "Pricing benchmarks by district", "Live buy and lease rates per square metre across New Cairo, Sheikh Zayed, 6th October, Downtown, Sheraton, and Maadi."],
        ["🏢", "Supply pipeline", "Which developments are delivering in 2026–2027 and how that shifts availability in your target area."],
        ["📈", "Where the smart money is going", "Yield analysis, absorption rates, and the shortlist of districts our advisors are watching this year."],
        ["🏗️", "Top developers by activity", "The developers most represented in Cairo's active office pipeline — a proxy for where the deals are actually happening."],
      ];

  const body = `
    <p style="margin:0 0 20px 0; font-size:16px; color:#171717;">${escapeHtml(t(T.common.hi, lang))} ${escapeHtml(first)}, 👋</p>

    <p style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#171717;">
      ${escapeHtml(t(T.marketReport.intro, lang))}
    </p>

    ${downloadHero}

    <p style="margin:0 0 12px 0; font-size:12px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:2px;">
      ${escapeHtml(t(T.marketReport.whatsInside, lang))}
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      ${bullets.map(([i, ti, d]) => bulletRow(i, ti, d)).join("")}
    </table>

    <hr style="border:0; border-top:1px solid #EAE4DA; margin:32px 0 24px 0;">

    <div style="margin:0 0 8px 0; padding:24px; background:#F8F5F1; border-radius:12px;">
      <p style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
        ${isAr ? "تريد قراءة مخصصة؟" : "Want a personalised read?"}
      </p>
      <p style="margin:0 0 14px 0; font-size:14px; line-height:1.5; color:#171717;">
        ${isAr ? "احجز مكالمة مجانية مدتها 15 دقيقة وسيرشدك مستشار PLACES خلال المناطق والفئات السعرية التي تهمك." : "Book a free 15-minute call and a PLACES advisor will walk you through the districts and price bands you care about most — no pressure, no pitch."}
      </p>
      <a href="${taggedCalendlyUrl({ campaign: "email_market_report", content: "talk_to_us" })}"
         style="display:inline-block; background:#171717; color:#ffffff; padding:11px 22px; border-radius:999px; text-decoration:none; font-weight:600; font-size:14px;">
        ${escapeHtml(t(T.common.talkToUs, lang))} →
      </a>
    </div>

    <p style="margin:24px 0 8px 0; font-size:14px; line-height:1.6; color:#64748B;">
      ${escapeHtml(t(T.common.reply, lang))}
    </p>
    <p style="margin:16px 0 0 0; font-size:14px; color:#171717;">
      ${escapeHtml(t(T.common.signOff, lang))}
    </p>
  `;

  const html = brandedShell({
    preheader: isAr
      ? "تقرير سوق المكاتب في القاهرة 2026 — الأسعار والعرض والعائدات في كل منطقة."
      : "Your Cairo Office Market Report 2026 is inside — pricing, supply, and yields across every district.",
    body,
    lang,
  });

  return sendMail({
    to: opts.toEmail,
    subject: t(T.marketReport.subject, lang),
    html,
    replyTo: "admin@places-egy.com",
  });
}

// ── Developer survey auto-reply ─────────────────────────────────────────────
// Fired when a visitor submits the /guides/* developer survey lead magnet.
// Delivers the PLACES Cairo Developer Price Survey PDF via a big prominent
// download button. Structure mirrors sendMarketReportReply for consistency:
// greeting → hero download → what's inside → talk-to-us CTA → sign-off.

export async function sendDeveloperSurveyReply(opts: {
  toEmail: string;
  toName: string;
  lang?: Lang;
}): Promise<void> {
  const lang: Lang = opts.lang ?? "en";
  const isAr = lang === "ar";
  const first = firstNameOf(opts.toName);
  const monthYear = new Date().toLocaleDateString(
    isAr ? "ar-EG" : "en-GB",
    { month: "long", year: "numeric" },
  );

  // Append UTM tags so any click from this email shows up in /dashboard →
  // Leads → source pill as its own attribution bucket.
  const downloadPdfUrl = `${DEVELOPER_SURVEY_URL}${DEVELOPER_SURVEY_URL.includes("?") ? "&" : "?"}utm_source=places-egy.com&utm_medium=email&utm_campaign=email_developer_survey&utm_content=download_pdf`;

  const heroTitle = isAr
    ? "استطلاع أسعار المطورين في القاهرة 2026"
    : "Cairo Developer Price Survey 2026";
  const heroSubtitle = isAr
    ? `مجاني · PDF · محدث ${monthYear}`
    : `Free · PDF · Updated ${monthYear}`;
  const downloadCta = isAr ? "تحميل PDF" : "Download PDF";
  const readyLabel = isAr ? "📄 استطلاعك جاهز" : "📄 Your survey is ready";

  const downloadHero = `
    <div style="margin:0 0 28px 0; padding:28px 24px; background:linear-gradient(135deg,#171717 0%,#2A2A2A 100%); border-radius:14px; text-align:center;">
      <p style="margin:0 0 10px 0; font-size:11px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:3px;">
        ${readyLabel}
      </p>
      <h2 style="margin:0 0 6px 0; font-size:22px; font-weight:700; color:#ffffff; line-height:1.3;">
        ${heroTitle}
      </h2>
      <p style="margin:0 0 22px 0; font-size:13px; color:rgba(255,255,255,0.6);">
        ${heroSubtitle}
      </p>
      <a href="${downloadPdfUrl}"
         style="display:inline-block; background:#E11D48; color:#ffffff; padding:14px 32px; border-radius:999px; text-decoration:none; font-weight:700; font-size:15px; box-shadow:0 4px 12px rgba(225,29,72,0.4);">
        ${downloadCta}
      </a>
    </div>`;

  const bullets = isAr
    ? [
        ["📍", "أسعار كل مطور رئيسي", "الأرقام الفعلية التي يفرضها المطورون في التجمع الخامس والشيخ زايد و6 أكتوبر — ليست الأسعار المعلنة."],
        ["📈", "الفروق بين المناطق", "أين تحصل على أفضل قيمة، وأين تدفع علاوة على العلامة التجارية للمطور."],
        ["🏗️", "بيانات الصفقات الحقيقية", "مُجمع بواسطة PLACES من صفقات محلية فعلية — ليس من قوائم المواقع."],
        ["🔄", "محدث كل ربع سنة", "المطورون يعدلون الأسعار بشكل متكرر. هذه هي بيانات الربع الحالي."],
      ]
    : [
        ["📍", "Prices by every major developer", "The actual numbers developers are charging in Fifth Settlement, Sheikh Zayed, and 6th October — not the marketing sheets."],
        ["📈", "Where the value is right now", "Which districts are quietly better priced, and where you're paying a premium for the developer brand rather than the location."],
        ["🏗️", "Real transaction data", "Compiled by PLACES from on-the-ground deals across Cairo — not scraped from listing sites."],
        ["🔄", "Refreshed quarterly", "Developer prices move frequently. This is the current-quarter snapshot."],
      ];

  const hi = isAr ? "مرحباً" : "Hi";
  const intro = isAr
    ? "شكراً لطلبك استطلاع أسعار المطورين. الملف مرفق أدناه — يستحق ~15 دقيقة من وقتك."
    : "Thanks for requesting the developer price survey. The PDF is one click below — it's worth ~15 minutes of your time.";
  const talkTitle = isAr
    ? "تحتاج رأي بشأن مطور معين؟"
    : "Want a read on a specific developer?";
  const talkBody = isAr
    ? "احجز مكالمة مجانية مدتها 15 دقيقة وسيقارن مستشار PLACES بين المطورين الذين تفكر فيهم."
    : "Book a free 15-minute call and a PLACES advisor will compare the developers you're actually considering, side by side.";
  const talkCta = isAr ? "تحدث معنا" : "Talk to us";
  const replyLine = isAr
    ? "أي أسئلة؟ فقط رد على هذا البريد الإلكتروني — تصل مباشرة إلى فريقنا."
    : "Any questions? Just reply to this email — it goes straight to our team.";
  const signOff = isAr ? "— PLACES" : "— PLACES";

  const body = `
    <p style="margin:0 0 20px 0; font-size:16px; color:#171717;">${hi} ${escapeHtml(first)}, 👋</p>

    <p style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#171717;">
      ${intro}
    </p>

    ${downloadHero}

    <p style="margin:0 0 12px 0; font-size:12px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:2px;">
      ${isAr ? "ما ستجده" : "What's inside"}
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      ${bullets.map(([i, ti, d]) => bulletRow(i, ti, d)).join("")}
    </table>

    <hr style="border:0; border-top:1px solid #EAE4DA; margin:32px 0 24px 0;">

    <div style="margin:0 0 8px 0; padding:24px; background:#F8F5F1; border-radius:12px;">
      <p style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:2px;">
        ${talkTitle}
      </p>
      <p style="margin:0 0 14px 0; font-size:14px; line-height:1.5; color:#171717;">
        ${talkBody}
      </p>
      <a href="${taggedCalendlyUrl({ campaign: "email_developer_survey", content: "talk_to_us" })}"
         style="display:inline-block; background:#171717; color:#ffffff; padding:11px 22px; border-radius:999px; text-decoration:none; font-weight:600; font-size:14px;">
        ${talkCta} →
      </a>
    </div>

    <p style="margin:24px 0 8px 0; font-size:14px; line-height:1.6; color:#64748B;">
      ${replyLine}
    </p>
    <p style="margin:16px 0 0 0; font-size:14px; color:#171717;">
      ${signOff}
    </p>
  `;

  const html = brandedShell({
    preheader: isAr
      ? "استطلاع أسعار المطورين في القاهرة 2026 — الأرقام الفعلية، مجمعة على الأرض."
      : "Your 2026 Cairo Developer Price Survey is inside — real numbers, ground-level.",
    body,
    lang,
  });

  return sendMail({
    to: opts.toEmail,
    subject: isAr
      ? "استطلاع أسعار المطورين في القاهرة 2026"
      : "Your Cairo Developer Price Survey 2026",
    html,
    replyTo: "admin@places-egy.com",
  });
}

// ── Favorites digest emails ─────────────────────────────────────────────────
// Sent to signed-in accounts based on their favorites activity:
//   1. sendFavoritesDigest2h — 2h debounced digest after 3+ favorites
//   2. sendFavoritesDigestWeekly — Monday 9 AM recap for accounts with any
//      favorite added in the past 7 days
//   3. sendFavoritesDigestMilestone — fires immediately at 10 favorites with
//      a warm "let's talk" CTA
// All three share renderFavoritesEmail() below — the only difference is the
// subject line + intro block + CTA framing.

export type FavoritedListing = {
  id: number;
  title: string;
  price: number | null;
  currency: string | null;
  area_sqm: number | null;
  developer: string | null;
  location: string | null;
  transaction_type: string | null;
  first_image_url: string | null;
  url_path: string; // /listings/[id]-[slug]
};

function priceLine(l: FavoritedListing, lang: Lang): string {
  if (!l.price) return isAr(lang) ? "السعر عند الطلب" : "Price on request";
  const n = formatNumber(l.price, lang);
  const cur = l.currency === "USD" ? "USD" : "EGP";
  return `${n} ${cur}`;
}

function isAr(lang: Lang): boolean {
  return lang === "ar";
}

// Render one office card in the email — image left, details right.
function officeCard(l: FavoritedListing, lang: Lang, utmCampaign: string): string {
  const rtl = isAr(lang);
  const url = `https://places-egy.com${l.url_path}?utm_source=places-egy.com&utm_medium=email&utm_campaign=${utmCampaign}&utm_content=office_card_${l.id}`;
  const img = l.first_image_url
    ? `<img src="${escapeHtml(l.first_image_url)}" alt="" style="width:100%; max-width:180px; height:130px; object-fit:cover; border-radius:8px; display:block;">`
    : `<div style="width:180px; height:130px; background:#EAE4DA; border-radius:8px;"></div>`;
  const areaLine =
    l.area_sqm != null
      ? `<span style="color:#64748B;"> · ${formatNumber(l.area_sqm, lang)} ${escapeHtml(t(T.common.perSqm, lang))}</span>`
      : "";
  const devLine = l.developer
    ? `<p style="margin:4px 0 0 0; font-size:12px; color:#64748B;">${escapeHtml(l.developer)}</p>`
    : "";
  const locLine = l.location
    ? `<p style="margin:2px 0 6px 0; font-size:13px; color:#334155;">${escapeHtml(l.location)}</p>`
    : "";
  const txn = l.transaction_type?.toLowerCase() === "sale"
    ? t(T.common.forSale, lang)
    : t(T.common.forRent, lang);

  // In RTL we swap image/text order.
  const imgCell = `<td valign="top" style="width:180px; padding:${rtl ? "0 0 0 16px" : "0 16px 0 0"};">${img}</td>`;
  const textCell = `
    <td valign="top" style="text-align:${rtl ? "right" : "left"};">
      <p style="margin:0 0 4px 0; font-size:11px; font-weight:700; color:#E11D48; text-transform:uppercase; letter-spacing:1.5px;">
        ${escapeHtml(txn)}
      </p>
      <p style="margin:0 0 4px 0; font-size:15px; font-weight:700; color:#171717; line-height:1.3;">
        <a href="${url}" style="color:#171717; text-decoration:none;">${escapeHtml(l.title)}</a>
      </p>
      ${locLine}
      <p style="margin:0; font-size:14px; font-weight:600; color:#171717;">
        ${escapeHtml(priceLine(l, lang))}${areaLine}
      </p>
      ${devLine}
      <p style="margin:10px 0 0 0;">
        <a href="${url}" style="display:inline-block; background:#171717; color:#ffffff; padding:6px 14px; border-radius:999px; text-decoration:none; font-weight:600; font-size:12px;">
          ${escapeHtml(t(T.common.viewOffice, lang))}
        </a>
      </p>
    </td>`;

  return `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #EAE4DA;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            ${rtl ? textCell + imgCell : imgCell + textCell}
          </tr>
        </table>
      </td>
    </tr>`;
}

function similarSection(similar: FavoritedListing[], lang: Lang, utmCampaign: string): string {
  if (similar.length === 0) return "";
  return `
    <hr style="border:0; border-top:1px solid #EAE4DA; margin:32px 0 20px 0;">
    <p style="margin:0 0 14px 0; font-size:12px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:2px;">
      ${escapeHtml(t(T.common.similarOffices, lang))}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${similar.map((l) => officeCard(l, lang, `${utmCampaign}_similar`)).join("")}
    </table>`;
}

function ctaPanel(opts: {
  labelKey: { en: string; ar: string };
  bodyKey: { en: string; ar: string };
  buttonKey: { en: string; ar: string };
  campaign: string;
  lang: Lang;
  isPrimary?: boolean;
}): string {
  const bg = opts.isPrimary ? "#171717" : "#F8F5F1";
  const labelColor = "#E11D48";
  const bodyColor = opts.isPrimary ? "#ffffff" : "#171717";
  const btnBg = opts.isPrimary ? "#E11D48" : "#171717";
  return `
    <div style="margin:24px 0 8px 0; padding:24px; background:${bg}; border-radius:12px;">
      <p style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:${labelColor}; text-transform:uppercase; letter-spacing:2px;">
        ${escapeHtml(t(opts.labelKey, opts.lang))}
      </p>
      <p style="margin:0 0 14px 0; font-size:14px; line-height:1.5; color:${bodyColor};">
        ${escapeHtml(t(opts.bodyKey, opts.lang))}
      </p>
      <a href="${taggedCalendlyUrl({ campaign: opts.campaign, content: "talk_to_us" })}"
         style="display:inline-block; background:${btnBg}; color:#ffffff; padding:11px 22px; border-radius:999px; text-decoration:none; font-weight:600; font-size:14px;">
        ${escapeHtml(t(opts.buttonKey, opts.lang))} →
      </a>
    </div>`;
}

type DigestVariant = "digest2h" | "weekly" | "milestone";

export async function sendFavoritesDigest(opts: {
  toEmail: string;
  toName: string;
  lang?: Lang;
  variant: DigestVariant;
  favorites: FavoritedListing[];
  similar: FavoritedListing[];
}): Promise<void> {
  const lang: Lang = opts.lang ?? "en";
  const first = firstNameOf(opts.toName);
  const count = opts.favorites.length;

  const config =
    opts.variant === "digest2h"
      ? {
          subjectKey: T.digest2h.subject,
          headingKey: T.digest2h.heading,
          introKey: T.digest2h.intro,
          ctaLabelKey: T.digest2h.ctaLabel,
          ctaBodyKey: T.digest2h.ctaBody,
          ctaButtonKey: T.common.talkToUs,
          ctaPrimary: false,
          campaign: "email_favorites_digest",
        }
      : opts.variant === "weekly"
        ? {
            subjectKey: T.digestWeekly.subject,
            headingKey: T.digestWeekly.heading,
            introKey: T.digestWeekly.intro,
            ctaLabelKey: T.digest2h.ctaLabel,
            ctaBodyKey: T.digest2h.ctaBody,
            ctaButtonKey: T.common.talkToUs,
            ctaPrimary: false,
            campaign: "email_favorites_weekly",
          }
        : {
            subjectKey: T.digestMilestone.subject,
            headingKey: T.digestMilestone.heading,
            introKey: T.digestMilestone.intro,
            ctaLabelKey: T.digestMilestone.ctaLabel,
            ctaBodyKey: T.digestMilestone.ctaBody,
            ctaButtonKey: T.digestMilestone.ctaLabel,
            ctaPrimary: true,
            campaign: "email_favorites_milestone",
          };

  const intro = t(config.introKey, lang).replace(
    "{count}",
    formatNumber(count, lang),
  );

  const body = `
    <p style="margin:0 0 20px 0; font-size:16px; color:#171717;">${escapeHtml(t(T.common.hi, lang))} ${escapeHtml(first)},</p>

    <h2 style="margin:0 0 12px 0; font-size:22px; font-weight:700; color:#171717; line-height:1.3;">
      ${escapeHtml(t(config.headingKey, lang))}
    </h2>

    <p style="margin:0 0 20px 0; font-size:15px; line-height:1.6; color:#64748B;">
      ${escapeHtml(intro)}
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${opts.favorites.map((l) => officeCard(l, lang, config.campaign)).join("")}
    </table>

    ${ctaPanel({
      labelKey: config.ctaLabelKey,
      bodyKey: config.ctaBodyKey,
      buttonKey: config.ctaButtonKey,
      campaign: config.campaign,
      lang,
      isPrimary: config.ctaPrimary,
    })}

    ${opts.variant !== "milestone" ? similarSection(opts.similar, lang, config.campaign) : ""}

    <p style="margin:24px 0 8px 0; font-size:14px; line-height:1.6; color:#64748B;">
      ${escapeHtml(t(T.common.reply, lang))}
    </p>
    <p style="margin:16px 0 0 0; font-size:14px; color:#171717;">
      ${escapeHtml(t(T.common.signOff, lang))}
    </p>
  `;

  const preheader = isAr(lang)
    ? `${formatNumber(count, lang)} مكتب حفظتها على PLACES — الأسعار والتفاصيل والروابط بالداخل.`
    : `${count} offices you saved on PLACES — prices, details, and links inside.`;

  const html = brandedShell({ preheader, body, lang });

  return sendMail({
    to: opts.toEmail,
    subject: t(config.subjectKey, lang),
    html,
    replyTo: "admin@places-egy.com",
  });
}
