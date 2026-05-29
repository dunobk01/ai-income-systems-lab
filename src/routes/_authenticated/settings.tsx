import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — AI Income Systems Lab" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => { setName(profile?.display_name ?? ""); }, [profile?.display_name]);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("subscriptions")
      .select("price_id, status, amount_cents, currency, created_at, environment")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPurchases(data ?? []));
  }, [user]);

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
          <Button onClick={save} variant="brand" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </section>

      <section className="mt-6 glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Plan</h2>
            <p className="text-sm text-muted-foreground mt-1 capitalize">Current tier: <span className="text-foreground font-medium">{profile?.tier ?? "none"}</span></p>
          </div>
          {profile?.tier !== "pro" && (
            <Button asChild variant="glass"><Link to="/pricing">Upgrade</Link></Button>
          )}
        </div>
      </section>

      <section className="mt-6 glass rounded-2xl p-6">
        <h2 className="font-semibold">Purchase history</h2>
        {purchases.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No purchases yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-white/10 text-sm">
            {purchases.map((p, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium capitalize">{p.price_id.replace("_onetime", "")}</div>
                  <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()} · {p.environment}</div>
                </div>
                <span className="text-xs uppercase tracking-wide text-emerald-300">{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
