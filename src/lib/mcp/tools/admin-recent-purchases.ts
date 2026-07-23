import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, supabaseForUser } from "./_admin";

export default defineTool({
  name: "admin_recent_purchases",
  title: "Admin: recent purchases & subscriptions",
  description:
    "Admin-only. List recent Stripe subscriptions/purchases with status, price, amount, and environment.",
  inputSchema: { limit: z.number().int().min(1).max(200).optional().describe("Max rows (default 25).") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(ctx, sb);
    if (denied) return denied;
    const { data, error } = await sb
      .from("subscriptions")
      .select(
        "id, user_id, price_id, product_id, status, amount_cents, currency, environment, current_period_end, cancel_at_period_end, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { subscriptions: data },
    };
  },
});
