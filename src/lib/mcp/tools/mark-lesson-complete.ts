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
  name: "mark_lesson_complete",
  title: "Mark a lesson complete",
  description:
    "Mark a lesson as complete (or incomplete) for the signed-in user. Provide either lesson_id or lesson_slug.",
  inputSchema: {
    lesson_id: z.string().uuid().optional().describe("Lesson UUID."),
    lesson_slug: z.string().min(1).optional().describe("Lesson slug (used if lesson_id omitted)."),
    completed: z.boolean().optional().describe("Set to false to mark incomplete. Defaults to true."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ lesson_id, lesson_slug, completed }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    if (!lesson_id && !lesson_slug)
      return { content: [{ type: "text", text: "Provide lesson_id or lesson_slug" }], isError: true };

    const sb = supabaseForUser(ctx);
    let resolvedId = lesson_id;
    if (!resolvedId) {
      const { data: lesson, error: lErr } = await sb
        .from("lessons")
        .select("id")
        .eq("slug", lesson_slug!)
        .maybeSingle();
      if (lErr) return { content: [{ type: "text", text: lErr.message }], isError: true };
      if (!lesson)
        return { content: [{ type: "text", text: `Lesson '${lesson_slug}' not found or not accessible.` }], isError: true };
      resolvedId = lesson.id;
    }

    const isComplete = completed !== false;
    const { data, error } = await sb
      .from("lesson_progress")
      .upsert(
        {
          user_id: ctx.getUserId(),
          lesson_id: resolvedId,
          completed: isComplete,
          completed_at: isComplete ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,lesson_id" },
      )
      .select("lesson_id, completed, completed_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [
        { type: "text", text: isComplete ? `Marked lesson ${resolvedId} complete.` : `Marked lesson ${resolvedId} incomplete.` },
      ],
      structuredContent: { progress: data },
    };
  },
});
