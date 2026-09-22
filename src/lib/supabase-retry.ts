import { supabase } from "@/integrations/supabase/client";

/**
 * Some member-area reads occasionally reach PostgREST as `anon` (expired or
 * not-yet-attached access token), which surfaces as "permission denied".
 * Refresh the session once and retry before showing the member an error.
 */
function isAuthError(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | null;
  const msg = (e?.message ?? "").toLowerCase();
  return (
    e?.code === "42501" ||
    e?.code === "PGRST301" ||
    msg.includes("permission denied") ||
    msg.includes("jwt") ||
    msg.includes("not authorized")
  );
}

export async function withFreshSession<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (!isAuthError(err)) throw err;
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      throw new Error("Your session expired. Please sign in again to keep going.");
    }
    return await run();
  }
}
