import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Shield, Table, Search, Lock, Unlock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getPermissionDiagnostics, type PermissionDiagnostics, type TableDiagnostics } from "@/lib/permissions.functions";

export const Route = createFileRoute("/_authenticated/admin/permissions")({
  head: () => ({ meta: [{ title: "Permission Diagnostics — Admin" }] }),
  component: AdminPermissions,
});

function AdminPermissions() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const fetchFn = useServerFn(getPermissionDiagnostics);

  const [data, setData] = useState<PermissionDiagnostics | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [onlyWarnings, setOnlyWarnings] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) void navigate({ to: "/dashboard", replace: true });
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    void (async () => {
      try {
        const res = await fetchFn();
        setData(res);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load diagnostics");
      }
    })();
  }, [isAdmin, fetchFn]);

  const summary = useMemo(() => {
    if (!data) return null;
    const total = data.tables.length;
    const rlsEnabled = data.tables.filter((t) => t.rls_enabled).length;
    const rlsDisabled = total - rlsEnabled;
    const sdFunctions = data.functions.filter((f) => f.security_definer).length;
    const publicTables = data.tables.filter((t) => tableIsPubliclyReadable(t)).length;
    return { total, rlsEnabled, rlsDisabled, sdFunctions, publicTables };
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.tables.filter((t) => {
      const matches = !q || t.name.toLowerCase().includes(q.toLowerCase());
      if (!matches) return false;
      if (!onlyWarnings) return true;
      return !t.rls_enabled || tableHasNoPolicies(t) || tableIsPubliclyWritable(t);
    });
  }, [data, q, onlyWarnings]);

  if (!isAdmin) return null;

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Admin
          </Link>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Permission Diagnostics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live audit of RLS, grants, policies, and security-definer functions across the public schema.
          </p>
        </div>
      </div>

      {err && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{err}</div>}

      {summary && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Table className="h-4 w-4" />} label="Total tables" value={summary.total} />
          <StatCard
            icon={summary.rlsDisabled > 0 ? <AlertTriangle className="h-4 w-4 text-amber-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            label="RLS enabled"
            value={`${summary.rlsEnabled} / ${summary.total}`}
            warning={summary.rlsDisabled > 0}
          />
          <StatCard icon={<Shield className="h-4 w-4" />} label="Security-definer functions" value={summary.sdFunctions} />
          <StatCard icon={<Unlock className="h-4 w-4" />} label="Publicly readable tables" value={summary.publicTables} />
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tables…" className="pl-9" />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyWarnings}
            onChange={(e) => setOnlyWarnings(e.target.checked)}
            className="rounded border-white/10 bg-white/5"
          />
          Show only warnings
        </label>
      </div>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 && !err && (
          <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
            {data ? "No tables match the current filters." : "Loading diagnostics…"}
          </div>
        )}
        {filtered.map((t) => (
          <TableCard key={t.name} table={t} />
        ))}
      </div>

      {data && (
        <div className="mt-10 glass rounded-2xl p-6">
          <h2 className="font-semibold">Security-definer functions</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Functions that run as their owner instead of the caller. These are flagged by security scanners but are often intentional for RLS helpers and triggers.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">Function</th>
                  <th className="py-2 pr-4">Arguments</th>
                  <th className="py-2 pr-4">Owner</th>
                  <th className="py-2">Security definer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.functions.map((f) => (
                  <tr key={f.name}>
                    <td className="py-2 pr-4 font-mono text-xs">{f.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{f.argument_types || "—"}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{f.owner}</td>
                    <td className="py-2">
                      <Badge variant={f.security_definer ? "destructive" : "outline"} className="text-[10px]">
                        {f.security_definer ? "Yes" : "No"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data?.generated_at && (
        <p className="mt-4 text-xs text-muted-foreground">
          Generated at {new Date(data.generated_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  warning,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <div className={`glass rounded-2xl p-5 ${warning ? "border-amber-500/20" : ""}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon} {label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}

function TableCard({ table: t }: { table: TableDiagnostics }) {
  const warnings = tableWarnings(t);
  const publicReadable = tableIsPubliclyReadable(t);

  return (
    <div className={`glass rounded-2xl p-5 ${warnings.length > 0 ? "border-amber-500/20" : ""}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold font-mono text-sm">{t.name}</h3>
          <Badge variant="outline" className="text-[10px] border-white/15">
            {t.rls_enabled ? (
              <span className="flex items-center gap-1 text-emerald-300"><Lock className="h-3 w-3" /> RLS on</span>
            ) : (
              <span className="flex items-center gap-1 text-amber-300"><Unlock className="h-3 w-3" /> RLS off</span>
            )}
          </Badge>
          {publicReadable && (
            <Badge variant="outline" className="text-[10px] border-sky-500/30 text-sky-300">
              Public read
            </Badge>
          )}
        </div>
        {warnings.length > 0 && (
          <div className="flex gap-2">
            {warnings.map((w) => (
              <span key={w} className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {w}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Grants</h4>
          {t.grants.length === 0 ? (
            <p className="text-xs text-muted-foreground">No explicit grants found.</p>
          ) : (
            <ul className="space-y-1">
              {t.grants.map((g) => (
                <li key={g.role} className="text-xs">
                  <span className="font-medium">{g.role}</span>{" "}
                  <span className="text-muted-foreground">{g.privileges}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Policies ({t.policies.length})
          </h4>
          {t.policies.length === 0 ? (
            <p className="text-xs text-muted-foreground">No policies.</p>
          ) : (
            <ul className="space-y-2">
              {t.policies.map((p) => (
                <li key={p.name} className="text-xs border-l-2 border-white/10 pl-3">
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="font-medium">{p.name}</span>
                    <Badge variant="outline" className="text-[10px] border-white/15">{p.command}</Badge>
                    <span className="text-muted-foreground">→ {p.roles}</span>
                  </div>
                  {p.using && (
                    <div className="mt-1 text-[10px] text-muted-foreground font-mono truncate" title={p.using}>
                      USING: {p.using}
                    </div>
                  )}
                  {p.with_check && (
                    <div className="mt-1 text-[10px] text-muted-foreground font-mono truncate" title={p.with_check}>
                      WITH CHECK: {p.with_check}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function tableIsPubliclyReadable(t: TableDiagnostics): boolean {
  const hasAnonGrant = t.grants.some((g) => g.role === "anon" && g.privileges.includes("SELECT"));
  const hasAnonPolicy = t.policies.some(
    (p) => p.roles.includes("anon") && (p.command === "SELECT" || p.command === "ALL"),
  );
  return hasAnonGrant || hasAnonPolicy;
}

function tableIsPubliclyWritable(t: TableDiagnostics): boolean {
  const hasAnonGrant = t.grants.some(
    (g) => g.role === "anon" && /INSERT|UPDATE|DELETE/.test(g.privileges),
  );
  const hasAnonPolicy = t.policies.some(
    (p) => p.roles.includes("anon") && /INSERT|UPDATE|DELETE|ALL/.test(p.command),
  );
  return hasAnonGrant || hasAnonPolicy;
}

function tableHasNoPolicies(t: TableDiagnostics): boolean {
  return t.rls_enabled && t.policies.length === 0;
}

function tableWarnings(t: TableDiagnostics): string[] {
  const warnings: string[] = [];
  if (!t.rls_enabled) warnings.push("RLS disabled");
  if (tableIsPubliclyWritable(t)) warnings.push("Public write");
  if (tableHasNoPolicies(t)) warnings.push("No policies");
  return warnings;
}
