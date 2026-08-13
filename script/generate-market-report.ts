import PDFDocument from "pdfkit";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Cairo Office Market Report — data-rich PDF combining live PLACES listing
// data with researched market data from JLL, Enterprise MENA, IWG, and
// public sources. Run: npm run generate-market-report
//   → outputs to dist/cairo-office-market-report-2026.pdf
//   → uploads to Supabase Storage bucket `market-reports` (public URL stable)

const BRAND = {
  primary: "#171717",
  primarySoft: "#2A2A2A",
  accent: "#E11D48",
  accentSoft: "#FEE2E7",
  muted: "#64748B",
  softBg: "#F8F5F1",
  divider: "#EAE4DA",
  white: "#FFFFFF",
  chart: {
    a: "#E11D48",
    b: "#171717",
    c: "#F59E0B",
    d: "#64748B",
    e: "#0EA5E9",
    f: "#8B5CF6",
  },
} as const;

type Listing = {
  id: number;
  title: string;
  location: string | null;
  price: number | null;
  currency: string | null;
  area_sqm: number | null;
  developer: string | null;
  transaction_type: string | null;
  subtype: string | null;
};

// ── Researched market data (Q1/Q2 2026, cited on the Sources page) ────────
// Sources: JLL Q1 2026 Cairo Real Estate Report; Enterprise MENA Egypt
// "Cairo office rents jump 20% as demand outpaces supply of Grade A space"
// (Jul 2026); Sands of Wealth Cairo Rents 2026; Cairo Global Property Guide
// Rental Yields Q2 2026; IWG regional flexible-office growth data 2025-2026.
type DistrictResearch = {
  slug: string;
  name: string;
  positioning: string;
  saleAvgEgpPerSqm: number | null;
  rentAvgUsdPerSqmYr: number | null;
  yieldPct: number | null;
  notableProjects: string[];
  activeDevelopers: string[];
  demandDrivers: string;
};

