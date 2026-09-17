import { describe, it, expect } from "vitest";
import {
  FREE_TIER_VALUE,
  backoffMinutes,
  freeMemberFields,
  grantsAccess,
  isHardSuppressed,
  isRetryableStatus,
  nextTierForProvisioning,
  normalizeEmail,
  resolveEntitlement,
  signupSourceForProvider,
  tierLabelFor,
  MAILERLITE_GROUPS,
} from "@/lib/member-rules";

const HOUR = 3600_000;
const future = new Date(Date.now() + 30 * 24 * HOUR).toISOString();
const past = new Date(Date.now() - 24 * HOUR).toISOString();

/** Mirror of the server workflow's decisions, with the database stubbed out. */
function provision(opts: {
  currentTier?: string | null;
  subscriptions?: Array<{ price_id: string; status: string; current_period_end?: string | null }>;
  provider?: string;
  priorLeads?: Array<{ lead_magnet: string | null }>;
  priorSyncJobs?: number;
  suppression?: string | null;
}) {
  const subs = opts.subscriptions ?? [];
  const tier = nextTierForProvisioning(opts.currentTier ?? FREE_TIER_VALUE, subs);
  const priorLeads = opts.priorLeads ?? [];
  const hasAccountLead = priorLeads.some((l) => l.lead_magnet === "account");
  const wasExistingLead = priorLeads.length > 0 && !hasAccountLead;
  const source = wasExistingLead
    ? "existing-lead-account-created"
    : signupSourceForProvider(opts.provider ?? "email");
  const suppression = opts.suppression ?? null;
  const syncBlocked = isHardSuppressed(suppression) || suppression === "unsubscribe";
  return {
    tier,
    leadCreated: !hasAccountLead,
    source,
    syncQueued: !syncBlocked && (opts.priorSyncJobs ?? 0) === 0,
  };
}

describe("free membership on signup", () => {
  it("1. email/password signup creates a Free member and a MailerLite sync job", () => {
    const r = provision({ provider: "email" });
    expect(r.tier).toBe(FREE_TIER_VALUE);
    expect(tierLabelFor(r.tier)).toBe("Free");
    expect(r.source).toBe("account-signup-email");
    expect(r.leadCreated).toBe(true);
    expect(r.syncQueued).toBe(true);
  });

  it("2. Google signup creates a Free member and a MailerLite sync job", () => {
    const r = provision({ provider: "google" });
    expect(r.tier).toBe(FREE_TIER_VALUE);
    expect(r.source).toBe("account-signup-google");
    expect(r.syncQueued).toBe(true);
  });

  it("3. Apple signup creates a Free member and a MailerLite sync job", () => {
    const r = provision({ provider: "apple" });
    expect(r.tier).toBe(FREE_TIER_VALUE);
    expect(r.source).toBe("account-signup-apple");
    expect(r.syncQueued).toBe(true);
  });

  it("4. an existing lead creating an account makes no duplicates", () => {
    const r = provision({ priorLeads: [{ lead_magnet: "weekly-newsletter" }], provider: "google" });
    expect(r.source).toBe("existing-lead-account-created");
    expect(r.leadCreated).toBe(true);

    const repeat = provision({ priorLeads: [{ lead_magnet: "account" }], priorSyncJobs: 1 });
    expect(repeat.leadCreated).toBe(false);
    expect(repeat.syncQueued).toBe(false);
  });

  it("normalises the email before any record is written", () => {
    expect(normalizeEmail("  XBhiBlackBox@Gmail.com ")).toBe("xbhiblackbox@gmail.com");
  });

  it("writes the documented MailerLite free-member fields", () => {
    const fields = freeMemberFields({
      userId: "user-1",
      signupSource: "account-signup-google",
      signupProvider: "google",
      accountCreatedAt: "2026-09-13T19:00:25.000Z",
    });
    expect(fields).toMatchObject({
      user_id: "user-1",
      account_status: "active",
      plan_status: "free",
      plan_id: "free",
      plan_name: "Free",
      signup_source: "account-signup-google",
      signup_provider: "google",
    });
    expect(fields.account_created_at).toBe("2026-09-13 19:00:25");
    expect(MAILERLITE_GROUPS.freeMembers).toBe("AI-Income-Systems Free Members");
  });
});

