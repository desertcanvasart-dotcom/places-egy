import type { Request, Response, NextFunction } from "express";
import { randomBytes, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "./supabase";

// Cookie-based account sessions. On signup we mint a random 32-byte token,
// store it on the account row, and set an httpOnly cookie. Subsequent
// requests present the cookie; middleware looks up the account and attaches
// it to req. No JWT, no OAuth, no password reset flow — this is a lead
// capture form disguised as an account.

const COOKIE_NAME = "places_session";
const COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function setSessionCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function readSessionCookie(req: Request): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE_NAME) return decodeURIComponent(rest.join("="));
  }
  return null;
}

// Constant-time string compare — protects the token lookup against timing
// attacks even though the fetch itself would leak little info here.
export function safeTokenEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export type SessionAccount = {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
};

// Loads the current session's account, or null. Never throws — a bad cookie
// just returns null so the caller can decide whether to prompt signup.
export async function getSessionAccount(
  req: Request,
): Promise<SessionAccount | null> {
  if (!supabaseAdmin) return null;
  const token = readSessionCookie(req);
  if (!token || token.length !== 64) return null;
  const { data, error } = await supabaseAdmin
    .from("accounts")
    .select("id,name,email,phone,created_at,session_token")
    .eq("session_token", token)
    .maybeSingle();
  if (error || !data) return null;
  if (!safeTokenEqual(String(data.session_token ?? ""), token)) return null;
  // Fire-and-forget last_active_at bump so we can show "active X ago" in
  // the admin dashboard.
  void supabaseAdmin
    .from("accounts")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", data.id);
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    created_at: data.created_at,
  };
}

// Middleware that gates a route behind a valid session cookie. Attaches
// req.account (typed via module augmentation below).
export async function requireAccount(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const account = await getSessionAccount(req);
  if (!account) {
    return res.status(401).json({ message: "Sign in to continue" });
  }
  (req as Request & { account: SessionAccount }).account = account;
  next();
}
