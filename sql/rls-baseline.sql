-- ─────────────────────────────────────────────────────────────────────────
-- PLACES · Row Level Security baseline
-- Locked down 2026-06-12. Reproducible + auditable version of what's live.
-- ─────────────────────────────────────────────────────────────────────────
--
-- CONTEXT: policies alone aren't enough on Supabase. The `anon` role
-- inherits table-level grants from `authenticated`, and by default
-- Supabase grants INSERT/UPDATE/DELETE to both. If you only add RLS
-- policies without REVOKEing those grants, anon can still write (RLS
-- checks are bypassed by the base grant on some code paths).
--
-- The fix that actually worked: REVOKE those grants from anon on every
-- table the front-end reads. `anon` keeps SELECT (that's why the site
-- works); writes go exclusively through the service-role key on the
-- server (server/supabase.ts admin client).
--
-- Re-apply this file if you ever migrate Supabase projects or restore
-- from backup. Run against the target project's SQL editor as project
-- owner (not as anon).
--
-- Verify anon actually has no write:
--   SELECT grantee, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE grantee = 'anon' AND table_schema = 'public';
-- Should show only SELECT for the tables below.
--

-- ── Public content tables (SELECT-only for anon) ────────────────────────
-- Anything a visitor sees on the marketing site is SELECT-able but the
-- server writes on their behalf via service role.

REVOKE INSERT, UPDATE, DELETE ON public.listings FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.deals FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.projects FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.client_logos FROM anon;

-- ── Lead + account tables (no anon access at all beyond insert-via-server) ──
-- Server uses service role for all reads/writes. Anon should not be
-- able to read leads even by primary key.

REVOKE ALL ON public.leads FROM anon;
REVOKE ALL ON public.accounts FROM anon;
REVOKE ALL ON public.favorites FROM anon;
REVOKE ALL ON public.calendly_bookings FROM anon;

-- ── Storage ─────────────────────────────────────────────────────────────
-- listings-images bucket: public-READ only.
-- Bucket ACL is set in the Supabase dashboard, not in SQL. Verify:
--   Storage → listings-images → Settings → Public bucket = ON (read only)
--   Policies tab → INSERT policy scoped to service_role only.
