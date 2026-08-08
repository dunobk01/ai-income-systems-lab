import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, supabaseForUser } from "./_admin";

export default defineTool({
  name: "admin_delete_module",
  title: "Admin: delete module",
  description:
    "Admin-only. DESTRUCTIVE: deleting a module cascade-deletes all of its lessons and every member's progress on those lessons. If the module still has lessons, the tool refuses unless confirm_cascade_delete is true.",
  inputSchema: {
    module_id: z.string().uuid(),
    confirm_cascade_delete: z
      .boolean()
      .optional()
      .describe(
        "Must be true to delete a module that still has lessons. This permanently deletes those lessons and all member progress on them.",
      ),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ module_id, confirm_cascade_delete }, ctx) => {
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(ctx, sb);
    if (denied) return denied;

    const { data: lessons, error: lessonsError } = await sb
      .from("lessons")
      .select("id")
      .eq("module_id", module_id);
    if (lessonsError)
      return { content: [{ type: "text", text: lessonsError.message }], isError: true };

    const lessonIds = (lessons ?? []).map((l: { id: string }) => l.id);

    if (lessonIds.length > 0 && !confirm_cascade_delete) {
      let progressCount = 0;
      const { count } = await sb
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .in("lesson_id", lessonIds);
      progressCount = count ?? 0;

      return {
        content: [
          {
            type: "text",
            text:
              `Refused: module ${module_id} still has ${lessonIds.length} lesson(s) and ${progressCount} member progress record(s). ` +
              `Deleting it will permanently remove all of them. Delete the lessons first, or re-run with confirm_cascade_delete: true.`,
          },
        ],
        isError: true,
      };
    }

    const { error } = await sb.from("modules").delete().eq("id", module_id);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [
        {
          type: "text",
          text: `Deleted module ${module_id}${lessonIds.length ? ` and its ${lessonIds.length} lesson(s) plus related member progress` : ""}.`,
        },
      ],
    };
  },
});
