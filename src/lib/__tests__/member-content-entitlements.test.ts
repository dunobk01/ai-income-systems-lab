import { describe, expect, it, vi } from "vitest";
import { assertBuilderAccess } from "@/lib/entitlements";

const contextFor = (tier: string, admin = false) => {
  const query = (data: unknown) => ({
    select: () => ({ eq: () => ({ data, maybeSingle: async () => ({ data }) }) }),
  });
  return { userId: "member", supabase: { from: (table: string) => query(table === "profiles" ? { tier } : admin ? [{ role: "admin" }] : []) } };
};

describe("server enforcement for member tools and content", () => {
  it.each(["none", "free", "starter", "monthly"])("denies %s before a protected operation", async tier => {
    const operation = vi.fn();
    const run = async () => { await assertBuilderAccess(contextFor(tier)); operation(); };
    await expect(run()).rejects.toThrow("Builder");
    expect(operation).not.toHaveBeenCalled();
  });
  it.each(["builder", "accelerator", "pro"])("allows %s protected operations", async tier => {
    await expect(assertBuilderAccess(contextFor(tier))).resolves.toBeUndefined();
  });
  it("preserves creator/admin access regardless of tier", async () => {
    await expect(assertBuilderAccess(contextFor("none", true))).resolves.toBeUndefined();
  });
});