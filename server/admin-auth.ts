import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.warn(
    "[admin-auth] ADMIN_PASSWORD not set — admin endpoints will return 503 until configured.",
  );
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// Middleware that gates admin endpoints behind an x-admin-password header.
// Constant-time compare to avoid timing attacks. 503 if no password configured.
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ message: "Admin auth not configured" });
  }
  const provided = req.header("x-admin-password");
  if (!provided || !safeEqual(provided, ADMIN_PASSWORD)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
