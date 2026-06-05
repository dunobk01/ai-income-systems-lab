import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cancelMonthlySubscription } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — AI Income Systems Lab" }] }),
  component: SettingsPage,
});

type MembershipRow = { id: string; status: string; current_period_end: string | null; cancel_at_period_end: boolean } | null;

function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [membership, setMembership] = useState<MembershipRow>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const cancelFn = useServerFn(cancelMonthlySubscription);

  useEffect(() => { setName(profile?.display_name ?? ""); }, [profile?.display_name]);

  const loadPurchases = async (uid: string) => {
    const { data } = await supabase
      .from("subscriptions")
      .select("id, price_id, status, amount_cents, currency, created_at, environment, current_period_end, cancel_at_period_end")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    const rows = data ?? [];
    setPurchases(rows);
    const activeMonthly = rows.find(
      (r: any) => r.price_id === "ailab_monthly_subscription" && ["active", "trialing", "past_due"].includes(r.status),
    );
    setMembership(activeMonthly ? {
      id: activeMonthly.id,
      status: activeMonthly.status,
      current_period_end: activeMonthly.current_period_end,
      cancel_at_period_end: activeMonthly.cancel_at_period_end,
    } : null);
  };

  useEffect(() => {
    if (!user) return;
    void loadPurchases(user.id);
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  const confirmCancel = async () => {
    setCanceling(true);
    try {
      const result = await cancelFn({ data: { environment: getStripeEnvironment() } });
      if ("error" in result) { toast.error(result.error); return; }
      toast.success("Membership canceled — access continues until your period ends.");
      setCancelOpen(false);
      if (user) await loadPurchases(user.id);
      await refreshProfile();
    } finally {
      setCanceling(false);
    }
  };

  const goLifetime = () => {
    setCancelOpen(false);
    void navigate({ to: "/checkout", search: { tier: "starter" } });
  };

  const periodEndLabel = membership?.current_period_end
    ? new Date(membership.current_period_end).toLocaleDateString()
    : null;

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight">Settings</h1>

      <section className="mt-8 glass rounded-2xl p-6">
        <h2 className="font-semibold">Profile</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} disabled className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>
          <Button onClick={save} variant="brand" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </section>

      <section className="mt-6 glass rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold">Plan</h2>
            <p className="text-sm text-muted-foreground mt-1 capitalize">Current tier: <span className="text-foreground font-medium">{profile?.tier ?? "none"}</span></p>
          </div>
          {profile?.tier !== "pro" && (
            <Button asChild variant="glass"><Link to="/pricing">Upgrade</Link></Button>
          )}
        </div>
      </section>

      {membership && (
        <section className="mt-6 glass rounded-2xl p-6">
          <h2 className="font-semibold">All-Access Monthly membership</h2>
          <div className="mt-3 text-sm text-muted-foreground space-y-1">
            <p>Status: <span className="text-foreground capitalize">{membership.status}</span> · $14.99/month</p>
            {membership.cancel_at_period_end ? (
              <p className="text-amber-200">Cancellation scheduled — access ends {periodEndLabel ?? "at end of period"}.</p>
            ) : periodEndLabel ? (
              <p>Renews on {periodEndLabel}.</p>
            ) : null}
          </div>
          {!membership.cancel_at_period_end && (
            <div className="mt-4">
              <Button variant="glass" size="sm" onClick={() => setCancelOpen(true)}>Cancel membership</Button>
            </div>
          )}
        </section>
      )}

      <section className="mt-6 glass rounded-2xl p-6">
        <h2 className="font-semibold">Purchase history</h2>
        {purchases.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No purchases yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-white/10 text-sm">
            {purchases.map((p, i) => {
              const refunded = p.status === "refunded";
              const amount = p.amount_cents
                ? (p.amount_cents / 100).toLocaleString(undefined, { style: "currency", currency: (p.currency ?? "usd").toUpperCase() })
                : null;
              const label = p.price_id === "ailab_monthly_subscription"
                ? "All-Access Monthly"
                : p.price_id.replace(/_onetime$/, "").replace(/^ailab_/, "");
              return (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium capitalize">
                      {label}
                      {amount && <span className="ml-2 text-xs text-muted-foreground font-normal">{amount}{p.price_id === "ailab_monthly_subscription" ? "/mo" : ""}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()} · {p.environment}</div>
                  </div>
                  <span className={`text-xs uppercase tracking-wide ${refunded ? "text-red-300" : "text-emerald-300"}`}>
                    {p.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel membership?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You'll lose access to all 11 modules at the end of your billing period{periodEndLabel ? ` (${periodEndLabel})` : ""}.
          </p>
          <p className="mt-3 text-sm">
            Or grab lifetime Starter access for just <strong>$29</strong> — a one-time payment that's less than 2 months of membership.
          </p>
          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
            <Button variant="glass" onClick={confirmCancel} disabled={canceling} className="sm:flex-1">
              {canceling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Cancel anyway
            </Button>
            <Button variant="brand" onClick={goLifetime} disabled={canceling} className="sm:flex-1">
              Get Lifetime Access — $29
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
