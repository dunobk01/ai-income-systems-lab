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



const agentInput = z.object({
  prompt: z.string().min(10).max(4000),
  platform: z.enum(["chatgpt", "claude", "code"]).default("claude"),
  goal: z.string().min(2).max(300).optional(),
});

const agentSchema = z.object({
  name: z.string(),
  one_liner: z.string(),
  job_to_be_done: z.string(),
  target_user: z.string(),
  roles: z.array(z.object({
    name: z.string(),
    purpose: z.string(),
    responsibilities: z.array(z.string()).min(2).max(6),
  })).min(1).max(4),
  tools: z.array(z.object({
    name: z.string(),
    description: z.string(),
    when_to_use: z.string(),
    when_not_to_use: z.string(),
    input_schema: z.string(),
    output_shape: z.string(),
  })).min(2).max(8),
  memory: z.object({
    short_term: z.string(),
    working: z.string(),
    long_term: z.string(),
  }),
  skills: z.array(z.object({
    name: z.string(),
    description: z.string(),
    when_to_trigger: z.string(),
  })).min(1).max(5),
  system_prompt: z.string(),
  output_contract: z.string(),
  guardrails: z.array(z.string()).min(3).max(8),
  step_budget: z.number().int().min(3).max(40),
  acceptance_tests: z.array(z.object({
    name: z.string(),
    input: z.string(),
    expected: z.string(),
    pass_criteria: z.string(),
  })).min(5).max(10),
  next_steps: z.array(z.string()).min(3).max(6),
});

export const generateAgentSpec = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => agentInput.parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured. Please contact support.");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `You are a senior AI agent architect. A user has a rough prompt or idea. Turn it into a complete, shippable agent specification — the kind that can be handed to a developer or pasted into ChatGPT/Claude/an SDK and actually run.

Source prompt / idea from user:
"""
${data.prompt}
"""

Target platform: ${data.platform}
Stated goal (optional): ${data.goal ?? "(infer from prompt)"}

Produce an opinionated, specific spec. No fluff. Include:
- Clear roles (specialist sub-agents only if the job actually needs them; otherwise a single role is fine)
- 2–8 well-designed tools — each with crisp when-to-use and when-NOT-to-use, an input schema (TypeScript-style string), and a deterministic output shape
- Memory layers (state "none" for layers not needed)
- Skills (capability bundles the agent loads on demand) — at least one, with a description that doubles as the retrieval trigger
- A full, paste-ready system prompt that includes identity, operating procedure, tool policy, output contract, guardrails, and step budget
- An explicit output contract (the exact final-message shape)
- 3–8 guardrails, written as enforceable rules
- A sane step budget
- 5–10 acceptance tests covering happy path, edges, adversarial, and known-bad. Each test has input, expected behavior, and pass criteria.
- 3–6 concrete next steps to implement on the chosen platform.

Be specific to the user's domain — never generic.`;

    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({ schema: agentSchema }),
      prompt,
    });

    const { supabase, userId } = context;
    const { data: saved, error: saveErr } = await supabase
      .from("agent_specs")
      .insert({
        user_id: userId,
        title: experimental_output.name,
        inputs: data,
        output: experimental_output,
      })
      .select("id")
      .single();
    if (saveErr) throw new Error(saveErr.message);

    return { ...experimental_output, id: saved.id as string };
  });

export const listAgentSpecs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("agent_specs")
      .select("id,title,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data;
  });

export const getAgentSpec = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("agent_specs")
      .select("id,title,inputs,output,created_at,updated_at")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateAgentSpec = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(200).optional(),
      output: z.record(z.string(), z.unknown()).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined) patch.title = data.title;
    if (data.output !== undefined) patch.output = data.output;
    const { error } = await supabase.from("agent_specs").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAgentSpec = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("agent_specs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
