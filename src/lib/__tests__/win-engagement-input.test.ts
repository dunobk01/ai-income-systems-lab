import { describe, expect, it } from "vitest";
import { winCommentSchema, winLikeSchema } from "../win-engagement-input";

const winId = "540f135a-fc8c-4656-8178-6e4c66894c28";
describe("win engagement", () => {
  it("accepts liking and unliking a win", () => {
    expect(winLikeSchema.parse({ winId, liked: true }).liked).toBe(true);
    expect(winLikeSchema.parse({ winId, liked: false }).liked).toBe(false);
  });
  it("requires a nonblank comment", () => {
    expect(winCommentSchema.safeParse({ winId, body: "   " }).success).toBe(false);
    expect(winCommentSchema.parse({ winId, body: " Great work! " }).body).toBe("Great work!");
  });
  it("limits comments to 500 characters", () => {
    expect(winCommentSchema.safeParse({ winId, body: "a".repeat(500) }).success).toBe(true);
    expect(winCommentSchema.safeParse({ winId, body: "a".repeat(501) }).success).toBe(false);
  });
});