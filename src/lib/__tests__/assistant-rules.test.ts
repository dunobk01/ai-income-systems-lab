import { describe, expect, it } from "vitest";
import { ASSISTANT_DAILY_LIMIT, canUseAssistant, remainingMessages } from "@/lib/assistant-rules";

describe("AI Assistant rules", () => {
  it("allows 30 messages per day", () => {
    expect(ASSISTANT_DAILY_LIMIT).toBe(30);
    expect(remainingMessages(29)).toBe(1);
    expect(remainingMessages(30)).toBe(0);
  });

  it("is available on every paid plan", () => {
    expect(canUseAssistant("starter")).toBe(true);
    expect(canUseAssistant("builder")).toBe(true);
    expect(canUseAssistant("accelerator")).toBe(true);
  });

  it("is not available to Free members unless admin", () => {
    expect(canUseAssistant("none")).toBe(false);
    expect(canUseAssistant("free")).toBe(false);
    expect(canUseAssistant(null)).toBe(false);
    expect(canUseAssistant("none", true)).toBe(true);
  });
});
