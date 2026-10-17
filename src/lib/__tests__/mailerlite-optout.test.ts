import { afterEach, describe, expect, it, vi } from "vitest";
import { mailerliteTrackUpgrade } from "../mailerlite.server";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("MailerLite upgrade opt-out preservation", () => {
  it("does not reactivate an unsubscribed subscriber or enroll them in a campaign", async () => {
    vi.stubEnv("MAILERLITE_API_KEY", "mock-credential");
    const fetcher = vi.fn()
      .mockResolvedValueOnce(Response.json({ data: [{ id: "group", name: "AI-Income-Systems Customers" }] }))
      .mockResolvedValueOnce(Response.json({ data: { id: "subscriber", status: "unsubscribed" } }));
    vi.stubGlobal("fetch", fetcher);
    await mailerliteTrackUpgrade({ email: "recipient@example.com", planId: "builder", planLabel: "Builder", amountCents: 2999, currency: "usd" });
    const payload = JSON.parse(fetcher.mock.calls[1][1].body);
    expect(payload.status).toBeUndefined();
    expect(payload.groups).toBeUndefined();
    expect(payload.fields.plan_id).toBe("builder");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("adds an active subscriber to Customers without replacing existing groups", async () => {
    vi.stubEnv("MAILERLITE_API_KEY", "mock-credential");
    const fetcher = vi.fn()
      .mockResolvedValueOnce(Response.json({ data: [{ id: "group", name: "AI-Income-Systems Customers" }] }))
      .mockResolvedValueOnce(Response.json({ data: { id: "subscriber", status: "active" } }))
      .mockResolvedValueOnce(Response.json({ data: {} }));
    vi.stubGlobal("fetch", fetcher);
    await mailerliteTrackUpgrade({ email: "recipient@example.com", planId: "builder", planLabel: "Builder", amountCents: 2999, currency: "usd" });
    expect(fetcher.mock.calls[2][0]).toBe("https://connect.mailerlite.com/api/subscribers/subscriber/groups/group");
    expect(JSON.parse(fetcher.mock.calls[1][1].body).groups).toBeUndefined();
  });
});