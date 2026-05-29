import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — AI Income Systems Lab" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setName(profile?.display_name ?? ""); }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
    await refreshProfile();
  };

  return (
    <div className="p-6 lg:p-10 max-w-2xl">
      <h1 className="text-2xl font-bold">Account settings</h1>
      <p className="text-sm text-muted-foreground">Manage your profile and subscription.</p>

      <section className="mt-8 glass rounded-2xl p-6">
        <h2 className="font-semibold">Profile</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="dn">Display name</Label>
            <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>
          <Button onClick={save} variant="brand" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </section>

      <section className="mt-6 glass rounded-2xl p-6">
        <h2 className="font-semibold">Subscription</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Current tier: <span className="text-foreground font-medium capitalize">{profile?.tier ?? "none"}</span>
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Upgrades and billing management open up once Stripe checkout is enabled.
        </p>
      </section>
    </div>
  );
}
