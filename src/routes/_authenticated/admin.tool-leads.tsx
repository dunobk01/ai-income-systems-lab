import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Users, Sparkles, CalendarDays } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FREE_TOOLS } from "@/lib/free-tools-data";

export const Route = createFileRoute("/_authenticated/admin/tool-leads")({
  head: () => ({ meta: [{ title: "Free tool leads — Admin" }] }),
  component: ToolLeadsPage,
});

type Lead = {
  id: string;
  created_at: string;
  email: string;
  first_name: string | null;
  tool_slug: string;
  business_type: string | null;
  score: number | null;
  result_summary: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const toolName = (slug: string) => FREE_TOOLS.find((t) => t.slug === slug)?.name ?? slug;

function csvCell(value: unknown) {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function ToolLeadsPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Lead[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [tool, setTool] = useState("all");
  const [biz, setBiz] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    if (!loading && !isAdmin) void navigate({ to: "/dashboard", replace: true });
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    void (async () => {
      const { data, error } = await supabase
        .from("tool_leads")
        .select(
          "id, created_at, email, first_name, tool_slug, business_type, score, result_summary, utm_source, utm_medium, utm_campaign",
        )
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) setErr(error.message);
      else setRows((data ?? []) as Lead[]);
    })();
  }, [isAdmin]);

  const businessTypes = useMemo(() => {
    const set = new Set<string>();
    (rows ?? []).forEach((r) => r.business_type && set.add(r.business_type));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const fromTs = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTs = to ? new Date(`${to}T23:59:59`).getTime() : null;
    return (rows ?? []).filter((r) => {
      if (tool !== "all" && r.tool_slug !== tool) return false;
      if (biz !== "all" && (r.business_type ?? "") !== biz) return false;
      const ts = new Date(r.created_at).getTime();
      if (fromTs !== null && ts < fromTs) return false;
      if (toTs !== null && ts > toTs) return false;
      return true;
    });
  }, [rows, tool, biz, from, to]);

  const stats = useMemo(() => {
    const all = rows ?? [];
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const perTool: Record<string, number> = {};
    all.forEach((r) => {
      perTool[r.tool_slug] = (perTool[r.tool_slug] ?? 0) + 1;
    });
    return {
      total: all.length,
      last7: all.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length,
      perTool,
    };
  }, [rows]);

  const exportCsv = () => {
    const header = [
      "date",
      "email",
      "first_name",
      "tool",
      "business_type",
      "score",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "result_summary",
    ];
    const lines = [header.join(",")].concat(
      filtered.map((r) =>
        [
          new Date(r.created_at).toISOString(),
          r.email,
          r.first_name,
          toolName(r.tool_slug),
          r.business_type,
          r.score,
          r.utm_source,
          r.utm_medium,
          r.utm_campaign,
          r.result_summary,
        ]
          .map(csvCell)
          .join(","),
      ),
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tool-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) return null;

  const selectCls =
    "h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none focus:border-[color:var(--brand)]/50";

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Admin
      </Link>
      <h1 className="mt-4 text-3xl font-black tracking-tight">Free tool leads</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everyone who asked for a full report from the free tools.
      </p>

      {err && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">{err}</div>
      )}

      {/* Summary tiles */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Total leads
          </div>
          <div className="mt-2 text-3xl font-black">{stats.total}</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> Last 7 days
          </div>
          <div className="mt-2 text-3xl font-black">{stats.last7}</div>
        </div>
        {FREE_TOOLS.map((t) => (
          <div key={t.slug} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> {t.name}
            </div>
            <div className="mt-2 text-3xl font-black">{stats.perTool[t.slug] ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Tool
          <select className={selectCls} value={tool} onChange={(e) => setTool(e.target.value)}>
            <option value="all">All tools</option>
            {FREE_TOOLS.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Business type
          <select className={selectCls} value={biz} onChange={(e) => setBiz(e.target.value)}>
            <option value="all">All types</option>
            {businessTypes.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          From
          <input type="date" className={selectCls} value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          To
          <input type="date" className={selectCls} value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <Button variant="glass" className="h-10" onClick={exportCsv} disabled={!filtered.length}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {stats.total}
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Tool</th>
              <th className="px-3 py-2">Business type</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">UTM source</th>
            </tr>
          </thead>
          <tbody>
            {rows === null && (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={6}>
                  Loading…
                </td>
              </tr>
            )}
            {rows !== null && filtered.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={6}>
                  No leads match these filters yet.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{fmtDate(r.created_at)}</td>
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">{toolName(r.tool_slug)}</td>
                <td className="px-3 py-2">{r.business_type ?? "—"}</td>
                <td className="px-3 py-2">{r.score ?? "—"}</td>
                <td className="px-3 py-2">{r.utm_source ?? "direct"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
