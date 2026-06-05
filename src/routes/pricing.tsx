import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { Check, Sparkles, ArrowRight, X as XIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { CohortCountdown } from "@/components/cohort-countdown";
import { LeadCapture } from "@/components/lead-capture";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — AI Income Systems Lab" },
      { name: "description", content: "Three tiers, one-time payment, lifetime access. Pick the level that fits your goals." },
    ],
  }),
  component: PricingPage,
});

type Tier = {
  name: string;
  price: number;
  tag: string;
  tier: "starter" | "builder" | "pro";
  featured?: boolean;
  bestFor: string;
  whyUpgrade: string;
  features: string[];
};

const tiers: Tier[] = [
  {
    name: "Starter Lab",
    price: 29,
    tag: "Try the system",
    tier: "starter",
    bestFor: "Beginners who want to learn the system and ship one small offer.",
    whyUpgrade: "Best entry point — full curriculum, no builders.",
    features: [
      "Full 11-module course access",
      "Searchable prompt library (12 starter prompts)",
      "Action steps + downloads on every lesson",
      "Progress tracking + private notes",
      "Lifetime access — pay once",
    ],
  },
  {
    name: "Builder Lab",
    price: 79,
    tag: "Most popular",
    featured: true,
    tier: "builder",
    bestFor: "Creators ready to launch products and funnels with AI shortcuts.",
    whyUpgrade: "Unlocks the interactive builders that turn ideas into ship-ready plans in minutes.",
    features: [
      "Everything in Starter",
      "Digital Product Builder — generates a full product blueprint (positioning, outline, 3-week plan, launch hooks) from your niche",
      "Sales Funnel Builder — full lead magnet → landing → tripwire → upsell plan with copy angles",
      "n8n Workflow Library — drop-in templates for delivery, follow-up, content repurposing, and lead routing",
      "AI Tool Stack Guide (when to use which model & why)",
      "20 Builder-tier prompts (hooks, niche research, brand voice, customer voice mining…)",
    ],
  },
  {
    name: "Pro Systems Lab",
    price: 149,
    tag: "Go pro",
    tier: "pro",
    bestFor: "Operators selling AI services or running multiple income systems.",
    whyUpgrade: "Adds the agent generator, local-service kit, and pro-grade prompt frameworks for higher-ticket work.",
    features: [
      "Everything in Builder",
      "AI Agents & Skills module (8 deep lessons)",
      "Agent Generator — turn any prompt into a full agent spec",
      "Local Business AI Service Kit (audit, outreach, fulfilment)",
      "25 Pro prompts (multi-agent workflows, RAG specs, launch command center, VOC mining…)",
      "Priority access to new content & builders",
    ],
  },
];

const tierRank: Record<string, number> = { none: 0, starter: 1, builder: 2, pro: 3 };

type Row = { label: string; starter: boolean | string; builder: boolean | string; pro: boolean | string };
const compare: { section: string; rows: Row[] }[] = [
  {
    section: "Learning",
    rows: [
      { label: "Course modules", starter: "11 modules · 90+ lessons", builder: "11 modules · 90+ lessons", pro: "12 modules · 100+ lessons" },
      { label: "AI Agents & Skills module", starter: false, builder: false, pro: true },
      { label: "Lifetime access", starter: true, builder: true, pro: true },
      { label: "Progress tracking & notes", starter: true, builder: true, pro: true },
    ],
  },
  {
    section: "Prompt library",
    rows: [
      { label: "Starter prompts", starter: "12", builder: "12", pro: "12" },
      { label: "Builder prompts", starter: false, builder: "20", pro: "20" },
      { label: "Pro prompts (agents, skills, systems)", starter: false, builder: false, pro: "25" },
    ],
  },
  {
    section: "Interactive builders",
    rows: [
      { label: "Digital Product Builder", starter: false, builder: true, pro: true },
      { label: "Sales Funnel Builder", starter: false, builder: true, pro: true },
      { label: "Agent Generator (prompt → spec)", starter: false, builder: false, pro: true },
    ],
  },
  {
    section: "Templates & kits",
    rows: [
      { label: "n8n Workflow Library", starter: false, builder: true, pro: true },
      { label: "AI Tool Stack Guide", starter: false, builder: true, pro: true },
      { label: "Local Business AI Service Kit", starter: false, builder: false, pro: true },
      { label: "Outreach scripts + audit templates", starter: false, builder: false, pro: true },
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
  const currentRank = tierRank[profile?.tier ?? "none"];
  const ctaTo = user ? "/checkout" : "/signup";
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-hero" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Lifetime access · No subscriptions
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight">
            Pick your <span className="text-gradient">level</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            One-time payment. Free upgrades inside your tier. Cohort pricing closes monthly.
          </p>
          <div className="mt-6 flex justify-center">
            <CohortCountdown label="Current cohort pricing closes in" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => {
            const tierR = tierRank[t.tier];
            const isCurrent = user && currentRank === tierR;
            const isIncluded = user && currentRank > tierR;
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
                <h3 className="mt-2 text-xl font-bold">{t.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t.bestFor}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-black">${t.price}</span>
                  <span className="text-sm text-muted-foreground">one-time</span>
                </div>
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
                    <Link to={ctaTo} search={{ tier: t.tier }}>
                      Get Instant Access <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Prices in USD. Stripe-secured checkout. Refunds available within 14 days, no questions asked.
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
                  <th className="text-center font-medium px-3 py-4">Starter<br /><span className="text-foreground font-bold normal-case tracking-normal">$29</span></th>
                  <th className="text-center font-medium px-3 py-4 bg-white/5">
                    Builder<br /><span className="text-foreground font-bold normal-case tracking-normal">$79</span>
                    <div className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full text-background font-semibold" style={{ background: "var(--gradient-brand)" }}>Most popular</div>
                  </th>
                  <th className="text-center font-medium px-3 py-4">Pro<br /><span className="text-foreground font-bold normal-case tracking-normal">$149</span></th>
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
                        <td className="px-3 py-3 text-center"><Cell v={r.pro} /></td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
        <LeadCapture source="pricing" />
      </section>

      <SiteFooter />
    </div>
  );
}
