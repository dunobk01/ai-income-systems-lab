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

async function recordOneTimePurchase(session: any, env: StripeEnv) {
  const userId = session.metadata?.userId;
  const priceId = session.metadata?.priceId;
  if (!userId || !priceId) {
    console.error("checkout.session.completed missing metadata", session.id);
    return;
  }
  const stripe = createStripeClient(env);
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items.data.price.product", "payment_intent"],
  });
  const line = full.line_items?.data?.[0];
  const productId = typeof line?.price?.product === "string"
    ? line.price.product
    : (line?.price?.product as any)?.id ?? "unknown";

  await (getSupabase().from("subscriptions") as any).upsert(
    {
      user_id: userId,
      stripe_subscription_id: full.payment_intent
        ? (typeof full.payment_intent === "string" ? full.payment_intent : full.payment_intent.id)
        : full.id,
      stripe_customer_id: typeof full.customer === "string" ? full.customer : full.customer?.id ?? "",
      product_id: productId,
      price_id: priceId,
      status: "complete",
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function handle(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "checkout.session.completed":
    case "transaction.completed":
      await recordOneTimePurchase(event.data.object, env);
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
