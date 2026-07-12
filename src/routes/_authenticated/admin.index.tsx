import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShoppingBag, BookOpen, DollarSign, Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — AI Income Systems Lab" }] }),
  component: AdminPage,
});

type Stats = {
  totalUsers: number;
  paidUsers: number;
  totalPurchases: number;
  revenueCents: number;
  byTier: Record<string, number>;
  recent: Array<{ user_id: string; price_id: string; created_at: string; environment: string }>;
};

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) void navigate({ to: "/dashboard", replace: true });
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    void (async () => {
      try {
        const [{ count: totalUsers }, { data: profiles }, { data: subs }] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("tier"),
          supabase.from("subscriptions").select("user_id, price_id, amount_cents, status, created_at, environment").order("created_at", { ascending: false }),
        ]);

        const byTier: Record<string, number> = { none: 0, starter: 0, builder: 0, pro: 0 };
        (profiles ?? []).forEach((p: any) => { byTier[p.tier] = (byTier[p.tier] ?? 0) + 1; });

        const validSubs = (subs ?? []).filter((s: any) => s.status !== "refunded");
        const revenueCents = validSubs.reduce((sum: number, s: any) => sum + (s.amount_cents ?? 0), 0);
        const paidUsers = new Set(validSubs.map((s: any) => s.user_id)).size;

        setStats({
          totalUsers: totalUsers ?? 0,
          paidUsers,
          totalPurchases: subs?.length ?? 0,
          revenueCents,
          byTier,
          recent: (subs ?? []).slice(0, 10) as any,
        });
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load stats");
      }
    })();
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      <h1 className="text-3xl font-black tracking-tight">Admin</h1>
      <p className="text-sm text-muted-foreground mt-1">Overview of users, purchases, and revenue.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/admin/newsletter" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm">
          <Mail className="h-4 w-4" /> Newsletter & blog posts
        </Link>
        <Link to="/admin/pillars" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm">
          <BookOpen className="h-4 w-4" /> Manage pillar guides
        </Link>
      </div>

      {err && <div className="mt-6 text-sm text-red-300">{err}</div>}

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="h-4 w-4" />} label="Total users" value={stats?.totalUsers ?? "—"} />
        <StatCard icon={<ShoppingBag className="h-4 w-4" />} label="Paid users" value={stats?.paidUsers ?? "—"} />
        <StatCard icon={<BookOpen className="h-4 w-4" />} label="Purchases" value={stats?.totalPurchases ?? "—"} />
        <StatCard icon={<DollarSign className="h-4 w-4" />} label="Revenue" value={stats ? `$${(stats.revenueCents / 100).toLocaleString()}` : "—"} />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold">Users by tier</h2>
          <div className="mt-4 space-y-3 text-sm">
            {stats && Object.entries(stats.byTier).map(([tier, n]) => (
              <div key={tier} className="flex justify-between">
                <span className="capitalize text-muted-foreground">{tier}</span>
                <span className="font-medium">{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold">Recent purchases</h2>
          <div className="mt-4 space-y-2 text-sm">
            {stats?.recent.length === 0 && <p className="text-muted-foreground">No purchases yet.</p>}
            {stats?.recent.map((r, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="font-mono text-muted-foreground">{r.user_id.slice(0, 8)}…</span>
                <span>{r.price_id.replace("_onetime", "")}</span>
                <span className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                <span className="text-muted-foreground uppercase text-[10px]">{r.environment}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon} {label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}
