import { canUseBuilders } from "@/lib/access";

type AuthedContext = { supabase: any; userId: string };

/**
 * Server-side paywall for the AI builders. Free members can preview the
 * builders in the UI, but generation is enforced here so the gate cannot be
 * bypassed by calling the server function directly.
 */
export async function assertBuilderAccess(context: AuthedContext) {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    context.supabase.from("profiles").select("tier").eq("user_id", context.userId).maybeSingle(),
    context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
  ]);
  const isAdmin = !!(roles ?? []).some((r: { role: string }) => r.role === "admin");
  if (!canUseBuilders(profile?.tier, isAdmin)) {
    throw new Error("This builder is included with the Builder plan. Upgrade to generate and save results.");
  }
}
