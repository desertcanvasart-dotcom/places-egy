import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LeadForm } from "@/components/LeadForm";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { FileText, BarChart3, MapPin, Building2 } from "lucide-react";

// Dedicated landing page for the "Cairo Office Market Report 2026" lead
// magnet. The page's whole job is: sell the value of the report, capture
// the email, deliver the PDF (once the PDF exists — for now we save the
// lead and PLACES team follows up manually while we finalize the doc).

export default function MarketReportPage() {
  useDocumentMeta({
    title: "Cairo Office Market Report 2026 — Free Download | PLACES",
    description:
      "Pricing trends, supply pipeline, top developers, and yield analysis across Cairo's six most active office districts. Free PDF report from the PLACES advisory team.",
    url: "https://places-egy.com/resources/market-report",
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Market Report", url: "/resources/market-report" },
        ])}
      />
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left — value pitch */}
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full mb-5">
                Free · 2026 Edition
              </span>
              <h1 className="text-3xl md:text-[2.75rem] font-serif font-bold text-primary mb-4 leading-tight">
                Cairo Office Market Report 2026
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                A no-noise briefing on Egypt's administrative office market —
                pricing, supply, absorption, and where the yields are heading.
                Built for investors and businesses making 7-figure office
                decisions.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex gap-3">
                  <BarChart3 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-primary text-sm">
                      Price benchmarks by district
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Buy and lease rates per sqm across New Cairo, Sheikh
                      Zayed, 6th October, Downtown, Sheraton, and Maadi.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Building2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-primary text-sm">
                      Supply pipeline
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Which developments are delivering in 2026-2027 and how
                      that shifts availability in your target area.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-primary text-sm">
                      Where the smart money is going
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Yield analysis, absorption rates, and a shortlist of
                      districts our advisors are watching this year.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <FileText className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-primary text-sm">
                      12-page PDF, instant download
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sent to your inbox the moment you sign up. Share it
                      internally — attribution to PLACES stays on every page.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — form card */}
            <div className="bg-white rounded-2xl border border-border/40 shadow-lg p-6 md:p-8 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-primary mb-1">
                Get the report
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your details — we'll email it to you within a few
                minutes.
              </p>
              <LeadForm
                leadSource="market_report_landing"
                magnet="cairo_office_market_report_2026"
                submitLabel="Send me the report"
                showMessage={false}
                successTitle="You're on the list."
                successBody="Watch your inbox — the report will land within a few minutes. If it doesn't show up, check your spam folder and mark PLACES as safe."
              />
              <p className="mt-4 text-[11px] text-muted-foreground text-center">
                We'll also send you the quarterly market update. Unsubscribe
                any time.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
