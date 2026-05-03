// Centralized source of truth for all developer projects.
//
// Each project is tagged with a `type` matching the Supabase `subtype` enum,
// plus the developer slug so it can be surfaced on:
//   - Developer pages (filter by developer)
//   - Commercial / admin sub-pages (filter by type)
//
// Adding a new project = one entry here. It automatically appears on the
// relevant developer page and on the relevant sub-page with no other code
// changes.

export type ProjectType =
  | "business-park"
  | "business-building"
  | "mixed-use"
  | "mega-mall"
  | "strip-mall"
  | "drive-through";

export type Project = {
  name: string;
  type: ProjectType;
  // Optional badge override shown on developer-page project tiles. Use when a
  // project's display category is more specific than its underlying type
  // (e.g. medical hub built as a business-building). Does not affect filtering
  // or routing — type is still the source of truth for those.
  tag?: string;
  location: string;
  developer: string; // developer slug — must match DEVELOPER_SLUGS in location-content.ts
  image: string;
};

// Developer slug → display name. Keep keys in sync with the `developer` field
// on each Project below and with the slugs used for /developers/{slug} routes.
export const DEVELOPER_DISPLAY_NAMES: Record<string, string> = {
  emaar: "Emaar Misr",
  arabella: "Arabella",
  "al-futtaim": "Al Futtaim",
  "majid-al-futtaim": "Majid Al Futtaim",
  lmd: "LMD",
  sodic: "SODIC",
  "the-waterway": "The Waterway",
  "imkan-misr": "Imkan Misr",
  "the-ark-developments": "The Ark Developments",
  kvrd: "KVRD",
  "pre-developments": "PRE Developments",
  marakez: "MARAKEZ",
  "al-rabat-properties": "Al Rabat Properties",
  "al-jazi": "Al Jazi Developments",
  "horizon-egypt": "Horizon Egypt Developments",
  catalyst: "Catalyst Developments",
  afaaq: "Afaaq Developments",
  "town-writers": "Town Writers Developments",
  larz: "Larz Developments",
  morshedy: "Morshedy Group",
  "el-sewedy": "El Sewedy Developments",
  "inma-developments": "Inma Developments",
  "amer-group": "Amer Group",
  "madinet-masr": "Madinet Masr",
  "raslan-group": "Raslan Group",
  upwyde: "Upwyde",
  "palm-hills": "Palm Hills Developments",
  sky: "SKY — Park St.",
  ora: "ORA Developers Egypt",
  akoya: "Akoya Developments",
  "el-hazek": "El Hazek Group",
  wealth: "Wealth Developments",
};

// Human-readable display labels for each ProjectType — used as card badges.
// Kept separate from the slug so slugs stay URL-/DB-safe.
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  "business-park": "Business Park",
  "business-building": "Business Building",
  "mixed-use": "Mixed Use",
  "mega-mall": "Mega Mall",
  "strip-mall": "Strip Mall",
  "drive-through": "Drive-Through",
};

