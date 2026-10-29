// Data-quality rules for listings. Used by scripts/validate-listings.ts (report)
// and the admin form (warnings before save). Keep free of "@/" imports.

export interface CheckableListing {
  id?: number;
  title?: string | null;
  description?: string | null;
  area_sqm?: number | null;
  furnishing?: string | null;
  maintenance_status?: string | null;
  maintenance_fees?: number | null;
  currency?: string | null;
}

export interface ListingIssue {
  rule: string;
  field: string;
  current: string;
  conflicting: string;
  fix: string;
}

const AREA_MIN = 10;
const AREA_MAX = 50_000;

// "1,080 SQM", "600meter", "233 m²", "500 - 4,500 SQM" -> [1080], [600], [233], [500, 4500]
export function titleSizes(title: string): number[] {
  const sizes: number[] = [];
  const unit = String.raw`(?:sq\.?\s*m|sqm|m²|m2|square\s*met(?:er|re)s?|met(?:er|re)s?)(?![a-z])`;
  const range = new RegExp(String.raw`(\d[\d,.]*)\s*(?:-|–|to)\s*(\d[\d,.]*)\s*${unit}`, "gi");
  const single = new RegExp(String.raw`(\d[\d,.]*)\s*${unit}`, "gi");
  const num = (s: string) => Number(s.replace(/,/g, ""));
  let rest = title;
  for (const m of Array.from(title.matchAll(range))) {
    sizes.push(num(m[1]), num(m[2]));
    rest = rest.replace(m[0], " ");
  }
  for (const m of Array.from(rest.matchAll(single))) sizes.push(num(m[1]));
  return sizes.filter((n) => Number.isFinite(n) && n > 0);
}

const UNFINISHED_IN_TITLE = /\b(white\s*box|core\s*(?:&|and)\s*shell|semi[\s-]*finished)\b/i;
const FINISHED_IN_TITLE = /\b(fully\s*finished|finished|furnished|fully\s*furnished)\b/i;
const FINISHED_VALUES = new Set(["finished", "fully-finished", "furnished", "serviced"]);
const UNFINISHED_VALUES = new Set(["core-shell", "semi-finished"]);
const CONDITION_LABEL: Record<string, string> = {
  "core-shell": "Core & Shell",
  "semi-finished": "Semi-Finished",
  finished: "Finished",
  "fully-finished": "Fully Finished",
  furnished: "Furnished",
  serviced: "Serviced",
};

// A maintenance charge stated in the description, e.g. "Maintenance: EGP 120 / sqm".
const MAINTENANCE_CHARGE =
  /maintenance[^.\n]{0,60}?(?:\d[\d,.]*\s*(?:egp|usd|le|l\.e|%|\/\s*(?:sqm|m))|(?:egp|usd)\s*\d|fees?\b|charges?\b|to be confirmed)/i;

