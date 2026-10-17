import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";
import type { BillingCharge, BillingRenewal } from "./admin-subscriber-data";

/** Read Stripe once per refresh, with pagination; never infer collections from a plan price. */
export async function readSubscriberBilling(environment: StripeEnv): Promise<{ charges: BillingCharge[]; renewals: BillingRenewal[] }> {
  const stripe = createStripeClient(environment);
  const charges: BillingCharge[] = [];
  const renewals: BillingRenewal[] = [];
  await Promise.all([
    (async () => {
      for await (const charge of stripe.charges.list({ limit: 100, expand: ["data.customer"] })) {
        const customer = typeof charge.customer === "object" && charge.customer && !charge.customer.deleted ? charge.customer : null;
        charges.push({ id: charge.id, userId: customer?.metadata?.userId ?? null,
          email: customer?.email ?? charge.billing_details?.email ?? charge.receipt_email ?? null,
          amount: charge.amount, refunded: charge.amount_refunded, currency: charge.currency,
          paid: charge.paid, status: charge.status, created_at: new Date(charge.created * 1000).toISOString() });
      }
    })(),
    (async () => {
      for await (const sub of stripe.subscriptions.list({ limit: 100, status: "all", expand: ["data.customer"] })) {
        const customer = typeof sub.customer === "object" && sub.customer && !sub.customer.deleted ? sub.customer : null;
        const item = sub.items.data[0];
        const legacy = sub as unknown as { current_period_end?: number };
        const periodEnd = item?.current_period_end ?? legacy.current_period_end;
        renewals.push({ userId: sub.metadata?.userId ?? customer?.metadata?.userId ?? null,
          email: customer?.email ?? null, status: sub.status, cancelAtPeriodEnd: sub.cancel_at_period_end,
          periodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          priceId: item?.price.lookup_key ?? item?.price.metadata?.lovable_external_id ?? null,
          amount: item?.price.unit_amount == null ? null : item.price.unit_amount * (item.quantity ?? 1), currency: sub.currency });
      }
    })(),
  ]);
  return { charges, renewals };
}