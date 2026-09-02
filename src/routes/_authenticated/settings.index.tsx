import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, CreditCard, ArrowRight, MailX } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { tierLabel } from "@/lib/access";

export const Route = createFileRoute("/_authenticated/settings/")({
  head: () => ({ meta: [{ title: "Settings — AI Income Systems Lab" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: me }, { count }] = await Promise.all([
        (supabase.from("profiles") as any).select("referral_code").eq("user_id", user.id).maybeSingle(),
        (supabase.from("profiles") as any).select("id", { count: "exact", head: true }).eq("referred_by", user.id),
      ]);
      if (cancelled) return;
      setReferralCode((me as any)?.referral_code ?? null);
      setReferralCount(count ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const referralUrl = referralCode ? `https://ai-income-systems.com/?ref=${referralCode}` : "";
  const copyReferral = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success("Referral link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  useEffect(() => {
    setName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

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
          <Button onClick={save} variant="brand" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </section>

      <section className="mt-6 glass rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold">Plan &amp; billing</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Current plan: <span className="text-foreground font-medium">{tierLabel(profile?.tier)}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your subscription, payment method, invoices, renewal and cancellation.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="brand">
              <Link to="/settings/billing">
                <CreditCard className="h-4 w-4" /> Manage billing
              </Link>
            </Button>
            <Button asChild variant="glass">
              <Link to="/pricing">
                Plans <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-6 glass rounded-2xl p-6">
        <h2 className="font-semibold">Referral link</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your link. When someone signs up, they're credited to you — {referralCount} member
          {referralCount === 1 ? "" : "s"} referred so far.
        </p>
        {referralCode ? (
          <div className="mt-4 flex gap-2">
            <Input readOnly value={referralUrl} className="font-mono text-xs" />
            <Button variant="glass" onClick={copyReferral} className="shrink-0">
              <Copy className="h-4 w-4" /> Copy
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">Generating your referral link…</p>
        )}
      </section>

      <section className="mt-6 glass rounded-2xl p-6">
        <h2 className="font-semibold">Email preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You're subscribed to the weekly newsletter and product updates. You can opt out at any time — your
          account and course progress are unaffected.
        </p>
        <Button asChild variant="glass" className="mt-4">
          <a href={`/unsubscribe?email=${encodeURIComponent(user?.email ?? "")}`}>
            <MailX className="h-4 w-4" /> Unsubscribe from emails
          </a>
        </Button>
      </section>
    </div>
  );
}

