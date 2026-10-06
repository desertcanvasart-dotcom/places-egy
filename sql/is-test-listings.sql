-- Adds an `is_test` flag so admin can mark listings as test — hidden from the
-- public site, the sitemap, and prerendered pages (Google) — without a
-- delete/soft-404 cycle in GSC. Default false preserves existing rows.
--
-- Run this once in the Supabase SQL editor BEFORE the next deploy, otherwise
-- saves from /dashboard will fail (the column won't exist yet).

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS listings_is_test_idx ON public.listings(is_test);
