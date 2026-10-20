-- Records when each listing is published. Older rows stay NULL (no record of
-- their creation time); every new listing gets now() from the default.
-- The column is added WITHOUT a default first so existing rows aren't stamped
-- with today's date.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS created_at timestamptz;

-- Listings already added today (before this column existed): take the publish
-- time from their earliest photo upload (filenames are <unix-ms>-<rand>.<ext>).
UPDATE public.listings l
SET created_at = to_timestamp(sub.ms / 1000.0)
FROM (
  SELECT id, min(m[1]::bigint) AS ms
  FROM public.listings, regexp_matches(images::text, '/(\d{13})-[a-z0-9]{6}\.', 'g') AS m
  GROUP BY id
) sub
WHERE l.id = sub.id
  AND l.created_at IS NULL
  AND to_timestamp(sub.ms / 1000.0) >= '2026-10-20 00:00:00+03'::timestamptz;

ALTER TABLE public.listings
  ALTER COLUMN created_at SET DEFAULT now();
