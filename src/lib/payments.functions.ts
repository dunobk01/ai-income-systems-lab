import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type CheckoutResult = { clientSecret: string } | { error: string };

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId: string },
): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");

  const found = await stripe.customers.search({
    query: `metadata['userId']:'${options.userId}'`,
    limit: 1,
  });
  if (found.data.length) return found.data[0].id;

  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }

  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    metadata: { userId: options.userId },
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { priceId: string; returnUrl: string; environment: StripeEnv }) => {
    if (!/^[a-zA-Z0-9_]+$/.test(data.priceId)) throw new Error("Invalid priceId");
    return data;
  })
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const { userId, supabase } = context;

      // Tier rank: monthly subs and one-time tiers map to the same enum.
      const tierRank: Record<string, number> = { none: 0, monthly: 1, starter: 1, builder: 2, pro: 3, accelerator: 3 };
      const priceToTier: Record<string, "starter" | "builder" | "pro" | "monthly" | "accelerator"> = {
        // Legacy lifetime
        ailab_starter_onetime: "starter",
        ailab_builder_onetime: "builder",
        ailab_pro_onetime: "pro",
        // Legacy monthly
        ailab_monthly_subscription: "monthly",
        // New monthly + annual recurring tiers
        ailab_starter_monthly: "starter",
        ailab_starter_annual: "starter",
        ailab_builder_monthly: "builder",
        ailab_builder_annual: "builder",
        ailab_accelerator_monthly: "accelerator",
        ailab_accelerator_annual: "accelerator",
      };
      const requested = priceToTier[data.priceId];
      if (!requested) throw new Error("Unknown price");

      const { data: prof } = await supabase
        .from("profiles").select("tier").eq("user_id", userId).maybeSingle();
      const currentTier = (prof?.tier as string | undefined) ?? "none";
      const haveRank = tierRank[currentTier] ?? 0;
      const wantRank = tierRank[requested] ?? 0;

      if (haveRank > wantRank) {
        return { error: `You already have ${currentTier} access — this plan is included.` };
      }
      if (haveRank === wantRank && haveRank > 0) {
        return { error: `You already have an active ${currentTier} plan.` };
      }

      const stripe = createStripeClient(data.environment);
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email ?? undefined;

      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      if (!prices.data.length) throw new Error("Price not found");
      const stripePrice = prices.data[0];
      const isRecurring = stripePrice.type === "recurring";

      const customerId = await resolveOrCreateCustomer(stripe, { email, userId });

      const productId = typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: isRecurring ? "subscription" : "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        allow_promotion_codes: true,
        ...(isRecurring
          ? { subscription_data: { metadata: { userId, priceId: data.priceId } } }
          : { payment_intent_data: { description: product.name } }),
        metadata: { userId, priceId: data.priceId },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

type CancelResult = { ok: true; periodEnd: string | null } | { error: string };

export const cancelMonthlySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<CancelResult> => {
    try {
      const { userId, supabase } = context;
      const { data: row } = await supabase
        .from("subscriptions")
        .select("stripe_subscription_id")
        .eq("user_id", userId)
        .eq("environment", data.environment)
        .eq("price_id", "ailab_monthly_subscription")
        .in("status", ["active", "trialing", "past_due"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!row?.stripe_subscription_id) return { error: "No active monthly membership found." };

      const stripe = createStripeClient(data.environment);
      const sub = await stripe.subscriptions.update(row.stripe_subscription_id as string, {
        cancel_at_period_end: true,
      });
      const periodEnd = (sub as any).current_period_end
        ? new Date((sub as any).current_period_end * 1000).toISOString()
        : null;
      return { ok: true, periodEnd };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
