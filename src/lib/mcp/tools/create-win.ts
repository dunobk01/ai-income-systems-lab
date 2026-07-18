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
    amount: z.number().nonnegative().describe("Dollar amount of the win."),
    system: z.string().min(1).describe("Which system/product produced the win (e.g. 'Digital Product', 'Agency')."),
    note: z.string().optional().describe("Optional short note about the win."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ amount, system, note }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("wins")
      .insert({ user_id: ctx.getUserId(), amount, system, note: note ?? null })
      .select("id, amount, system, note, created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Posted win #${data.id} ($${data.amount} — ${data.system}).` }],
      structuredContent: { win: data },
    };
  },
});
