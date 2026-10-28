// One-off fixes for area / price-per-m² / condition conflicts found by
// scripts/validate-listings.ts. Each fix was checked against the title, the
// description and price ÷ price_per_meter. Conflicting cases are NOT here
// (left for a human).
//
// Dry run by default. --apply writes and saves a backup; --revert <file> restores it.
// A row is skipped if its current value no longer matches `from` (someone edited it).
// updated_at is left alone, so listing order doesn't change.
//
//   npx tsx --env-file=.env scripts/fix-listing-data.ts
//   npx tsx --env-file=.env scripts/fix-listing-data.ts --apply
//   npx tsx --env-file=.env scripts/fix-listing-data.ts --revert listing-data-backup-<ts>.json
import { readFileSync, writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

type Field = "area_sqm" | "price_per_meter" | "furnishing";
type Fix = { id: number; field: Field; from: number | string | null; to: number | string; why: string };

const FIXES: Fix[] = [
  // Area missing or 0: title + description agree, and price ÷ price/m² confirms where set.
  { id: 147, field: "area_sqm", from: null, to: 557, why: "title/description 557 SQM (+150 outdoor); 891,000 ÷ 557 = 1,600/m²" },
  { id: 175, field: "area_sqm", from: 0, to: 340, why: "title/description 340 SQM; 82.5M ÷ 242,000 = 341" },
  { id: 189, field: "area_sqm", from: 0, to: 110, why: "title/description 110 SQM; 17.6M ÷ 160,000 = 110" },
  { id: 191, field: "area_sqm", from: 0, to: 118, why: "title/description 118 SQM; 21.24M ÷ 180,000 = 118" },
  { id: 196, field: "area_sqm", from: null, to: 166, why: "title/description 166 SQM indoor (+55 outdoor)" },
  { id: 233, field: "area_sqm", from: null, to: 632, why: "title/description 632 SQM (+32); 884,000 ÷ 1,400 = 631" },
  { id: 318, field: "area_sqm", from: 0, to: 700, why: "title/description 700 SQM; 700,000 ÷ 1,000 = 700" },
  { id: 325, field: "area_sqm", from: 0, to: 3800, why: "title/description 3,800 SQM; 5.7M ÷ 1,500 = 3,800" },
  { id: 330, field: "area_sqm", from: 0, to: 800, why: "title/description 800 SQM; 24,000 ÷ 30 = 800" },
  { id: 344, field: "area_sqm", from: null, to: 2270, why: "title/description 2,270 SQM indoor (+790 outdoor); 77,180 ÷ 34 = 2,270" },
  // Implausible areas (typos)
  { id: 197, field: "area_sqm", from: 3, to: 168, why: "title/description 168 SQM indoor (+78 terrace)" },
  { id: 313, field: "area_sqm", from: 6000000, to: 6000, why: "title/description 6,000 SQM; 850M ÷ 141,000 = 6,028" },
  { id: 549, field: "area_sqm", from: 7, to: 107, why: "title/description 107 SQM; 149,800 ÷ 1,400 = 107" },
  // Title size ≠ area field: title + description + price ÷ price/m² all agree on the title's size.
  { id: 148, field: "area_sqm", from: 62, to: 63, why: "title/description 63 SQM; 82,000 ÷ 1,300 = 63" },
  { id: 281, field: "area_sqm", from: 500, to: 3000, why: "title/description 3,000 SQM (\"T&R Hub 500\" is the project name)" },
  { id: 281, field: "price_per_meter", from: 3000, to: 1200, why: "3.6M ÷ 3,000 SQM = 1,200/m² (the field held the area)" },
  { id: 283, field: "area_sqm", from: 1340, to: 1345, why: "title/description 1,345 SQM; 1,614,000 ÷ 1,200 = 1,345" },
  { id: 288, field: "area_sqm", from: 1800, to: 1846, why: "title/description 1,846 SQM; 300M ÷ 162,000 = 1,852" },
  { id: 298, field: "area_sqm", from: 360, to: 370, why: "title/description 370 SQM; 684,500 ÷ 1,850 = 370" },
  { id: 314, field: "area_sqm", from: 634, to: 639, why: "title/description 639 SQM; 1,405,000 ÷ 2,200 = 639" },
  { id: 334, field: "area_sqm", from: 800, to: 850, why: "title/description 850 SQM; 1,190,000 ÷ 1,400 = 850" },
  { id: 339, field: "area_sqm", from: 2000, to: 1500, why: "title/description 1,500 SQM; 3M ÷ 2,000 = 1,500" },
  { id: 345, field: "area_sqm", from: 2200, to: 2300, why: "title/description 2,300 SQM; 73,600 ÷ 32 = 2,300" },
  { id: 371, field: "area_sqm", from: 33, to: 560, why: "title/description 560 SQM; 18,480 ÷ 33 = 560 (the field held the price/m²)" },
  { id: 376, field: "area_sqm", from: 630, to: 680, why: "title/description 680 SQM; 900,000 ÷ 1,324 = 680" },
  { id: 439, field: "area_sqm", from: 94, to: 64, why: "title/description 64 SQM; 86,000 ÷ 1,300 = 66 (94 would be 122,200)" },
  { id: 455, field: "area_sqm", from: 4200, to: 4300, why: "title/description 4,300 SQM; 5,160,000 ÷ 1,200 = 4,300" },
  { id: 534, field: "area_sqm", from: 1300, to: 1315, why: "title/description 1,315 SQM; 23,670 ÷ 18 = 1,315" },
  { id: 542, field: "area_sqm", from: 950, to: 960, why: "title/description 960 SQM; 1,056,000 ÷ 1,100 = 960" },
  { id: 571, field: "area_sqm", from: 154, to: 140, why: "title/description 140 SQM; 154,000 ÷ 1,100 = 140" },
  { id: 572, field: "area_sqm", from: 134, to: 138, why: "title/description 138 SQM; 179,000 ÷ 1,300 = 138" },
  { id: 573, field: "area_sqm", from: 630, to: 680, why: "title/description 680 SQM; 159.8M ÷ 235,000 = 680" },
  { id: 579, field: "area_sqm", from: 480, to: 400, why: "title/description 400 SQM; 480,000 ÷ 1,200 = 400" },
  // Condition
  { id: 571, field: "furnishing", from: "finished", to: "semi-finished", why: "title and description say White Box" },
  // "Finished after N months": condition = what the tenant receives (approved 2026-10-28; #334 already did this).
  { id: 161, field: "furnishing", from: "semi-finished", to: "fully-finished", why: "title: Fully Finished After 3 Months" },
  { id: 224, field: "furnishing", from: "semi-finished", to: "finished", why: "title: Finished After 4 Months" },
  { id: 229, field: "furnishing", from: "semi-finished", to: "finished", why: "title: Finished After 3 Months" },
  { id: 285, field: "furnishing", from: "semi-finished", to: "finished", why: "title: Finished After 3 Weeks" },
];

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
const db = createClient(url, key);

const same = (a: unknown, b: unknown) =>
  (a == null && b == null) || (a != null && b != null && String(a) === String(b));

async function revert(file: string) {
  const rows = JSON.parse(readFileSync(file, "utf8")) as Array<{ id: number; field: Field; value: unknown }>;
  for (const r of rows) {
    const { error } = await db.from("listings").update({ [r.field]: r.value }).eq("id", r.id);
    console.log(`#${r.id} ${r.field} ${error ? `FAILED ${error.message}` : `restored to ${r.value}`}`);
  }
}

async function main() {
  const revertIdx = process.argv.indexOf("--revert");
  if (revertIdx !== -1) return revert(process.argv[revertIdx + 1]);
  const apply = process.argv.includes("--apply");

  const ids = [...new Set(FIXES.map((f) => f.id))];
  const { data, error } = await db.from("listings").select("id,area_sqm,price_per_meter,furnishing").in("id", ids);
  if (error) throw error;
  const byId = new Map((data as Array<Record<string, unknown> & { id: number }>).map((r) => [r.id, r]));

  const todo: Fix[] = [];
  for (const f of FIXES) {
    const row = byId.get(f.id);
    const current = row?.[f.field] ?? null;
    if (!row) console.log(`#${f.id} SKIP: listing not found`);
    else if (same(current, f.to)) console.log(`#${f.id} ${f.field}: already ${f.to}`);
    else if (!same(current, f.from)) console.log(`#${f.id} ${f.field}: SKIP, now ${current} (expected ${f.from}); edited since the report`);
    else {
      console.log(`#${f.id} ${f.field}: ${f.from ?? "empty"} -> ${f.to}   (${f.why})`);
      todo.push(f);
    }
  }
  console.log(`${todo.length} change(s) on ${new Set(todo.map((f) => f.id)).size} listing(s) ${apply ? "to write" : "(dry run; pass --apply)"}`);
  if (!apply || todo.length === 0) return;

  const backup = `listing-data-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(backup, JSON.stringify(todo.map((f) => ({ id: f.id, field: f.field, value: f.from })), null, 2));
  console.log(`backup: ${backup}`);
  for (const f of todo) {
    const { error: e } = await db.from("listings").update({ [f.field]: f.to }).eq("id", f.id);
    console.log(`#${f.id} ${f.field} ${e ? `FAILED ${e.message}` : "updated"}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
