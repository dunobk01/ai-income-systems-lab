import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const productInput = z.object({
  niche: z.string().min(2).max(200),
  audience: z.string().min(2).max(200),
  outcome: z.string().min(2).max(300),
  price: z.string().min(1).max(50),
  format: z.string().min(2).max(100),
});

const productSchema = z.object({
  title: z.string(),
  promise: z.string(),
  target_buyer: z.string(),
  top_pains: z.array(z.string()).min(3).max(5),
  deliverables: z.array(z.string()).min(3).max(8),
  outline: z.array(z.object({ chapter: z.string(), summary: z.string() })).min(4).max(8),
  positioning: z.string(),
  three_week_plan: z.array(z.string()).min(3).max(3),
  launch_hooks: z.array(z.string()).min(3).max(5),
});

export const generateProductPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productInput.parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured. Please contact support.");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `You are a senior digital product strategist. Build a shippable product brief.

Niche: ${data.niche}
Audience: ${data.audience}
Desired outcome for buyer: ${data.outcome}
Price target: ${data.price}
Format: ${data.format}

Return a tight, specific, opinionated plan. No fluff. Use the buyer's likely language.`;

    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({ schema: productSchema }),
      prompt,
    });

    // Persist
    const { supabase, userId } = context;
    await supabase.from("digital_product_plans").insert({
      user_id: userId,
      title: experimental_output.title,
      inputs: data,
      output: experimental_output,
    });

    return experimental_output;
  });

const funnelInput = z.object({
  offer: z.string().min(2).max(300),
  audience: z.string().min(2).max(200),
  price: z.string().min(1).max(50),
  channel: z.string().min(2).max(100),
});

const funnelSchema = z.object({
  positioning_line: z.string(),
  ad_hooks: z.array(z.string()).min(5).max(8),
  lead_magnet: z.object({ name: z.string(), description: z.string(), format: z.string() }),
  landing_page: z.object({ headline: z.string(), subhead: z.string(), sections: z.array(z.string()).min(5) }),
  email_sequence: z.array(z.object({ day: z.number(), subject: z.string(), purpose: z.string(), body_outline: z.string() })).min(5).max(5),
  sales_page_outline: z.array(z.string()).min(6),
  upsell: z.object({ name: z.string(), price: z.string(), pitch: z.string() }),
  kpis: z.array(z.string()).min(4).max(6),
});

export const generateFunnelPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => funnelInput.parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured. Please contact support.");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `You are a senior direct-response strategist. Design a complete sales funnel.

Offer: ${data.offer}
Audience: ${data.audience}
Price: ${data.price}
Primary acquisition channel: ${data.channel}

Be specific. Use real-sounding copy in the audience's voice, not generic marketing.`;

    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({ schema: funnelSchema }),
      prompt,
    });

    const { supabase, userId } = context;
    await supabase.from("funnel_plans").insert({
      user_id: userId,
      title: data.offer.slice(0, 80),
      inputs: data,
      output: experimental_output,
    });

    return experimental_output;
  });
