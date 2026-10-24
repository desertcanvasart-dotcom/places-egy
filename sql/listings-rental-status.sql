-- Rental availability for listings (PLACES shows a "Rented" badge; Hotdesk
-- mirrors it). rental_end NULL while rented = "date to be confirmed".
-- Run BEFORE deploying the code that reads these columns.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS rental_status text NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS rental_start date,
  ADD COLUMN IF NOT EXISTS rental_end date;

ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_rental_status_check;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_rental_status_check
  CHECK (rental_status IN ('available', 'rented'));

ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_rental_dates_check;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_rental_dates_check
  CHECK (rental_end IS NULL OR rental_start IS NULL OR rental_end >= rental_start);

CREATE INDEX IF NOT EXISTS listings_rental_status_idx ON public.listings (rental_status);
