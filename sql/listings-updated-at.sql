-- Adds listings.updated_at so an edited listing sorts to the top like a new one.
-- Backfill keeps today's order (newest id first): each row gets now() minus one
-- minute per id below the max. Run BEFORE deploying the code that orders by it.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE public.listings
SET updated_at = now() - ((SELECT max(id) FROM public.listings) - id) * interval '1 minute'
WHERE updated_at IS NULL;

ALTER TABLE public.listings
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS listings_updated_at_idx ON public.listings (updated_at DESC);
