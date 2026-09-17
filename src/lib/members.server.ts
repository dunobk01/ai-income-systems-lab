/**
 * Server-only member provisioning.
 *
 * One idempotent workflow that guarantees every authenticated account has:
 *   - a profile,
 *   - a Free-or-higher tier (never downgrading a valid paid tier),
 *   - a normalised local lead/member record,
 *   - a recorded MailerLite synchronisation state.
 *
 * Safe to run on every sign-in.
 */

import {
  FREE_TIER_VALUE,
  isHardSuppressed,
  nextTierForProvisioning,
  normalizeEmail,
  signupSourceForProvider,
  type EntitlementRow,
} from "@/lib/member-rules";

export type ProvisionInput = {
  userId: string;
  email: string;
  displayName?: string | null;
  provider?: string | null;
  /** Overrides the provider-derived source (e.g. existing-lead-account-created). */
  source?: string | null;
  accountCreatedAt?: string | null;
};

export type ProvisionResult = {
  ok: true;
  tier: string;
  profileCreated: boolean;
  leadCreated: boolean;
  syncQueued: boolean;
  syncSkippedReason?: string;
};

export async function provisionFreeMember(input: ProvisionInput): Promise<ProvisionResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const admin = supabaseAdmin as any;

  const email = normalizeEmail(input.email);
  const provider = (input.provider ?? "email").toLowerCase();

  /* 1. Profile ---------------------------------------------------------- */
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("user_id, tier")
    .eq("user_id", input.userId)
    .maybeSingle();

  let profileCreated = false;
  if (!existingProfile) {
    const { error } = await admin.from("profiles").insert({
      user_id: input.userId,
      display_name: input.displayName ?? email.split("@")[0],
      tier: FREE_TIER_VALUE,
    });
    // A concurrent signup trigger may have won the race — that is fine.
    if (error && !/duplicate key/i.test(error.message)) {
      throw new Error(`profile provisioning failed: ${error.message}`);
    }
    profileCreated = !error;
  }

  /* 2. Tier — assign Free only when no valid paid entitlement exists ----- */
  const { data: subs } = await admin
    .from("subscriptions")
    .select("price_id, status, current_period_end")
    .eq("user_id", input.userId);

  const currentTier = (existingProfile?.tier as string | undefined) ?? FREE_TIER_VALUE;
  const targetTier = nextTierForProvisioning(currentTier, (subs ?? []) as EntitlementRow[]);
  if (targetTier !== currentTier) {
    await admin.from("profiles").update({ tier: targetTier }).eq("user_id", input.userId);
  }

  /* 3. Local lead / member record --------------------------------------- */
  // Was this address already known to us as a lead before the account existed?
  const { data: priorLeads } = await admin
    .from("leads")
    .select("id, lead_magnet")
    .eq("email", email);

  const hasAccountLead = (priorLeads ?? []).some(
    (l: { lead_magnet: string | null }) => l.lead_magnet === "account",
  );
  const wasExistingLead = (priorLeads ?? []).length > 0 && !hasAccountLead;

  const source =
    input.source ?? (wasExistingLead ? "existing-lead-account-created" : signupSourceForProvider(provider));

  let leadCreated = false;
  if (!hasAccountLead) {
    const { error } = await admin
      .from("leads")
      .insert({ email, source, lead_magnet: "account" });
    if (error && !/duplicate key/i.test(error.message)) {
      console.error("[provision] lead insert failed", error.message);
    } else if (!error) {
      leadCreated = true;
    }
  }

  /* 4. MailerLite synchronisation state --------------------------------- */
  const { data: suppression } = await admin
    .from("suppressed_emails")
    .select("reason")
    .eq("email", email)
    .maybeSingle();
  const reason = (suppression as { reason?: string } | null)?.reason ?? null;

  if (isHardSuppressed(reason)) {
    return {
      ok: true,
      tier: targetTier,
      profileCreated,
      leadCreated,
      syncQueued: false,
      syncSkippedReason: `suppressed (${reason})`,
    };
  }
  if (reason === "unsubscribe") {
    return {
      ok: true,
      tier: targetTier,
      profileCreated,
      leadCreated,
      syncQueued: false,
      syncSkippedReason: "unsubscribed",
    };
  }

  // One open job per user+event, and never re-queue a completed one: this is
  // what stops repeated sign-ins from restarting MailerLite automations.
  const { data: priorJobs } = await admin
    .from("mailerlite_sync_jobs")
    .select("id, status")
    .eq("user_id", input.userId)
    .eq("event_type", "free_member_signup");

  const alreadyHandled = (priorJobs ?? []).length > 0;

  let syncQueued = false;
  if (!alreadyHandled) {
    const { error } = await admin.from("mailerlite_sync_jobs").insert({
      user_id: input.userId,
      email,
      event_type: "free_member_signup",
      payload: {
        signup_source: source,
        signup_provider: provider,
        account_created_at: input.accountCreatedAt ?? new Date().toISOString(),
        display_name: input.displayName ?? null,
      },
    });
    if (error && !/duplicate key/i.test(error.message)) {
      console.error("[provision] sync enqueue failed", error.message);
    } else if (!error) {
      syncQueued = true;
    }
  }

  return { ok: true, tier: targetTier, profileCreated, leadCreated, syncQueued };
}
