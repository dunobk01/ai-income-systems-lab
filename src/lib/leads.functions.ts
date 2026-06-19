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
  try {
    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        fields: {
          source: source ?? undefined,
          lead_magnet: leadMagnet ?? undefined,
        },
        status: "active",
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[mailerlite] subscribe failed", res.status, body);
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
