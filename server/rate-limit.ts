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

// Strict limiter reserved for future write endpoints (contact forms, lead
// capture, chatbot). Mount per-route, not globally.
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, please try again shortly." },
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
