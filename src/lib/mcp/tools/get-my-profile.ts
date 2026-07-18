import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_my_profile",
  title: "Get my profile",
  description: "Return the signed-in user's profile, tier, and admin status on AI Income Systems Lab.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const sb = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    const [{ data: profile, error: pErr }, { data: roles }] = await Promise.all([
      sb.from("profiles").select("display_name, tier, onboarded_at, referral_code, created_at").eq("user_id", userId).maybeSingle(),
      sb.from("user_roles").select("role").eq("user_id", userId),
    ]);
    if (pErr) return { content: [{ type: "text", text: pErr.message }], isError: true };
    const result = {
      user_id: userId,
      email: ctx.getUserEmail(),
      profile,
      roles: (roles ?? []).map((r) => r.role),
      is_admin: (roles ?? []).some((r) => r.role === "admin"),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
