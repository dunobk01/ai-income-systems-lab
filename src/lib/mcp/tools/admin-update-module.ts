import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, supabaseForUser } from "./_admin";

const TIER = z.enum(["none", "monthly", "starter", "builder", "pro", "accelerator"]);

export default defineTool({
  name: "admin_update_module",
  title: "Admin: update module",
  description: "Admin-only. Update fields on an existing module. Only provided fields change.",
  inputSchema: {
    module_id: z.string().uuid(),
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    summary: z.string().nullable().optional(),
    order_index: z.number().int().min(0).optional(),
    required_tier: TIER.optional(),
    is_preview: z.boolean().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ module_id, ...patch }, ctx) => {
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(ctx, sb);
    if (denied) return denied;

    const update = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    if (Object.keys(update).length === 0)
      return { content: [{ type: "text", text: "No fields to update." }], isError: true };

    const { data, error } = await sb
      .from("modules")
      .update(update)
      .eq("id", module_id)
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Updated module ${data.id}.` }],
      structuredContent: { module: data },
    };
  },
});
