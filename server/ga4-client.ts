import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Thin wrapper around Google Analytics Data API for the weekly report.
// Reads the service account JSON from GA4_SERVICE_ACCOUNT_JSON env var
// and the property ID from GA4_PROPERTY_ID.
//
// The JSON is passed as a stringified env var (Railway UI) rather than a
// file on disk. We parse it once at module load. If either env var is
// missing or malformed the client returns null and every method short-
// circuits to safe defaults — the weekly report still ships, just
// without traffic numbers.

const PROPERTY_ID = process.env.GA4_PROPERTY_ID ?? "";
const SA_JSON_RAW = process.env.GA4_SERVICE_ACCOUNT_JSON ?? "";

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  project_id: string;
}

let cachedClient: BetaAnalyticsDataClient | null = null;
let initTried = false;

function getClient(): BetaAnalyticsDataClient | null {
  if (initTried) return cachedClient;
  initTried = true;
  if (!PROPERTY_ID) {
    console.warn("[ga4] GA4_PROPERTY_ID not set — traffic metrics disabled.");
    return null;
  }
  if (!SA_JSON_RAW) {
    console.warn("[ga4] GA4_SERVICE_ACCOUNT_JSON not set — traffic metrics disabled.");
    return null;
  }
  try {
    const creds = JSON.parse(SA_JSON_RAW) as ServiceAccountKey;
    if (!creds.client_email || !creds.private_key) {
      console.warn("[ga4] service account JSON missing client_email/private_key — traffic metrics disabled.");
      return null;
    }
    cachedClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: creds.client_email,
        // Railway env vars strip the literal \n → actual newlines when
        // stored, but if the JSON was pasted with escaped \n we need to
        // un-escape it here. Both cases work.
        private_key: creds.private_key.replace(/\\n/g, "\n"),
      },
    });
    return cachedClient;
  } catch (err) {
    console.warn(
      "[ga4] failed to parse GA4_SERVICE_ACCOUNT_JSON:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

// GA4 date strings must be YYYY-MM-DD.
function toGa4Date(d: Date): string {
  return d.toISOString().split("T")[0];
}

export interface GA4WeeklyTraffic {
  sessions: number;
  prevSessions: number;
  sessionsDeltaPct: number | null; // null if prev = 0
  users: number;
  keyEvents: number; // sum of the 5 configured Key events
  topLandingPage: { path: string; sessions: number } | null;
  topChannel: { name: string; sessions: number } | null;
  conversionRatePct: number | null; // (keyEvents / sessions) * 100
  // Per-day sessions for the last 7 days, oldest → newest, for the
  // inline-SVG sparkline chart in the email.
  dailySessions: Array<{ date: string; sessions: number }>;
  // Channel mix (top 5) for the sessions-by-channel bar chart.
  channelBreakdown: Array<{ name: string; sessions: number }>;
}

// Fetch the last-7-days snapshot from GA4. Returns null if the client
// isn't configured; caller renders the report without the traffic section.
export async function fetchGa4WeeklyTraffic(): Promise<GA4WeeklyTraffic | null> {
  const client = getClient();
  if (!client) return null;

  const property = `properties/${PROPERTY_ID}`;
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekEnd = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // yesterday
  const prevStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const prevEnd = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

  try {
    // One batchRunReports call = one API bill event + one auth round-trip.
    // Six queries below all share the same property so batching keeps
    // latency low + quota usage low. Adds per-day and per-channel breakdowns
    // for the inline SVG chart rendering.
    const [batch] = await client.batchRunReports({
      property,
      requests: [
        // Query 0 — sessions + users + keyEvents for THIS week
        {
          dateRanges: [{ startDate: toGa4Date(weekStart), endDate: toGa4Date(weekEnd) }],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "keyEvents" },
          ],
        },
        // Query 1 — sessions PREVIOUS week (for delta %)
        {
          dateRanges: [{ startDate: toGa4Date(prevStart), endDate: toGa4Date(prevEnd) }],
          metrics: [{ name: "sessions" }],
        },
        // Query 2 — top landing page by sessions, this week
        {
          dateRanges: [{ startDate: toGa4Date(weekStart), endDate: toGa4Date(weekEnd) }],
          dimensions: [{ name: "landingPagePlusQueryString" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 1,
        },
        // Query 3 — top default channel group by sessions, this week
        {
          dateRanges: [{ startDate: toGa4Date(weekStart), endDate: toGa4Date(weekEnd) }],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 1,
        },
        // Query 4 — sessions PER DAY for the last 7 days (line chart data)
        {
          dateRanges: [{ startDate: toGa4Date(weekStart), endDate: toGa4Date(weekEnd) }],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ dimension: { dimensionName: "date" } }],
        },
        // Query 5 — channel mix (top 5) for the sessions-by-channel bar chart
        {
          dateRanges: [{ startDate: toGa4Date(weekStart), endDate: toGa4Date(weekEnd) }],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 5,
        },
      ],
    });

    const [q0, q1, q2, q3, q4, q5] = batch.reports ?? [];

    // Parse this-week totals
    const q0row = q0?.rows?.[0]?.metricValues ?? [];
    const sessions = Number(q0row[0]?.value ?? 0);
    const users = Number(q0row[1]?.value ?? 0);
    const keyEvents = Number(q0row[2]?.value ?? 0);

    // Parse previous-week sessions
    const prevSessions = Number(q1?.rows?.[0]?.metricValues?.[0]?.value ?? 0);
    const sessionsDeltaPct =
      prevSessions === 0 ? null : Math.round(((sessions - prevSessions) / prevSessions) * 100);

    // Parse top landing page
    const topLandingRow = q2?.rows?.[0];
    const topLandingPage = topLandingRow
      ? {
          path: topLandingRow.dimensionValues?.[0]?.value ?? "(unknown)",
          sessions: Number(topLandingRow.metricValues?.[0]?.value ?? 0),
        }
      : null;

    // Parse top channel
    const topChannelRow = q3?.rows?.[0];
    const topChannel = topChannelRow
      ? {
          name: topChannelRow.dimensionValues?.[0]?.value ?? "(unknown)",
          sessions: Number(topChannelRow.metricValues?.[0]?.value ?? 0),
        }
      : null;

    const conversionRatePct =
      sessions === 0 ? null : Math.round((keyEvents / sessions) * 1000) / 10; // one decimal

    // Per-day sessions — GA4 returns YYYYMMDD strings which we normalize to
    // YYYY-MM-DD for downstream chart rendering. GA4 may skip days with 0
    // sessions, so we fill in gaps to always have a 7-point series.
    const dayMap = new Map<string, number>();
    for (const row of q4?.rows ?? []) {
      const raw = row.dimensionValues?.[0]?.value ?? "";
      const iso =
        raw.length === 8 ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : raw;
      dayMap.set(iso, Number(row.metricValues?.[0]?.value ?? 0));
    }
    const dailySessions: Array<{ date: string; sessions: number }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
      const iso = toGa4Date(d);
      dailySessions.push({ date: iso, sessions: dayMap.get(iso) ?? 0 });
    }

    // Channel breakdown (top 5)
    const channelBreakdown: Array<{ name: string; sessions: number }> =
      (q5?.rows ?? []).map((row) => ({
        name: row.dimensionValues?.[0]?.value ?? "(unknown)",
        sessions: Number(row.metricValues?.[0]?.value ?? 0),
      }));

    return {
      sessions,
      prevSessions,
      sessionsDeltaPct,
      users,
      keyEvents,
      topLandingPage,
      topChannel,
      conversionRatePct,
      dailySessions,
      channelBreakdown,
    };
  } catch (err) {
    console.warn(
      "[ga4] fetch failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
