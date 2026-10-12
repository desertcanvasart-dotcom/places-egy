import type React from "react";

// Supabase Storage serves files from /storage/v1/object/public/<bucket>/<path>.
// The image-transformation endpoint lives at /storage/v1/render/image/public/...
// and accepts ?width=&height=&quality=&resize= for edge-resized output.
//
// We rewrite Supabase Storage URLs to use the render endpoint so listing
// thumbnails don't ship the original (often multi-MB phone photo) to every
// card view. Non-Supabase URLs (fallback Unsplash, /public images) are passed
// through unchanged.

const SUPABASE_OBJECT_PATH = "/storage/v1/object/public/";
const SUPABASE_RENDER_PATH = "/storage/v1/render/image/public/";

// Toggle this to `true` once the Supabase project is on the Pro plan (Image
// Transformations are gated behind Pro). On the Free plan the render endpoint
// returns 400/403, which forces an onError → original-URL swap on every image
// and also breaks carousels (the per-element "already fell back" guard sticks
// across src changes when React reuses the same <img> node). Until then we
// just serve the original object URL directly — same outcome, one fewer
// round-trip per image, and carousels work normally.
//
// TURNED BACK ON 2026-09-07 — user upgraded Supabase to Pro plan. Now the
// render endpoint serves optimized WebP/AVIF at exact requested widths,
// dropping 2-5MB phone photos to ~50-200KB per image. Real speed win over
// serving originals. If the render endpoint ever starts returning 4xx
// again, the onError fallback in components will still serve the raw file.
const IMAGE_TRANSFORMS_ENABLED = true;

export type ImageVariant = "thumb" | "card" | "full";

const VARIANT_PRESETS: Record<ImageVariant, { width: number; quality: number }> = {
  thumb: { width: 200, quality: 70 },
  card: { width: 800, quality: 75 },
  full: { width: 1600, quality: 80 },
};

export function supabaseImage(url: string, variant: ImageVariant = "card"): string {
  if (!url) return url;
  if (!IMAGE_TRANSFORMS_ENABLED) return url;
  const idx = url.indexOf(SUPABASE_OBJECT_PATH);
  if (idx === -1) return url;
  const preset = VARIANT_PRESETS[variant];
  const rendered =
    url.slice(0, idx) +
    SUPABASE_RENDER_PATH +
    url.slice(idx + SUPABASE_OBJECT_PATH.length);
  const sep = rendered.includes("?") ? "&" : "?";
  // format=webp drops ~30-40% size vs JPEG at same quality. Supabase
  // falls back to JPEG for browsers that don't support WebP (basically
  // just IE11, <1% of traffic). Modern browsers get WebP.
  return `${rendered}${sep}width=${preset.width}&quality=${preset.quality}&resize=cover&format=webp`;
}

// onError handler for <img> tags using supabaseImage(). If the render endpoint
// returns 4xx (e.g. Supabase project is on Free tier without Image Transforms),
// fall back to the original object URL so the user still sees the image. The
// data-fell-back attribute prevents an infinite loop if the original also
// fails — and is reset when the src prop changes so it doesn't stick across
// carousel slides that reuse the same <img> element.
export function supabaseImageOnError(originalUrl: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fellBackFor === originalUrl) return;
    img.dataset.fellBackFor = originalUrl;
    img.src = originalUrl;
  };
}

