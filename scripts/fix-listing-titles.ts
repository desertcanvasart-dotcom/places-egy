// Strips Markdown (leading #, *, `, ~, stray | separators) from listing titles.
// Dry run by default (Markdown titles only; --all includes stray "|"). --apply writes and saves a backup; --revert <file> restores it.
// Only the title column changes (updated_at is left alone, so order is unchanged).
//
//   npx tsx --env-file=.env scripts/fix-listing-titles.ts
//   npx tsx --env-file=.env scripts/fix-listing-titles.ts --apply
//   npx tsx --env-file=.env scripts/fix-listing-titles.ts --revert listing-title-backup-<ts>.json
import { readFileSync, writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { cleanListingTitle } from "../client/src/lib/listing-text";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
const db = createClient(url, key);

async function revert(file: string) {
  const rows = JSON.parse(readFileSync(file, "utf8")) as Array<{ id: number; title: string }>;
  for (const r of rows) {
    const { error } = await db.from("listings").update({ title: r.title }).eq("id", r.id);
    console.log(`#${r.id} ${error ? `FAILED ${error.message}` : "restored"}`);
  }
}

async function main() {
  const revertIdx = process.argv.indexOf("--revert");
  if (revertIdx !== -1) return revert(process.argv[revertIdx + 1]);
  const apply = process.argv.includes("--apply");
  // Default scope: Markdown titles only (leading #, *, `, ~). --all also trims stray "|" separators.
  const all = process.argv.includes("--all");
  const hasMarkdown = (t: string) => /^\s*#|[*`~]/.test(t);

  const { data, error } = await db.from("listings").select("id,title").order("id");
  if (error) throw error;
  const changes = (data as Array<{ id: number; title: string | null }>)
    .map((r) => ({ id: r.id, before: r.title ?? "", after: cleanListingTitle(r.title ?? "") }))
    .filter((r) => r.after && r.after !== r.before && (all || hasMarkdown(r.before)));

  for (const c of changes) console.log(`#${c.id}\n  before: ${c.before}\n  after:  ${c.after}`);
  console.log(`${changes.length} title(s) ${apply ? "to update" : "would change (dry run; pass --apply)"}`);
  if (!apply || changes.length === 0) return;

  const backup = `listing-title-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(backup, JSON.stringify(changes.map((c) => ({ id: c.id, title: c.before })), null, 2));
  console.log(`backup: ${backup}`);
  for (const c of changes) {
    const { error: e } = await db.from("listings").update({ title: c.after }).eq("id", c.id);
    console.log(`#${c.id} ${e ? `FAILED ${e.message}` : "updated"}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
