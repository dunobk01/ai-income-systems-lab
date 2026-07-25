import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, supabaseForUser } from "./_admin";

const TIER = z.enum(["none", "monthly", "starter", "builder", "pro", "accelerator"]);

export default defineTool({
  name: "admin_create_module",
  title: "Admin: create module",
  description: "Admin-only. Create a new course module.",
  inputSchema: {
    course_id: z.string().uuid().describe("Parent course UUID."),
    title: z.string().min(1),
    slug: z.string().min(1).describe("URL slug, unique per course."),
    summary: z.string().optional(),
    order_index: z.number().int().min(0).optional(),
    required_tier: TIER.optional().describe("Minimum tier required. Defaults to 'starter'."),
    is_preview: z.boolean().optional().describe("If true, visible to all users."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(ctx, sb);
    if (denied) return denied;

    const { data, error } = await sb
      .from("modules")
      .insert({
        course_id: input.course_id,
        title: input.title,
        slug: input.slug,
        summary: input.summary ?? null,
        order_index: input.order_index ?? 0,
        required_tier: input.required_tier ?? "starter",
        is_preview: input.is_preview ?? false,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created module '${data.title}' (${data.id}).` }],
      structuredContent: { module: data },
    };
  },
});
