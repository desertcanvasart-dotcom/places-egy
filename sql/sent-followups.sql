-- Idempotency ledger for nurture followup emails.
-- One row per (lead, followup_type) — the UNIQUE constraint guarantees we
-- never send the same day-2 or day-5 email twice, even if the cron runs
-- multiple times per day or a lead sits in the send window across ticks.
--
-- Run manually in Supabase SQL editor BEFORE enabling the
-- /api/admin/send-nurture-followups cron. Safe to re-run (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS public.sent_followups (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  followup_type TEXT NOT NULL CHECK (followup_type IN ('day_2', 'day_5')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lead_id, followup_type)
);

REVOKE ALL ON public.sent_followups FROM anon;
