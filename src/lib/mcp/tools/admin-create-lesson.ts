import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, supabaseForUser } from "./_admin";

export default defineTool({
  name: "admin_create_lesson",
  title: "Admin: create lesson",
  description: "Admin-only. Create a new lesson inside a module.",
  inputSchema: {
    module_id: z.string().uuid(),
    title: z.string().min(1),
    slug: z.string().min(1).describe("URL slug, unique per module."),
    content: z.string().optional().describe("Markdown lesson body."),
    action_steps: z.string().optional(),
    video_url: z.string().url().optional(),
    resource_url: z.string().url().optional(),
    duration_minutes: z.number().int().min(0).optional(),
    order_index: z.number().int().min(0).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(ctx, sb);
    if (denied) return denied;

    const { data, error } = await sb
      .from("lessons")
      .insert({
        module_id: input.module_id,
        title: input.title,
        slug: input.slug,
        content: input.content ?? null,
        action_steps: input.action_steps ?? null,
        video_url: input.video_url ?? null,
        resource_url: input.resource_url ?? null,
        duration_minutes: input.duration_minutes ?? null,
        order_index: input.order_index ?? 0,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created lesson '${data.title}' (${data.id}).` }],
      structuredContent: { lesson: data },
    };
  },
});
