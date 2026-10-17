import { describe, expect, it } from "vitest";
import { buildSubscriberOverview, nextChargeDate, type SubscriberAccount, type BillingCharge, type BillingRenewal } from "../admin-subscriber-data";
const account: SubscriberAccount = { id: "owner", email: "member@example.com", display_name: "Member", tier: "builder", is_admin: false, provider: "email", created_at: "2026-09-20", last_sign_in_at: null };
const charge: BillingCharge = { id: "payment", userId: "owner", email: null, amount: 2999, refunded: 0, currency: "usd", paid: true, status: "succeeded", created_at: "2026-09-20" };
const renewal: BillingRenewal = { userId: "owner", email: null, status: "active", cancelAtPeriodEnd: false, periodEnd: "2026-10-20", priceId: "ailab_builder_monthly", amount: 2999, currency: "usd" };
describe("Admin subscriber overview", () => {
  it("includes lead-magnet email signups as Free without creating login accounts", () => {
    const [row] = buildSubscriberOverview([], [{ email: "free@example.com", created_at: "2026-09-01", lead_magnet: "ai-business-engine" }], { charges: [], renewals: [] });
    expect(row.tier).toBe("none"); expect(row.account_id).toBeNull(); expect(row.totals).toEqual([]);
  });
  it("deduplicates normalized opt-in emails while preserving paid tier and earliest signup", () => {
    const rows = buildSubscriberOverview([account], [{ email: " MEMBER@example.com ", created_at: "2026-09-01" }, { email: "member@example.com", created_at: "2026-09-22" }], { charges: [], renewals: [] });
    expect(rows).toHaveLength(1); expect(rows[0].tier).toBe("builder"); expect(rows[0].created_at).toBe("2026-09-01");
  });
  it("sums actual successful charges and refunds rather than subscription price", () => {
    const [row] = buildSubscriberOverview([account], [], { charges: [charge, { ...charge, id: "second", amount: 26400, refunded: 26400 }, { ...charge, id: "failed", paid: false, status: "failed" }], renewals: [renewal] });
    expect(row.totals).toEqual([{ currency: "usd", charged: 29399, refunded: 26400, net: 2999 }]);
  });
  it("keeps currencies separate", () => {
    const [row] = buildSubscriberOverview([account], [], { charges: [charge, { ...charge, id: "eur", currency: "eur", amount: 1000 }], renewals: [] });
    expect(row.totals).toHaveLength(2); expect(row.totals?.[1].charged).toBe(1000);
  });
  it("does not display unavailable billing as zero paid", () => { expect(buildSubscriberOverview([account], [], null)[0].totals).toBeNull(); });
  it("shows next renewal for active subscriptions", () => { expect(nextChargeDate(renewal)).toBe("2026-10-20"); });
  it("never promises a next charge after scheduled cancellation", () => { expect(nextChargeDate({ ...renewal, cancelAtPeriodEnd: true })).toBeNull(); });
  it("does not present canceled or past-due subscriptions as scheduled renewals", () => {
    expect(nextChargeDate({ ...renewal, status: "canceled" })).toBeNull(); expect(nextChargeDate({ ...renewal, status: "past_due" })).toBeNull();
  });
});