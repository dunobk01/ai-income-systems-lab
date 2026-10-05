import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CreditCard, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { FreeToolCards } from "@/components/free-tools/tool-cards";
import { ogImageMeta } from "@/lib/og";
import { FREE_TOOLS } from "@/lib/free-tools-data";

const TITLE = "Free AI Tools for Small Business Owners";
const DESC =
  "Free AI tools for small business: prompt generator, AI readiness scorecard, time & money savings calculator, and AI search visibility check. Results in 60 seconds, no signup.";
const URL = "https://ai-income-systems.com/free-tools";

const FAQS = [
  {
    q: "Are these tools really free?",
    a: "Yes. You can run every tool and see a result without an account or a card. You only give an email if you want the full personalised report.",
  },
  {
    q: "Do I need to sign up to get a result?",
    a: "No. Each tool shows your result on screen immediately. The email step is optional and only sends the longer report.",
  },
  {
    q: "What happens to my email address?",
    a: "It's used to send your report and occasional practical AI emails you can unsubscribe from in one click. We never sell it.",
  },
  {
    q: "Will these tools tell me how much money I'll make?",
    a: "No. We don't do income promises. The tools estimate time saved and point at the work worth automating first.",
  },
];

export const Route = createFileRoute("/free-tools/")({
  head: () => ({
    meta: [
      { title: `${TITLE} — AI Income Systems Lab` },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Free AI Tools for Small Business Owners",
          url: URL,
          itemListElement: FREE_TOOLS.filter((t) => t.status === "live").map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "SoftwareApplication",
              name: t.name,
              description: t.promise,
              url: `https://ai-income-systems.com${t.path}`,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://ai-income-systems.com/" },
            { "@type": "ListItem", position: 2, name: "Free Tools", item: URL },
          ],
        }),
      },
    ],
  }),
  component: FreeToolsHub,
});

function FreeToolsHub() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 sm:pt-20 pb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free tools
          </div>
          <h1 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight">
            Free AI tools for <span className="text-gradient">small business owners</span>.
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
            Answers in 60 seconds, no signup to start.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
        <FreeToolCards location="free-tools-hub" />
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-12">
        <div className="glass rounded-2xl p-5 grid gap-4 sm:grid-cols-3 text-sm">
          {[
            { icon: CreditCard, text: "No card, ever" },
            { icon: Zap, text: "Instant result on screen" },
            { icon: ShieldCheck, text: "We never sell your email" },
          ].map((t) => (
            <div key={t.text} className="flex items-center gap-2 text-muted-foreground">
              <t.icon className="h-4 w-4 text-[color:var(--brand-2)] shrink-0" />
              {t.text}
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Want the step-by-step version? Read our{" "}
          <Link to="/guides" className="text-[color:var(--brand)] hover:underline">free AI business guides</Link>.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <h2 className="text-2xl font-bold tracking-tight text-center">Questions people ask</h2>
        <div className="mt-6 space-y-3">
          {FAQS.map((f) => (
            <div key={f.q} className="glass rounded-2xl p-5">
              <p className="font-semibold">{f.q}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
        <div className="glass-strong rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to build the systems behind the answers?</h2>
          <p className="mt-2 text-muted-foreground">
            The Lab teaches you to wire these automations together yourself — step by step, no agency retainer.
          </p>
          <Button asChild size="lg" variant="brand" className="mt-6 h-12 px-7">
            <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
