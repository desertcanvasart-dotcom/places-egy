import rateLimit from "express-rate-limit";

// Global limiter for all /api/* routes. Generous ceiling — protects upstream
// (WordPress proxy, future Supabase calls) from runaway clients and basic abuse
// without affecting normal browsing.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, please try again shortly." },
});

// Strict limiter reserved for public write endpoints (contact forms, lead
// capture, chatbot) where the caller could be anyone. Mount per-route.
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, please try again shortly." },
});

// Admin write limiter — used on /api/admin/* endpoints. Still bounded so a
// compromised session can't scan/mass-mutate, but generous enough that a
// human clicking through the dashboard (editing a listing, re-pinning a
// project, updating lead statuses) doesn't hit the ceiling. The 5/min
// strictLimiter previously mounted here was ergonomic hostility, not
// security — the admin password already gates every call.
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many admin requests — pause 60 seconds." },
});

// Upload limiter for admin image uploads. A listing can legitimately have many
// images, each uploaded as its own request, so the tight strictLimiter (5/min)
// would wrongly block a normal multi-image upload at the 6th file. Generous
// ceiling, still admin-gated, still bounded against runaway abuse.
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many uploads, please try again shortly." },
});