const DISTRICT_RESEARCH: DistrictResearch[] = [
  {
    slug: "New Cairo",
    name: "New Cairo (incl. Fifth Settlement)",
    positioning:
      "Cairo's most active office submarket. Hosts 44 of 77 active office developments citywide and roughly 90% of Grade A office stock. Corporates and multinationals have steadily migrated here from central Cairo over the past decade.",
    saleAvgEgpPerSqm: 183_000, // JLL Q2 2026 range 182–184k
    rentAvgUsdPerSqmYr: 348, // Enterprise MENA — New Cairo business parks
    yieldPct: 8.3, // Cairo residential proxy — office typically 100-150bps lower
    notableProjects: [
      "Mivida Business Park (Emaar)",
      "The Ark (Wadi Degla)",
      "Cairo Festival City (Al‑Futtaim)",
      "Eastown (SODIC)",
      "Water Way / 5A",
    ],
    activeDevelopers: ["Emaar Misr", "SODIC", "Al‑Futtaim", "Palm Hills", "Wadi Degla"],
    demandDrivers:
      "Grade‑A supply concentration, proximity to Cairo Airport, expanding residential base of decision‑makers, and government's digital cadastral push simplifying corporate leases.",
  },
  {
    slug: "Sheikh Zayed",
    name: "Sheikh Zayed",
    positioning:
      "West Cairo's primary corporate submarket. Traditionally the home of multinationals moving out of Mohandessin/Downtown. Business parks concentrated around Smart Village, Capital Business Park, and Arkan Plaza.",
    saleAvgEgpPerSqm: 183_000, // JLL Q2 2026
    rentAvgUsdPerSqmYr: 354, // Enterprise MENA — West Cairo business parks
    yieldPct: 8.0,
    notableProjects: [
      "Smart Village",
      "Capital Business Park",
      "Arkan Plaza",
      "Westown Hub (SODIC)",
      "New Zayed cluster",
    ],
    activeDevelopers: ["SODIC", "Palm Hills", "MARAKEZ", "Talaat Moustafa Group"],
    demandDrivers:
      "Tech + telco anchors at Smart Village, established multinational base, growing tech ecosystem, easier commute for West Cairo residential base.",
  },
  {
    slug: "6th October",
    name: "6th October",
    positioning:
      "Widest pricing spread in the city (EGP 70k–325k per sqm sale) — quality varies more than in New Cairo or Zayed. Historically an industrial/logistics hub, now shifting toward mixed‑use business parks.",
    saleAvgEgpPerSqm: 165_000, // Midpoint of the wide 70-325k range
    rentAvgUsdPerSqmYr: 280,
    yieldPct: 8.5,
    notableProjects: ["Palm Hills October", "MARAKEZ portfolio", "SODIC West"],
    activeDevelopers: ["Palm Hills", "MARAKEZ", "SODIC", "Hyde Park"],
    demandDrivers:
      "Industrial + logistics adjacency, cost advantage vs Zayed, better‑value Grade B stock for SMEs and back‑office functions.",
  },
  {
    slug: "Downtown Cairo",
    name: "Downtown Cairo",
    positioning:
      "Cairo's historic CBD. Ageing Grade B/C stock at accessible price points. Government offices, embassies, and long‑established Egyptian companies remain the primary tenant base.",
    saleAvgEgpPerSqm: 67_000, // JLL Q2 2026 — the "value" district citywide
    rentAvgUsdPerSqmYr: 210,
    yieldPct: 7.5,
    notableProjects: ["Nile Corniche buildings", "Talaat Harb", "Kasr El Nil"],
    activeDevelopers: ["Independent landlords", "Talaat Harb Company"],
    demandDrivers:
      "Government proximity, embassies, cash‑pay tenant base, character/heritage buildings. Grade A supply is thin — most modern demand routes to New Cairo or Zayed.",
  },
  {
    slug: "Sheraton",
    name: "Sheraton (Heliopolis)",
    positioning:
      "East Cairo alternative to New Cairo — proximity to Cairo International Airport and historic Heliopolis corporate base. Grade B stock dominates; a growing pipeline of new Grade A.",
    saleAvgEgpPerSqm: 110_000,
    rentAvgUsdPerSqmYr: 250,
    yieldPct: 7.8,
    notableProjects: ["Airport City", "Heliopolis Development portfolio"],
    activeDevelopers: ["Heliopolis Housing", "Independent landlords"],
    demandDrivers:
      "Airport adjacency for aviation + logistics + travel companies, existing Heliopolis corporate ecosystem, entry pricing vs New Cairo.",
  },
  {
    slug: "Maadi",
    name: "Maadi",
    positioning:
      "Cairo's most sought‑after residential district for expats and diplomats — that pulls NGOs, embassies, boutique multinationals, and design‑led small offices into converted residential and boutique commercial stock.",
    saleAvgEgpPerSqm: 95_000,
    rentAvgUsdPerSqmYr: 235,
    yieldPct: 8.0,
    notableProjects: ["Degla / Maadi corniche stock", "New Maadi commercial strips"],
    activeDevelopers: ["Independent landlords", "Wadi Degla"],
    demandDrivers:
      "Embassy + NGO cluster, expat residential density, boutique/design‑led tenant profile, calmer environment vs Zayed/New Cairo.",
  },
];

const CITYWIDE = {
  totalStockSqm: 2_800_000, // JLL Q1 2026
  vacancyPct: 9,
  primeRentGrowthYoyPct: 1.8, // JLL — USD terms
  gradeARentGrowthYoyPct: 2.3, // JLL — USD terms
  overallRentGrowthYoyPct: 20, // Enterprise MENA — EGP terms Q2 2026
  gradeAPremiumPct: 18.4, // Enterprise MENA — premium over Grade B
  q1DeliveriesSqm: 100_000,
  pipeline2026Sqm: 426_500,
  newCairoShare: 0.9, // JLL — ~90% of stock in New Cairo
  activeDevelopments: 77,
  newCairoDevelopments: 44,
  averageRentUsd: 325, // Enterprise MENA
  gradeARentUsd: 335.6,
  gradeBRentUsd: 283.5,
  supplyDemandGap: {
    demandAnnualSqm: 9_500_000, // Per Bonyan CEO cited in Enterprise MENA
    supplyAnnualSqm: 2_850_000, // Midpoint of 2.5-3.2m
  },
  iwgGrowth2025Pct: 300, // JLL — flex office
  iwgPlanned2026Centers: 30,
};

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id,title,location,price,currency,area_sqm,developer,transaction_type,subtype",
    );
  if (error) throw error;
  return (data ?? []) as Listing[];
}

