import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, supabaseForUser } from "./_admin";

export default defineTool({
  name: "admin_delete_module",
  title: "Admin: delete module",
  description:
    "Admin-only. Delete a module. Fails if lessons still reference it — delete those first.",
  inputSchema: { module_id: z.string().uuid() },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ module_id }, ctx) => {
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(ctx, sb);
    if (denied) return denied;

    const { error } = await sb.from("modules").delete().eq("id", module_id);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Deleted module ${module_id}.` }] };
  },
});
