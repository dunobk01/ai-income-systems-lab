import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tiktokTrack } from "@/lib/tiktok";
import { dlPurchase } from "@/lib/datalayer";
import { pinCheckout } from "@/lib/pinterest";
import { getCheckoutSessionSummary } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: ReturnPage,
});

function ReturnPage() {
  const { session_id } = Route.useSearch();
  const [summary, setSummary] = useState<{
    amountCents: number;
    currency: string;
    priceId: string | null;
    productLabel: string;
  } | null>(null);
  const [firedRef, setFiredRef] = useState<string | null>(null);

  useEffect(() => {
    if (!session_id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getCheckoutSessionSummary({
          data: { sessionId: session_id, environment: getStripeEnvironment() },
        });
        if (cancelled) return;
        if ("ok" in res) {
          setSummary({
            amountCents: res.amountCents,
            currency: res.currency,
            priceId: res.priceId,
            productLabel: res.productLabel,
          });
        }
      } catch {
        // Fall through to a zero-value ping — better than never firing.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session_id]);

  useEffect(() => {
    if (!session_id) return;
    // Guard against StrictMode double-mount + summary refresh firing twice.
    if (firedRef === session_id) return;
    setFiredRef(session_id);

    const value = summary ? summary.amountCents / 100 : 0;
    const currency = (summary?.currency ?? "usd").toUpperCase();
    const productId = summary?.priceId ?? "ai-income-systems-lab";
    const productName = summary?.productLabel ?? "AI Income Systems Lab";

    tiktokTrack("Purchase", {
      contents: [{ content_id: productId, content_type: "product", content_name: productName }],
      value,
      currency,
    });
    dlPurchase({
      transaction_id: session_id,
      currency,
      value,
      items: [{ item_id: productId, item_name: productName, price: value, quantity: 1 }],
    });
    pinCheckout({
      order_id: session_id,
      value,
      currency,
      order_quantity: 1,
      product_id: productId,
    });
    // We intentionally fire once per session_id; summary may arrive after
    // the first pass and re-fire is guarded above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session_id, summary]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass rounded-3xl p-10 max-w-lg w-full text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <h1 className="mt-6 text-3xl font-black">You're in.</h1>
        <p className="mt-3 text-muted-foreground">
          Your purchase is confirmed and your access is unlocking now. If your dashboard still shows the old tier, refresh in 30 seconds.
        </p>
        {summary && (
          <p className="mt-4 text-sm text-muted-foreground">
            {summary.productLabel} — {(summary.amountCents / 100).toLocaleString(undefined, {
              style: "currency",
              currency: summary.currency.toUpperCase(),
            })}
          </p>
        )}
        {session_id && <p className="mt-2 text-[10px] text-muted-foreground/60 font-mono">Ref: {session_id.slice(0, 18)}…</p>}
        <Button asChild variant="brand" className="mt-7 h-11 w-full">
          <Link to="/dashboard">Go to dashboard <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
