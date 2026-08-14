import { describe, expect, it } from "vitest";
import { assertBuilderAccess } from "@/lib/entitlements";

/**
 * Minimal stand-in for the authenticated Supabase client that
 * `requireSupabaseAuth` puts on the server-function context.
 */
function fakeContext(tier: string | null, roles: string[] = []) {
  const supabase = {
    from(table: string) {
      const result =
        table === "profiles"
          ? { data: tier === null ? null : { tier } }
          : { data: roles.map((role) => ({ role })) };
      const chain: Record<string, unknown> = {
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => result,
        then: (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve),
      };
      return chain;
    },
  };
  return { supabase, userId: "00000000-0000-0000-0000-000000000001" } as never;
}

describe("assertBuilderAccess — server-side paywall", () => {
  it("rejects a free member calling a builder endpoint directly", async () => {
    await expect(assertBuilderAccess(fakeContext("none"))).rejects.toThrow(/Builder plan/i);
  });

  it("rejects a member with no profile row at all", async () => {
    await expect(assertBuilderAccess(fakeContext(null))).rejects.toThrow(/Builder plan/i);
  });

  it("rejects a starter/monthly member", async () => {
    await expect(assertBuilderAccess(fakeContext("starter"))).rejects.toThrow(/Builder plan/i);
    await expect(assertBuilderAccess(fakeContext("monthly"))).rejects.toThrow(/Builder plan/i);
  });

  it("allows builder tier and above", async () => {
    await expect(assertBuilderAccess(fakeContext("builder"))).resolves.toBeUndefined();
    await expect(assertBuilderAccess(fakeContext("pro"))).resolves.toBeUndefined();
  });

  it("allows admins regardless of tier", async () => {
    await expect(assertBuilderAccess(fakeContext("none", ["admin"]))).resolves.toBeUndefined();
  });

  it("ignores non-admin roles", async () => {
    await expect(assertBuilderAccess(fakeContext("none", ["moderator"]))).rejects.toThrow();
  });
});
