import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook, createStripeClient } from "@/lib/stripe.server";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return _supabase;
}

const TIER_LABEL: Record<string, string> = {
  starter_onetime: "Starter Lab",
  builder_onetime: "Builder Lab",
  pro_onetime: "Pro Systems Lab",
  ailab_starter_onetime: "Starter Lab",
  ailab_builder_onetime: "Builder Lab",
  ailab_pro_onetime: "Pro Systems Lab",
};

async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!lovableKey || !resendKey) {
    console.warn("Resend not configured, skipping email");
    return;
  }
  try {
    const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from: "AI Income Systems Lab <onboarding@resend.dev>",
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) console.error("Resend send failed", res.status, await res.text());
  } catch (e) {
    console.error("Resend send error", e);
  }
}

function fmtAmount(cents: number, currency: string) {
  return (Math.abs(cents) / 100).toLocaleString(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  });
}

async function sendReceiptEmail(opts: {
  to: string;
  productLabel: string;
  amountCents: number;
  currency: string;
}) {
  const amount = fmtAmount(opts.amountCents, opts.currency);
  await sendEmail({
    to: opts.to,
    subject: `You're in — ${opts.productLabel}`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
      <h1 style="font-size:22px;margin:0 0 12px">Welcome to ${opts.productLabel} 🎉</h1>
      <p style="color:#444;line-height:1.5">Your purchase is confirmed. Lifetime access is unlocked on your account right now.</p>
      <p style="color:#444;line-height:1.5">Amount charged: <strong>${amount}</strong></p>
      <p style="margin-top:24px"><a href="https://ai-income-systems.com/dashboard" style="background:#111;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Open your dashboard</a></p>
      <p style="color:#888;font-size:12px;margin-top:32px">Refunds available within 14 days — just reply to this email.</p>
    </div>`,
  });
}

async function sendRefundEmail(opts: {
  to: string;
  productLabel: string;
  amountCents: number;
  currency: string;
  newTier: string;
}) {
  const amount = fmtAmount(opts.amountCents, opts.currency);
  const tierLine = opts.newTier === "none"
    ? `Your premium access to the Lab has been removed.`
    : `Your account has been moved to the <strong>${opts.newTier}</strong> tier based on your remaining purchases.`;
  await sendEmail({
    to: opts.to,
    subject: `Refund processed — ${opts.productLabel}`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
      <h1 style="font-size:22px;margin:0 0 12px">Your refund is processed</h1>
      <p style="color:#444;line-height:1.5">We've refunded <strong>${amount}</strong> for <strong>${opts.productLabel}</strong>. It typically lands back on your card within 5–10 business days.</p>
      <p style="color:#444;line-height:1.5">${tierLine} If you're still signed in, refresh the page or sign out and back in to see the change.</p>
      <p style="color:#444;line-height:1.5">Questions or want to come back later? Just reply to this email — we're here.</p>
    </div>`,
  });
}

async function recordOneTimePurchase(session: any, env: StripeEnv) {
  const userId = session.metadata?.userId;
  const priceId = session.metadata?.priceId;
  if (!userId || !priceId) {
    console.error("checkout.session.completed missing metadata", session.id);
    return;
  }
  const stripe = createStripeClient(env);
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items.data.price.product", "payment_intent", "customer"],
  });
  const line = full.line_items?.data?.[0];
  const productId = typeof line?.price?.product === "string"
    ? line.price.product
    : (line?.price?.product as any)?.id ?? "unknown";

  const paymentIntentId = full.payment_intent
    ? (typeof full.payment_intent === "string" ? full.payment_intent : full.payment_intent.id)
    : full.id;

  const customerId = typeof full.customer === "string" ? full.customer : full.customer?.id ?? "";
  const amountCents = full.amount_total ?? 0;
  const currency = (full.currency ?? "usd").toLowerCase();
  const email =
    (typeof full.customer === "object" && full.customer && "email" in full.customer
      ? (full.customer as any).email
      : null) ?? full.customer_details?.email ?? null;

  await (getSupabase().from("subscriptions") as any).upsert(
    {
      user_id: userId,
      stripe_subscription_id: paymentIntentId,
      stripe_customer_id: customerId,
      product_id: productId,
      price_id: priceId,
      status: "complete",
      amount_cents: amountCents,
      currency,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (email) {
    await sendReceiptEmail({
      to: email,
      productLabel: TIER_LABEL[priceId] ?? "your plan",
      amountCents,
      currency,
    });
  }
}

async function handleRefund(charge: any, env: StripeEnv) {
  // charge.payment_intent is the same id we stored as stripe_subscription_id.
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!paymentIntentId) {
    console.error("charge.refunded missing payment_intent");
    return;
  }

  // Flip the row to refunded and capture user/price/amount for the email.
  // The subscriptions_apply_tier trigger recomputes profiles.tier from
  // remaining non-refunded rows, so locked routes downgrade immediately.
  const { data: updated, error: updateErr } = await (getSupabase().from("subscriptions") as any)
    .update({ status: "refunded", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", paymentIntentId)
    .eq("environment", env)
    .select("user_id, price_id, amount_cents, currency")
    .maybeSingle();

  if (updateErr) {
    console.error("Failed to mark subscription refunded", updateErr);
    return;
  }
  if (!updated) {
    console.warn("No subscription row matched refunded charge", paymentIntentId);
    return;
  }

  // Read the new effective tier (post-trigger) and the user's email so the
  // notification can tell them exactly what changed.
  const [{ data: profile }, { data: authUser }] = await Promise.all([
    (getSupabase().from("profiles") as any)
      .select("tier")
      .eq("user_id", updated.user_id)
      .maybeSingle(),
    (getSupabase().auth as any).admin.getUserById(updated.user_id),
  ]);

  const email =
    authUser?.user?.email ??
    charge.billing_details?.email ??
    charge.receipt_email ??
    null;

  if (!email) {
    console.warn("Refund processed but no email found for user", updated.user_id);
    return;
  }

  const refundedCents = charge.amount_refunded ?? updated.amount_cents ?? 0;
  const currency = (charge.currency ?? updated.currency ?? "usd").toLowerCase();

  await sendRefundEmail({
    to: email,
    productLabel: TIER_LABEL[updated.price_id] ?? "your plan",
    amountCents: refundedCents,
    currency,
    newTier: profile?.tier ?? "none",
  });
}

async function handle(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "checkout.session.completed":
      await recordOneTimePurchase(event.data.object, env);
      break;
    case "charge.refunded":
      await handleRefund(event.data.object, env);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handle(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
