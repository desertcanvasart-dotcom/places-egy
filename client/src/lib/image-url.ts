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

export type ImageVariant = "thumb" | "card" | "full";

const VARIANT_PRESETS: Record<ImageVariant, { width: number; quality: number }> = {
  thumb: { width: 200, quality: 70 },
  card: { width: 800, quality: 75 },
  full: { width: 1600, quality: 80 },
};

export function supabaseImage(url: string, variant: ImageVariant = "card"): string {
  if (!url) return url;
  const idx = url.indexOf(SUPABASE_OBJECT_PATH);
  if (idx === -1) return url;
  const preset = VARIANT_PRESETS[variant];
  const rendered =
    url.slice(0, idx) +
    SUPABASE_RENDER_PATH +
    url.slice(idx + SUPABASE_OBJECT_PATH.length);
  const sep = rendered.includes("?") ? "&" : "?";
  return `${rendered}${sep}width=${preset.width}&quality=${preset.quality}&resize=cover`;
}

// onError handler for <img> tags using supabaseImage(). If the render endpoint
// returns 4xx (e.g. Supabase project is on Free tier without Image Transforms),
// fall back to the original object URL so the user still sees the image. The
// data-fell-back attribute prevents an infinite loop if the original also fails.
export function supabaseImageOnError(originalUrl: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fellBack === "true") return;
    img.dataset.fellBack = "true";
    img.src = originalUrl;
  };
}

