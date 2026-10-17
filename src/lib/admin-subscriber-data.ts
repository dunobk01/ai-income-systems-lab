export type SubscriberTier = "none" | "monthly" | "starter" | "builder" | "pro" | "accelerator";
export type SubscriberAccount = { id: string; email: string; display_name: string | null; tier: SubscriberTier; is_admin: boolean; provider: string; created_at: string; last_sign_in_at: string | null };
export type SubscriberLead = { email: string; created_at: string; source?: string | null; lead_magnet?: string | null; tool_slug?: string | null };
export type BillingCharge = { id: string; userId: string | null; email: string | null; amount: number; refunded: number; currency: string; paid: boolean; status: string; created_at: string };
export type BillingRenewal = { userId: string | null; email: string | null; status: string; cancelAtPeriodEnd: boolean; periodEnd: string | null; priceId: string | null; amount: number | null; currency: string };
export type Subscriber = SubscriberAccount & {
  account_id: string | null;
  sources: string[];
  payments: BillingCharge[];
  totals: { currency: string; charged: number; refunded: number; net: number }[] | null;
  renewals: BillingRenewal[];
  billing_status: string;
};

const normalize = (email: string) => email.trim().toLowerCase();

/** Email opt-ins are contacts, never invented login accounts or paid entitlements. */
export function buildSubscriberOverview(accounts: SubscriberAccount[], leads: SubscriberLead[], billing: {
  charges: BillingCharge[]; renewals: BillingRenewal[];
} | null): Subscriber[] {
  const map = new Map<string, Subscriber>();
  for (const account of accounts) {
    const email = normalize(account.email);
    if (!email) continue;
    map.set(email, { ...account, email, account_id: account.id, sources: [], payments: [], totals: billing ? [] : null, renewals: [], billing_status: "No subscription" });
  }
  for (const lead of leads) {
    const email = normalize(lead.email);
    if (!email) continue;
    const member = map.get(email) ?? {
      id: `lead:${email}`, account_id: null, email, display_name: null, tier: "none", is_admin: false,
      provider: "Email signup", created_at: lead.created_at, last_sign_in_at: null,
      sources: [], payments: [], totals: billing ? [] : null, renewals: [], billing_status: "No subscription",
    } satisfies Subscriber;
    if (lead.created_at < member.created_at) member.created_at = lead.created_at;
    const source = lead.lead_magnet || lead.tool_slug || lead.source;
    if (source && !member.sources.includes(source)) member.sources.push(source);
    map.set(email, member);
  }
  for (const member of map.values()) {
    if (!billing) { member.billing_status = "Billing unavailable"; continue; }
    const matches = (entry: { userId: string | null; email: string | null }) =>
      entry.userId ? entry.userId === member.account_id : !!entry.email && normalize(entry.email) === member.email;
    member.payments = billing.charges.filter(matches);
    const totals = new Map<string, { currency: string; charged: number; refunded: number; net: number }>();
    for (const payment of member.payments) {
      if (!payment.paid || payment.status !== "succeeded") continue;
      const total = totals.get(payment.currency) ?? { currency: payment.currency, charged: 0, refunded: 0, net: 0 };
      total.charged += payment.amount;
      total.refunded += payment.refunded;
      total.net = total.charged - total.refunded;
      totals.set(payment.currency, total);
    }
    member.totals = [...totals.values()];
    member.renewals = billing.renewals.filter(matches);
    member.billing_status = member.renewals.map(r => r.cancelAtPeriodEnd ? `${r.status} · cancellation scheduled` : r.status).join(", ") || "No subscription";
  }
  return [...map.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function nextChargeDate(renewal: BillingRenewal): string | null {
  return !renewal.cancelAtPeriodEnd && ["active", "trialing"].includes(renewal.status) ? renewal.periodEnd : null;
}

export function formatBillingMoney(amount: number, currency: string): string {
  const zero = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);
  const three = new Set(["bhd", "jod", "kwd", "omr", "tnd"]);
  const code = currency.toLowerCase();
  return new Intl.NumberFormat("en-US", { style: "currency", currency: code.toUpperCase() }).format(amount / (zero.has(code) ? 1 : three.has(code) ? 1000 : 100));
}