import { defineTool } from "@lovable.dev/mcp-js";
import { requireAdmin, supabaseForUser } from "./_admin";

export default defineTool({
  name: "admin_stats",
  title: "Admin: platform stats",
  description:
    "Admin-only. Returns totals for AI Income Systems Lab: users, leads, active subscriptions, revenue, and a tier breakdown.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(ctx, sb);
    if (denied) return denied;

    const PAGE = 1000;
    async function fetchAll<T>(table: "profiles" | "subscriptions", cols: string): Promise<T[]> {
      const rows: T[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await sb.from(table).select(cols).range(from, from + PAGE - 1);
        if (error) throw new Error(error.message);
        const batch = (data ?? []) as T[];
        rows.push(...batch);
        if (batch.length < PAGE) break;
      }
      return rows;
    }

    let profilesRows: { tier: string | null }[];
    let subsRows: { amount_cents: number | null; status: string }[];
    let leadsCount: number | null;
    let subsCount: number | null;
    let paidSubsCount: number | null;
    try {
      const [p, s, leads, subsC, paid] = await Promise.all([
        fetchAll<{ tier: string | null }>("profiles", "tier"),
        fetchAll<{ amount_cents: number | null; status: string }>("subscriptions", "amount_cents, status"),
        sb.from("leads").select("id", { count: "exact", head: true }),
        sb.from("subscriptions").select("id", { count: "exact", head: true }),
        sb
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .in("status", ["active", "trialing", "past_due"]),
      ]);
      profilesRows = p;
      subsRows = s;
      leadsCount = leads.count ?? 0;
      subsCount = subsC.count ?? 0;
      paidSubsCount = paid.count ?? 0;
    } catch (e) {
      return { content: [{ type: "text", text: (e as Error).message }], isError: true };
    }

    const tiers: Record<string, number> = {};
    for (const p of profilesRows) {
      const t = p.tier ?? "none";
      tiers[t] = (tiers[t] ?? 0) + 1;
    }
    const revenueCents = subsRows
      .filter((s) => !["refunded", "failed"].includes(s.status))
      .reduce((sum, s) => sum + (s.amount_cents ?? 0), 0);

    const result = {
      total_users: profilesRows.length,
      total_leads: leadsCount ?? 0,
      total_subscriptions: subsCount ?? 0,
      active_subscriptions: paidSubsCount ?? 0,
      revenue_cents: revenueCents,
      revenue_usd: Math.round(revenueCents) / 100,
      tier_breakdown: tiers,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
