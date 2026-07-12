import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { z } from "zod";
import { Check, Sparkles, ArrowRight, X as XIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { CohortCountdown } from "@/components/cohort-countdown";
import { LeadCapture } from "@/components/lead-capture";
import { useAuth } from "@/lib/auth-context";
import { ogImageMeta } from "@/lib/og";
import { ExitIntentModal } from "@/components/exit-intent-modal";

const pricingFaqs = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel from Settings in one click; access continues through the end of your billing period." },
  { q: "What's the difference between Monthly and Annual?", a: "Annual plans are billed once per year at the equivalent of 10 months (2 months free). Same features either way." },
  { q: "Do you offer refunds?", a: "Monthly is cancel-anytime — no refund needed. Annual plans get a 14-day money-back guarantee." },
  { q: "Can I upgrade or downgrade?", a: "Yes, from Settings. Upgrades pro-rate immediately; downgrades apply at the next billing cycle." },
  { q: "Is my payment secure?", a: "All payments are processed by Stripe. We never see or store your card details." },
  { q: "Do I get lifetime access?", a: "Your access lasts as long as your subscription is active. If you cancel, you keep access through the current billing period." },
];

export const Route = createFileRoute("/pricing")({
  validateSearch: z.object({ expired: z.coerce.boolean().optional() }),
  head: () => ({
    meta: [
      { title: "Pricing — AI Income Systems Lab" },
      { name: "description", content: "Monthly or annual memberships. Starter $29/mo, Builder $79/mo, Accelerator $149/mo. Annual plans get 2 months free. Cancel anytime." },
      { property: "og:title", content: "Pricing — AI Income Systems Lab" },
      { property: "og:description", content: "Three subscription tiers — Starter, Builder, Accelerator. Monthly or annual. Cancel anytime." },
      { property: "og:url", content: "https://ai-income-systems.com/pricing" },
    
      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: "https://ai-income-systems.com/pricing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "AI Income Systems Lab",
          description: "Course + interactive builders teaching AI-powered digital products, funnels, automations, faceless video, image gen, and chatbots.",
          brand: { "@type": "Brand", name: "AI Income Systems Lab" },
          offers: [
            { "@type": "Offer", name: "Starter Monthly", price: "29", priceCurrency: "USD", url: "https://ai-income-systems.com/pricing", availability: "https://schema.org/InStock" },
            { "@type": "Offer", name: "Builder Monthly", price: "79", priceCurrency: "USD", url: "https://ai-income-systems.com/pricing", availability: "https://schema.org/InStock" },
            { "@type": "Offer", name: "Accelerator Monthly", price: "149", priceCurrency: "USD", url: "https://ai-income-systems.com/pricing", availability: "https://schema.org/InStock" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: pricingFaqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: PricingPage,
});

type TierKey = "starter" | "builder" | "accelerator";
type Tier = {
  name: string;
  key: TierKey;
  monthly: number;
  annual: number;
  monthlyPriceId: string;
  annualPriceId: string;
  tag: string;
  featured?: boolean;
  bestFor: string;
  whyUpgrade: string;
  features: string[];
};

const tiers: Tier[] = [
  {
    name: "Starter",
    key: "starter",
    monthly: 29,
    annual: 290,
    monthlyPriceId: "starter_monthly",
    annualPriceId: "starter_annual",
    tag: "Core course",
    bestFor: "Beginners who want the full curriculum and a shippable first offer.",
    whyUpgrade: "All 11 core modules + 90+ lessons. Learn the system end-to-end.",
    features: [
      "Full 11-module course access",
      "Searchable prompt library (12 starter prompts)",
      "Action steps + downloads on every lesson",
      "Progress tracking + private notes",
      "Cancel anytime · Upgrade anytime",
    ],
  },
  {
    name: "Builder",
    key: "builder",
    monthly: 79,
    annual: 790,
    monthlyPriceId: "builder_monthly",
    annualPriceId: "builder_annual",
    tag: "Most popular",
    featured: true,
    bestFor: "Creators ready to launch products, funnels, and offers with AI shortcuts.",
    whyUpgrade: "Courses + community + templates + the interactive builders that turn ideas into ship-ready plans in minutes.",
    features: [
      "Everything in Starter",
      "Members-only Community + Wins channel",
      "Template Library (prompts, n8n workflows, Lovable scaffolds)",
      "Digital Product Builder + Sales Funnel Builder",
      "AI Tool Stack Guide & 20 Builder-tier prompts",
    ],
  },
  {
    name: "Accelerator",
    key: "accelerator",
    monthly: 149,
    annual: 1490,
    monthlyPriceId: "accelerator_monthly",
    annualPriceId: "accelerator_annual",
    tag: "All-in",
    bestFor: "Operators selling AI services or running multiple income systems.",
    whyUpgrade: "Everything above + faceless video, image gen, and chatbot agency modules. All builders + member DMs unlocked.",
    features: [
      "Everything in Builder",
      "Faceless Video Income (ElevenLabs + HeyGen/Synthesia)",
      "AI Image Income (Midjourney / Flux 2 for POD, ads, thumbnails)",
      "Chatbot Agency module (Botpress — $1k–5k setup deals)",
      "Agent Generator + AI Agents & Skills (8 deep lessons)",
      "Local Business AI Service Kit + 25 Pro prompts",
      "Direct messages between members",
    ],
  },
];

const TIER_RANK: Record<string, number> = { none: 0, monthly: 1, starter: 1, builder: 2, pro: 3, accelerator: 3 };

type Row = { label: string; starter: boolean | string; builder: boolean | string; accelerator: boolean | string };
const compare: { section: string; rows: Row[] }[] = [
  {
    section: "Learning",
    rows: [
      { label: "Core course (11 modules · 90+ lessons)", starter: true, builder: true, accelerator: true },
      { label: "AI Agents & Skills module", starter: false, builder: false, accelerator: true },
      { label: "Faceless Video Income module", starter: false, builder: false, accelerator: true },
      { label: "AI Image Income module", starter: false, builder: false, accelerator: true },
      { label: "Chatbot Agency (Botpress) module", starter: false, builder: false, accelerator: true },
    ],
  },
  {
    section: "Community & support",
    rows: [
      { label: "Members-only community + Wins channel", starter: false, builder: true, accelerator: true },
      { label: "Direct messages between members", starter: false, builder: false, accelerator: true },
      { label: "Progress tracking & notes", starter: true, builder: true, accelerator: true },
    ],
  },
  {
    section: "Prompt library",
    rows: [
      { label: "Starter prompts", starter: "12", builder: "12", accelerator: "12" },
      { label: "Builder prompts", starter: false, builder: "20", accelerator: "20" },
      { label: "Pro/Accelerator prompts", starter: false, builder: false, accelerator: "25" },
    ],
  },
  {
    section: "Interactive builders",
    rows: [
      { label: "Digital Product Builder", starter: false, builder: true, accelerator: true },
      { label: "Sales Funnel Builder", starter: false, builder: true, accelerator: true },
      { label: "Agent Generator (prompt → spec)", starter: false, builder: false, accelerator: true },
    ],
  },
  {
    section: "Templates & kits",
    rows: [
      { label: "n8n Workflow Library", starter: false, builder: true, accelerator: true },
      { label: "AI Tool Stack Guide", starter: false, builder: true, accelerator: true },
      { label: "Local Business AI Service Kit", starter: false, builder: false, accelerator: true },
    ],
  },
];

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check className="h-4 w-4 text-[color:var(--brand-2)] mx-auto" />;
  if (v === false) return <XIcon className="h-4 w-4 text-muted-foreground/50 mx-auto" />;
  return <span className="text-xs text-foreground/85">{v}</span>;
}

function PricingPage() {
  const { user, profile } = useAuth();
  const { expired } = Route.useSearch();
  const currentTier = profile?.tier ?? "none";
  const currentRank = TIER_RANK[currentTier] ?? 0;
  const ctaTo = user ? "/checkout" : "/signup";
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-hero" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-10 text-center">
          {expired && (
            <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
              <strong className="font-semibold">Your membership has ended.</strong> Resubscribe anytime to pick up where you left off.
            </div>
          )}
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Monthly or annual · Cancel anytime
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight">
            Pick your <span className="text-gradient">level</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Three tiers built around what you actually ship. Switch or cancel from Settings anytime. Annual plans get <strong className="text-foreground">2 months free</strong>.
          </p>

          {/* Billing toggle */}
          <div className="mt-7 inline-flex rounded-full glass p-1 text-sm">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full transition ${billing === "monthly" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`px-5 py-2 rounded-full transition flex items-center gap-2 ${billing === "annual" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Annual
              <span className="text-[10px] font-semibold text-background px-2 py-0.5 rounded-full" style={{ background: "var(--gradient-brand)" }}>
                2 months free
              </span>
            </button>
          </div>

          <div className="mt-6 flex justify-center">
            <CohortCountdown label="Current cohort pricing closes in" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => {
            const tierR = TIER_RANK[t.key];
            const isCurrent = !!user && currentTier === t.key;
            const isIncluded = !!user && currentRank > tierR;
            const price = billing === "monthly" ? t.monthly : t.annual;
            const suffix = billing === "monthly" ? "/month" : "/year";
            const priceId = billing === "monthly" ? t.monthlyPriceId : t.annualPriceId;
            return (
              <div
                key={t.name}
                className={`rounded-3xl p-7 flex flex-col ${
                  t.featured ? "ring-brand bg-white/5 relative lg:scale-[1.03] lg:-mt-3 lg:mb-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]" : "glass"
                }`}
              >
                {t.featured && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-background px-3 py-1 rounded-full"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    ★ {t.tag}
                  </span>
                )}
                {!t.featured && <span className="text-xs uppercase tracking-wider text-muted-foreground">{t.tag}</span>}
                <h2 className="mt-2 text-xl font-bold">{t.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{t.bestFor}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-black">${price}</span>
                  <span className="text-sm text-muted-foreground">{suffix}</span>
                </div>
                {billing === "annual" && (
                  <p className="mt-1 text-xs text-[color:var(--brand-2)]">
                    Just ${Math.round(t.annual / 12)}/mo · Save ${t.monthly * 12 - t.annual}/year
                  </p>
                )}
                <p className="mt-3 text-xs leading-relaxed text-[color:var(--brand-2)]/90 bg-[color:var(--brand-2)]/5 border border-[color:var(--brand-2)]/15 rounded-lg px-3 py-2">
                  <span className="font-semibold">Why this tier:</span> {t.whyUpgrade}
                </p>
                <ul className="mt-5 space-y-3 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-[color:var(--brand-2)] mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button disabled variant="glass" className="mt-7 h-11 opacity-70 cursor-default">
                    Current plan
                  </Button>
                ) : isIncluded ? (
                  <Button disabled variant="glass" className="mt-7 h-11 opacity-70 cursor-default">
                    Included in your plan
                  </Button>
                ) : (
                  <Button asChild variant={t.featured ? "brand" : "glass"} className="mt-7 h-11">
                    <Link to={ctaTo} search={{ tier: priceId }}>
                      Start {t.name} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Prices in USD. Stripe-secured checkout. Cancel anytime from Settings — keep access through the end of your billing period.
        </p>
      </section>

      {/* COMPARISON */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Compare every tier</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">What's actually inside each lab</h2>
        </div>
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-medium px-5 py-4 w-1/3">Feature</th>
                  <th className="text-center font-medium px-3 py-4">Starter<br /><span className="text-foreground font-bold normal-case tracking-normal">$29/mo</span></th>
                  <th className="text-center font-medium px-3 py-4 bg-white/5">
                    Builder<br /><span className="text-foreground font-bold normal-case tracking-normal">$79/mo</span>
                    <div className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full text-background font-semibold" style={{ background: "var(--gradient-brand)" }}>Most popular</div>
                  </th>
                  <th className="text-center font-medium px-3 py-4">Accelerator<br /><span className="text-foreground font-bold normal-case tracking-normal">$149/mo</span></th>
                </tr>
              </thead>
              <tbody>
                {compare.map((s) => (
                  <Fragment key={s.section}>
                    <tr className="bg-black/20">
                      <td colSpan={4} className="px-5 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">{s.section}</td>
                    </tr>
                    {s.rows.map((r) => (
                      <tr key={`${s.section}-${r.label}`} className="border-b border-white/5 last:border-0">
                        <td className="px-5 py-3">{r.label}</td>
                        <td className="px-3 py-3 text-center"><Cell v={r.starter} /></td>
                        <td className="px-3 py-3 text-center bg-white/5"><Cell v={r.builder} /></td>
                        <td className="px-3 py-3 text-center"><Cell v={r.accelerator} /></td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Annual plans pay the same per-month rate × 10 (2 months free). Cancel anytime — your access continues through the end of your billing period.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">FAQ</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">Pricing questions</h2>
        </div>
        <div className="space-y-3">
          {pricingFaqs.map((f) => (
            <details key={f.q} className="glass rounded-xl px-5 py-4 group">
              <summary className="font-medium cursor-pointer list-none flex justify-between items-center gap-3">
                <span>{f.q}</span>
                <span className="text-muted-foreground group-open:rotate-45 transition shrink-0">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
        <LeadCapture source="pricing" />
      </section>

      <SiteFooter />
    </div>
  );
}
