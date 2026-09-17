import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type EnsureResult = {
  ok: boolean;
  tier: string;
  repaired: { profile: boolean; lead: boolean; sync: boolean };
};

/**
 * Repair-on-session-load fallback.
 *
 * Called once per authenticated session. The identity comes from the verified
 * bearer token, never from the client, so this cannot be used to grant a tier.
 * It only ever raises a member to Free — a valid paid tier is left untouched.
 */
export const ensureMemberProvisioned = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EnsureResult> => {
    const { supabase, userId } = context;
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    const email = user?.email;

    if (!email) {
      return { ok: false, tier: "none", repaired: { profile: false, lead: false, sync: false } };
    }

    const { provisionFreeMember } = await import("@/lib/members.server");
    const result = await provisionFreeMember({
      userId,
      email,
      displayName: (user?.user_metadata?.display_name as string | undefined) ?? null,
      provider: (user?.app_metadata?.provider as string | undefined) ?? "email",
      accountCreatedAt: user?.created_at ?? null,
    });

    // Best-effort immediate delivery; anything left behind is retried by the
    // scheduled worker, so a MailerLite outage never loses the member.
    if (result.syncQueued) {
      try {
        const { processMailerliteSyncJobs } = await import("@/lib/mailerlite-sync.server");
        await processMailerliteSyncJobs(5);
      } catch (err) {
        console.error("[ensureMemberProvisioned] inline sync failed", err);
      }
    }

    return {
      ok: true,
      tier: result.tier,
      repaired: {
        profile: result.profileCreated,
        lead: result.leadCreated,
        sync: result.syncQueued,
      },
    };
  });
