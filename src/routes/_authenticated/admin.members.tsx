import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { listMembersAdmin, setMemberTier, setMemberAdmin } from "@/lib/course-admin.functions";
import { formatBillingMoney, nextChargeDate, type Subscriber, type SubscriberTier } from "@/lib/admin-subscriber-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/members")({
  head: () => ({ meta: [
    { title: "Subscribers & Billing — AI Income Systems Lab Admin" },
    { name: "description", content: "Private subscriber directory, membership tiers, signup dates, payments, and subscription renewals." },
    { property: "og:title", content: "Subscribers & Billing — AI Income Systems Lab Admin" },
    { property: "og:description", content: "Private subscriber and billing administration for AI Income Systems Lab." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }), component: MembersAdmin,
});
const TIERS: SubscriberTier[] = ["none", "starter", "builder", "accelerator", "monthly", "pro"];
const tierLabel = (tier: string) => tier === "none" ? "Free" : tier === "monthly" ? "Legacy Monthly" : tier === "pro" ? "Legacy Pro" : tier[0].toUpperCase() + tier.slice(1);
const input = "rounded-md border border-input bg-background px-3 py-2 text-sm";
const fmt = (date?: string | null) => date ? new Date(date).toLocaleDateString() : "—";
const totalsLabel = (member: Subscriber, field: "charged" | "refunded" | "net" = "charged") => member.totals === null ? "Unavailable" : member.totals.length ? member.totals.map(t => formatBillingMoney(t[field], t.currency)).join(" / ") : "$0.00";
const renewalLabel = (member: Subscriber) => member.renewals.map(r => {
  const date = nextChargeDate(r);
  return date ? fmt(date) : r.cancelAtPeriodEnd && ["active", "trialing", "past_due"].includes(r.status) ? `Ends ${fmt(r.periodEnd)}` : r.status === "past_due" ? "Payment overdue" : "—";
}).join(" / ") || (member.totals === null ? "Unavailable" : "—");

function MembersAdmin() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const list = useServerFn(listMembersAdmin);
  const updTier = useServerFn(setMemberTier);
  const updAdmin = useServerFn(setMemberAdmin);
  const [members, setMembers] = useState<Subscriber[]>([]);
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("all");
  const [status, setStatus] = useState("all");
  const [environment, setEnvironment] = useState<"live" | "sandbox">("live");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const sel = members.find(m => m.id === selectedId);
  const reload = useCallback(async () => {
    setBusy(true); setError(null);
    try { const result = await list({ data: { environment } }); setMembers(result.members); setBillingError(result.billingError); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load subscribers."); }
    finally { setBusy(false); }
  }, [list, environment]);
  useEffect(() => { if (!loading && !isAdmin) void navigate({ to: "/dashboard", replace: true }); }, [loading, isAdmin, navigate]);
  useEffect(() => { if (isAdmin) void reload(); }, [isAdmin, reload]);
  const rows = useMemo(() => members.filter(m => tier === "all" || m.tier === tier)
    .filter(m => status === "all" || (status === "renewing" ? m.renewals.some(r => !!nextChargeDate(r)) : status === "email-only" ? !m.account_id : m.renewals.some(r => r.status === status)))
    .filter(m => !q || `${m.email} ${m.display_name ?? ""}`.toLowerCase().includes(q.toLowerCase())), [members, tier, status, q]);
  const exportCsv = () => {
    const headers = ["email", "name", "tier", "account", "signup_date", "billing_environment", "billing_status", "total_charged", "total_refunded", "net_paid", "next_renewal_or_end", "sources"];
    const escape = (value: unknown) => { const text = String(value ?? ""); return `"${(/^[=+@-]/.test(text) ? "'" : "") + text.replace(/"/g, '""')}"`; };
    const lines = rows.map(m => [m.email, m.display_name, tierLabel(m.tier), m.account_id ? "Login account" : "Email subscriber", m.created_at, environment, m.billing_status, totalsLabel(m), totalsLabel(m, "refunded"), totalsLabel(m, "net"), renewalLabel(m), m.sources.join("; ")].map(escape).join(","));
    const url = URL.createObjectURL(new Blob([[headers.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click(); URL.revokeObjectURL(url);
  };
  if (!isAdmin) return null;
  return <div className="p-4 sm:p-6 lg:p-10 max-w-7xl min-w-0">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">Members & subscribers</h1><Button variant="secondary" onClick={() => void reload()} disabled={busy}><RefreshCw className={busy ? "animate-spin" : ""} />Refresh</Button></div>
    <div className="mt-6 flex flex-wrap gap-2" aria-label="Filter by tier">
      <Button size="sm" variant={tier === "all" ? "default" : "secondary"} onClick={() => setTier("all")}>All ({members.length})</Button>
      {TIERS.map(t => <Button key={t} size="sm" variant={tier === t ? "default" : "secondary"} onClick={() => setTier(t)}>{tierLabel(t)} ({members.filter(m => m.tier === t).length})</Button>)}
    </div>
    <div className="mt-4 flex flex-wrap items-end gap-3">
      <label className="flex-1 min-w-48 text-xs text-muted-foreground">Search email or name<input className={`${input} w-full mt-1 text-foreground`} value={q} onChange={e => setQ(e.target.value)} /></label>
      <label className="text-xs text-muted-foreground">Status<select aria-label="Status" className={`${input} block mt-1 text-foreground`} value={status} onChange={e => setStatus(e.target.value)}><option value="all">All statuses</option><option value="renewing">Renewing</option><option value="email-only">Email subscribers</option><option value="past_due">Payment overdue</option><option value="canceled">Canceled</option></select></label>
      <label className="text-xs text-muted-foreground">Payment records<select aria-label="Payment records" className={`${input} block mt-1 text-foreground`} value={environment} onChange={e => setEnvironment(e.target.value as "live" | "sandbox")}><option value="live">Live payments</option><option value="sandbox">Test payments</option></select></label>
      <Button variant="secondary" onClick={exportCsv} disabled={busy || !!error}><Download />Export CSV</Button>
    </div>
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
    {billingError && <p role="alert" className="mt-4 text-warning">Payment records unavailable: {billingError}</p>}
    {busy ? <p role="status" className="mt-6 text-muted-foreground">Loading subscribers and payment records…</p> : !error && <>
      <p className="mt-5 text-xs text-muted-foreground">{rows.length} subscribers · {environment === "live" ? "Live" : "Test"} payment records</p>
      <div className="mt-2 overflow-x-auto border-y border-border">
        <table className="w-full text-sm"><thead className="text-left text-xs text-muted-foreground"><tr>{["Email", "Tier", "Signup date", "Charged", "Next renewal / end", "Billing status"].map(h => <th key={h} className="p-3 whitespace-nowrap">{h}</th>)}</tr></thead><tbody>
          {rows.map(m => <tr key={m.id} className="border-t border-border hover:bg-muted/50"><td className="p-3"><Button variant="link" className="h-auto p-0 whitespace-normal text-left justify-start break-all" onClick={() => setSelectedId(m.id)}>{m.email}</Button><div className="text-xs text-muted-foreground">{m.is_admin ? "Admin · " : ""}{m.account_id ? "Login account" : "Email subscriber"}</div></td><td className="p-3 whitespace-nowrap">{tierLabel(m.tier)}</td><td className="p-3 whitespace-nowrap">{fmt(m.created_at)}</td><td className="p-3 whitespace-nowrap">{totalsLabel(m)}</td><td className="p-3 whitespace-nowrap">{renewalLabel(m)}</td><td className="p-3 capitalize">{m.billing_status}</td></tr>)}
        </tbody></table>
      </div>{rows.length === 0 && <p className="mt-6 text-muted-foreground">No matching subscribers.</p>}
    </>}
    <Dialog open={!!sel} onOpenChange={open => { if (!open) setSelectedId(null); }}><DialogContent className="max-w-xl max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle className="break-all pr-6">{sel?.email}</DialogTitle><DialogDescription>{sel?.account_id ? "Login account" : "Free email subscriber"}{sel?.display_name ? ` · ${sel.display_name}` : ""}</DialogDescription></DialogHeader>
      {sel && <>
        <dl className="grid grid-cols-[1fr_1fr] gap-3 text-sm"><dt className="text-muted-foreground">Tier</dt><dd>{tierLabel(sel.tier)}</dd><dt className="text-muted-foreground">Signup date</dt><dd>{fmt(sel.created_at)}</dd><dt className="text-muted-foreground">Last sign-in</dt><dd>{fmt(sel.last_sign_in_at)}</dd><dt className="text-muted-foreground">Total charged</dt><dd>{totalsLabel(sel)}</dd><dt className="text-muted-foreground">Refunded</dt><dd>{totalsLabel(sel, "refunded")}</dd><dt className="text-muted-foreground">Net paid</dt><dd>{totalsLabel(sel, "net")}</dd><dt className="text-muted-foreground">Next renewal / end</dt><dd>{renewalLabel(sel)}</dd><dt className="text-muted-foreground">Signup sources</dt><dd className="break-words">{sel.sources.join(", ") || sel.provider}</dd></dl>
        {sel.account_id && <>
          <label className="text-sm">Plan / tier (manual override)<select className={`${input} w-full mt-1`} value={sel.tier} disabled={saving} onChange={async e => {
            const next = e.target.value as SubscriberTier; const id = sel.account_id; if (!id || !confirm(`Change ${sel.email} to ${tierLabel(next)}? This changes access, not billing.`)) return;
            setSaving(true); try { await updTier({ data: { userId: id, tier: next } }); toast.success("Tier updated"); await reload(); } catch (err) { toast.error(err instanceof Error ? err.message : "Update failed"); } finally { setSaving(false); }
          }}>{TIERS.map(t => <option key={t} value={t}>{tierLabel(t)}</option>)}</select></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sel.is_admin} disabled={saving} onChange={async e => {
            const on = e.target.checked; const id = sel.account_id; if (!id || !confirm(`${on ? "Give" : "Remove"} admin access for ${sel.email}?`)) return;
            setSaving(true); try { await updAdmin({ data: { userId: id, admin: on } }); toast.success("Admin access updated"); await reload(); } catch (err) { toast.error(err instanceof Error ? err.message : "Update failed"); } finally { setSaving(false); }
          }} />Admin access</label>
        </>}
        <h3 className="font-semibold">{environment === "live" ? "Live" : "Test"} subscriptions</h3>
        {!sel.renewals.length && <p className="text-sm text-muted-foreground">No subscriptions.</p>}
        {sel.renewals.map((r, i) => <div key={i} className="border-t border-border pt-3 text-sm"><div>{r.priceId || "Subscription"}</div><div className="text-muted-foreground capitalize">{r.status}{r.cancelAtPeriodEnd ? " · cancellation scheduled" : ""}</div><div className="text-muted-foreground">{nextChargeDate(r) ? "Next renewal" : "Period ends"}: {fmt(r.periodEnd)}</div>{r.amount !== null && <div className="text-muted-foreground">Plan rate: {formatBillingMoney(r.amount, r.currency)}</div>}</div>)}
        <h3 className="font-semibold">Payment history</h3>{sel.totals === null ? <p className="text-sm text-warning">Payment records unavailable.</p> : !sel.payments.length ? <p className="text-sm text-muted-foreground">No charges recorded.</p> : sel.payments.map(p => <div key={p.id} className="border-t border-border pt-3 text-sm flex justify-between gap-3"><div>{fmt(p.created_at)}<div className="text-muted-foreground capitalize">{p.status}{p.refunded ? ` · refunded ${formatBillingMoney(p.refunded, p.currency)}` : ""}</div></div><span>{formatBillingMoney(p.amount, p.currency)}</span></div>)}
      </>}
    </DialogContent></Dialog>
  </div>;
}
