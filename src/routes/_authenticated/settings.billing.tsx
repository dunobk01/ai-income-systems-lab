import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CreditCard, ExternalLink, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createPortalSession, setSubscriptionRenewal } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { tierLabel } from "@/lib/access";

export const Route = createFileRoute("/_authenticated/settings/billing")({
  head: () => ({
    meta: [
      { title: "Billing & Subscription — AI Income Systems Lab" },
      {
        name: "description",
        content:
          "Manage your AI Income Systems Lab membership: update your payment method, download invoices, change plan, renew or cancel.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BillingPage,
});

const PLAN_LABEL: Record<string, string> = {
  ailab_starter_monthly: "Starter — Monthly",
  ailab_builder_monthly: "Builder — Monthly",
  ailab_accelerator_monthly: "Accelerator — Monthly",
  ailab_starter_annual: "Starter — Annual",
  ailab_builder_annual: "Builder — Annual",
  ailab_accelerator_annual: "Accelerator — Annual",
  ailab_starter_onetime: "Starter Lab",
  ailab_builder_onetime: "Builder Lab",
  ailab_pro_onetime: "Pro Systems Lab",
  ailab_monthly_subscription: "All-Access Monthly",
};

const planLabel = (priceId: string) =>
  PLAN_LABEL[priceId] ?? priceId.replace(/^ailab_/, "").replace(/_/g, " ");

const isRecurring = (priceId: string) => !/_onetime$/.test(priceId);
const ACTIVE = ["active", "trialing", "past_due"];

type Row = {
  id: string;
  price_id: string;
  status: string;
  amount_cents: number | null;
  currency: string | null;
  created_at: string;
  environment: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
};

function money(cents: number | null, currency: string | null) {
  if (cents == null) return null;
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: (currency ?? "usd").toUpperCase(),
  });
}

function BillingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const portalFn = useServerFn(createPortalSession);
  const renewalFn = useServerFn(setSubscriptionRenewal);

  const [rows, setRows] = useState<Row[] | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Row | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("subscriptions")
      .select(
        "id, price_id, status, amount_cents, currency, created_at, environment, current_period_end, cancel_at_period_end",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setRows([]);
      return;
    }
    setRows((data ?? []) as Row[]);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const active = (rows ?? []).filter((r) => isRecurring(r.price_id) && ACTIVE.includes(r.status));
  const oneTime = (rows ?? []).filter((r) => !isRecurring(r.price_id));
  const hasBillingAccount = (rows ?? []).length > 0;

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const result = await portalFn({
        data: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/settings/billing`,
        },
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPortalLoading(false);
    }
  };

  const changeRenewal = async (row: Row, cancelAtPeriodEnd: boolean) => {
    setBusyId(row.id);
    try {
      const result = await renewalFn({
        data: {
          subscriptionId: row.id,
          cancelAtPeriodEnd,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(
        cancelAtPeriodEnd
          ? "Cancellation scheduled — you keep access until the end of your billing period."
          : "Renewal turned back on. Your plan will continue as normal.",
      );
      setCancelTarget(null);
      await load();
      await refreshProfile();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <Link
        to="/settings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Settings
      </Link>
      <h1 className="mt-3 text-3xl font-black tracking-tight">Billing &amp; subscription</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You're on the <span className="text-foreground font-medium">{tierLabel(profile?.tier)}</span> plan.
        Everything here is self-serve — no emails, no waiting.
      </p>

      {/* Stripe portal */}
      <section className="mt-8 glass rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl glass p-2.5">
            <CreditCard className="h-5 w-5 text-[color:var(--brand-2)]" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">Payment methods, invoices &amp; plan changes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Opens the secure Stripe billing portal in a new tab. Update your card, download past invoices,
              switch between monthly and annual, or cancel.
            </p>
            <Button
              variant="brand"
              className="mt-4"
              onClick={openPortal}
              disabled={portalLoading || !hasBillingAccount}
            >
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Open billing portal
            </Button>
            {!hasBillingAccount && rows !== null && (
              <p className="mt-3 text-xs text-muted-foreground">
                You don't have a billing account yet.{" "}
                <Link to="/pricing" className="text-[color:var(--brand-2)] hover:underline">
                  Choose a plan
                </Link>{" "}
                to get started.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Active subscriptions */}
      <section className="mt-6 glass rounded-2xl p-6">
        <h2 className="font-semibold">Active subscriptions</h2>
        {rows === null ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : active.length === 0 ? (
          <div className="mt-3">
            <p className="text-sm text-muted-foreground">No active subscription.</p>
            <Button asChild variant="glass" size="sm" className="mt-3">
              <Link to="/pricing">View plans</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {active.map((row) => {
              const amount = money(row.amount_cents, row.currency);
              const periodEnd = row.current_period_end
                ? new Date(row.current_period_end).toLocaleDateString()
                : null;
              const canceling = row.cancel_at_period_end === true;
              return (
                <div key={row.id} className="rounded-2xl border border-white/10 p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-medium">{planLabel(row.price_id)}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <span className="capitalize">{row.status}</span>
                        {amount ? ` · ${amount}` : ""}
                      </div>
                    </div>
                    <span
                      className={`text-xs uppercase tracking-wide ${
                        canceling ? "text-amber-300" : "text-emerald-300"
                      }`}
                    >
                      {canceling ? "Ending" : "Renewing"}
                    </span>
                  </div>

                  {row.status === "past_due" && (
                    <p className="mt-3 text-sm text-amber-200">
                      Your last payment failed. Update your card in the billing portal to keep access — we'll
                      retry automatically.
                    </p>
                  )}

                  <p className="mt-3 text-sm text-muted-foreground">
                    {canceling
                      ? `Cancellation scheduled — access ends ${periodEnd ?? "at the end of the period"}.`
                      : periodEnd
                        ? `Renews automatically on ${periodEnd}.`
                        : "Renews automatically."}
                  </p>

                  <div className="mt-4 flex gap-2 flex-wrap">
                    {canceling ? (
                      <Button
                        variant="brand"
                        size="sm"
                        disabled={busyId === row.id}
                        onClick={() => changeRenewal(row, false)}
                      >
                        {busyId === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        Resume subscription
                      </Button>
                    ) : (
                      <Button
                        variant="glass"
                        size="sm"
                        disabled={busyId === row.id}
                        onClick={() => setCancelTarget(row)}
                      >
                        Cancel subscription
                      </Button>
                    )}
                    <Button asChild variant="glass" size="sm">
                      <Link to="/pricing">Change plan</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* One-time purchases */}
      {oneTime.length > 0 && (
        <section className="mt-6 glass rounded-2xl p-6">
          <h2 className="font-semibold">One-time purchases</h2>
          <div className="mt-3 divide-y divide-white/10 text-sm">
            {oneTime.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{planLabel(p.price_id)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                    {money(p.amount_cents, p.currency) ? ` · ${money(p.amount_cents, p.currency)}` : ""}
                  </div>
                </div>
                <span
                  className={`text-xs uppercase tracking-wide ${
                    p.status === "refunded" ? "text-red-300" : "text-emerald-300"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full history */}
      <section className="mt-6 glass rounded-2xl p-6">
        <h2 className="font-semibold">Billing history</h2>
        {rows === null ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-white/10 text-sm">
            {rows.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{planLabel(p.price_id)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                    {money(p.amount_cents, p.currency) ? ` · ${money(p.amount_cents, p.currency)}` : ""}
                  </div>
                </div>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{p.status}</span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> Card details are handled by Stripe — we never see or store
          them. See our{" "}
          <Link to="/refund" className="text-[color:var(--brand-2)] hover:underline">
            refund &amp; cancellation policy
          </Link>
          .
        </p>
      </section>

      <Dialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel {cancelTarget ? planLabel(cancelTarget.price_id) : "subscription"}?</DialogTitle>
            <DialogDescription>
              You'll keep full access until{" "}
              {cancelTarget?.current_period_end
                ? new Date(cancelTarget.current_period_end).toLocaleDateString()
                : "the end of your billing period"}
              . After that your account drops to the permanent Free plan — your progress and notes are kept.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You can resume any time before the period ends with one click.
          </p>
          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
            <Button variant="glass" onClick={() => setCancelTarget(null)} className="sm:flex-1">
              Keep my plan
            </Button>
            <Button
              variant="brand"
              className="sm:flex-1"
              disabled={!!busyId}
              onClick={() => cancelTarget && changeRenewal(cancelTarget, true)}
            >
              {busyId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
