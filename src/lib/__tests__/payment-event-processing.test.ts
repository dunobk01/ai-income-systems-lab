import { describe, expect, it, vi } from "vitest";
import { assertPaymentWrite, processPaymentEvent } from "../payment-event-processing";

describe("durable payment event processing", () => {
  it("never dispatches when claiming fails", async () => {
    const dispatch = vi.fn();
    await expect(processPaymentEvent({ claim: async () => { throw new Error("offline"); }, dispatch, complete: vi.fn(), release: vi.fn() })).rejects.toThrow("offline");
    expect(dispatch).not.toHaveBeenCalled();
  });
  it("retries a failed purchase write and marks complete only after success", async () => {
    let state = "retryable";
    let fail = true;
    let purchases = 0;
    const operations = {
      claim: async () => { if (state === "complete") return state; state = "processing"; return "claimed"; },
      dispatch: async () => { assertPaymentWrite(fail ? { message: "offline" } : null); purchases++; },
      complete: async () => { state = "complete"; },
      release: async () => { state = "retryable"; },
    };
    await expect(processPaymentEvent(operations)).rejects.toThrow("offline");
    expect(state).toBe("retryable");
    expect(purchases).toBe(0);
    fail = false;
    await processPaymentEvent(operations);
    await processPaymentEvent(operations);
    expect(state).toBe("complete");
    expect(purchases).toBe(1);
  });
  it("does not acknowledge another delivery while processing is in flight", async () => {
    const dispatch = vi.fn();
    await expect(processPaymentEvent({ claim: async () => "busy", dispatch, complete: vi.fn(), release: vi.fn() })).rejects.toThrow("retry later");
    expect(dispatch).not.toHaveBeenCalled();
  });
});