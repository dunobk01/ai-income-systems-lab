import { hasTier } from "@/lib/access";

export const COURSE_ACCESS = {
  starter: { modules: 11, lessons: 69 },
  builder: { modules: 12, lessons: 77 },
  accelerator: { modules: 15, lessons: 89 },
} as const;

/**
 * Shared client-side curriculum check. Database RLS remains authoritative for
 * lesson bodies; this keeps the course index and lesson screen consistent.
 */
export const hasCourseAccess = (
  memberTier: string | null | undefined,
  requiredTier: string | null | undefined,
  isAdmin?: boolean,
) => hasTier(memberTier, requiredTier ?? "starter", isAdmin);