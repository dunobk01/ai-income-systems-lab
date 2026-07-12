import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Attach a referral code to the current authenticated user's profile,
// only when they don't already have a referrer set. Silent no-op on any
// failure — never blocks signup.
export const attachReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ code: z.string().regex(/^[a-z0-9]{6,32}$/i) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Look up referrer by code (excluding self)
    const { data: referrer } = await (supabase.from("profiles") as any)
      .select("user_id")
      .eq("referral_code", data.code.toLowerCase())
      .maybeSingle();
    const referrerId = (referrer as any)?.user_id as string | undefined;
    if (!referrerId || referrerId === userId) return { ok: false };

    // Only set if not already set
    const { data: me } = await (supabase.from("profiles") as any)
      .select("referred_by")
      .eq("user_id", userId)
      .maybeSingle();
    if ((me as any)?.referred_by) return { ok: false };

    const { error } = await (supabase.from("profiles") as any)
      .update({ referred_by: referrerId })
      .eq("user_id", userId);
    if (error) return { ok: false };
    return { ok: true };
  });
