import { describe, expect, it } from "vitest";
import { winInputSchema } from "../win-input";

describe("accomplishment wins", () => {
  it("accepts an AI accomplishment without a dollar amount", () => {
    expect(winInputSchema.parse({ system: "Built my first AI workflow" })).toEqual({ system: "Built my first AI workflow" });
  });
  it("requires a nonblank accomplishment", () => {
    expect(winInputSchema.safeParse({ system: "   " }).success).toBe(false);
  });
});