export const PROJECTS: Project[] = [
  // ─── LMD ─────────────────────────────────────────────────────────
  { name: "One Ninety", type: "business-park", location: "New Cairo · South 90 Street", developer: "lmd", image: "/images/one-ninety.jpg" },
  { name: "Three Sixty", type: "business-park", location: "New Cairo · Golden Square", developer: "lmd", image: "/images/three-sixty.webp" },
  { name: "Stei8ht", type: "business-park", location: "New Cairo · Suez Road", developer: "lmd", image: "/images/stei8ht.webp" },
  { name: "Mindset", type: "business-building", location: "Sheikh Zayed", developer: "lmd", image: "/images/Mindset.png" },

  // ─── SODIC ───────────────────────────────────────────────────────
  { name: "Allegria Business Park", type: "business-park", location: "Sheikh Zayed", developer: "sodic", image: "/images/Allegria-Business-Park.jpg" },
  { name: "EDNC", type: "mixed-use", location: "New Cairo", developer: "sodic", image: "/images/EDNC.jpg" },
  { name: "Westown Hub", type: "mixed-use", location: "Sheikh Zayed", developer: "sodic", image: "/images/Westown-hub.jpg" },
  { name: "October Plaza Business District", type: "business-park", location: "Sheikh Zayed", developer: "sodic", image: "/images/October Plaza Business District.webp" },
  { name: "The Estates", type: "mixed-use", location: "Sheikh Zayed", developer: "sodic", image: "/images/The Estates.jpg" },
  { name: "Cairo Gate", type: "mixed-use", location: "Sheikh Zayed", developer: "sodic", image: "/images/Cairo-gate.webp" },

  // ─── Emaar (Eterna/Medical Hub stays local in emaar.tsx) ────────
  { name: "Mivida Business Park", type: "business-park", location: "New Cairo · South 90 Street", developer: "emaar", image: "/images/Mivida-Business-Park.jpg" },
  { name: "Mivida The Place", type: "business-park", location: "New Cairo · South 90 Street", developer: "emaar", image: "/images/Mivida-The-Place.jpg" },
  { name: "Mivida My Park", type: "business-park", location: "New Cairo · South 90 Street", developer: "emaar", image: "/images/Mivida-my-park.jpg" },
  { name: "Mivida Linea", type: "business-building", location: "New Cairo · South 90 Street", developer: "emaar", image: "/images/Mivida-Linea.webp" },
  { name: "Three Towers", type: "business-building", location: "New Cairo", developer: "emaar", image: "/images/Three-towers.jpeg" },

  // ─── Arabella ────────────────────────────────────────────────────
  { name: "Enawalks", type: "mixed-use", location: "New Cairo · South 90 Street", developer: "arabella", image: "/images/Enawalks.webp" },
  { name: "Arabella Plaza Mall", type: "mixed-use", location: "New Cairo · Gamal Abdelnasser Axis", developer: "arabella", image: "/images/Arabella Plaza Mall.webp" },

  // ─── Al Futtaim ──────────────────────────────────────────────────
  { name: "Cairo Festival City", type: "business-park", location: "New Cairo · South 90 Street", developer: "al-futtaim", image: "/images/cairo-festival-city.webp" },

  // ─── Majid Al Futtaim ────────────────────────────────────────────
  { name: "City Centre Almaza", type: "mega-mall", location: "Nasr City · Sheraton", developer: "majid-al-futtaim", image: "/images/city-center-almaza.webp" },
  { name: "Junction", type: "mixed-use", location: "Sheikh Zayed", developer: "majid-al-futtaim", image: "/images/Junction.jpg" },
  { name: "City Centre Maadi", type: "mixed-use", location: "Maadi · Maadi – on the Ring Road", developer: "majid-al-futtaim", image: "/images/city-centre-maadi.jpeg" },

  // ─── The Waterway Developments ───────────────────────────────────
  { name: "5A", type: "business-park", location: "New Cairo · Ring Road", developer: "the-waterway", image: "/images/5A.jpg" },
  { name: "Waterway The Hub", type: "mixed-use", location: "New Cairo · Mohamed Naguib Axis", developer: "the-waterway", image: "/images/Waterway-the-hub.jpg" },
  { name: "Waterway The View", type: "business-park", location: "New Cairo · South 90 Street", developer: "the-waterway", image: "/images/the-view.webp" },
  { name: "Waterway Villas – Gentle Turquoise", type: "mixed-use", location: "New Cairo · Golden Square", developer: "the-waterway", image: "/images/gentle-turqouise.webp" },
  { name: "Waterway W Signature", type: "mixed-use", location: "New Cairo · Mohamed Naguib Axis", developer: "the-waterway", image: "/images/W-Signature.png" },
  { name: "Waterway 1", type: "strip-mall", location: "New Cairo · Mohamed Naguib Axis", developer: "the-waterway", image: "/images/waterway-1.jpeg" },
  { name: "Waterway W55", type: "business-park", location: "New Cairo · North 90 Street", developer: "the-waterway", image: "/images/waterway-w55.webp" },
  { name: "Waterway Villas", type: "strip-mall", location: "New Cairo · Golden Square", developer: "the-waterway", image: "/images/waterway-villas.jpg" },
  { name: "Waterway 2", type: "strip-mall", location: "New Cairo · North 90 Street", developer: "the-waterway", image: "/images/waterway-2.jpg" },

  // ─── Imkan Misr ──────────────────────────────────────────────────
  { name: "Alburouj Business Park", type: "business-park", location: "New Heliopolis · El Shorouk · Smart Village East", developer: "imkan-misr", image: "/images/business-park.jpg" },

  // ─── The Ark Developments ────────────────────────────────────────
  { name: "The Ark Business District", type: "business-park", location: "New Cairo · South 90 Street", developer: "the-ark-developments", image: "/images/the-ark-developments-=projects.jpeg" },

  // ─── KVRD ────────────────────────────────────────────────────────
  { name: "Polaris", type: "mixed-use", location: "New Cairo · North 90 Street", developer: "kvrd", image: "/images/polaris.webp" },
  { name: "Sidewalk", type: "strip-mall", location: "New Cairo · Golden Square", developer: "kvrd", image: "/images/sidewalk.jpeg" },

  // ─── PRE Developments ────────────────────────────────────────────
  { name: "Point 90", type: "mega-mall", location: "New Cairo · South 90 Street", developer: "pre-developments", image: "/images/point-90.jpeg" },
  { name: "ZAG", type: "strip-mall", location: "New Cairo · South 90 Street", developer: "pre-developments", image: "/images/the-ZAG.jpeg" },
  { name: "The Big", type: "business-park", location: "New Cairo · Ring Road", developer: "pre-developments", image: "/images/the-big.webp" },

  // ─── MARAKEZ ─────────────────────────────────────────────────────
  { name: "District 5", type: "business-park", location: "New Cairo · Cairo-Sokhna Highway", developer: "marakez", image: "/images/District-5.jpg" },

  // ─── Al Rabat Properties ─────────────────────────────────────────
  { name: "Building 255", type: "strip-mall", location: "New Cairo · North 90 Street", developer: "al-rabat-properties", image: "/images/AlRabat-Properties-B255.webp" },
  { name: "B289", type: "strip-mall", location: "New Cairo · 70 Street", developer: "al-rabat-properties", image: "/images/alrabat-b289.webp" },
  { name: "B290", type: "strip-mall", location: "New Cairo · 70 Street", developer: "al-rabat-properties", image: "/images/mallby9-alrabat.webp" },
  { name: "B303", type: "strip-mall", location: "New Cairo · South 90 Street", developer: "al-rabat-properties", image: "/images/b303.jpeg" },
  { name: "B424", type: "mixed-use", location: "New Cairo · North 90 Street", developer: "al-rabat-properties", image: "/images/b424.webp" },
  { name: "By 9", type: "strip-mall", location: "New Cairo · Al Rehab", developer: "al-rabat-properties", image: "/images/AlRabat-Properties-By9.webp" },
  { name: "Sleek", type: "mixed-use", location: "New Cairo · South 90 Street", developer: "al-rabat-properties", image: "/images/AlRabat-Properties-Sleek.webp" },
  { name: "The Yard", type: "mixed-use", location: "New Cairo · Al Sadat Axis", developer: "al-rabat-properties", image: "/images/the-yard.jpeg" },
  { name: "Sway", type: "strip-mall", location: "New Cairo · Mohamed Naguib Axis", developer: "al-rabat-properties", image: "/images/sway.webp" },

  // ─── Al Jazi Developments ────────────────────────────────────────
  { name: "Chess Field", type: "business-park", location: "New Cairo · Mohamed Naguib Axis", developer: "al-jazi", image: "/images/chess-field.jpeg" },

  // ─── Horizon Egypt Developments ──────────────────────────────────
  { name: "Saada", type: "business-park", location: "New Cairo · Suez Road", developer: "horizon-egypt", image: "/images/saada.jpg" },

  // ─── Catalyst Developments ───────────────────────────────────────
  { name: "Business Plus", type: "business-building", location: "New Cairo · North 90 Street", developer: "catalyst", image: "/images/business-park.jpg" },
  { name: "North Plus", type: "business-building", location: "New Cairo · North 90 Street", developer: "catalyst", image: "/images/catalyst-community-development.jpeg" },
  { name: "Treble C", type: "business-building", location: "New Cairo · South 90 Street", developer: "catalyst", image: "/images/business-park.jpg" },
  { name: "O Zone", type: "business-building", tag: "Medical Hub", location: "New Cairo · El Narges", developer: "catalyst", image: "/images/o-zone.webp" },
  { name: "Elegantry Mall", type: "business-building", tag: "Medical Hub", location: "New Cairo · El Mahkama", developer: "catalyst", image: "/images/Elegantry-mall.jpg" },

  // ─── Afaaq Developments ──────────────────────────────────────────
  { name: "Amorada Hub", type: "strip-mall", location: "New Cairo · Middle Ring Road", developer: "afaaq", image: "/images/Amorada-Hub.jpg" },

  // ─── Town Writers Developments ───────────────────────────────────
  { name: "Quadro", type: "business-building", location: "New Cairo · North 90 Street", developer: "town-writers", image: "/images/Quadro .jpeg" },
  { name: "Revolve", type: "strip-mall", location: "New Cairo · North 90 Street", developer: "town-writers", image: "/images/Revolve.jpeg" },

  // ─── Larz Developments ───────────────────────────────────────────
  { name: "KOV", type: "strip-mall", location: "New Cairo · South 90 Street", developer: "larz", image: "/images/KOV.jpeg" },

  // ─── Morshedy Group ──────────────────────────────────────────────
  { name: "One Kattameya", type: "business-park", location: "Maadi · Maadi Ring Road", developer: "morshedy", image: "/images/One-Kattameya.jpg" },
  { name: "Rehana Plaza", type: "strip-mall", location: "Maadi · Maadi Ring Road", developer: "morshedy", image: "/images/Rayhana Plaza.jpg" },
  { name: "Bavaria Town", type: "business-building", location: "Maadi · Maadi Ring Road", developer: "morshedy", image: "/images/Bavaria-town.jpg" },

  // ─── El Sewedy Developments ──────────────────────────────────────
  { name: "U-Venues", type: "mixed-use", location: "New Cairo · South 90 Street", developer: "el-sewedy", image: "/images/uvenues.jpeg" },

  // ─── Inma Developments ───────────────────────────────────────────
  { name: "Trivium Square", type: "mixed-use", location: "New Cairo · North 90 Street", developer: "inma-developments", image: "/images/trivium-square.webp" },
  { name: "Trivium Complex", type: "mixed-use", location: "New Cairo · North 90 Street", developer: "inma-developments", image: "/images/Trivium-Business-Complex.jpg" },

  // ─── Amer Group ──────────────────────────────────────────────────
  { name: "Top 90", type: "business-building", location: "New Cairo · South 90 Street", developer: "amer-group", image: "/images/top-90-mall.jpeg" },

  // ─── Madinet Masr ────────────────────────────────────────────────
  { name: "Tajed", type: "strip-mall", location: "New Cairo · Ring Road", developer: "madinet-masr", image: "/images/tajed.jpeg" },
  { name: "Kinda", type: "business-park", location: "New Cairo · Ring Road", developer: "madinet-masr", image: "/images/kinda.jpeg" },

  // ─── Raslan Group ────────────────────────────────────────────────
  { name: "The Corner", type: "strip-mall", location: "New Cairo · Al Sadat Axis", developer: "raslan-group", image: "/images/the-corner.jpeg" },
  { name: "Square One", type: "strip-mall", location: "New Cairo · Ring Road", developer: "raslan-group", image: "/images/square-one.webp" },

  // ─── Upwyde ──────────────────────────────────────────────────────
  { name: "IT Business Hub", type: "mixed-use", location: "New Cairo · South 90 Street", developer: "upwyde", image: "/images/it-business-hub.jpeg" },
  { name: "Cinco", type: "mixed-use", location: "New Cairo · North 90 Street", developer: "upwyde", image: "/images/cinco.webp" },
  { name: "Park Vie", type: "mixed-use", location: "New Cairo · El Nasr Street", developer: "upwyde", image: "/images/Park-vie.webp" },
  { name: "Granoy", type: "mixed-use", location: "New Cairo · North 90 Street", developer: "upwyde", image: "/images/granoy.webp" },

  // ─── Palm Hills Developments ─────────────────────────────────────
  { name: "Palmet", type: "business-park", location: "New Cairo · Middle Ring Road", developer: "palm-hills", image: "/images/palmet.jpeg" },
  { name: "Palm Hills Business Park", type: "business-park", location: "Sheikh Zayed", developer: "palm-hills", image: "/images/palm-hills-business-park.jpg" },
  { name: "October Plaza", type: "business-park", location: "Sheikh Zayed", developer: "palm-hills", image: "/images/Palm-Hills-october-plaza.jpg" },

  // ─── SKY — Park St. ──────────────────────────────────────────────
  { name: "Park St. Edition", type: "mixed-use", location: "New Cairo · Shofiat · Ring Road", developer: "sky", image: "/images/SKY-Park-St-edition.webp" },
  { name: "Park St. East", type: "mixed-use", location: "New Cairo · Ring Road", developer: "sky", image: "/images/Sky-Park-Street-East-Edition.webp" },
  { name: "Park St. West", type: "mixed-use", location: "Sheikh Zayed · Ring Road", developer: "sky", image: "/images/Sky-Park-St-west-edition.jpeg" },

  // ─── ORA Developers Egypt ────────────────────────────────────────
  { name: "Solana East", type: "business-park", location: "New Cairo · South 90 Street", developer: "ora", image: "/images/Solana.jpeg" },
  { name: "Zed West", type: "business-park", location: "Sheikh Zayed", developer: "ora", image: "/images/Zed West.jpeg" },
  { name: "Zed East", type: "business-park", location: "New Cairo · Ring Road", developer: "ora", image: "/images/ORA Zed East.jpeg" },

  // ─── Akoya Developments ──────────────────────────────────────────
  { name: "The Ledge", type: "strip-mall", location: "New Cairo · AUC Axis", developer: "akoya", image: "/images/The ledge.jpeg" },
  { name: "Leven Square", type: "strip-mall", location: "New Cairo · Mohamed Naguib Axis", developer: "akoya", image: "/images/Leven square.jpeg" },

  // ─── El Hazek Group ──────────────────────────────────────────────
  { name: "Lake Town", type: "mixed-use", location: "New Cairo · Bin Zayed Axis", developer: "el-hazek", image: "/images/Lake-Town.jpg" },
  { name: "Lakeview Boutique", type: "mixed-use", location: "New Cairo · El Nasr Street", developer: "el-hazek", image: "/images/mixed-use.jpg" },
  { name: "Downtown", type: "business-park", location: "New Cairo · South 90 Street", developer: "el-hazek", image: "/images/Downtown-Mall.jpeg" },

  // ─── Wealth Developments ─────────────────────────────────────────
  { name: "Elev 8", type: "mixed-use", location: "New Cairo · South 90 Street", developer: "wealth", image: "/images/mixed-use.jpg" },
  { name: "At 9", type: "mixed-use", location: "New Cairo · North 90 Street", developer: "wealth", image: "/images/mixed-use.jpg" },
  { name: "South Gate", type: "mixed-use", location: "New Cairo · South 90 Street", developer: "wealth", image: "/images/mixed-use.jpg" },
];

export function getProjectsByDeveloper(developerSlug: string): Project[] {
  return PROJECTS.filter((p) => p.developer === developerSlug);
}

export function getProjectsByType(type: ProjectType): Project[] {
  return PROJECTS.filter((p) => p.type === type);
}
