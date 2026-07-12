import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy — AI Income Systems Lab" },
      {
        name: "description",
        content:
          "14-day money-back guarantee, cancel anytime, no hidden fees. Read the AI Income Systems Lab refund and cancellation policy.",
      },
      { property: "og:title", content: "Refund & Cancellation Policy — AI Income Systems Lab" },
      {
        property: "og:description",
        content:
          "14-day money-back guarantee, cancel anytime, no hidden fees.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://ai-income-systems.com/refund" },
      {
        property: "og:image",
        content: "https://ai-income-systems.com/__l5e/assets-v1/9053bc09-99f9-4de8-9ff8-ad1634bd23d2/og-brand.jpg",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Refund & Cancellation Policy — AI Income Systems Lab" },
      {
        name: "twitter:description",
        content:
          "14-day money-back guarantee, cancel anytime, no hidden fees.",
      },
      {
        name: "twitter:image",
        content: "https://ai-income-systems.com/__l5e/assets-v1/9053bc09-99f9-4de8-9ff8-ad1634bd23d2/og-brand.jpg",
      },
    ],
    links: [
      { rel: "canonical", href: "https://ai-income-systems.com/refund" },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-12 text-center">
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">
            Refund & <span className="text-gradient">Cancellation</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: July 12, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-24 space-y-10">
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">1. 14-Day Money-Back Guarantee</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We offer a 14-day money-back guarantee on your first payment for any subscription tier. If the program isn't a fit, email us within 14 days of your initial purchase and we'll refund 100% of your payment — no hoops, no hard feelings.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">2. Cancel Anytime</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You can cancel your subscription at any time from your account settings or by emailing{" "}
            <a href="mailto:support@ai-income-systems.com" className="text-[color:var(--brand-2)] hover:underline">
              support@ai-income-systems.com
            </a>. After canceling, you keep full access through the end of your current billing period.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">3. No Hidden Fees or Forced Upsells</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The price you see is the price you pay. There are no setup fees, surprise charges, or mandatory upsells. You can upgrade or downgrade tiers at any time.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">4. How to Request a Refund</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To request a refund, send an email to{" "}
            <a href="mailto:support@ai-income-systems.com" className="text-[color:var(--brand-2)] hover:underline">
              support@ai-income-systems.com
            </a>{" "}
            with the subject line "Refund Request" and include the email address used for your account. We process refund requests within 2–5 business days.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">5. Exceptions</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The 14-day guarantee applies to your first payment only. Renewals and subsequent subscription charges are eligible for cancellation going forward but are not eligible for retroactive refunds after the initial 14-day window has passed.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">6. Annual Plans</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Annual plans include 2 months free compared to paying monthly. If you cancel an annual plan after the 14-day guarantee period, you keep access through the end of the annual billing period. Annual plans are not prorated for partial use.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">7. Changes to This Policy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may update this Refund & Cancellation Policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of the platform after changes constitutes acceptance of the revised policy.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
