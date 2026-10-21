// One-off (re-runnable): create w200/w800/w1600 WebP variants for every listing
// photo that doesn't have them yet. Usage: npx tsx --env-file=.env script/backfill-image-variants.ts
import { createClient } from "@supabase/supabase-js";
import { IMAGE_VARIANTS, isVariantName, uploadVariants, variantName } from "../server/image-variants";

const BUCKET = "listings-images";
const CONCURRENCY = Number(process.env.CONCURRENCY) || 6;

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
const client = createClient(url, key);

async function listAll(): Promise<string[]> {
  const names: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.storage.from(BUCKET).list("", {
      limit: 1000,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    names.push(...data.filter((f) => f.id).map((f) => f.name));
    if (data.length < 1000) break;
  }
  return names;
}

const all = await listAll();
const existing = new Set(all);
const todo = all
  .filter((n) => !isVariantName(n) && IMAGE_VARIANTS.some((v) => !existing.has(variantName(n, v.suffix))))
  .slice(0, Number(process.env.LIMIT) || undefined);
console.log(`${all.length} objects, ${all.filter((n) => !isVariantName(n)).length} originals, ${todo.length} need variants`);

let done = 0;
let failed = 0;
async function worker() {
  for (let name = todo.shift(); name; name = todo.shift()) {
    let { data, error } = await client.storage.from(BUCKET).download(name);
    for (let attempt = 1; error && attempt <= 4; attempt++) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      ({ data, error } = await client.storage.from(BUCKET).download(name));
    }
    if (error || !data) {
      failed++;
      console.warn(`download failed: ${name}`, error);
      continue;
    }
    const r = await uploadVariants(client, BUCKET, name, Buffer.from(await data.arrayBuffer()));
    if (r.failed) failed++;
    if (++done % 100 === 0) console.log(`${done} done, ${failed} with failures`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`finished: ${done} processed, ${failed} with failures`);
