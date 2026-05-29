import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { StripeEmbeddedCheckoutView } from "@/components/stripe-embedded-checkout";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";

const PRICE_MAP: Record<string, { name: string; price: number; priceId: string }> = {
  starter: { name: "Starter Lab", price: 29, priceId: "starter_onetime" },
  builder: { name: "Builder Lab", price: 79, priceId: "builder_onetime" },
  pro: { name: "Pro Systems Lab", price: 149, priceId: "pro_onetime" },
};

export const Route = createFileRoute("/_authenticated/checkout")({
  validateSearch: z.object({
    tier: z.enum(["starter", "builder", "pro"]).optional(),
  }),
  beforeLoad: ({ search }) => {
    if (!search.tier) throw redirect({ to: "/pricing" });
  },
  component: CheckoutPage,
});

function CheckoutPage() {
  const { tier } = Route.useSearch();
  const plan = PRICE_MAP[tier ?? "starter"];
  const returnUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;

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
            <p className="text-sm text-muted-foreground mt-2">
              One-time payment. Lifetime access. 14-day refund window.
            </p>
            <div className="mt-6 flex items-baseline justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-muted-foreground">Total today</span>
              <span className="text-3xl font-black">${plan.price}</span>
            </div>
          </div>
          <StripeEmbeddedCheckoutView priceId={plan.priceId} returnUrl={returnUrl} />
        </div>
      </div>
    </div>
  );
}
