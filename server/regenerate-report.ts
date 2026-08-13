import type { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "crypto";
import { buildPdf } from "../script/generate-market-report";

// POST /api/admin/regenerate-market-report
//
// Regenerates the Cairo Office Market Report PDF from live listings and
// uploads it to Supabase Storage (same URL as the manual `npm run
// generate-market-report` command).
//
// Called by:
//   1. External cron scheduler (e.g. cron-job.org, Railway Cron Jobs, or any
//      cron-as-a-service) hitting POST /api/admin/regenerate-market-report
//      on the 1st of every month at 00:05 UTC (schedule "5 0 1 * *") with
//      header `x-cron-token: <CRON_TOKEN>`.
//   2. Or manually with:
//        curl -X POST -H "x-cron-token: $CRON_TOKEN" \
//          https://places-egy.com/api/admin/regenerate-market-report
//
// Auth: shared secret via `x-cron-token` header — matches CRON_TOKEN env var.
// Separate from the human admin password so the cron doesn't need OAuth /
// interactive login. Constant-time compare against timing attacks.

const CRON_TOKEN = process.env.CRON_TOKEN;

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function regenerateMarketReportHandler(
  req: Request,
  res: Response,
): Promise<void> {
  if (!CRON_TOKEN) {
    res
      .status(503)
      .json({ message: "CRON_TOKEN env var not configured — cron disabled." });
    return;
  }
  const provided = req.header("x-cron-token");
  if (!provided || !safeEqual(provided, CRON_TOKEN)) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const started = Date.now();
  try {
    console.log("[cron] regenerating market report…");
    const buffer = await buildPdf();
    const bucket = process.env.MARKET_REPORT_BUCKET ?? "market-reports";
    const filename = "cairo-office-market-report-2026.pdf";
    const supabaseUrl =
      process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL!;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.VITE_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: true,
      });
    if (error) {
      console.error("[cron] upload failed:", error.message);
      res.status(500).json({ message: `Upload failed: ${error.message}` });
      return;
    }
    const elapsed = Date.now() - started;
    console.log(
      `[cron] regenerated market report (${(buffer.length / 1024).toFixed(1)} KB) in ${elapsed}ms`,
    );
    res.json({
      ok: true,
      sizeKb: Math.round(buffer.length / 1024),
      elapsedMs: elapsed,
      filename,
      bucket,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron] regenerate failed:", err);
    res
      .status(500)
      .json({ message: `Regenerate failed: ${(err as Error).message}` });
  }
}
