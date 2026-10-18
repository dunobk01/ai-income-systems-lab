import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "create_win",
  title: "Post a new win",
  description: "Post a new win to the AI Income Systems Lab Wall of Wins as the signed-in user.",
  inputSchema: {
    system: z.string().trim().min(1).max(120).describe("An AI accomplishment, learning milestone, or project built."),
    note: z.string().trim().max(500).optional().describe("Optional short note about the win."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ system, note }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("wins")
      .insert({ user_id: ctx.getUserId(), system, note: note ?? null })
      .select("id, system, note, created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Posted win #${data.id}: ${data.system}.` }],
      structuredContent: { win: data },
    };
  },
});
