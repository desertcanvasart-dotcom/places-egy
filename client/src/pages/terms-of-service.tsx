import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: April 2026</p>
          </header>

          <div className="space-y-10 text-foreground/90 leading-relaxed">
            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">1. Agreement to Terms</h2>
              <p>
                By accessing or using the PLACES Real Estate website at places-egy.com, you agree
                to be bound by these Terms of Service. If you do not agree to these terms, please
                do not use our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">2. About PLACES</h2>
              <p>
                PLACES Real Estate is a commercial real estate advisory and brokerage firm based
                in Egypt. We provide information, advisory services, and access to commercial and
                administrative property listings across Cairo and surrounding areas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">3. Use of the Website</h2>
              <p className="mb-3">You may use our website for lawful purposes only. You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Use the website in any way that violates applicable Egyptian or international law</li>
                <li>Attempt to gain unauthorized access to any part of the website or its systems</li>
                <li>Transmit any harmful, fraudulent, or misleading content through our contact or inquiry forms</li>
                <li>Reproduce, distribute, or commercially exploit any content on this website without our written permission</li>
                <li>Use automated tools to scrape, crawl, or extract data from our website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">
                4. Property Listings &amp; Information
              </h2>
              <p className="mb-3">
                The property listings, pricing, availability, and market information published on
                this website are provided for informational purposes only.
              </p>
              <p className="mb-3">
                PLACES makes reasonable efforts to ensure accuracy, but we do not guarantee that
                all listing information is complete, current, or error-free. Property availability,
                pricing, and terms are subject to change without notice.
              </p>
              <p>
                Nothing on this website constitutes a formal offer, contract, or binding commitment
                regarding any property.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">5. Advisory Services</h2>
              <p className="mb-3">
                PLACES provides commercial real estate advisory services including market surveys,
                due diligence support, and unit evaluation. These services are delivered through
                direct engagement with our team and are separate from the general information
                available on this website.
              </p>
              <p>
                Information provided on this website is general in nature and does not constitute
                formal investment, legal, or financial advice. You should seek independent
                professional advice before making any property or investment decision.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">6. Intellectual Property</h2>
              <p className="mb-3">
                All content on this website — including text, images, data, logos, page layouts,
                and structural design — is the property of PLACES Real Estate or its licensed
                partners and is protected under applicable copyright and intellectual property law.
              </p>
              <p>
                You may not reproduce, republish, or distribute any content from this website
                without prior written consent from PLACES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">7. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites, including developer websites
                and external resources. These links are provided for convenience only. PLACES does
                not endorse, control, or take responsibility for the content or practices of any
                third-party website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">
                8. Disclaimer of Warranties
              </h2>
              <p className="mb-3">
                Our website is provided on an "as is" and "as available" basis. PLACES makes no
                warranties, express or implied, regarding the accuracy, reliability, or
                availability of the website or its content.
              </p>
              <p>
                We do not warrant that the website will be uninterrupted, error-free, or free from
                viruses or other harmful components.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">
                9. Limitation of Liability
              </h2>
              <p className="mb-3">
                To the fullest extent permitted by applicable law, PLACES Real Estate shall not be
                liable for any indirect, incidental, consequential, or punitive damages arising
                from your use of this website or reliance on any information published on it.
              </p>
              <p>
                Our total liability for any claim arising from your use of this website shall not
                exceed the amount you have paid to PLACES for services directly related to that
                claim, if any.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold PLACES Real Estate, its team, and affiliates
                harmless from any claims, losses, or damages — including legal fees — arising from
                your use of this website or your violation of these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">11. Governing Law</h2>
              <p>
                These Terms of Service are governed by the laws of the Arab Republic of Egypt. Any
                disputes arising from these terms or your use of this website shall be subject to
                the exclusive jurisdiction of the competent courts of Egypt.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">
                12. Changes to These Terms
              </h2>
              <p>
                We may update these Terms of Service at any time. Changes will be reflected by
                updating the "Last updated" date at the top of this page. Continued use of the
                website after any changes constitutes your acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">13. Contact</h2>
              <p className="mb-3">For questions about these Terms of Service, contact us at:</p>
              <address className="not-italic text-muted-foreground">
                <p className="font-semibold text-primary">PLACES Real Estate</p>
                <p>info@places-egy.com</p>
                <p>01063618217</p>
                <p>Tolip Hotel, New Cairo</p>
              </address>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
