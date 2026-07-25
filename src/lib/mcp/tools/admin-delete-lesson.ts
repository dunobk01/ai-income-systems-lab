import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, supabaseForUser } from "./_admin";

export default defineTool({
  name: "admin_delete_lesson",
  title: "Admin: delete lesson",
  description:
    "Admin-only. Delete a lesson. Related lesson_progress rows are removed by cascading foreign keys.",
  inputSchema: { lesson_id: z.string().uuid() },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ lesson_id }, ctx) => {
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(ctx, sb);
    if (denied) return denied;

    const { error } = await sb.from("lessons").delete().eq("id", lesson_id);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Deleted lesson ${lesson_id}.` }] };
  },
});
