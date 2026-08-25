// Single source of truth for enum values stored in Supabase.
//
// `value` is what lives in the database and gets compared against.
// `label` is what the user sees.
//
// Rules for values:
//   - lowercase
//   - no spaces (use hyphens)
//   - no special characters (no `&`, `/`, etc.) — keeps them URL-safe
//
// When you add a new option here, admin dropdowns and filter sidebars
// pick it up automatically. No code changes needed elsewhere.

export type EnumOption = { value: string; label: string };

export const FURNISHING_OPTIONS: EnumOption[] = [
  { value: "core-shell", label: "Core & Shell" },
  { value: "finished", label: "Finished" },
  { value: "semi-finished", label: "Semi-Finished" },
  { value: "fully-finished", label: "Fully Finished" },
  { value: "furnished", label: "Furnished" },
  { value: "serviced", label: "Serviced" },
];

export const PROPERTY_TYPE_OPTIONS: EnumOption[] = [
  { value: "admin", label: "Admin" },
  { value: "commercial", label: "Commercial" },
];

export const SUBTYPE_OPTIONS: EnumOption[] = [
  { value: "business-park", label: "Business Park" },
  { value: "business-building", label: "Business Building" },
  { value: "mixed-use", label: "Mixed Use" },
  { value: "mega-mall", label: "Mega Mall" },
  { value: "strip-mall", label: "Strip Mall" },
  { value: "drive-through", label: "Drive Through" },
];

export const TRANSACTION_TYPE_OPTIONS: EnumOption[] = [
  { value: "sale", label: "Sale" },
  { value: "rent", label: "Rent" },
];

// Whether maintenance is included in the listing price. Displayed under the
// label "Maintenance" (the numeric amount field is labelled "Maintenance Fees").
export const MAINTENANCE_STATUS_OPTIONS: EnumOption[] = [
  { value: "included", label: "Included" },
  { value: "not-included", label: "Not Included" },
];

// Values are URL slugs that match the dev page paths under /developers/{slug}.
// Adding a new developer here is one of the 4 steps documented in the dev-page
// wiring memory — don't forget the route + grid + slug map + logo map updates.
export const DEVELOPER_OPTIONS: EnumOption[] = [
  { value: "emaar", label: "Emaar" },
  { value: "sodic", label: "SODIC" },
  { value: "lmd", label: "LMD" },
  { value: "al-futtaim", label: "Al-Futtaim" },
  { value: "majid-al-futtaim", label: "Majid Al-Futtaim" },
  { value: "the-waterway", label: "The Waterway" },
  { value: "marakez", label: "MARAKEZ" },
  { value: "arabella", label: "Arabella Developments" },
  { value: "imkan-misr", label: "Imkan Misr" },
  { value: "the-ark-developments", label: "The Ark Developments" },
  { value: "kvrd", label: "KVRD" },
  { value: "pre-developments", label: "PRE Developments" },
  { value: "al-rabat-properties", label: "Al Rabat Properties" },
  { value: "al-jazi", label: "Al Jazi Developments" },
  { value: "horizon-egypt", label: "Horizon Egypt Developments" },
  { value: "catalyst", label: "Catalyst Developments" },
  { value: "afaaq", label: "Afaaq Developments" },
  { value: "town-writers", label: "Town Writers Developments" },
  { value: "larz", label: "Larz Developments" },
  { value: "morshedy", label: "Morshedy Group" },
  { value: "el-sewedy", label: "El Sewedy Developments" },
  { value: "inma-developments", label: "Inma Developments" },
  { value: "amer-group", label: "Amer Group" },
  { value: "madinet-masr", label: "Madinet Masr" },
  { value: "raslan-group", label: "Raslan Group" },
  { value: "upwyde", label: "Upwyde" },
  { value: "palm-hills", label: "Palm Hills Developments" },
  { value: "sky", label: "SKY — Park St." },
  { value: "ora", label: "ORA Developers Egypt" },
  { value: "akoya", label: "Akoya Developments" },
  { value: "el-hazek", label: "El Hazek Group" },
  { value: "wealth", label: "Wealth Developments" },
  { value: "modad", label: "Modad Developments" },
  { value: "al-borouj-misr", label: "Al Borouj Misr" },
  { value: "serac-developments", label: "Serac Developments" },
  { value: "urbnlanes-development", label: "Urbnlanes Development" },
  { value: "paio", label: "Paio" },
  { value: "starlight-developments", label: "Starlight Developments" },
  { value: "shoura-developments", label: "Shoura Developments" },
  { value: "urban-smart-development", label: "Urban Smart Development" },
  { value: "tameer-development", label: "TAMEER Development" },
  { value: "mountain-view", label: "Mountain View" },
  { value: "qatari-diar", label: "Qatari Diar" },
  { value: "mainmarks-development", label: "Mainmarks Development" },
  { value: "metawee-development", label: "Metawee Development" },
  { value: "rocc", label: "Rocc" },
  { value: "east-main", label: "East Main" },
  { value: "hdp", label: "HDP" },
  { value: "eden-group", label: "Eden Group" },
  { value: "badreldin", label: "Badreldin" },
  { value: "inertia-egypt", label: "Inertia Egypt" },
  { value: "orascom-development", label: "Orascom Development" },
  { value: "saudi-egyptian-developers", label: "Saudi Egyptian Developers" },
  // ─ Added 2026-08-25 — new developers with active New Cairo portfolios ─
  { value: "makateb-offices", label: "Makateb Offices" },
  { value: "concord-group", label: "Concord Group" },
  { value: "eloia", label: "Eloia" },
  { value: "living-in", label: "Living In" },
  { value: "regents", label: "Regents" },
  { value: "mercon", label: "Mercon" },
];

export const LOCATION_OPTIONS: EnumOption[] = [
  { value: "New Cairo", label: "New Cairo" },
  { value: "Sheikh Zayed", label: "Sheikh Zayed" },
  { value: "6th October", label: "6th October" },
  { value: "Downtown Cairo", label: "Downtown Cairo" },
  { value: "Sheraton", label: "Sheraton" },
  { value: "Maadi", label: "Maadi" },
];

// Converts a stored slug back to a display label. Falls back to a title-cased
// version of the slug if the value isn't in the mapping (for forward-compat
// when new values are added to Supabase before the enum file is updated).
export function getEnumLabel(options: EnumOption[], value: string | null | undefined): string {
  if (!value) return "";
  const match = options.find((o) => o.value === value);
  if (match) return match.label;
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
