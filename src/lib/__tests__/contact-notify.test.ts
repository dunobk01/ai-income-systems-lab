import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyOwner, notifyVisitor, threadUrl } from "../contact-notify";
import { TEMPLATES } from "../email-templates/registry";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("contact form confirmation email", () => {
  it("sends the confirmation to the visitor's own address, keyed to that submission", async () => {
    const token = "a".repeat(48);
    const send = vi.fn(async () => ({ sent: true }));
    await notifyVisitor(
      { name: "Jane", subject: "Question about Builder", threadUrl: threadUrl(token) },
      "jane@example.com",
      "contact-confirm-123",
      send,
    );
    expect(send).toHaveBeenCalledWith("contact-confirmation", "jane@example.com", {
      templateData: {
        name: "Jane",
        subject: "Question about Builder",
        threadUrl: `https://ai-income-systems.com/contact/r/${token}`,
      },
      idempotencyKey: "contact-confirm-123",
    });
  });

  it("does not fail the submission when the confirmation send fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const send = vi.fn(async () => {
      throw new Error("provider offline");
    });
    await expect(
      notifyVisitor({ name: "Jane", subject: "Hi there" }, "jane@example.com", "contact-confirm-123", send),
    ).resolves.toBeUndefined();
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("keeps the owner heads-up on its own fixed-recipient template", async () => {
    const send = vi.fn(async () => ({ sent: true }));
    await notifyOwner(
      { name: "Jane", email: "jane@example.com", subject: "Hi there", message: "Question" },
      "contact-new-123",
      send,
    );
    expect(send.mock.calls[0][0]).toBe("contact-new-message");
    expect(send.mock.calls[0][1]).toBe("");
    expect(send.mock.calls[0][2].idempotencyKey).toBe("contact-new-123");
  });

  it("registers the confirmation template so the send can resolve it", () => {
    expect(TEMPLATES["contact-confirmation"]).toBeTruthy();
    const subject = TEMPLATES["contact-confirmation"].subject;
    expect(typeof subject === "function" ? subject({ subject: "Builder" }) : subject).toContain("Builder");
  });
});
