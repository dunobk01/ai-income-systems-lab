import { TIER_RANK, tierRank } from "@/lib/access";

/** Messages each member can send to the AI Assistant per UTC day. */
export const ASSISTANT_DAILY_LIMIT = 30;

/** Every paid plan (Starter and up) and admins can use the AI Assistant. */
export const canUseAssistant = (tier: string | null | undefined, isAdmin?: boolean) =>
  isAdmin === true || tierRank(tier) >= (TIER_RANK.starter ?? 1);

/** Start of the current UTC day, used to count today's messages. */
export const startOfUtcDay = (now: Date = new Date()) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

export const remainingMessages = (usedToday: number) =>
  Math.max(0, ASSISTANT_DAILY_LIMIT - usedToday);
