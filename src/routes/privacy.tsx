import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — AI Income Systems Lab" },
      {
        name: "description",
        content:
          "How AI Income Systems Lab collects, uses, and protects your personal data. Read our full privacy policy.",
      },
      { property: "og:title", content: "Privacy Policy — AI Income Systems Lab" },
      {
        property: "og:description",
        content:
          "How AI Income Systems Lab collects, uses, and protects your personal data.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://ai-income-systems.com/privacy" },
      {
        property: "og:image",
        content: "https://ai-income-systems.com/__l5e/assets-v1/4fc4935b-005a-45ad-950a-3d437f26a30a/og-brand.jpg",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Privacy Policy — AI Income Systems Lab" },
      {
        name: "twitter:description",
        content:
          "How AI Income Systems Lab collects, uses, and protects your personal data.",
      },
      {
        name: "twitter:image",
        content: "https://ai-income-systems.com/__l5e/assets-v1/4fc4935b-005a-45ad-950a-3d437f26a30a/og-brand.jpg",
      },
    ],
    links: [
      { rel: "canonical", href: "https://ai-income-systems.com/privacy" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-12 text-center">
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-24 space-y-10">
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We collect information you provide directly, such as your name, email address, and payment details when you register, subscribe, or contact us. We also collect usage data and device information automatically through cookies and similar technologies.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed space-y-1">
            <li>Provide, operate, and maintain our services and platform</li>
            <li>Process transactions and send related information</li>
            <li>Send administrative and promotional communications</li>
            <li>Respond to inquiries and provide customer support</li>
            <li>Monitor and analyze usage and trends to improve user experience</li>
            <li>Detect, prevent, and address fraud and security issues</li>
          </ul>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">3. Sharing Your Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We do not sell your personal information. We may share data with trusted third-party service providers (such as payment processors, email delivery services, and analytics providers) solely to operate our business. We may also disclose information if required by law or to protect our rights.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">4. Cookies & Tracking</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies and similar tracking technologies to analyze site traffic, understand user behavior, and improve our services. You can control cookie preferences through your browser settings.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">5. Data Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We implement reasonable security measures to protect your personal information. However, no internet-based service can be 100% secure, and we cannot guarantee absolute security of your data.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">6. Your Rights</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Depending on your location, you may have the right to access, correct, delete, or restrict processing of your personal data. To exercise these rights, contact us at support@ai-income-systems.com.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">7. Children's Privacy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our services are not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">8. Changes to This Policy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of the platform after changes constitutes acceptance of the revised policy.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">9. Contact Us</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you have any questions about this Privacy Policy, please email us at{" "}
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
