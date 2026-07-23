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
  name: "list_my_progress",
  title: "List my lesson progress",
  description:
    "List the signed-in user's completed lessons on AI Income Systems Lab, with lesson title and module.",
  inputSchema: {
    limit: z.number().int().min(1).max(200).optional().describe("Max lessons to return (default 50)."),
    only_completed: z
      .boolean()
      .optional()
      .describe("If true (default), return only completed lessons."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, only_completed }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = supabaseForUser(ctx)
      .from("lesson_progress")
      .select(
        "lesson_id, completed, completed_at, lessons(title, slug, modules(title, slug, order_index))",
      )
      .eq("user_id", ctx.getUserId())
      .order("completed_at", { ascending: false, nullsFirst: false })
      .limit(limit ?? 50);
    if (only_completed !== false) q = q.eq("completed", true);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { progress: data },
    };
  },
});
