import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(255),
  source: z.string().max(100).optional(),
  lead_magnet: z.string().max(100).optional(),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("leads").insert({
      email: data.email.trim().toLowerCase(),
      source: data.source ?? null,
      lead_magnet: data.lead_magnet ?? null,
    });
    // Ignore duplicate-key errors silently — treat as success.
    if (error && !/duplicate key/i.test(error.message)) {
      throw new Error(error.message);
    }
    return { ok: true };
  });
