// Centralized tier helpers.
//
// Two access dimensions:
//   * Curriculum (all modules/lessons): monthly + starter + builder + pro.
//   * Feature tiers (builders, prompt-library tiers, etc.): starter/builder/pro
//     ranked numerically. Monthly does NOT inherit feature access — it's
//     curriculum-only.

export type Tier = "none" | "monthly" | "starter" | "builder" | "pro";

const FEATURE_RANK: Record<string, number> = {
  none: 0,
  monthly: 0, // monthly has no feature-tier inheritance
  starter: 1,
  builder: 2,
  pro: 3,
};

export const tierRank = FEATURE_RANK;

export function hasCurriculumAccess(tier: string | undefined, isAdmin?: boolean): boolean {
  if (isAdmin) return true;
  return tier === "monthly" || tier === "starter" || tier === "builder" || tier === "pro";
}

export function meetsTier(
  tier: string | undefined,
  required: "starter" | "builder" | "pro",
  isAdmin?: boolean,
): boolean {
  if (isAdmin) return true;
  return (FEATURE_RANK[tier ?? "none"] ?? 0) >= FEATURE_RANK[required];
}

export function isMonthly(tier: string | undefined): boolean {
  return tier === "monthly";
}
