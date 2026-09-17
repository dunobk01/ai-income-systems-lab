import { describe, expect, it } from "vitest";
import { canUseBuilders, hasTier, isFreeTier, tierLabel, tierRank } from "@/lib/access";
import { COURSE_ACCESS, hasCourseAccess } from "@/lib/course-access";

describe("access model — free members", () => {
  it("treats a brand new (tier `none`/null) account as Free", () => {
    expect(isFreeTier("none")).toBe(true);
    expect(isFreeTier(null)).toBe(true);
    expect(isFreeTier(undefined)).toBe(true);
    expect(tierLabel("none")).toBe("Free");
    expect(tierRank("none")).toBe(0);
  });

  it("denies every paid requirement to a free member", () => {
    for (const required of ["starter", "monthly", "builder", "pro", "accelerator"]) {
      expect(hasTier("none", required)).toBe(false);
      expect(hasTier(null, required)).toBe(false);
    }
  });

  it("blocks builders for free and starter members", () => {
    expect(canUseBuilders("none")).toBe(false);
    expect(canUseBuilders(null)).toBe(false);
    expect(canUseBuilders("starter")).toBe(false);
    expect(canUseBuilders("monthly")).toBe(false);
  });

  it("allows builders for builder tier and above, and for admins", () => {
    expect(canUseBuilders("builder")).toBe(true);
    expect(canUseBuilders("pro")).toBe(true);
    expect(canUseBuilders("accelerator")).toBe(true);
    expect(canUseBuilders("none", true)).toBe(true);
  });

  it("does not let an unknown/spoofed tier string escalate access", () => {
    expect(tierRank("admin")).toBe(0);
    expect(tierRank("PRO")).toBe(0);
    expect(canUseBuilders("super-pro")).toBe(false);
    expect(hasTier("free-but-actually-pro", "builder")).toBe(false);
  });
});

describe("course module ladder", () => {
  it("gives Starter Modules 1–11 but not Builder or Accelerator modules", () => {
    expect(hasCourseAccess("starter", "starter")).toBe(true);
    expect(hasCourseAccess("starter", "builder")).toBe(false);
    expect(hasCourseAccess("starter", "accelerator")).toBe(false);
    expect(COURSE_ACCESS.starter).toEqual({ modules: 11, lessons: 69 });
  });

  it("gives Builder Modules 1–12 but not Accelerator modules", () => {
    expect(hasCourseAccess("builder", "starter")).toBe(true);
    expect(hasCourseAccess("builder", "builder")).toBe(true);
    expect(hasCourseAccess("builder", "accelerator")).toBe(false);
    expect(COURSE_ACCESS.builder).toEqual({ modules: 12, lessons: 77 });
  });

  it("gives Accelerator all 15 modules and preserves legacy Pro access", () => {
    for (const requirement of ["starter", "builder", "accelerator"]) {
      expect(hasCourseAccess("accelerator", requirement)).toBe(true);
      expect(hasCourseAccess("pro", requirement)).toBe(true);
    }
    expect(COURSE_ACCESS.accelerator).toEqual({ modules: 15, lessons: 89 });
  });
});
