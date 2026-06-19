import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(255),
  source: z.string().max(100).optional(),
  lead_magnet: z.string().max(100).optional(),
});

async function syncToMailerLite(email: string, source?: string | null, leadMagnet?: string | null) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) return;

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  try {
    // Find the group ID for "AI-Income-Systems Leads 1"
    const groupsRes = await fetch("https://connect.mailerlite.com/api/groups", { headers });
    let groupId: string | undefined;
    if (groupsRes.ok) {
      const groupsData = (await groupsRes.json()) as { data?: Array<{ id: string; name: string }> };
      const group = groupsData.data?.find((g) => g.name === "AI-Income-Systems Leads 1");
      if (group) groupId = group.id;
    }

    // Create/update subscriber
    const subscriberRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
        fields: {
          lead_source: source ?? undefined,
          lead_magnet: leadMagnet ?? undefined,
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
    const email = data.email.trim().toLowerCase();
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
    await syncToMailerLite(email, data.source, data.lead_magnet);
    return { ok: true };
  });
