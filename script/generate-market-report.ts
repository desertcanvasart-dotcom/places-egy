import PDFDocument from "pdfkit";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Generates the Cairo Office Market Report PDF from live Supabase listings.
// Run: tsx --env-file=.env script/generate-market-report.ts
//   → outputs to dist/market-report.pdf
//   → also uploads to Supabase Storage bucket `reports` at the same time so
//     the URL stays stable across regenerations.
//
// PDF brand colors match the PLACES site:
//   primary: #171717 (near-black)
//   accent:  #E11D48 (rose/red)
//   muted:   #64748B (slate)
// Body copy uses the system-default Helvetica (bundled with PDFKit).

const BRAND = {
  primary: "#171717",
  accent: "#E11D48",
  muted: "#64748B",
  softBg: "#F8F5F1",
  white: "#FFFFFF",
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

// ── Stats computation ───────────────────────────────────────────────────────
type DistrictStat = {
  location: string;
  totalListings: number;
  rentListings: number;
  saleListings: number;
  avgRentPerSqm: number | null;
  avgSalePerSqm: number | null;
  minPrice: number | null;
  maxPrice: number | null;
};

const DISPLAY_LOCATIONS = [
  "New Cairo",
  "Sheikh Zayed",
  "6th October",
  "Downtown Cairo",
  "Sheraton",
  "Maadi",
];

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

function computeDistrictStats(listings: Listing[]): DistrictStat[] {
  const groups = new Map<string, Listing[]>();
  for (const l of listings) {
    const loc = normalizeLoc(l.location);
    if (!DISPLAY_LOCATIONS.includes(loc)) continue;
    const arr = groups.get(loc) ?? [];
    arr.push(l);
    groups.set(loc, arr);
  }
  return DISPLAY_LOCATIONS.map((loc) => {
    const items = groups.get(loc) ?? [];
    const rents = items.filter(
      (i) => i.transaction_type?.toLowerCase() === "rent",
    );
    const sales = items.filter(
      (i) => i.transaction_type?.toLowerCase() === "sale",
    );
    const rentPsm = rents
      .filter((r) => r.price && r.area_sqm && r.area_sqm > 0)
      .map((r) => r.price! / r.area_sqm!);
    const salePsm = sales
      .filter((r) => r.price && r.area_sqm && r.area_sqm > 0)
      .map((r) => r.price! / r.area_sqm!);
    const prices = items.map((i) => i.price).filter((p): p is number => p != null);
    return {
      location: loc,
      totalListings: items.length,
      rentListings: rents.length,
      saleListings: sales.length,
      avgRentPerSqm: rentPsm.length
        ? rentPsm.reduce((a, b) => a + b, 0) / rentPsm.length
        : null,
      avgSalePerSqm: salePsm.length
        ? salePsm.reduce((a, b) => a + b, 0) / salePsm.length
        : null,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
    };
  });
}

function topDevelopers(listings: Listing[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const l of listings) {
    if (!l.developer) continue;
    const name = l.developer.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function formatEGP(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M EGP`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K EGP`;
  return `${Math.round(n)} EGP`;
}

// ── PDF rendering ───────────────────────────────────────────────────────────
async function buildPdf(): Promise<Buffer> {
  const listings = await fetchListings();
  const active = listings.filter((l) => l.price != null);
  const districts = computeDistrictStats(active);
  const developers = topDevelopers(active);

  const totalListings = active.length;
  const totalRent = active.filter(
    (i) => i.transaction_type?.toLowerCase() === "rent",
  ).length;
  const totalSale = active.filter(
    (i) => i.transaction_type?.toLowerCase() === "sale",
  ).length;

  const now = new Date();
  const monthYear = now.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: "Cairo Office Market Report 2026",
      Author: "PLACES",
      Subject: "Cairo administrative office real estate market snapshot",
      Keywords: "Cairo, office, real estate, market report, PLACES",
      Creator: "PLACES Website",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const pageWidth = doc.page.width - 96; // 48 margin each side

  // ── COVER PAGE ────────────────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(BRAND.primary);
  doc.fillColor(BRAND.accent).fontSize(11).font("Helvetica-Bold");
  doc.text("PLACES", 48, 60, { characterSpacing: 3 });
  doc.fillColor("#FFFFFF80").fontSize(10).font("Helvetica");
  doc.text("Egypt's specialized office real estate partner", 48, 78);

  // Big title in the middle
  doc.fillColor(BRAND.accent).fontSize(11).font("Helvetica-Bold");
  doc.text(`FREE · ${monthYear.toUpperCase()}`, 48, 260, { characterSpacing: 3 });

  doc.fillColor(BRAND.white).fontSize(48).font("Helvetica-Bold");
  doc.text("Cairo Office", 48, 285, { width: pageWidth });
  doc.text("Market Report", 48, doc.y, { width: pageWidth });

  doc.moveDown(1);
  doc.fillColor("#FFFFFFB0").fontSize(14).font("Helvetica");
  doc.text(
    "A data-driven snapshot of pricing, supply, and where the smart money is going across Cairo's six most active administrative office districts.",
    48,
    doc.y,
    { width: pageWidth, lineGap: 6 },
  );

  // Footer of cover
  doc.fillColor("#FFFFFF60").fontSize(9).font("Helvetica");
  doc.text(
    `Prepared by the PLACES advisory team · ${monthYear} · places-egy.com`,
    48,
    doc.page.height - 80,
    { width: pageWidth },
  );

  // ── PAGE 2: EXECUTIVE SUMMARY ─────────────────────────────────────────────
  doc.addPage();
  drawPageHeader(doc, "Executive Summary");

  const summaryY = 120;
  drawStatCard(doc, 48, summaryY, (pageWidth - 24) / 3, "Active listings", String(totalListings));
  drawStatCard(doc, 48 + (pageWidth - 24) / 3 + 12, summaryY, (pageWidth - 24) / 3, "For rent", String(totalRent));
  drawStatCard(doc, 48 + 2 * ((pageWidth - 24) / 3 + 12), summaryY, (pageWidth - 24) / 3, "For sale", String(totalSale));

  doc.fillColor(BRAND.primary).fontSize(14).font("Helvetica-Bold");
  doc.text("What this report covers", 48, summaryY + 100);

  doc.fillColor(BRAND.muted).fontSize(11).font("Helvetica");
  doc.moveDown(0.5);
  doc.text(
    "This report benchmarks live administrative office prices across the six most active districts in Greater Cairo — New Cairo, Sheikh Zayed, 6th October, Downtown Cairo, Sheraton, and Maadi. Prices are computed from active listings PLACES represents right now, so the numbers reflect what deals are actually closing at.",
    { lineGap: 4, width: pageWidth },
  );
  doc.moveDown(0.5);
  doc.text(
    "You'll find: average price per square metre for buy and lease, supply distribution by developer, and where our advisors are seeing the strongest demand.",
    { lineGap: 4, width: pageWidth },
  );
  doc.moveDown(0.5);
  doc.text(
    "Have a specific requirement? Reply to the email that delivered this report — it goes straight to a PLACES advisor.",
    { lineGap: 4, width: pageWidth },
  );

  // ── PAGE 3: PRICING BY DISTRICT ───────────────────────────────────────────
  doc.addPage();
  drawPageHeader(doc, "Pricing by District");

  doc.fillColor(BRAND.muted).fontSize(10).font("Helvetica");
  doc.text(
    "Average rent and sale prices per square metre, computed from active listings.",
    48,
    120,
    { width: pageWidth },
  );

  let tableY = 155;
  const colX = { name: 48, listings: 220, rent: 320, sale: 440 };
  doc.fillColor(BRAND.primary).fontSize(10).font("Helvetica-Bold");
  doc.text("District", colX.name, tableY);
  doc.text("Listings", colX.listings, tableY);
  doc.text("Rent /sqm", colX.rent, tableY);
  doc.text("Sale /sqm", colX.sale, tableY);
  tableY += 20;
  doc
    .strokeColor(BRAND.muted)
    .lineWidth(0.5)
    .moveTo(48, tableY - 4)
    .lineTo(48 + pageWidth, tableY - 4)
    .stroke();

  doc.font("Helvetica").fontSize(10);
  for (const d of districts) {
    if (d.totalListings === 0) continue;
    doc.fillColor(BRAND.primary).text(d.location, colX.name, tableY);
    doc.fillColor(BRAND.muted).text(String(d.totalListings), colX.listings, tableY);
    doc.text(
      d.avgRentPerSqm ? formatEGP(d.avgRentPerSqm) : "—",
      colX.rent,
      tableY,
    );
    doc.text(
      d.avgSalePerSqm ? formatEGP(d.avgSalePerSqm) : "—",
      colX.sale,
      tableY,
    );
    tableY += 24;
  }

  // Note
  doc.moveDown(2);
  doc.fillColor(BRAND.muted).fontSize(9).font("Helvetica-Oblique");
  doc.text(
    "Where a district shows '—', we don't yet have enough active listings in that transaction type to publish a reliable benchmark. Contact us for private comps.",
    48,
    tableY + 20,
    { width: pageWidth, lineGap: 3 },
  );

  // ── PAGE 4: TOP DEVELOPERS + CTA ──────────────────────────────────────────
  doc.addPage();
  drawPageHeader(doc, "Top Developers");

  doc.fillColor(BRAND.muted).fontSize(10).font("Helvetica");
  doc.text(
    "Developers most represented in our current listings pipeline — a proxy for market activity.",
    48,
    120,
    { width: pageWidth },
  );

  let devY = 155;
  doc.fontSize(11);
  for (const dev of developers) {
    doc.fillColor(BRAND.primary).font("Helvetica-Bold");
    doc.text(dev.name, 48, devY);
    doc.fillColor(BRAND.accent).font("Helvetica-Bold");
    doc.text(`${dev.count} listings`, 48 + pageWidth - 100, devY, {
      width: 100,
      align: "right",
    });
    devY += 22;
    doc
      .strokeColor(BRAND.softBg)
      .lineWidth(0.5)
      .moveTo(48, devY - 4)
      .lineTo(48 + pageWidth, devY - 4)
      .stroke();
  }

  // Final CTA panel
  const ctaY = devY + 60;
  doc.rect(48, ctaY, pageWidth, 180).fill(BRAND.primary);

  doc.fillColor(BRAND.accent).fontSize(10).font("Helvetica-Bold");
  doc.text("READY FOR THE NEXT STEP?", 72, ctaY + 30, { characterSpacing: 2 });

  doc.fillColor(BRAND.white).fontSize(20).font("Helvetica-Bold");
  doc.text("Talk to a PLACES advisor", 72, ctaY + 50, { width: pageWidth - 48 });

  doc.fillColor("#FFFFFFAA").fontSize(11).font("Helvetica");
  doc.text(
    "Book a free 15-minute call and we'll walk you through what's happening in the districts and price bands you care about most.",
    72,
    ctaY + 90,
    { width: pageWidth - 48, lineGap: 3 },
  );

  doc.fillColor(BRAND.accent).fontSize(11).font("Helvetica-Bold");
  doc.text(
    "→ places-egy.com/contact",
    72,
    ctaY + 140,
    { width: pageWidth - 48 },
  );

  // ── FOOTER on every page ──────────────────────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    if (i === 0) continue; // skip cover
    doc.fillColor(BRAND.muted).fontSize(8).font("Helvetica");
    doc.text(
      `Cairo Office Market Report · ${monthYear} · PLACES · places-egy.com`,
      48,
      doc.page.height - 30,
      { width: pageWidth, align: "center" },
    );
  }

  doc.end();
  return done;
}

function drawPageHeader(doc: PDFKit.PDFDocument, title: string): void {
  doc.rect(0, 0, doc.page.width, 80).fill(BRAND.softBg);
  doc.fillColor(BRAND.accent).fontSize(9).font("Helvetica-Bold");
  doc.text("PLACES", 48, 30, { characterSpacing: 3 });
  doc.fillColor(BRAND.primary).fontSize(20).font("Helvetica-Bold");
  doc.text(title, 48, 45);
}

function drawStatCard(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
): void {
  doc.roundedRect(x, y, w, 80, 10).fillAndStroke(BRAND.softBg, BRAND.softBg);
  doc.fillColor(BRAND.accent).fontSize(9).font("Helvetica-Bold");
  doc.text(label.toUpperCase(), x + 16, y + 16, {
    width: w - 32,
    characterSpacing: 1,
  });
  doc.fillColor(BRAND.primary).fontSize(28).font("Helvetica-Bold");
  doc.text(value, x + 16, y + 34, { width: w - 32 });
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("[market-report] fetching listings…");
  const buffer = await buildPdf();
  console.log(`[market-report] PDF built (${(buffer.length / 1024).toFixed(1)} KB)`);

  // Write local copy for inspection
  try {
    mkdirSync("dist", { recursive: true });
    const localPath = join("dist", "cairo-office-market-report-2026.pdf");
    writeFileSync(localPath, buffer);
    console.log(`[market-report] wrote local copy → ${localPath}`);
  } catch (err) {
    console.warn("[market-report] local write skipped:", err);
  }

  // Upload to Supabase Storage → returns a stable public URL
  const bucket = process.env.MARKET_REPORT_BUCKET ?? "market-reports";
  const filename = "cairo-office-market-report-2026.pdf";

  console.log(`[market-report] uploading to Supabase Storage: ${bucket}/${filename}`);
  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: true,
    });
  if (uploadErr) {
    console.error("[market-report] upload failed:", uploadErr.message);
    console.error(
      "\n  Fix: create the bucket in Supabase Studio → Storage → New bucket → name:",
      `"${bucket}"`,
      "→ mark as Public → save. Then re-run this script.",
    );
    process.exit(1);
  }

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(filename);
  console.log("\n✅ Done. Public URL:\n");
  console.log(`  ${pub.publicUrl}\n`);
  console.log("Next: set MARKET_REPORT_URL on Railway to that URL.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
