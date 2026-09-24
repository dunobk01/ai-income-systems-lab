import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { listMembersAdmin, setMemberTier, setMemberAdmin } from "@/lib/course-admin.functions";
import { Download, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/members")({
  head: () => ({ meta: [{ title: "Members — Admin" }, { name: "robots", content: "noindex" }] }),
  component: MembersAdmin,
});

const TIERS = ["none", "monthly", "starter", "builder", "pro", "accelerator"] as const;
const input = "rounded-lg border border-white/10 bg-background px-3 py-2 text-sm";
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : "—");

function MembersAdmin() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const list = useServerFn(listMembersAdmin);
  const updTier = useServerFn(setMemberTier);
  const updAdmin = useServerFn(setMemberAdmin);
  const [members, setMembers] = useState<any[] | null>(null);
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("all");
  const [sel, setSel] = useState<any>(null);

  useEffect(() => { if (!loading && !isAdmin) void navigate({ to: "/dashboard", replace: true }); }, [loading, isAdmin, navigate]);
  const reload = () => list().then((r) => { setMembers(r.members); setSel((s: any) => s && r.members.find((m: any) => m.id === s.id)); }).catch((e) => toast.error(e.message));
  useEffect(() => { if (isAdmin) void reload(); }, [isAdmin]);

  const rows = useMemo(() => (members ?? [])
    .filter((m) => tier === "all" || m.tier === tier)
    .filter((m) => !q || m.email.toLowerCase().includes(q.toLowerCase()) || (m.display_name ?? "").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.created_at.localeCompare(a.created_at)), [members, q, tier]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (members ?? []).forEach((m) => { c[m.tier] = (c[m.tier] ?? 0) + 1; });
    return c;
  }, [members]);

  const exportCsv = () => {
    const head = ["email", "name", "tier", "admin", "provider", "joined", "last_sign_in"];
    const body = rows.map((m) => [m.email, m.display_name ?? "", m.tier, m.is_admin, m.provider, m.created_at, m.last_sign_in_at ?? ""].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","));
    const url = URL.createObjectURL(new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "members.csv"; a.click(); URL.revokeObjectURL(url);
  };

  if (!isAdmin) return null;

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      <h1 className="text-3xl font-black tracking-tight">Members</h1>
      <p className="text-sm text-muted-foreground mt-1">Every account by email and plan. Click a member for details.</p>

      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        <button onClick={() => setTier("all")} className={`rounded-full px-3 py-1 border border-white/10 ${tier === "all" ? "bg-primary text-primary-foreground" : ""}`}>All ({members?.length ?? 0})</button>
        {TIERS.map((t) => (
          <button key={t} onClick={() => setTier(t)} className={`rounded-full px-3 py-1 border border-white/10 capitalize ${tier === t ? "bg-primary text-primary-foreground" : ""}`}>{t === "none" ? "free" : t} ({counts[t] ?? 0})</button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input placeholder="Search email or name" value={q} onChange={(e) => setQ(e.target.value)} className={`${input} flex-1 min-w-[200px]`} />
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm"><Download className="h-4 w-4" /> Export CSV</button>
      </div>

      {!members && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      <div className="mt-4 glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr><th className="p-3">Email</th><th className="p-3">Tier</th><th className="p-3 hidden sm:table-cell">Joined</th><th className="p-3 hidden md:table-cell">Last sign-in</th></tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} onClick={() => setSel(m)} className="border-t border-white/5 hover:bg-white/5 cursor-pointer">
                <td className="p-3"><div className="font-medium break-all">{m.email}</div>{m.is_admin && <span className="text-[10px] uppercase text-primary">admin</span>}</td>
                <td className="p-3 capitalize">{m.tier === "none" ? "free" : m.tier}</td>
                <td className="p-3 hidden sm:table-cell text-muted-foreground">{fmt(m.created_at)}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{fmt(m.last_sign_in_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex justify-end" onClick={() => setSel(null)}>
          <div className="w-full max-w-md h-full overflow-y-auto bg-card border-l border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2">
              <div><h2 className="text-lg font-bold break-all">{sel.email}</h2><p className="text-sm text-muted-foreground">{sel.display_name ?? "No name"}</p></div>
              <button onClick={() => setSel(null)} aria-label="Close" className="p-2"><X className="h-4 w-4" /></button>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Signed up with</dt><dd className="capitalize">{sel.provider}</dd>
              <dt className="text-muted-foreground">Joined</dt><dd>{fmt(sel.created_at)}</dd>
              <dt className="text-muted-foreground">Last sign-in</dt><dd>{fmt(sel.last_sign_in_at)}</dd>
            </dl>

            <label className="block mt-6 text-sm space-y-1">
              <span className="text-muted-foreground">Plan / tier (manual override)</span>
              <select className={`${input} w-full`} value={sel.tier} onChange={async (e) => {
                const t = e.target.value;
                if (!confirm(`Change ${sel.email} to ${t}?`)) return;
                try { await updTier({ data: { userId: sel.id, tier: t as any } }); toast.success("Tier updated"); reload(); } catch (err: any) { toast.error(err.message); }
              }}>
                {TIERS.map((t) => <option key={t} value={t}>{t === "none" ? "free" : t}</option>)}
              </select>
            </label>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={sel.is_admin} onChange={async (e) => {
                const on = e.target.checked;
                if (!confirm(on ? `Give ${sel.email} admin access?` : `Remove admin access from ${sel.email}?`)) return;
                try { await updAdmin({ data: { userId: sel.id, admin: on } }); toast.success("Admin access updated"); reload(); } catch (err: any) { toast.error(err.message); }
              }} /> Admin access
            </label>

            <h3 className="mt-6 font-semibold text-sm">Payments</h3>
            {sel.subscriptions.length === 0 && <p className="text-sm text-muted-foreground mt-1">No purchases.</p>}
            <div className="mt-2 space-y-2">
              {sel.subscriptions.map((s: any, i: number) => (
                <div key={i} className="rounded-lg border border-white/10 p-3 text-xs space-y-1">
                  <div className="flex justify-between"><span>{s.price_id}</span><span className="uppercase text-muted-foreground">{s.environment}</span></div>
                  <div className="text-muted-foreground">Status: {s.status}{s.cancel_at_period_end ? " (cancels at period end)" : ""}</div>
                  <div className="text-muted-foreground">Renews/ends: {fmt(s.current_period_end)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
