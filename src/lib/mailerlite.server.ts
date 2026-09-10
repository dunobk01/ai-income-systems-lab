/**
 * Server-only MailerLite helpers for lifecycle events (upgrades, plan changes).
 *
 * Never import this from client code — it reads MAILERLITE_API_KEY.
 */

const ML_BASE = "https://connect.mailerlite.com/api";

const CUSTOMER_GROUP = "AI-Income-Systems Customers";

function headers(apiKey: string) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

async function resolveGroupId(apiKey: string, name: string): Promise<string | undefined> {
  const h = headers(apiKey);
  const res = await fetch(`${ML_BASE}/groups?limit=200`, { headers: h });
  if (res.ok) {
    const body = (await res.json()) as { data?: Array<{ id: string; name: string }> };
    const found = body.data?.find((g) => g.name === name);
    if (found) return found.id;
  }
  const created = await fetch(`${ML_BASE}/groups`, {
    method: "POST",
    headers: h,
    body: JSON.stringify({ name }),
  });
  if (created.ok) {
    const body = (await created.json()) as { data?: { id: string } };
    return body.data?.id;
  }
  return undefined;
}

/**
 * Record a paid upgrade against the subscriber so free -> paid conversion can
 * be reported on in MailerLite. Never throws: email tracking must not break a
 * payment webhook.
 */
export async function mailerliteTrackUpgrade(opts: {
  email: string;
  planId: string;
  planLabel: string;
  amountCents: number;
  currency: string;
}) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey || !opts.email) return;

  try {
    const groupId = await resolveGroupId(apiKey, CUSTOMER_GROUP);
    const res = await fetch(`${ML_BASE}/subscribers`, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify({
        email: opts.email.trim().toLowerCase(),
        status: "active",
        groups: groupId ? [groupId] : undefined,
        fields: {
          plan_status: "paid",
          plan_id: opts.planId,
          plan_name: opts.planLabel,
          upgraded_at: new Date().toISOString().slice(0, 19).replace("T", " "),
          last_payment_amount: (opts.amountCents / 100).toFixed(2),
          last_payment_currency: opts.currency.toUpperCase(),
        },
      }),
    });
    if (!res.ok) {
      console.error("[mailerlite] upgrade sync failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("[mailerlite] upgrade sync error", err);
  }
}
