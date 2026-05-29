import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
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

const tiers = [
  {
    name: "Starter Lab",
    price: 29,
    tag: "Try the system",
    tier: "starter" as const,
    features: [
      "Full 11-module course access",
      "Searchable prompt library",
      "Action steps + downloads",
      "Progress tracking + notes",
      "Lifetime access",
    ],
  },
  {
    name: "Builder Lab",
    price: 79,
    tag: "Most popular",
    featured: true,
    tier: "builder" as const,
    features: [
      "Everything in Starter",
      "Digital Product Builder",
      "Sales Funnel Builder",
      "n8n Workflow Library",
      "AI Tool Stack Guide",
    ],
  },
  {
    name: "Pro Systems Lab",
    price: 149,
    tag: "Go pro",
    tier: "pro" as const,
    features: [
      "Everything in Builder",
      "Local Business AI Service Kit",
      "Outreach scripts + audit templates",
      "Advanced launch checklists",
      "Priority new-content access",
    ],
  },
];

const tierRank: Record<string, number> = { none: 0, starter: 1, builder: 2, pro: 3 };

function PricingPage() {
  const { user, profile } = useAuth();
  const currentRank = tierRank[profile?.tier ?? "none"];
  const ctaTo = user ? "/checkout" : "/signup";
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-hero" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Lifetime access · No subscriptions
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight">
            Pick your <span className="text-gradient">level</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            One-time payment. Free upgrades to your tier. Cancel? Nothing to cancel.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => {
            const tierR = tierRank[t.tier];
            const isCurrent = user && currentRank === tierR;
            const isIncluded = user && currentRank > tierR;
            return (
              <div
                key={t.name}
                className={`rounded-3xl p-7 flex flex-col ${
                  t.featured ? "ring-brand bg-white/5 relative" : "glass"
                }`}
              >
                {t.featured && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-background px-3 py-1 rounded-full"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {t.tag}
                  </span>
                )}
                {!t.featured && <span className="text-xs uppercase tracking-wider text-muted-foreground">{t.tag}</span>}
                <h3 className="mt-2 text-xl font-bold">{t.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-black">${t.price}</span>
                  <span className="text-sm text-muted-foreground">one-time</span>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
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
                      Get {t.name} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Prices in USD. Stripe-secured checkout. Refunds available within 14 days, no questions asked.
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
