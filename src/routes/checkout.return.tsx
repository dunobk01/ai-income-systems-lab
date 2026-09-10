import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight, CalendarClock, Receipt, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tiktokTrack } from "@/lib/tiktok";
import { dlPurchase } from "@/lib/datalayer";
import { pinCheckout } from "@/lib/pinterest";
import { getCheckoutSessionSummary } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { DEFAULT_OG_IMAGE } from "@/lib/og";

const TITLE = "Order Confirmation — AI Income Systems Lab";
const DESCRIPTION =
  "Your AI Income Systems Lab membership is confirmed. See your plan, amount charged and next billing date, then jump straight into the course.";
const CANONICAL = "https://ai-income-systems.com/checkout/return";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: ReturnPage,
});

type Summary = {
  amountCents: number;
  currency: string;
  priceId: string | null;
  productLabel: string;
  interval: "day" | "week" | "month" | "year" | null;
  nextBillingDate: string | null;
  customerEmail: string | null;
  paid: boolean;
};

const money = (cents: number, currency: string) =>
  (cents / 100).toLocaleString(undefined, { style: "currency", currency: currency.toUpperCase() });

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

function ReturnPage() {
  const { session_id } = Route.useSearch();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(Boolean(session_id));
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
            interval: res.interval,
            nextBillingDate: res.nextBillingDate,
            customerEmail: res.customerEmail,
            paid: res.paid,
          });
        }
      } catch {
        // Fall through to a zero-value ping — better than never firing.
      } finally {
        if (!cancelled) setLoading(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session_id, summary]);

  const suffix = summary?.interval === "month" ? "/mo" : summary?.interval === "year" ? "/yr" : "";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="glass rounded-3xl p-8 sm:p-10 max-w-xl w-full">
        {session_id ? (
          <>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <h1 className="mt-6 text-3xl font-black">You're in.</h1>
              <p className="mt-3 text-muted-foreground">
                Your payment is confirmed and your access is unlocking now. A receipt is on its way by email.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 divide-y divide-white/10">
              {loading ? (
                <div className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading your order details…
                </div>
              ) : summary ? (
                <>
                  <Row label="Plan" value={summary.productLabel} icon={<Receipt className="h-4 w-4" />} />
                  <Row
                    label={summary.interval ? "Charged today" : "Total paid"}
                    value={`${money(summary.amountCents, summary.currency)}${suffix}`}
                    icon={<Receipt className="h-4 w-4" />}
                  />
                  {summary.nextBillingDate ? (
                    <Row
                      label="Next billing date"
                      value={longDate(summary.nextBillingDate)}
                      icon={<CalendarClock className="h-4 w-4" />}
                    />
                  ) : summary.interval ? (
                    <Row
                      label="Next billing date"
                      value="Shown in your billing settings"
                      icon={<CalendarClock className="h-4 w-4" />}
                    />
                  ) : (
                    <Row label="Renewal" value="One-time payment — no renewal" icon={<CalendarClock className="h-4 w-4" />} />
                  )}
                  {summary.customerEmail && (
                    <Row label="Receipt sent to" value={summary.customerEmail} icon={<Mail className="h-4 w-4" />} />
                  )}
                </>
              ) : (
                <div className="p-5 text-sm text-muted-foreground">
                  We couldn't load the order details right now — your payment is still recorded. Check your billing
                  settings in a moment.
                </div>
              )}
            </div>

            {summary?.interval && (
              <p className="mt-4 text-xs text-muted-foreground text-center">
                Your plan renews automatically each {summary.interval}. You can cancel anytime from billing settings —
                access continues until the end of the paid period.
              </p>
            )}

            <div className="mt-7 grid sm:grid-cols-2 gap-3">
              <Button asChild variant="brand" className="h-11">
                <Link to="/dashboard">
                  Go to dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11">
                <Link to="/settings/billing">Manage billing</Link>
              </Button>
            </div>

            <p className="mt-4 text-[10px] text-muted-foreground/60 font-mono text-center">
              Ref: {session_id.slice(0, 18)}…
            </p>
          </>
        ) : (
          <div className="text-center">
            <h1 className="text-3xl font-black">Order confirmation</h1>
            <p className="mt-3 text-muted-foreground">
              This is where your order details appear right after checkout — plan, amount charged and next billing
              date. We don't have a recent order to show on this device.
            </p>
            <div className="mt-7 grid sm:grid-cols-2 gap-3">
              <Button asChild variant="brand" className="h-11">
                <Link to="/pricing">See plans</Link>
              </Button>
              <Button asChild variant="outline" className="h-11">
                <Link to="/settings/billing">Manage billing</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold text-right">{value}</span>
    </div>
  );
}
