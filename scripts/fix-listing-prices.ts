// Price/currency fixes found on 2026-11-19 (see listing-data-issues.csv).
// Needs sql/listings-outdoor-and-fx.sql applied first (outdoor_area_sqm).
//
// Dry run by default. --apply writes and saves a backup; --revert <file>
// restores it. A row is skipped if its current value no longer matches
// `from` (someone edited it since). updated_at is left alone.
//
//   npx tsx --env-file=.env scripts/fix-listing-prices.ts
//   npx tsx --env-file=.env scripts/fix-listing-prices.ts --apply
//   npx tsx --env-file=.env scripts/fix-listing-prices.ts --revert listing-prices-backup-<ts>.json
import { readFileSync, writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

type Field = "currency" | "area_sqm" | "outdoor_area_sqm" | "price";
type Fix = { id: number; field: Field; from: number | string | null; to: number | string; why: string };

// USD amounts saved as EGP: in every case the description's USD rate × area
// equals the stored price exactly, so only the currency is wrong.
const usd = (id: number, why: string): Fix => ({ id, field: "currency", from: "EGP", to: "USD", why });

const FIXES: Fix[] = [
  usd(844, "description USD 36/m² × 450 m² = 16,200"),
  usd(843, "description $45/m², \"Monthly Rent: $20,250\" = 45 × 450"),
  usd(830, "description USD 52/m² × 403 m² = 20,956"),
  usd(802, "description USD 34/m² × 2,270 m² = 77,180 (outdoor 790 m² at USD 12 not in the price)"),
  usd(688, "description USD 40/m² × 500 m² = 20,000"),
  usd(685, "description USD 25/m² × 500 m² = 12,500"),
  usd(669, "description USD 40/m² × 500 m² = 20,000"),
  usd(641, "description USD 45/m² × 148 m² = 6,660"),
  usd(332, "description USD 40/m² × 800 m² = 32,000"),
  usd(316, "description USD 45/m² × 660 m² = 29,700"),
  usd(429, "description USD 40/m² × 378 m² = 15,120"),
  usd(434, "description USD 30/m² × 60 m² = 1,800"),
  usd(250, "description USD 28/m² × 1,424 m² = 39,872"),
  usd(244, "description USD 18/m² × 1,160 m² = 20,880 (stored 20,990)"),

  // #855: area held the 350 m² outdoor area; the unit is 650 m² + 350 m² outdoor.
  // The PRICE is not changed here: 385,000 = 1,100 × 350, and the right figure
  // depends on how the outdoor area is charged (owner's rule). Set it in the
  // admin once decided (at 1,100/m² indoor only: 715,000).
  { id: 855, field: "area_sqm", from: 350, to: 650, why: "title/description: 650 m² indoor" },
  { id: 855, field: "outdoor_area_sqm", from: null, to: 350, why: "title/description: + 350 m² outdoor" },
];

// Shown in the dry run for a person to decide; never applied by this script.
const REVIEW = [
  "#49: price 2,355,000 EGP = USD 30/m² × 1,570 m² converted at 50 EGP/$ by hand. Original quote: USD 47,100/month. Set currency USD + price 47,100 if the landlord quotes USD.",
  "#50: price 2,749,991 EGP ≈ USD 55/m² × 1,000 m² converted at ~50 by hand. Original quote: USD 55,000/month.",
  "#855: price 385,000 is 1,100 × 350 (the outdoor area). Needs the owner's outdoor pricing rule.",
  "#773, #512, #346, #144, #602, #491, #289, #511: price impossible for the area (see listing-data-issues.csv). Check against the landlord's quote.",
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

  const ids = Array.from(new Set(FIXES.map((f) => f.id)));
  const { data, error } = await db.from("listings").select("id,currency,area_sqm,outdoor_area_sqm,price").in("id", ids);
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
  console.log(`\n${todo.length} change(s) on ${new Set(todo.map((f) => f.id)).size} listing(s) ${apply ? "to write" : "(dry run; pass --apply)"}`);
  console.log("\nFor a person to decide (not changed by this script):");
  for (const r of REVIEW) console.log(`  - ${r}`);
  if (!apply || todo.length === 0) return;

  const backup = `listing-prices-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(backup, JSON.stringify(todo.map((f) => ({ id: f.id, field: f.field, value: f.from })), null, 2));
  console.log(`\nbackup: ${backup}`);
  for (const f of todo) {
    const { error: e } = await db.from("listings").update({ [f.field]: f.to }).eq("id", f.id);
    console.log(`#${f.id} ${f.field} ${e ? `FAILED ${e.message}` : "updated"}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
