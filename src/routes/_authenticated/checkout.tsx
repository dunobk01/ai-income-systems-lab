import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { StripeEmbeddedCheckoutView } from "@/components/stripe-embedded-checkout";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";
import { pinAddToCart } from "@/lib/pinterest";

type PlanInfo = { name: string; price: number; priceId: string; recurring: "month" | "year" | null; subline: string };

const PRICE_MAP: Record<string, PlanInfo> = {
  // New monthly tiers
  starter_monthly: { name: "Starter — Monthly", price: 29, priceId: "ailab_starter_monthly", recurring: "month", subline: "$29/month · Cancel anytime · Full core curriculum." },
  builder_monthly: { name: "Builder — Monthly", price: 79, priceId: "ailab_builder_monthly", recurring: "month", subline: "$79/month · Cancel anytime · Course + community + templates + builders." },
  accelerator_monthly: { name: "Accelerator — Monthly", price: 149, priceId: "ailab_accelerator_monthly", recurring: "month", subline: "$149/month · Cancel anytime · Everything + faceless video, image gen, chatbot modules, Pro builders, DMs." },
  // Annual tiers (2 months free)
  starter_annual: { name: "Starter — Annual", price: 290, priceId: "ailab_starter_annual", recurring: "year", subline: "$290/year (2 months free) · Cancel anytime." },
  builder_annual: { name: "Builder — Annual", price: 790, priceId: "ailab_builder_annual", recurring: "year", subline: "$790/year (2 months free) · Cancel anytime." },
  accelerator_annual: { name: "Accelerator — Annual", price: 1490, priceId: "ailab_accelerator_annual", recurring: "year", subline: "$1,490/year (2 months free) · Cancel anytime." },
  // Legacy (grandfathered): still routable in case checkout link is shared
  starter: { name: "Starter Lab (Legacy)", price: 29, priceId: "ailab_starter_onetime", recurring: null, subline: "One-time payment · Lifetime access · 14-day refund window." },
  builder: { name: "Builder Lab (Legacy)", price: 79, priceId: "ailab_builder_onetime", recurring: null, subline: "One-time payment · Lifetime access · 14-day refund window." },
  pro: { name: "Pro Systems Lab (Legacy)", price: 149, priceId: "ailab_pro_onetime", recurring: null, subline: "One-time payment · Lifetime access · 14-day refund window." },
  monthly: { name: "All-Access Monthly (Legacy)", price: 14.99, priceId: "ailab_monthly_subscription", recurring: "month", subline: "$14.99/month · Cancel anytime · Legacy plan." },
};

export const Route = createFileRoute("/_authenticated/checkout")({
  validateSearch: z.object({
    tier: z.enum([
      "starter_monthly", "builder_monthly", "accelerator_monthly",
      "starter_annual", "builder_annual", "accelerator_annual",
      "starter", "builder", "pro", "monthly",
    ]).optional(),
  }),
  beforeLoad: ({ search }) => {
    if (!search.tier) throw redirect({ to: "/pricing" });
  },
  component: CheckoutPage,
});

function CheckoutPage() {
  const { tier } = Route.useSearch();
  const plan = PRICE_MAP[tier ?? "starter_monthly"];
  const returnUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;
  const suffix = plan.recurring === "month" ? "/mo" : plan.recurring === "year" ? "/yr" : "";

  useEffect(() => {
    pinAddToCart({ value: plan.price, currency: "USD", order_quantity: 1, product_id: plan.priceId });
  }, [plan.priceId, plan.price]);

  return (
    <div className="min-h-screen">
      <PaymentTestModeBanner />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to pricing
        </Link>
        <div className="mt-6 grid lg:grid-cols-[1fr_1.3fr] gap-8">
          <div className="glass rounded-3xl p-6 h-fit">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Order summary</div>
            <h2 className="mt-1 text-2xl font-bold">{plan.name}</h2>
            <p className="text-sm text-muted-foreground mt-2">{plan.subline}</p>
            <div className="mt-6 flex items-baseline justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-muted-foreground">{plan.recurring ? "Billed today" : "Total today"}</span>
              <span className="text-3xl font-black">
                ${plan.price}
                {suffix && <span className="text-sm font-medium text-muted-foreground">{suffix}</span>}
              </span>
            </div>
          </div>
          <StripeEmbeddedCheckoutView priceId={plan.priceId} returnUrl={returnUrl} />
        </div>
      </div>
    </div>
  );
}

