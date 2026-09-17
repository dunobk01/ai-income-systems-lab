/**
 * Access model.
 *
 * Every account is a member. Creating an account grants Free membership
 * immediately, which unlocks the introductory curriculum and read-only
 * previews of every premium tool. Paid tiers unlock the rest.
 *
 * The Free tier's stored database value is centralised in `FREE_TIER_VALUE`
 * (see member-rules.ts) and is always displayed as "Free".
 *
 * UI gating in components is convenience only — the real enforcement lives in
 * RLS policies and in the tier check inside the server functions.
 */

import {
  FREE_TIER_LABEL,
  FREE_TIER_VALUE,
  TIER_RANK,
  tierLabelFor,
  type Tier,
} from "@/lib/member-rules";

export { FREE_TIER_VALUE, FREE_TIER_LABEL, TIER_RANK };
export type { Tier };

export const tierRank = (tier: string | null | undefined) => TIER_RANK[tier ?? FREE_TIER_VALUE] ?? 0;

export const hasTier = (tier: string | null | undefined, required: string, isAdmin?: boolean) =>
  isAdmin === true || tierRank(tier) >= (TIER_RANK[required] ?? 0);

/** A Free member is anyone without a paid tier. */
export const isFreeTier = (tier: string | null | undefined) => tierRank(tier) === 0;

/** Human label for the member's plan. */
export const tierLabel = tierLabelFor;

/** Builders / workflow library / template library are a Builder-and-up perk. */
export const canUseBuilders = (tier: string | null | undefined, isAdmin?: boolean) =>
  isAdmin === true || tierRank(tier) >= TIER_RANK.builder;

/** Nice display name for the tier that unlocks a given requirement. */
export const requiredTierLabel = (required: string) => tierLabel(required);
