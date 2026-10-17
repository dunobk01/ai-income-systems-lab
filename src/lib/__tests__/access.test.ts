import { describe, expect, it } from "vitest";
import { canUseBuilders, canUseTool, hasTier, isFreeTier, tierLabel, tierRank } from "@/lib/access";
import { FREE_TOOLS } from "@/lib/free-tools-data";
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

describe("revised tools, Lab and guide benefits", () => {
  it("keeps AI Prompt Generator available to everyone", () => {
    for (const tier of [undefined, null, "none", "free", "starter", "builder", "accelerator"]) {
      expect(canUseTool("ai-prompt-generator", tier)).toBe(true);
    }
  });
  it("denies every other catalog tool to signed-out, Free and Starter members", () => {
    const tools = FREE_TOOLS.filter(t => t.slug !== "ai-prompt-generator");
    expect(tools.length).toBe(9);
    for (const tool of tools) for (const tier of [undefined, null, "none", "free", "starter", "monthly"]) {
      expect(canUseTool(tool.slug, tier)).toBe(false);
    }
  });
  it("unlocks tools, Lab bodies and guides for Builder and Accelerator, preserving Pro and admin", () => {
    for (const tier of ["builder", "accelerator", "pro"]) {
      expect(canUseBuilders(tier)).toBe(true);
      for (const tool of FREE_TOOLS) expect(canUseTool(tool.slug, tier)).toBe(true);
    }
    expect(canUseBuilders("none", true)).toBe(true);
    expect(canUseBuilders("starter")).toBe(false);
    expect(canUseBuilders("none")).toBe(false);
  });
});
