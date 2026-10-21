import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";

// Pre-sized WebP copies stored next to each listing photo, so the site never
// needs Supabase's billed on-the-fly Image Transformations.
// Widths/qualities mirror VARIANT_PRESETS in client/src/lib/image-url.ts.
export const IMAGE_VARIANTS = [
  { suffix: "w200", width: 200, quality: 70 },
  { suffix: "w800", width: 800, quality: 75 },
  { suffix: "w1600", width: 1600, quality: 80 },
] as const;

// "1780401607100-1drl6d.jpeg" -> "1780401607100-1drl6d.w800.webp"
export function variantName(original: string, suffix: string): string {
  return original.replace(/\.[^./]+$/, "") + `.${suffix}.webp`;
}

export function isVariantName(name: string): boolean {
  return /\.w\d+\.webp$/.test(name);
}

// Uploads all variants for one original. Never throws: a missing variant just
// makes the site fall back to the original photo.
export async function uploadVariants(
  client: SupabaseClient,
  bucket: string,
  originalName: string,
  buffer: Buffer,
): Promise<{ ok: number; failed: number }> {
  let ok = 0;
  let failed = 0;
  for (const v of IMAGE_VARIANTS) {
    try {
      const out = await sharp(buffer)
        .rotate() // apply EXIF orientation from phone photos
        .resize({ width: v.width, withoutEnlargement: true })
        .webp({ quality: v.quality })
        .toBuffer();
      // Storage rate-limits bursts (429); back off and retry a few times.
      for (let attempt = 1; ; attempt++) {
        const { error } = await client.storage
          .from(bucket)
          .upload(variantName(originalName, v.suffix), out, {
            contentType: "image/webp",
            cacheControl: "31536000",
            upsert: true,
          });
        if (!error) break;
        if (attempt >= 5 || !/429|too many/i.test(String((error as { statusCode?: string }).statusCode ?? error.message))) {
          throw error;
        }
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
      ok++;
    } catch (err) {
      failed++;
      console.warn(`[image-variants] ${originalName} ${v.suffix} failed:`, err);
    }
  }
  return { ok, failed };
}
