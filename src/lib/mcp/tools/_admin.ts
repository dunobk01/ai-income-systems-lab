import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

export function supabaseForUser(ctx: ToolContext): SupabaseClient {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Returns null if authorized, or an error result if not. */
export async function requireAdmin(ctx: ToolContext, sb: SupabaseClient) {
  if (!ctx.isAuthenticated())
    return { content: [{ type: "text" as const, text: "Not authenticated" }], isError: true as const };
  const { data, error } = await sb.rpc("has_role", { _user_id: ctx.getUserId(), _role: "admin" });
  if (error) return { content: [{ type: "text" as const, text: error.message }], isError: true as const };
  if (!data)
    return {
      content: [{ type: "text" as const, text: "Forbidden: admin role required." }],
      isError: true as const,
    };
  return null;
}
