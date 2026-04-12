import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: April 2026</p>
          </header>

          <div className="space-y-10 text-foreground/90 leading-relaxed">
            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">1. Introduction</h2>
              <p className="mb-3">
                PLACES Real Estate operates the website places-egy.com. This Privacy Policy explains
                how we collect, use, and protect information you provide when you use our website.
              </p>
              <p>
                By using our website, you agree to the collection and use of information in
                accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">
                2. Information We Collect
              </h2>
              <h3 className="text-lg font-semibold text-primary mb-2">
                Information you provide directly
              </h3>
              <p className="mb-4">
                When you submit a contact or inquiry form, we collect your name, email address,
                phone number (if provided), and the content of your message. You are never required
                to submit personal information to browse our website.
              </p>
              <h3 className="text-lg font-semibold text-primary mb-2">
                Information collected automatically
              </h3>
              <p>
                When you visit our website, Google Analytics automatically collects browser type,
                pages visited, time on page, referring source, general location, and device type.
                This data is aggregated and not linked to your identity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">
                3. How We Use Your Information
              </h2>
              <p className="mb-3">
                We use the information you provide to respond to your inquiry, provide relevant
                property or market information, and follow up where appropriate.
              </p>
              <p>
                We use automatically collected data to understand how visitors use our website and
                improve its content and structure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">
                4. How We Share Your Information
              </h2>
              <p className="mb-3">
                We do not sell, trade, or rent your personal information to third parties.
              </p>
              <p className="mb-3">
                We may share your information with service providers such as Google Analytics who
                process data on our behalf, or with legal authorities where required by Egyptian
                law or applicable international law.
              </p>
              <p>
                We do not share your information with real estate portals, advertising networks, or
                third-party marketers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">5. Google Analytics</h2>
              <p>
                Our website uses Google Analytics to understand visitor behavior. Data collected is
                anonymized and aggregated. You can opt out by installing the Google Analytics
                Opt-out Browser Add-on at tools.google.com/dlpage/gaoptout.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">6. Cookies</h2>
              <p className="mb-3">
                Our website uses cookies to support basic functionality and analytics.
              </p>
              <p>
                We use two types: strictly necessary cookies, which are required for the website to
                function and cannot be disabled, and analytics cookies used by Google Analytics,
                which you can opt out of at any time through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">7. Data Retention</h2>
              <p>
                We retain contact and inquiry data for as long as necessary to respond to your
                request and maintain a record of our communications. To request removal of your
                data, contact us directly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">
                8. International Users
              </h2>
              <p>
                PLACES is based in Egypt and primarily serves users in Egypt and the Middle East.
                If you access our website from outside Egypt, your information may be transferred
                to and processed in Egypt. By using our website, you consent to this.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">9. Your Rights</h2>
              <p>
                You may have the right to access, correct, or request deletion of the personal
                information we hold about you, and to withdraw consent where applicable. Contact us
                to exercise any of these rights. We will respond within a reasonable timeframe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">10. Data Security</h2>
              <p>
                We implement reasonable technical and organizational measures to protect your
                personal data. No method of internet transmission is completely secure, but we take
                all reasonable steps to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">
                11. Children's Privacy
              </h2>
              <p>
                Our website is not directed at individuals under 18. We do not knowingly collect
                personal information from minors. Contact us if you believe a minor has submitted
                information and we will remove it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">
                12. Changes to This Policy
              </h2>
              <p>
                We may update this policy from time to time. The "Last updated" date at the top of
                this page will reflect any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">13. Contact</h2>
              <p className="mb-3">
                For any questions about this Privacy Policy or to exercise your rights, contact us at:
              </p>
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
