/**
 * Pure membership rules — no I/O, so they can be unit tested directly.
 *
 * Supabase is the source of truth for identity, profile and entitlement.
 * Stripe is the source of truth only for *successful* payments. MailerLite is
 * a synchronised marketing record and never controls site access.
 */

/**
 * The database enum value that represents Free membership.
 *
 * The underlying Postgres enum still stores `none` (renaming it in place would
 * break every deployed RLS policy and function mid-flight), so the value is
 * centralised here and always *displayed* as "Free".
 */
export const FREE_TIER_VALUE = "none" as const;
export const FREE_TIER_LABEL = "Free";

export type Tier = "none" | "free" | "monthly" | "starter" | "builder" | "pro" | "accelerator";

export const TIER_RANK: Record<string, number> = {
  none: 0,
  free: 0,
  monthly: 1,
  starter: 1,
  builder: 2,
  pro: 3,
  accelerator: 3,
};

/** Human label for a stored tier value. */
export function tierLabelFor(tier: string | null | undefined): string {
  switch (tier) {
    case "monthly":
      return "All-Access Monthly";
    case "starter":
      return "Starter";
    case "builder":
      return "Builder";
    case "pro":
      return "Pro";
    case "accelerator":
      return "Accelerator";
    default:
      return FREE_TIER_LABEL;
  }
}

/** Stripe price lookup key -> entitlement tier. */
export const PRICE_TO_TIER: Record<string, Exclude<Tier, "none" | "free">> = {
  ailab_starter_monthly: "starter",
  ailab_starter_annual: "starter",
  ailab_builder_monthly: "builder",
  ailab_builder_annual: "builder",
  ailab_accelerator_monthly: "accelerator",
  ailab_accelerator_annual: "accelerator",
  // Legacy one-time purchases (grandfathered).
  ailab_starter_onetime: "starter",
  ailab_builder_onetime: "builder",
  ailab_pro_onetime: "pro",
  starter_onetime: "starter",
  builder_onetime: "builder",
  pro_onetime: "pro",
  // Legacy subscription.
  ailab_monthly_subscription: "monthly",
};

const RECURRING_PRICES = new Set([
  "ailab_starter_monthly",
  "ailab_starter_annual",
  "ailab_builder_monthly",
  "ailab_builder_annual",
  "ailab_accelerator_monthly",
  "ailab_accelerator_annual",
  "ailab_monthly_subscription",
]);

/**
 * Subscription statuses that represent a subscription that has been paid for
 * at least once. `incomplete`, `incomplete_expired`, `unpaid` and `paused`
 * deliberately do NOT appear: a created-but-unpaid subscription grants nothing.
 */
export const PAID_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

/** One-time purchase statuses that still represent value received. */
export const PAID_ONETIME_STATUSES = new Set(["complete", "paid", "succeeded"]);

export type EntitlementRow = {
  price_id: string | null;
  status: string | null;
  /** ISO timestamp; a cancelled plan keeps access until this moment. */
  current_period_end?: string | null;
};

/**
 * Does this single record prove a payment that should grant access right now?
 */
export function grantsAccess(row: EntitlementRow, now: Date = new Date()): boolean {
  const priceId = row.price_id ?? "";
  const tier = PRICE_TO_TIER[priceId];
  if (!tier) return false;

  const status = (row.status ?? "").toLowerCase();

  if (RECURRING_PRICES.has(priceId)) {
    if (PAID_SUBSCRIPTION_STATUSES.has(status)) return true;
    // A cancelled subscription keeps access until the paid-through date.
    if (status === "canceled" && row.current_period_end) {
      return new Date(row.current_period_end).getTime() > now.getTime();
    }
    return false;
  }

  // One-time purchase: refunds and failures revoke, everything paid keeps.
  return PAID_ONETIME_STATUSES.has(status);
}

/**
 * Highest entitlement the member has actually paid for. Returns the Free tier
 * value when nothing qualifies — never `null`, so a member can never end up
 * with no membership at all.
 */
export function resolveEntitlement(rows: EntitlementRow[], now: Date = new Date()): Tier {
  let best: Tier = FREE_TIER_VALUE;
  let bestRank = 0;
  for (const row of rows) {
    if (!grantsAccess(row, now)) continue;
    const tier = PRICE_TO_TIER[row.price_id ?? ""];
    const rank = TIER_RANK[tier] ?? 0;
    if (rank > bestRank) {
      bestRank = rank;
      best = tier;
    }
  }
  return best;
}

/**
 * Free is only ever *assigned* when the member has no valid paid entitlement.
 * Guards against an abandoned checkout or a fresh sign-in downgrading someone.
 */
export function nextTierForProvisioning(currentTier: string | null | undefined, paidRows: EntitlementRow[], now?: Date): Tier {
  const earned = resolveEntitlement(paidRows, now);
  const currentRank = TIER_RANK[currentTier ?? FREE_TIER_VALUE] ?? 0;
  const earnedRank = TIER_RANK[earned] ?? 0;
  // Never silently strip a paid tier during provisioning; only the Stripe
  // webhook (which has proof) is allowed to reduce entitlement.
  return earnedRank >= currentRank ? earned : (currentTier as Tier);
}

/* ------------------------------------------------------------------ *
 * Signup + MailerLite mapping
 * ------------------------------------------------------------------ */

export const MAILERLITE_GROUPS = {
  freeMembers: "AI-Income-Systems Free Members",
  leads: "AI-Income-Systems Leads 1",
  os: "AI Income Operating System — 7-Day Nurture",
  customers: "AI-Income-Systems Customers",
} as const;

export function signupSourceForProvider(provider: string | null | undefined): string {
  switch ((provider ?? "email").toLowerCase()) {
    case "google":
      return "account-signup-google";
    case "apple":
      return "account-signup-apple";
    case "email":
    case "":
      return "account-signup-email";
    default:
      return `account-signup-${String(provider).toLowerCase()}`;
  }
}

/** Hard bounces and spam complaints must never be reactivated. */
export function isHardSuppressed(reason: string | null | undefined): boolean {
  return reason === "bounce" || reason === "complaint";
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Custom fields written to the MailerLite subscriber for a Free member. */
export function freeMemberFields(opts: {
  userId: string;
  signupSource: string;
  signupProvider: string;
  accountCreatedAt?: string | null;
}): Record<string, string> {
  return {
    user_id: opts.userId,
    account_status: "active",
    plan_status: "free",
    plan_id: "free",
    plan_name: FREE_TIER_LABEL,
    signup_source: opts.signupSource,
    signup_provider: opts.signupProvider,
    account_created_at: toMailerliteDate(opts.accountCreatedAt),
  };
}

export function toMailerliteDate(value?: string | null): string {
  const d = value ? new Date(value) : new Date();
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  return safe.toISOString().slice(0, 19).replace("T", " ");
}

/** Exponential backoff in minutes, capped, for the sync outbox. */
export function backoffMinutes(attemptCount: number): number {
  return Math.min(2 ** Math.max(0, attemptCount), 240);
}

/** A 4xx other than 429 is permanent — stop burning retries on it. */
export function isRetryableStatus(status: number): boolean {
  if (status === 408 || status === 429) return true;
  return status >= 500;
}
