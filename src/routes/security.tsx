import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security Policy — AI Income Systems Lab" },
      {
        name: "description",
        content:
          "How AI Income Systems Lab protects your data, payments, and account: TLS, Stripe PCI-DSS, RBAC, and incident response.",
      },
      { property: "og:title", content: "Security Policy — AI Income Systems Lab" },
      {
        property: "og:description",
        content:
          "How AI Income Systems Lab protects your data, payments, and account.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://ai-income-systems.com/security" },
      {
        property: "og:image",
        content: "https://ai-income-systems.com/__l5e/assets-v1/4fc4935b-005a-45ad-950a-3d437f26a30a/og-brand.jpg",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Security Policy — AI Income Systems Lab" },
      {
        name: "twitter:description",
        content:
          "How AI Income Systems Lab protects your data, payments, and account.",
      },
      {
        name: "twitter:image",
        content: "https://ai-income-systems.com/__l5e/assets-v1/4fc4935b-005a-45ad-950a-3d437f26a30a/og-brand.jpg",
      },
    ],
    links: [
      { rel: "canonical", href: "https://ai-income-systems.com/security" },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-12 text-center">
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">
            Security <span className="text-gradient">Policy</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-24 space-y-10">
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">1. Transport Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All traffic to and from AI Income Systems Lab is encrypted in transit using TLS 1.2 or higher. We enforce HTTPS sitewide and use HSTS headers to help protect against downgrade attacks.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">2. Payment Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Payments are processed by Stripe, a PCI-DSS Level 1 certified payment processor. We do not store full credit card numbers or CVV codes on our servers. Stripe handles all payment card data according to industry security standards.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">3. Authentication & Access</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            User accounts are protected by password-based authentication through our auth provider. Member-only content and admin functions are gated by role-based access controls (RBAC). We strongly recommend using a unique, strong password for your account.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">4. Data Storage & Backups</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Customer data is stored in encrypted databases hosted by our cloud infrastructure providers. Automated backups and replication help protect against data loss. We retain data only as long as necessary for the purposes described in our Privacy Policy.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">5. Third-Party Services</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use trusted third-party services for hosting, payments, email delivery, and analytics. Each provider is evaluated for security practices and is contractually bound to handle data responsibly. We do not sell your data to third parties.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">6. Monitoring & Incident Response</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We monitor our systems for suspicious activity and unauthorized access. If we become aware of a security incident that affects your data, we will notify affected users as required by law and take prompt steps to mitigate the issue.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">7. Reporting Vulnerabilities</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you believe you've found a security vulnerability in our platform, please email us at{" "}
            <a href="mailto:support@ai-income-systems.com" className="text-[color:var(--brand-2)] hover:underline">
              support@ai-income-systems.com
            </a>. We appreciate responsible disclosure and will investigate all reports promptly.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">8. Changes to This Policy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may update this Security Policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of the platform after changes constitutes acceptance of the revised policy.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
