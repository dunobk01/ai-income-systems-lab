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

    const [profiles, leads, subs, paidSubs] = await Promise.all([
      sb.from("profiles").select("tier", { count: "exact", head: false }),
      sb.from("leads").select("id", { count: "exact", head: true }),
      sb.from("subscriptions").select("amount_cents, status", { count: "exact", head: false }),
      sb.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["active", "trialing", "past_due"]),
    ]);

    const tiers: Record<string, number> = {};
    for (const p of profiles.data ?? []) {
      const t = (p as { tier: string }).tier ?? "none";
      tiers[t] = (tiers[t] ?? 0) + 1;
    }
    const revenueCents = (subs.data ?? [])
      .filter((s) => !["refunded", "failed"].includes((s as { status: string }).status))
      .reduce((sum, s) => sum + ((s as { amount_cents: number | null }).amount_cents ?? 0), 0);

    const result = {
      total_users: profiles.count ?? 0,
      total_leads: leads.count ?? 0,
      total_subscriptions: subs.count ?? 0,
      active_subscriptions: paidSubs.count ?? 0,
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
