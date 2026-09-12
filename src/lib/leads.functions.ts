import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * MailerLite audiences.
 *
 * - `leads` — general newsletter / content opt-ins.
 * - `free`  — people who claimed the free lead magnet and are being nurtured
 *             toward creating a permanent Free account.
 * - `os`    — people who requested the AI Income Operating System guide.
 */
export const AUDIENCE_GROUPS = {
  leads: "AI-Income-Systems Leads 1",
  free: "AI-Income-Systems Free Members",
  os: "AI Income Operating System — 7-Day Nurture",
} as const;

export type Audience = keyof typeof AUDIENCE_GROUPS;

const schema = z.object({
  email: z.string().email().max(255),
  source: z.string().max(100).optional(),
  lead_magnet: z.string().max(100).optional(),
  audience: z.enum(["leads", "free", "os"]).optional(),
  // Honeypot — real users never fill this in.
  company: z.string().max(100).optional(),
});

const ML_BASE = "https://connect.mailerlite.com/api";

function mlHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

/** Find a MailerLite group by name, creating it if it doesn't exist yet. */
async function resolveGroupId(apiKey: string, name: string): Promise<string | undefined> {
  const headers = mlHeaders(apiKey);

  const res = await fetch(`${ML_BASE}/groups?limit=200`, { headers });
  if (res.ok) {
    const body = (await res.json()) as { data?: Array<{ id: string; name: string }> };
    const found = body.data?.find((g) => g.name === name);
    if (found) return found.id;
  }

  const created = await fetch(`${ML_BASE}/groups`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name }),
  });
  if (created.ok) {
    const body = (await created.json()) as { data?: { id: string } };
    return body.data?.id;
  }
  console.error("[mailerlite] group create failed", created.status, await created.text());
  return undefined;
}

async function syncToMailerLite(
  email: string,
  opts: { source?: string | null; leadMagnet?: string | null; audience: Audience },
) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) return;

  try {
    const groupId = await resolveGroupId(apiKey, AUDIENCE_GROUPS[opts.audience]);

    const subscriberRes = await fetch(`${ML_BASE}/subscribers`, {
      method: "POST",
      headers: mlHeaders(apiKey),
      body: JSON.stringify({
        email,
        fields: {
          lead_source: opts.source ?? undefined,
          lead_magnet: opts.leadMagnet ?? undefined,
          plan_status: opts.audience === "free" || opts.audience === "os" ? "free-lead" : undefined,
        },
        status: "active",
        groups: groupId ? [groupId] : undefined,
      }),
    });
    if (!subscriberRes.ok) {
      const body = await subscriberRes.text();
      console.error("[mailerlite] subscribe failed", subscriberRes.status, body);
    }
  } catch (err) {
    console.error("[mailerlite] subscribe error", err);
  }
}

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    // Silently accept-and-drop honeypot hits so bots don't learn anything.
    if (data.company && data.company.trim().length > 0) return { ok: true };

    const email = data.email.trim().toLowerCase();
    const audience: Audience = data.audience ?? "leads";

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("leads").insert({
      email,
      source: data.source ?? null,
      lead_magnet: data.lead_magnet ?? null,
    });
    // Ignore duplicate-key errors silently — treat as success.
    if (error && !/duplicate key/i.test(error.message)) {
      throw new Error(error.message);
    }
    // Fire MailerLite sync; don't block the user on failures.
    await syncToMailerLite(email, {
      source: data.source,
      leadMagnet: data.lead_magnet,
      audience,
    });
    if (audience === "os") {
      const { sendOsPdfEmail } = await import("@/lib/os-delivery.server");
      await sendOsPdfEmail(email);
    }
    return { ok: true };
  });

/* ------------------------------------------------------------------ *
 * Self-serve unsubscribe by email address.
 *
 * Works without a signed token so it can be used as the custom unsubscribe
 * page URL in MailerLite, and from account settings. Always returns a
 * generic success so the endpoint can't be used to enumerate subscribers.
 * ------------------------------------------------------------------ */

async function unsubscribeFromMailerLite(email: string) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) return;
  const headers = mlHeaders(apiKey);
  try {
    const res = await fetch(`${ML_BASE}/subscribers/${encodeURIComponent(email)}`, { headers });
    if (!res.ok) return; // not a subscriber — nothing to do
    const body = (await res.json()) as { data?: { id?: string } };
    const id = body.data?.id;
    if (!id) return;
    const upd = await fetch(`${ML_BASE}/subscribers/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status: "unsubscribed" }),
    });
    if (!upd.ok) console.error("[mailerlite] unsubscribe failed", upd.status, await upd.text());
  } catch (err) {
    console.error("[mailerlite] unsubscribe error", err);
  }
}

export const unsubscribeByEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ email: z.string().email().max(255), company: z.string().max(100).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    if (data.company && data.company.trim().length > 0) return { ok: true };
    const email = data.email.trim().toLowerCase();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("suppressed_emails").upsert(
      {
        email,
        reason: "unsubscribe",
        metadata: { via: "unsubscribe-page" },
      },
      { onConflict: "email" },
    );
    if (error) {
      console.error("[unsubscribe] suppression insert failed", error.message);
      throw new Error("Could not process unsubscribe");
    }

    await unsubscribeFromMailerLite(email);
    return { ok: true };
  });