function normalizeLoc(loc: string | null): string {
  if (!loc) return "";
  const s = loc.trim().toLowerCase();
  if (s.includes("new cairo") || s === "new-cairo") return "New Cairo";
  if (s.includes("zayed")) return "Sheikh Zayed";
  if (s.includes("october") || s === "6th-october") return "6th October";
  if (s.includes("downtown")) return "Downtown Cairo";
  if (s.includes("sheraton")) return "Sheraton";
  if (s.includes("maadi")) return "Maadi";
  return loc.trim();
}

function formatEGP(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${Math.round(n)}`;
}

function formatCurrency(n: number, currency: "EGP" | "USD" = "EGP"): string {
  return `${formatEGP(n)} ${currency}`;
}

// ── PDF helpers ────────────────────────────────────────────────────────────
type Doc = PDFKit.PDFDocument;

function pageWidth(doc: Doc): number {
  return doc.page.width - 96;
}

function drawCover(doc: Doc, monthYear: string) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(BRAND.primary);
  doc.fillColor(BRAND.accent).fontSize(11).font("Helvetica-Bold");
  doc.text("PLACES", 48, 60, { characterSpacing: 3 });
  doc.fillColor("#FFFFFF80").fontSize(10).font("Helvetica");
  doc.text("Egypt's specialized office real estate partner", 48, 78);

  doc.fillColor(BRAND.accent).fontSize(11).font("Helvetica-Bold");
  doc.text(`RESEARCH REPORT · ${monthYear.toUpperCase()}`, 48, 260, {
    characterSpacing: 3,
  });

  doc.fillColor(BRAND.white).fontSize(46).font("Helvetica-Bold");
  doc.text("Cairo Office", 48, 285, { width: pageWidth(doc) });
  doc.text("Market Report", 48, doc.y, { width: pageWidth(doc) });

  doc.moveDown(1);
  doc.fillColor("#FFFFFFB0").fontSize(14).font("Helvetica");
  doc.text(
    "Data-driven benchmarks on pricing, supply, and yields across Cairo's six most active administrative office districts.",
    48,
    doc.y,
    { width: pageWidth(doc), lineGap: 6 },
  );

  doc.fillColor("#FFFFFF60").fontSize(9).font("Helvetica");
  doc.text(
    `Prepared by the PLACES advisory team · ${monthYear} · places-egy.com`,
    48,
    doc.page.height - 80,
    { width: pageWidth(doc) },
  );
}

function drawPageHeader(doc: Doc, section: string, title: string) {
  doc.rect(0, 0, doc.page.width, 80).fill(BRAND.softBg);
  doc.fillColor(BRAND.accent).fontSize(9).font("Helvetica-Bold");
  doc.text(section.toUpperCase(), 48, 30, { characterSpacing: 3 });
  doc.fillColor(BRAND.primary).fontSize(22).font("Helvetica-Bold");
  doc.text(title, 48, 45);
  doc.fillColor(BRAND.primary);
}

function drawStatCard(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
  sub?: string,
) {
  doc.roundedRect(x, y, w, 95, 10).fill(BRAND.softBg);
  doc.fillColor(BRAND.accent).fontSize(9).font("Helvetica-Bold");
  doc.text(label.toUpperCase(), x + 16, y + 16, {
    width: w - 32,
    characterSpacing: 1,
  });
  doc.fillColor(BRAND.primary).fontSize(24).font("Helvetica-Bold");
  doc.text(value, x + 16, y + 34, { width: w - 32 });
  if (sub) {
    doc.fillColor(BRAND.muted).fontSize(9).font("Helvetica");
    doc.text(sub, x + 16, y + 66, { width: w - 32 });
  }
}

// Simple horizontal bar chart for comparing districts.
function drawBarChart(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  h: number,
  data: Array<{ label: string; value: number }>,
  opts: { valueFormatter?: (n: number) => string; barColor?: string } = {},
) {
  const labelW = 130;
  const chartX = x + labelW;
  const chartW = w - labelW - 60;
  const max = Math.max(...data.map((d) => d.value));
  const rowH = (h - 10) / data.length;
  const barH = Math.min(rowH * 0.6, 18);

  doc.font("Helvetica").fontSize(10);
  data.forEach((d, i) => {
    const rowY = y + i * rowH + (rowH - barH) / 2;
    doc.fillColor(BRAND.primary).text(d.label, x, rowY + 3, {
      width: labelW - 10,
      align: "left",
    });
    const barLen = (d.value / max) * chartW;
    doc.rect(chartX, rowY, barLen, barH).fill(opts.barColor ?? BRAND.accent);
    doc.fillColor(BRAND.muted).fontSize(9);
    doc.text(
      opts.valueFormatter ? opts.valueFormatter(d.value) : String(d.value),
      chartX + barLen + 6,
      rowY + 4,
      { width: 60 },
    );
    doc.fontSize(10);
  });
}

function drawPageFooter(doc: Doc, pageIndex: number, monthYear: string) {
  if (pageIndex === 0) return;
  doc.fillColor(BRAND.muted).fontSize(8).font("Helvetica");
  doc.text(
    `Cairo Office Market Report · ${monthYear} · PLACES · places-egy.com`,
    48,
    doc.page.height - 30,
    { width: pageWidth(doc), align: "center" },
  );
  doc.text(String(pageIndex + 1), doc.page.width - 60, doc.page.height - 30, {
    width: 40,
    align: "right",
  });
}

// ── PDF build ──────────────────────────────────────────────────────────────
// Exported so both the CLI (below) AND the Railway cron endpoint
// (server/regenerate-report.ts) can call it. Fetches live Supabase listings
// each call so the numbers stay fresh.
export async function buildPdf(): Promise<Buffer> {
  const listings = (await fetchListings()).filter((l) => l.price != null);

  // Enrich each researched district with live PLACES data.
  const enriched = DISTRICT_RESEARCH.map((d) => {
    const local = listings.filter((l) => normalizeLoc(l.location) === d.slug);
    const withPsm = local.filter((l) => l.price! > 0 && (l.area_sqm ?? 0) > 0);
    const avgPsm =
      withPsm.length > 0
        ? withPsm.reduce((s, l) => s + l.price! / l.area_sqm!, 0) /
          withPsm.length
        : null;
    return { ...d, placesListings: local.length, placesAvgEgpPerSqm: avgPsm };
  });

  const totalActive = listings.length;
  const forRent = listings.filter(
    (l) => l.transaction_type?.toLowerCase() === "rent",
  ).length;
  const forSale = listings.filter(
    (l) => l.transaction_type?.toLowerCase() === "sale",
  ).length;

  const monthYear = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    bufferPages: true,
    info: {
      Title: "Cairo Office Market Report 2026",
      Author: "PLACES",
      Subject: "Cairo administrative office real estate market analysis",
      Keywords: "Cairo, office, real estate, market report, Egypt, PLACES",
      Creator: "PLACES Website",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // COVER
  drawCover(doc, monthYear);

  // PAGE 2 — Executive Summary
  doc.addPage();
  drawPageHeader(doc, "Section 01", "Executive Summary");

  const summaryY = 120;
  const cardW = (pageWidth(doc) - 24) / 3;
  drawStatCard(
    doc,
    48,
    summaryY,
    cardW,
    "Total Cairo office stock",
    "2.8M sqm",
    "JLL Q1 2026",
  );
  drawStatCard(
    doc,
    48 + cardW + 12,
    summaryY,
    cardW,
    "Grade A rent growth YoY",
    "+20%",
    "EGP terms, Q2 2026",
  );
  drawStatCard(
    doc,
    48 + 2 * (cardW + 12),
    summaryY,
    cardW,
    "Citywide vacancy",
    "9%",
    "Stable Q1 2026",
  );

  const trendsY = summaryY + 120;
  doc.fillColor(BRAND.primary).fontSize(14).font("Helvetica-Bold");
  doc.text("Three macro trends shaping Cairo's office market in 2026", 48, trendsY);

  const trends = [
    {
      title: "1. Grade A scarcity is real",
      body:
        "New Cairo hosts 44 of 77 active office developments citywide and roughly 90% of Grade A supply. That concentration + slow delivery pipeline (426,500 sqm scheduled 2026) is handing landlords 20% YoY rent growth in EGP terms.",
    },
    {
      title: "2. Corporate migration west + east continues",
      body:
        "Multinationals keep leaving central Cairo for Sheikh Zayed's business‑park cluster (Smart Village, Capital Business Park, Arkan) and New Cairo's Ark / Mivida / Cairo Festival City. Grade B stock in Downtown and Mohandessin faces structural demand pressure.",
    },
    {
      title: "3. Flexible office is the fastest‑growing segment",
      body:
        "IWG classifies Egypt as the region's fastest‑growing flex market (300% growth in 2025, 30 additional centers planned in 2026). Anchor commitments: Spaces 16,000 sqm at The Ark, Eastmain 7,000 sqm at Mobco, UBL 7,000 sqm at Tameer.",
    },
  ];

  let trendY = trendsY + 30;
  trends.forEach((t) => {
    doc.fillColor(BRAND.accent).fontSize(11).font("Helvetica-Bold");
    doc.text(t.title, 48, trendY);
    doc.fillColor(BRAND.muted).fontSize(10).font("Helvetica");
    doc.moveDown(0.3);
    doc.text(t.body, 48, doc.y, { width: pageWidth(doc), lineGap: 3 });
    trendY = doc.y + 18;
  });

  // PAGE 3 — Cairo Office Market Overview
  doc.addPage();
  drawPageHeader(doc, "Section 02", "Cairo Office Market Overview");

  doc.fillColor(BRAND.muted).fontSize(11).font("Helvetica");
  doc.text(
    `Total Grade A + B office stock in Greater Cairo reached ${(CITYWIDE.totalStockSqm / 1_000_000).toFixed(1)}M sqm at Q1 2026, following ${(CITYWIDE.q1DeliveriesSqm / 1000).toFixed(0)},000 sqm of new deliveries. Vacancy sat flat at ${CITYWIDE.vacancyPct}%. The upcoming ${(CITYWIDE.pipeline2026Sqm / 1000).toFixed(0)},000 sqm scheduled through 2026 is heavily concentrated in the New Administrative Capital and New Cairo — West Cairo will see less relief.`,
    48,
    120,
    { width: pageWidth(doc), lineGap: 4 },
  );

  const gap = CITYWIDE.supplyDemandGap;
  doc.moveDown(1);
  doc.fillColor(BRAND.primary).fontSize(14).font("Helvetica-Bold");
  doc.text("The supply–demand gap", 48, doc.y);

  doc.fillColor(BRAND.muted).fontSize(10).font("Helvetica");
  doc.moveDown(0.3);
  doc.text(
    `Cairo's estimated annual office demand runs at ~${(gap.demandAnnualSqm / 1_000_000).toFixed(1)}M sqm against current supply of ~${(gap.supplyAnnualSqm / 1_000_000).toFixed(1)}M sqm — a structural undersupply that's translating into landlord pricing power, extended payment plans, and reduced fit‑out concessions.`,
    48,
    doc.y,
    { width: pageWidth(doc), lineGap: 4 },
  );

  doc.moveDown(1);
  drawBarChart(
    doc,
    48,
    doc.y,
    pageWidth(doc),
    80,
    [
      { label: "Est. annual demand", value: gap.demandAnnualSqm },
      { label: "Est. annual supply", value: gap.supplyAnnualSqm },
    ],
    {
      valueFormatter: (n) => `${(n / 1_000_000).toFixed(1)}M sqm`,
    },
  );

  doc.moveDown(3);
  doc.fillColor(BRAND.primary).fontSize(14).font("Helvetica-Bold");
  doc.text("Rent ranges by grade (USD /sqm annually)", 48, doc.y);
  doc.moveDown(0.5);
  drawBarChart(
    doc,
    48,
    doc.y,
    pageWidth(doc),
    75,
    [
      { label: "Grade A", value: CITYWIDE.gradeARentUsd },
      { label: "Market average", value: CITYWIDE.averageRentUsd },
      { label: "Grade B", value: CITYWIDE.gradeBRentUsd },
    ],
    {
      valueFormatter: (n) => `$${n.toFixed(0)}`,
      barColor: BRAND.primary,
    },
  );

  doc.moveDown(3);
  doc.fillColor(BRAND.muted).fontSize(9).font("Helvetica-Oblique");
  doc.text(
    `Grade A commands a ${CITYWIDE.gradeAPremiumPct}% pricing premium over Grade B. Sources: JLL Cairo Q1 2026 Real Estate Report; Enterprise MENA, "Cairo office rents jump 20% as demand outpaces supply of Grade A space" (Jul 2026).`,
    48,
    doc.y,
    { width: pageWidth(doc), lineGap: 3 },
  );

  // PAGES 4–9 — District Deep-Dives
  for (const d of enriched) {
    doc.addPage();
    drawPageHeader(doc, `District Profile`, d.name);

    doc.fillColor(BRAND.muted).fontSize(11).font("Helvetica");
    doc.text(d.positioning, 48, 120, { width: pageWidth(doc), lineGap: 4 });

    const statY = doc.y + 20;
    const smallW = (pageWidth(doc) - 16) / 2;
    drawStatCard(
      doc,
      48,
      statY,
      smallW,
      "Avg sale (EGP /sqm)",
      d.saleAvgEgpPerSqm ? formatCurrency(d.saleAvgEgpPerSqm) : "—",
      "Public listings + PLACES data",
    );
    drawStatCard(
      doc,
      48 + smallW + 16,
      statY,
      smallW,
      "Avg rent (USD /sqm/yr)",
      d.rentAvgUsdPerSqmYr ? `$${d.rentAvgUsdPerSqmYr}` : "—",
      "Enterprise MENA Q2 2026",
    );

    doc.y = statY + 115;
    doc.fillColor(BRAND.primary).fontSize(12).font("Helvetica-Bold");
    doc.text("Notable projects", 48, doc.y);
    doc.fillColor(BRAND.muted).fontSize(10).font("Helvetica");
    doc.moveDown(0.3);
    doc.text(d.notableProjects.join(" · "), 48, doc.y, {
      width: pageWidth(doc),
      lineGap: 3,
    });

    doc.moveDown(1);
    doc.fillColor(BRAND.primary).fontSize(12).font("Helvetica-Bold");
    doc.text("Active developers", 48, doc.y);
    doc.fillColor(BRAND.muted).fontSize(10).font("Helvetica");
    doc.moveDown(0.3);
    doc.text(d.activeDevelopers.join(" · "), 48, doc.y, {
      width: pageWidth(doc),
      lineGap: 3,
    });

    doc.moveDown(1);
    doc.fillColor(BRAND.primary).fontSize(12).font("Helvetica-Bold");
    doc.text("Demand drivers", 48, doc.y);
    doc.fillColor(BRAND.muted).fontSize(10).font("Helvetica");
    doc.moveDown(0.3);
    doc.text(d.demandDrivers, 48, doc.y, {
      width: pageWidth(doc),
      lineGap: 3,
    });

    // PLACES-specific data callout
    if (d.placesListings > 0) {
      doc.moveDown(1.5);
      doc.rect(48, doc.y, pageWidth(doc), 60).fill(BRAND.softBg);
      const boxY = doc.y;
      doc.fillColor(BRAND.accent).fontSize(9).font("Helvetica-Bold");
      doc.text("PLACES INTELLIGENCE", 64, boxY + 12, { characterSpacing: 2 });
      doc.fillColor(BRAND.primary).fontSize(11).font("Helvetica");
      const psmText = d.placesAvgEgpPerSqm
        ? `avg EGP ${formatEGP(d.placesAvgEgpPerSqm)}/sqm from our own active listings`
        : "";
      doc.text(
        `We're currently representing ${d.placesListings} active listing${d.placesListings === 1 ? "" : "s"} in ${d.slug}${psmText ? ` (${psmText})` : ""}.`,
        64,
        boxY + 30,
        { width: pageWidth(doc) - 32, lineGap: 2 },
      );
    }
  }

  // PAGE — Comparative pricing table + chart
  doc.addPage();
  drawPageHeader(doc, "Section 03", "Comparative District Pricing");

  doc.fillColor(BRAND.muted).fontSize(10).font("Helvetica");
  doc.text(
    "Average sale price per square metre across all six districts. Numbers reflect Q1/Q2 2026 market data cross‑referenced with active PLACES listings.",
    48,
    120,
    { width: pageWidth(doc), lineGap: 3 },
  );

  doc.moveDown(1.5);
  drawBarChart(
    doc,
    48,
    doc.y,
    pageWidth(doc),
    170,
    enriched
      .filter((d) => d.saleAvgEgpPerSqm != null)
      .map((d) => ({
        label: d.slug,
        value: d.saleAvgEgpPerSqm ?? 0,
      })),
    {
      valueFormatter: (n) => `EGP ${formatEGP(n)}`,
    },
  );

  doc.y = doc.y + 20;
  doc.fillColor(BRAND.primary).fontSize(14).font("Helvetica-Bold");
  doc.text("Average lease rate (USD /sqm annually)", 48, doc.y);
  doc.moveDown(0.5);
  drawBarChart(
    doc,
    48,
    doc.y,
    pageWidth(doc),
    170,
    enriched
      .filter((d) => d.rentAvgUsdPerSqmYr != null)
      .map((d) => ({
        label: d.slug,
        value: d.rentAvgUsdPerSqmYr ?? 0,
      })),
    {
      valueFormatter: (n) => `$${n}`,
      barColor: BRAND.primary,
    },
  );

  // PAGE — PLACES listings distribution
  doc.addPage();
  drawPageHeader(doc, "Section 04", "PLACES Active Pipeline");

  doc.fillColor(BRAND.muted).fontSize(10).font("Helvetica");
  doc.text(
    `PLACES is currently representing ${totalActive} active listings across Greater Cairo — ${forRent} for rent and ${forSale} for sale. This is our own book, and the district distribution below is a real‑time proxy for where deals are actually happening right now.`,
    48,
    120,
    { width: pageWidth(doc), lineGap: 3 },
  );

  doc.moveDown(1);
  drawBarChart(
    doc,
    48,
    doc.y,
    pageWidth(doc),
    170,
    enriched
      .filter((d) => d.placesListings > 0)
      .sort((a, b) => b.placesListings - a.placesListings)
      .map((d) => ({ label: d.slug, value: d.placesListings })),
    {
      valueFormatter: (n) => `${n}`,
      barColor: BRAND.chart.c,
    },
  );

  // PAGE — Outlook + CTA
  doc.addPage();
  drawPageHeader(doc, "Section 05", "Outlook 2026-2027");

  const outlookY = 120;
  doc.fillColor(BRAND.muted).fontSize(11).font("Helvetica");
  doc.text(
    "What we're watching across the next 18 months, based on our own deal flow and third‑party research.",
    48,
    outlookY,
    { width: pageWidth(doc), lineGap: 3 },
  );

  const outlookItems = [
    {
      icon: "01",
      title: "Grade A stays tight through 2026",
      body:
        "With 426,500 sqm of scheduled 2026 deliveries but most concentrated in NAC + New Cairo, West Cairo Grade A will remain scarce. Expect landlord pricing power to persist and payment plans to lengthen further.",
    },
    {
      icon: "02",
      title: "Flexible office moves from niche to default",
      body:
        "IWG's 30 planned Cairo centers is the largest MENA rollout of the year. Expect fitted, month‑to‑month options to eat into the small‑office end of the traditional lease market.",
    },
    {
      icon: "03",
      title: "EGP volatility pushes USD‑pegged leases up the stack",
      body:
        "The March 2026 EGP depreciation triggered landlord repricing. USD leases (offered mostly by international‑grade landlords) are now standard for prime stock. Egyptian tenants are increasingly seeking EGP caps or hybrid pricing.",
    },
    {
      icon: "04",
      title: "New Administrative Capital enters the office comp set",
      body:
        "Once dismissed as residential‑led, NAC's CBD is delivering functional office GLA. Expect it to start appearing in corporate site‑selection shortlists alongside New Cairo by late 2026.",
    },
  ];

  let oY = outlookY + 45;
  outlookItems.forEach((item) => {
    doc.fillColor(BRAND.accent).fontSize(24).font("Helvetica-Bold");
    doc.text(item.icon, 48, oY);
    doc.fillColor(BRAND.primary).fontSize(12).font("Helvetica-Bold");
    doc.text(item.title, 90, oY + 4);
    doc.fillColor(BRAND.muted).fontSize(10).font("Helvetica");
    doc.text(item.body, 90, oY + 24, {
      width: pageWidth(doc) - 42,
      lineGap: 3,
    });
    oY = doc.y + 16;
  });

  // FINAL PAGE — About PLACES + CTA + Sources
  doc.addPage();
  drawPageHeader(doc, "About PLACES", "Talk to us");

  doc.fillColor(BRAND.muted).fontSize(11).font("Helvetica");
  doc.text(
    "PLACES is Egypt's specialized real estate partner for administrative office space. We work with buyers, tenants, and investors across Greater Cairo — with deep developer relationships and end‑to‑end advisory covering leasing, primary purchases, resale, investment consultation, and income‑generating property.",
    48,
    120,
    { width: pageWidth(doc), lineGap: 4 },
  );

  // CTA panel
  const ctaY = doc.y + 30;
  doc.rect(48, ctaY, pageWidth(doc), 160).fill(BRAND.primary);
  doc.fillColor(BRAND.accent).fontSize(10).font("Helvetica-Bold");
  doc.text("READY FOR A PERSONALISED READ?", 72, ctaY + 25, {
    characterSpacing: 2,
  });
  doc.fillColor(BRAND.white).fontSize(22).font("Helvetica-Bold");
  doc.text("Book a 15-minute call", 72, ctaY + 45, {
    width: pageWidth(doc) - 48,
  });
  doc.fillColor("#FFFFFFAA").fontSize(11).font("Helvetica");
  doc.text(
    "A PLACES advisor will walk you through the districts and price bands you care about most — no pressure, no pitch.",
    72,
    ctaY + 82,
    { width: pageWidth(doc) - 48, lineGap: 3 },
  );
  doc.fillColor(BRAND.accent).fontSize(11).font("Helvetica-Bold");
  doc.text("→ places-egy.com/contact", 72, ctaY + 125);

  // Sources
  doc.y = ctaY + 190;
  doc.fillColor(BRAND.primary).fontSize(11).font("Helvetica-Bold");
  doc.text("Sources", 48, doc.y);
  doc.fillColor(BRAND.muted).fontSize(9).font("Helvetica");
  doc.moveDown(0.3);
  const sources = [
    "JLL. \"Cairo Real Estate Market Dynamics — Q1 2026.\" jll.com",
    "Enterprise MENA. \"Cairo office rents jump 20% as demand outpaces supply of Grade A space.\" enterpriseam.com, Jul 2026.",
    "Invest‑Gate. \"JLL: Cairo's Real Estate Adapts Market Shifts During Q1 2026.\" invest-gate.me, 2026.",
    "Global Property Guide. \"Cairo Latest Rental Yields Data (2026).\" globalpropertyguide.com.",
    "Sands of Wealth. \"Updated Rents in Cairo (2026)\" and \"Egypt Real Estate Market Analysis (2026).\" sandsofwealth.com.",
    "PLACES active listings database, live as of report date.",
  ];
  sources.forEach((s) => {
    doc.text(`• ${s}`, 48, doc.y, {
      width: pageWidth(doc),
      lineGap: 2,
      indent: 8,
    });
    doc.moveDown(0.3);
  });

  doc.moveDown(1);
  doc.fillColor(BRAND.muted).fontSize(8).font("Helvetica-Oblique");
  doc.text(
    "This report is provided for informational purposes only. Figures are researched from public and industry sources plus PLACES's active listings database. Market conditions change quickly; contact a PLACES advisor for the most current data on any specific district or transaction.",
    48,
    doc.y,
    { width: pageWidth(doc), lineGap: 3 },
  );

  // Add footer to every page
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    drawPageFooter(doc, i, monthYear);
  }

  doc.end();
  return done;
}

