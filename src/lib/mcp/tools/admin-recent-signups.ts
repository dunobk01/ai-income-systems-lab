import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, supabaseForUser } from "./_admin";

export default defineTool({
  name: "admin_recent_signups",
  title: "Admin: recent signups",
  description: "Admin-only. List recently created member profiles with tier and referral code.",
  inputSchema: { limit: z.number().int().min(1).max(200).optional().describe("Max rows (default 25).") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(ctx, sb);
    if (denied) return denied;
    const { data, error } = await sb
      .from("profiles")
      .select("user_id, display_name, tier, referral_code, onboarded_at, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { profiles: data },
    };
  },
});