export function listingIssues(l: CheckableListing): ListingIssue[] {
  const issues: ListingIssue[] = [];
  const title = l.title ?? "";
  const area = l.area_sqm == null ? null : Number(l.area_sqm);

  // Area missing or implausible
  if (area == null || area === 0) {
    issues.push({ rule: "area is 0 or missing", field: "area_sqm", current: String(area ?? ""), conflicting: "", fix: "Enter the unit's area in m²" });
  } else if (area < AREA_MIN || area > AREA_MAX) {
    issues.push({
      rule: `area outside ${AREA_MIN}–${AREA_MAX.toLocaleString("en-US")} m²`,
      field: "area_sqm",
      current: String(area),
      conflicting: titleSizes(title).join(" / "),
      fix: titleSizes(title).length ? `Likely ${titleSizes(title)[0]} m² (from title)` : "Check the area; likely a typo",
    });
  }

  // Size in title vs area field
  const sizes = titleSizes(title);
  if (sizes.length && area && !sizes.some((s) => Math.abs(s - area) < 1)) {
    issues.push({
      rule: "title size differs from area field",
      field: "title/area_sqm",
      current: `area ${area}`,
      conflicting: `title says ${sizes.join(" / ")} m²`,
      fix: "Correct whichever is wrong (title or area)",
    });
  }

  // Condition in title vs condition field. "Flexi Finished" (finishing to the
  // tenant's choice) is a semi-finished unit, so it isn't a "finished" claim.
  const cond = l.furnishing ?? "";
  const condTitle = title.replace(/\bflexi[\s-]*finish(?:ed|ing)\b/gi, "");
  if (UNFINISHED_IN_TITLE.test(condTitle) && FINISHED_VALUES.has(cond)) {
    issues.push({
      rule: "title says unfinished, condition says finished",
      field: "title/furnishing",
      current: CONDITION_LABEL[cond] ?? cond,
      conflicting: `title: ${condTitle.match(UNFINISHED_IN_TITLE)?.[0]}`,
      fix: "Set condition to Core & Shell / Semi-Finished, or fix the title",
    });
  } else if (!UNFINISHED_IN_TITLE.test(condTitle) && FINISHED_IN_TITLE.test(condTitle) && UNFINISHED_VALUES.has(cond)) {
    issues.push({
      rule: "title says finished, condition says unfinished",
      field: "title/furnishing",
      current: CONDITION_LABEL[cond] ?? cond,
      conflicting: `title: ${condTitle.match(FINISHED_IN_TITLE)?.[0]}`,
      fix: "Set condition to Finished / Fully Finished, or fix the title",
    });
  }

  // Markdown in title
  if (/^\s*#/.test(title) || /[*`~]|\[[^\]]*\]\(/.test(title)) {
    issues.push({
      rule: "Markdown in title",
      field: "title",
      current: title,
      conflicting: "",
      fix: title.replace(/^\s*#+\s*/, "").replace(/[*`~]+/g, "").trim(),
    });
  }

  // Maintenance included but a charge is described
  const charge = (l.description ?? "").match(MAINTENANCE_CHARGE)?.[0];
  if (l.maintenance_status === "included" && charge) {
    issues.push({
      rule: "maintenance 'included' but description states a charge",
      field: "maintenance_status",
      current: "Included",
      conflicting: `description: "${charge.trim()}"`,
      fix: "Set maintenance to Not Included and enter the fee, or edit the description",
    });
  }

  // Currency
  if (!l.currency) {
    issues.push({ rule: "currency missing", field: "currency", current: "", conflicting: "", fix: "Set EGP or USD" });
  }

  return issues;
}

const TITLE_CONDITION: Record<string, string> = {
  "core-shell": "Core & Shell",
  "semi-finished": "Semi-Finished",
  finished: "Finished",
  "fully-finished": "Fully Finished",
  furnished: "Furnished",
  serviced: "Serviced",
};

// Fields are sometimes typed in lowercase ("hyde park", "cfc"): capitalise
// names nobody capitalised; short ones are acronyms.
function displayName(raw: string): string {
  if (!raw || /[A-Z]/.test(raw)) return raw;
  return raw.length <= 4 ? raw.toUpperCase() : raw.replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

// Title built from the structured fields, so title and fields can't disagree:
// "Office for Rent in Mivida The Place | 114 SQM | Finished"
export function suggestedTitle(l: {
  transaction_type?: string | null;
  project?: string | null;
  location_area?: string | null;
  location?: string | null;
  area_sqm?: number | null;
  furnishing?: string | null;
}): string {
  const deal =
    l.transaction_type === "income-property" ? "Income Property for Sale"
    : l.transaction_type === "sale" ? "Office for Sale"
    : "Office for Rent";
  const place = displayName(l.project?.trim() || l.location_area?.trim() || l.location?.trim() || "");
  return [
    place ? `${deal} in ${place}` : deal,
    l.area_sqm ? `${Number(l.area_sqm).toLocaleString("en-US")} SQM` : null,
    l.furnishing ? TITLE_CONDITION[l.furnishing] ?? null : null,
  ]
    .filter(Boolean)
    .join(" | ");
}