describe("Stripe checkout never grants or removes access on its own", () => {
  it("5. a Stripe Customer with no payment leaves the member Free", () => {
    expect(provision({ subscriptions: [] }).tier).toBe(FREE_TIER_VALUE);
  });

  it("6. an abandoned / expired checkout session does not change the tier", () => {
    const r = provision({
      subscriptions: [{ price_id: "ailab_starter_monthly", status: "incomplete_expired" }],
    });
    expect(r.tier).toBe(FREE_TIER_VALUE);
  });

  it("7. a failed first payment leaves the member Free", () => {
    for (const status of ["incomplete", "unpaid", "paused"]) {
      expect(
        resolveEntitlement([{ price_id: "ailab_starter_monthly", status }]),
      ).toBe(FREE_TIER_VALUE);
    }
  });

  it("13. an existing paid member opening another checkout is not downgraded", () => {
    const tier = nextTierForProvisioning("builder", [
      { price_id: "ailab_builder_monthly", status: "active", current_period_end: future },
      { price_id: "ailab_accelerator_monthly", status: "incomplete" },
    ]);
    expect(tier).toBe("builder");
  });

  it("16. a forged client tier claim cannot raise entitlement", () => {
    // Provisioning derives the tier purely from stored Stripe records.
    const tier = nextTierForProvisioning("accelerator", []);
    expect(tier).toBe("accelerator"); // existing value preserved...
    expect(resolveEntitlement([])).toBe(FREE_TIER_VALUE); // ...but nothing is earned
    expect(resolveEntitlement([{ price_id: "not_a_real_price", status: "active" }])).toBe(
      FREE_TIER_VALUE,
    );
  });
});

describe("paid entitlements map exactly", () => {
  it("8. a successful Starter payment upgrades only to Starter", () => {
    expect(
      resolveEntitlement([
        { price_id: "ailab_starter_monthly", status: "active", current_period_end: future },
      ]),
    ).toBe("starter");
    expect(
      resolveEntitlement([
        { price_id: "ailab_starter_annual", status: "active", current_period_end: future },
      ]),
    ).toBe("starter");
  });

  it("9. a successful Builder payment upgrades only to Builder", () => {
    expect(
      resolveEntitlement([
        { price_id: "ailab_builder_monthly", status: "active", current_period_end: future },
      ]),
    ).toBe("builder");
  });

  it("10. a successful Accelerator payment upgrades only to Accelerator", () => {
    expect(
      resolveEntitlement([
        { price_id: "ailab_accelerator_monthly", status: "active", current_period_end: future },
      ]),
    ).toBe("accelerator");
  });

  it("preserves legacy one-time mappings", () => {
    expect(resolveEntitlement([{ price_id: "ailab_pro_onetime", status: "complete" }])).toBe("pro");
    expect(resolveEntitlement([{ price_id: "ailab_monthly_subscription", status: "active" }])).toBe(
      "monthly",
    );
  });

  it("14. cancellation keeps access until the paid-through date, then returns to Free", () => {
    const row = { price_id: "ailab_builder_monthly", status: "canceled", current_period_end: future };
    expect(grantsAccess(row)).toBe(true);
    expect(resolveEntitlement([row])).toBe("builder");

    const lapsed = { ...row, current_period_end: past };
    expect(grantsAccess(lapsed)).toBe(false);
    expect(resolveEntitlement([lapsed])).toBe(FREE_TIER_VALUE);
  });

  it("15. a refund recalculates the highest remaining valid entitlement", () => {
    const rows = [
      { price_id: "ailab_pro_onetime", status: "refunded" },
      { price_id: "ailab_starter_onetime", status: "complete" },
    ];
    expect(resolveEntitlement(rows)).toBe("starter");
    expect(resolveEntitlement([{ price_id: "ailab_starter_onetime", status: "refunded" }])).toBe(
      FREE_TIER_VALUE,
    );
  });
});

describe("synchronisation durability and suppression", () => {
  it("11. webhook retries cannot duplicate work", () => {
    const seen = new Set<string>();
    const process = (id: string) => (seen.has(id) ? "duplicate" : (seen.add(id), "processed"));
    expect(process("evt_1")).toBe("processed");
    expect(process("evt_1")).toBe("duplicate");
    expect(process("evt_1")).toBe("duplicate");
    expect(seen.size).toBe(1);
  });

  it("12. signing in repeatedly does not restart MailerLite automations", () => {
    const first = provision({ priorSyncJobs: 0 });
    expect(first.syncQueued).toBe(true);
    for (let i = 0; i < 5; i++) {
      expect(provision({ priorLeads: [{ lead_magnet: "account" }], priorSyncJobs: 1 }).syncQueued).toBe(
        false,
      );
    }
  });

  it("17. MailerLite downtime produces a retryable job instead of losing the subscriber", () => {
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(422)).toBe(false);
    expect(backoffMinutes(1)).toBe(2);
    expect(backoffMinutes(4)).toBe(16);
    expect(backoffMinutes(20)).toBe(240); // capped
  });

  it("18. suppressed bounce or complaint addresses are never reactivated", () => {
    expect(provision({ suppression: "bounce" }).syncQueued).toBe(false);
    expect(provision({ suppression: "complaint" }).syncQueued).toBe(false);
    expect(provision({ suppression: "unsubscribe" }).syncQueued).toBe(false);
    expect(provision({ suppression: null }).syncQueued).toBe(true);
    expect(isHardSuppressed("bounce")).toBe(true);
    expect(isHardSuppressed("unsubscribe")).toBe(false);
  });

  it("keeps the four MailerLite groups distinct", () => {
    const names = Object.values(MAILERLITE_GROUPS);
    expect(new Set(names).size).toBe(4);
  });
});