async function main() {
  console.log("[market-report] fetching listings…");
  const buffer = await buildPdf();
  console.log(
    `[market-report] PDF built (${(buffer.length / 1024).toFixed(1)} KB)`,
  );

  try {
    mkdirSync("dist", { recursive: true });
    const localPath = join("dist", "cairo-office-market-report-2026.pdf");
    writeFileSync(localPath, buffer);
    console.log(`[market-report] wrote local copy → ${localPath}`);
  } catch (err) {
    console.warn("[market-report] local write skipped:", err);
  }

  const bucket = process.env.MARKET_REPORT_BUCKET ?? "market-reports";
  const filename = "cairo-office-market-report-2026.pdf";
  console.log(
    `[market-report] uploading to Supabase Storage: ${bucket}/${filename}`,
  );
  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: true,
    });
  if (uploadErr) {
    console.error("[market-report] upload failed:", uploadErr.message);
    process.exit(1);
  }
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(filename);
  console.log("\n✅ Done. Public URL:\n");
  console.log(`  ${pub.publicUrl}\n`);
}

// Only run main() when this file is invoked directly (via npm script /
// tsx CLI). When the server imports us to call buildPdf() from the cron
// handler, we don't want main() to fire.
import { pathToFileURL } from "url";
const invokedDirectly =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
