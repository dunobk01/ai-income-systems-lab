import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, supabaseForUser } from "./_admin";

export default defineTool({
  name: "admin_recent_leads",
  title: "Admin: recent email leads",
  description: "Admin-only. List recently captured email leads with source and lead magnet.",
  inputSchema: { limit: z.number().int().min(1).max(200).optional().describe("Max rows (default 25).") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(ctx, sb);
    if (denied) return denied;
    const { data, error } = await sb
      .from("leads")
      .select("id, email, source, lead_magnet, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { leads: data },
    };
  },
});
