import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, supabaseForUser } from "./_admin";

export default defineTool({
  name: "admin_update_lesson",
  title: "Admin: update lesson",
  description: "Admin-only. Update fields on an existing lesson. Only provided fields change.",
  inputSchema: {
    lesson_id: z.string().uuid(),
    module_id: z.string().uuid().optional().describe("Move lesson to a different module."),
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    content: z.string().nullable().optional(),
    action_steps: z.string().nullable().optional(),
    video_url: z.string().url().nullable().optional(),
    resource_url: z.string().url().nullable().optional(),
    duration_minutes: z.number().int().min(0).nullable().optional(),
    order_index: z.number().int().min(0).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ lesson_id, ...patch }, ctx) => {
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(ctx, sb);
    if (denied) return denied;

    const update = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    if (Object.keys(update).length === 0)
      return { content: [{ type: "text", text: "No fields to update." }], isError: true };

    const { data, error } = await sb
      .from("lessons")
      .update(update)
      .eq("id", lesson_id)
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Updated lesson ${data.id}.` }],
      structuredContent: { lesson: data },
    };
  },
});
