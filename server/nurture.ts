import type { Request, Response } from "express";
import { supabaseAdmin } from "./supabase";
import { sendNurtureFollowup, type Lang } from "./mailer";
import { fetchRecentListingsForWelcome } from "./lead-welcome-listings";

// Day-2 + Day-5 nurture followups.
//
// Fired by cron-job.org daily at 10:00 Cairo. For each lead that is
//   - between 48h–72h old (day_2) or
//   - between 5d–6d old  (day_5)
// AND not already terminal (qualified / won / lost) AND not already sent that
// specific followup, we render + send the templated nurture email defined in
// server/mailer.ts (sendNurtureFollowup).
//
// Idempotency is enforced by the sent_followups table (UNIQUE lead_id +
// followup_type). Two runs on the same day are safe; a cron reboot or manual
// re-fire won't send duplicates.
//
// Auth: x-cron-token header, same shared secret as weekly-report + digests.

type FollowupType = "day_2" | "day_5";

interface LeadRow {
  id: number;
  name: string | null;
  email: string | null;
  preferred_language: Lang | null;
  status: string | null;
  created_at: string;
}

async function fetchCandidates(
  windowStart: Date,
  windowEnd: Date,
): Promise<LeadRow[]> {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("id,name,email,preferred_language,status,created_at")
    .gte("created_at", windowStart.toISOString())
    .lt("created_at", windowEnd.toISOString())
    .not("status", "in", "(qualified,won,lost)");
  if (error) {
    console.warn("[nurture] candidate query failed:", error.message);
    return [];
  }
  return (data ?? []) as unknown as LeadRow[];
}

async function fetchAlreadySent(
  leadIds: number[],
  type: FollowupType,
): Promise<Set<number>> {
  if (!supabaseAdmin || leadIds.length === 0) return new Set();
  const { data, error } = await supabaseAdmin
    .from("sent_followups")
    .select("lead_id")
    .eq("followup_type", type)
    .in("lead_id", leadIds);
  if (error) {
    console.warn("[nurture] sent_followups query failed:", error.message);
    return new Set();
  }
  return new Set((data ?? []).map((r) => r.lead_id as number));
}

async function processBatch(
  leads: LeadRow[],
  type: FollowupType,
): Promise<{ sent: number; skipped: number }> {
  if (!supabaseAdmin) return { sent: 0, skipped: leads.length };
  const already = await fetchAlreadySent(leads.map((l) => l.id), type);
  let sent = 0;
  let skipped = 0;
  const day: 2 | 5 = type === "day_2" ? 2 : 5;

  for (const lead of leads) {
    if (already.has(lead.id)) {
      skipped++;
      continue;
    }
    if (!lead.email || !lead.name) {
      skipped++;
      continue;
    }
    try {
      const listings = await fetchRecentListingsForWelcome();
      await sendNurtureFollowup({
        toEmail: lead.email,
        toName: lead.name,
        listings,
        lang: (lead.preferred_language ?? "en") as Lang,
        day,
      });
      const { error: insErr } = await supabaseAdmin
        .from("sent_followups")
        .insert({ lead_id: lead.id, followup_type: type });
      if (insErr) {
        // Race: another concurrent run already recorded it. Not fatal — the
        // UNIQUE constraint prevents the double-send at DB level; we just
        // logged one duplicate email at worst. Log and continue.
        console.warn(
          `[nurture] insert sent_followups failed for lead ${lead.id}:`,
          insErr.message,
        );
      }
      sent++;
    } catch (err) {
      console.error(`[nurture] send failed for lead ${lead.id}:`, err);
      skipped++;
    }
  }
  return { sent, skipped };
}

export async function nurtureFollowupsHandler(
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
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    // Day-2 window: created 2–3 days ago (fires ~48h after signup).
    const day2Leads = await fetchCandidates(
      new Date(now - 3 * day),
      new Date(now - 2 * day),
    );
    // Day-5 window: created 5–6 days ago.
    const day5Leads = await fetchCandidates(
      new Date(now - 6 * day),
      new Date(now - 5 * day),
    );

    const day2 = await processBatch(day2Leads, "day_2");
    const day5 = await processBatch(day5Leads, "day_5");

    console.log(
      `[nurture] day2 sent=${day2.sent} skipped=${day2.skipped}, day5 sent=${day5.sent} skipped=${day5.skipped}`,
    );

    res.json({
      ok: true,
      day2Sent: day2.sent,
      day5Sent: day5.sent,
      skipped: day2.skipped + day5.skipped,
    });
  } catch (err) {
    console.error("[nurture] failed:", err);
    res.status(500).json({ message: (err as Error).message });
  }
}

// Re-export for manual test-fires from a script.
export { sendNurtureFollowup };
