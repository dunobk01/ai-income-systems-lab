import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AI Income Systems Lab" },
      {
        name: "description",
        content:
          "AI Income Systems Lab terms of service. Read the rules and conditions for using our platform.",
      },
      {
        property: "og:title",
        content: "Terms of Service — AI Income Systems Lab",
      },
      {
        property: "og:description",
        content:
          "AI Income Systems Lab terms of service. Read the rules and conditions for using our platform.",
      },
      { property: "og:url", content: "https://ai-income-systems.com/terms" },
    ],
    links: [
      { rel: "canonical", href: "https://ai-income-systems.com/terms" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-12 text-center">
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">
            Terms of <span className="text-gradient">Service</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-24 space-y-10">
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By accessing or using AI Income Systems Lab ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">2. Eligibility</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You must be at least 13 years old to use the Platform. By using the Platform, you represent that you meet this requirement and have the legal capacity to enter into these terms.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">3. Accounts & Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">4. Subscriptions & Payments</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Some features require a paid subscription. All fees are non-refundable unless otherwise stated or required by law. Subscription fees are charged on a recurring basis until canceled. You may cancel at any time through your account settings or by contacting support.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">5. Intellectual Property</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All content, materials, and software on the Platform are owned by AI Income Systems Lab or its licensors and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without express permission.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">6. Prohibited Conduct</h2>
          <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed space-y-1">
            <li>Use the Platform for any illegal or unauthorized purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Platform</li>
            <li>Interfere with or disrupt the integrity or performance of the Platform</li>
            <li>Harass, abuse, or harm another person through the Platform</li>
            <li>Upload or transmit viruses, malware, or other malicious code</li>
            <li>Scrape, data-mine, or systematically collect content without permission</li>
          </ul>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">7. Termination</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may suspend or terminate your account and access to the Platform at our discretion, without notice, for conduct that violates these terms or is otherwise harmful to other users or us.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">8. Disclaimers</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Platform is provided "as is" without warranties of any kind. We do not guarantee that the Platform will be uninterrupted, secure, or error-free. Your use is at your own risk.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">9. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, AI Income Systems Lab shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Platform.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">10. Governing Law</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These Terms shall be governed by the laws of the State of Arizona, without regard to conflict of law principles. Any disputes shall be resolved in the courts located in Tucson, Arizona.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">11. Changes to Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may modify these Terms at any time. Material changes will be posted on this page with an updated effective date. Continued use after changes constitutes acceptance of the revised Terms.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">12. Contact Us</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you have questions about these Terms, please email{" "}
            <a href="mailto:support@ai-income-systems.com" className="text-[color:var(--brand-2)] hover:underline">
              support@ai-income-systems.com
            </a>{" "}
            or write to us at:<br />
            AI Income Systems Lab<br />
            383 S Stone Ave, Unit 203<br />
            Tucson, AZ 85701
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
