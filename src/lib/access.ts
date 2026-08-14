/**
 * Access model.
 *
 * Every account is a member. Signing up with an email creates a permanent,
 * never-expiring Free membership (stored as tier `none`), which unlocks the
 * introductory curriculum and read-only previews of every premium tool.
 * Paid tiers unlock the rest.
 *
 * UI gating in components is convenience only — the real enforcement lives in
 * RLS policies and in the tier check inside the server functions.
 */

export type Tier = "none" | "monthly" | "starter" | "builder" | "pro" | "accelerator";

export const TIER_RANK: Record<string, number> = {
  none: 0,
  monthly: 1,
  starter: 1,
  builder: 2,
  pro: 3,
  accelerator: 3,
};

export const tierRank = (tier: string | null | undefined) => TIER_RANK[tier ?? "none"] ?? 0;

export const hasTier = (tier: string | null | undefined, required: string, isAdmin?: boolean) =>
  isAdmin === true || tierRank(tier) >= (TIER_RANK[required] ?? 0);

/** A Free member is anyone without a paid tier. */
export const isFreeTier = (tier: string | null | undefined) => tierRank(tier) === 0;

/** Human label for the member's plan. */
export const tierLabel = (tier: string | null | undefined): string => {
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
      return "Free";
  }
};

/** Builders / workflow library / template library are a Builder-and-up perk. */
export const canUseBuilders = (tier: string | null | undefined, isAdmin?: boolean) =>
  isAdmin === true || tierRank(tier) >= TIER_RANK.builder;

/** Nice display name for the tier that unlocks a given requirement. */
export const requiredTierLabel = (required: string) => tierLabel(required);
