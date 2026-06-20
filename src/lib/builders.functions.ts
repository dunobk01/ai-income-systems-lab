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
  outline: z
    .array(z.object({ chapter: z.string(), summary: z.string() }))
    .min(4)
    .max(8),
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
  offer: z.string().min(2).max(2000),
  audience: z.string().min(2).max(1000),
  price: z.string().min(1).max(50),
  channel: z.string().min(2).max(500),
});

const funnelSchema = z.object({
  positioning_line: z.string(),
  ad_hooks: z.array(z.string()).min(5).max(8),
  lead_magnet: z.object({ name: z.string(), description: z.string(), format: z.string() }),
  landing_page: z.object({
    headline: z.string(),
    subhead: z.string(),
    sections: z.array(z.string()).min(5),
  }),
  email_sequence: z
    .array(
      z.object({
        day: z.number(),
        subject: z.string(),
        purpose: z.string(),
        body_outline: z.string(),
      }),
    )
    .min(5)
    .max(5),
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
  roles: z.array(
    z.object({
      name: z.string(),
      purpose: z.string(),
      responsibilities: z.array(z.string()),
    }),
  ),
  tools: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      when_to_use: z.string(),
      when_not_to_use: z.string(),
      input_schema: z.string(),
      output_shape: z.string(),
    }),
  ),
  memory: z.object({
    short_term: z.string(),
    working: z.string(),
    long_term: z.string(),
  }),
  skills: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      when_to_trigger: z.string(),
    }),
  ),
  system_prompt: z.string(),
  output_contract: z.string(),
  guardrails: z.array(z.string()),
  step_budget: z.number().int(),
  acceptance_tests: z.array(
    z.object({
      name: z.string(),
      input: z.string(),
      expected: z.string(),
      pass_criteria: z.string(),
    }),
  ),
  next_steps: z.array(z.string()),
});

type AgentSpec = z.infer<typeof agentSchema>;

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const stringifyValue = (value: unknown, fallback: string) => {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return fallback;
};

const stringList = (value: unknown, fallback: string[]): string[] => {
  if (Array.isArray(value)) {
    const items = value.map((item) => stringifyValue(item, "")).filter(Boolean);
    return items.length > 0 ? items : fallback;
  }
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return fallback;
};

function extractJsonObject(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < cleaned.length; i += 1) {
    const char = cleaned[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\" && inString) {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "{") {
      if (depth === 0) start = i;
      depth += 1;
    }
    if (char === "}") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        return JSON.parse(cleaned.slice(start, i + 1));
      }
    }
  }

  throw new Error(
    "The AI response was not valid JSON. Please try again with a shorter or clearer prompt.",
  );
}

function normalizeAgentSpec(raw: unknown, input: z.infer<typeof agentInput>): AgentSpec {
  const obj = asRecord(raw);
  const titleFallback = input.goal || "AI Workflow Agent";
  const rolesRaw = Array.isArray(obj.roles) ? obj.roles.map(asRecord) : [];
  const toolsRaw = Array.isArray(obj.tools) ? obj.tools.map(asRecord) : [];
  const skillsRaw = Array.isArray(obj.skills) ? obj.skills.map(asRecord) : [];
  const testsRaw = Array.isArray(obj.acceptance_tests) ? obj.acceptance_tests.map(asRecord) : [];
  const memory = asRecord(obj.memory);

  return agentSchema.parse({
    name: stringifyValue(obj.name, titleFallback).slice(0, 120),
    one_liner: stringifyValue(obj.one_liner, `An agent that ${input.goal || "turns the provided workflow into a reliable AI-assisted system"}.`),
    job_to_be_done: stringifyValue(obj.job_to_be_done, input.goal || input.prompt),
    target_user: stringifyValue(obj.target_user, "The operator or builder responsible for this workflow."),
    roles: rolesRaw.length > 0 ? rolesRaw.map((role, index) => ({
      name: stringifyValue(role.name, index === 0 ? "Primary Agent" : `Specialist ${index + 1}`),
      purpose: stringifyValue(role.purpose, "Own a specific part of the workflow."),
      responsibilities: stringList(role.responsibilities, ["Interpret the user's request", "Execute the assigned workflow step", "Return clear handoff notes"]),
    })) : [{
      name: "Primary Agent",
      purpose: "Own the workflow from intake through final output.",
      responsibilities: ["Clarify the requested outcome", "Use the available tools only when needed", "Return the final answer in the agreed format"],
    }],
    tools: toolsRaw.length > 0 ? toolsRaw.map((tool, index) => ({
      name: stringifyValue(tool.name, `tool_${index + 1}`).replace(/\s+/g, "_").toLowerCase(),
      description: stringifyValue(tool.description, "Supports the agent with a focused workflow capability."),
      when_to_use: stringifyValue(tool.when_to_use, "Use when the workflow requires this capability."),
      when_not_to_use: stringifyValue(tool.when_not_to_use, "Do not use when the answer can be completed directly."),
      input_schema: stringifyValue(tool.input_schema, "{ query: string }") ,
      output_shape: stringifyValue(tool.output_shape, "{ result: string, notes?: string }") ,
    })) : [{
      name: "research_context",
      description: "Collects the facts and context required to complete the workflow.",
      when_to_use: "Use before making recommendations or producing the final deliverable.",
      when_not_to_use: "Do not use when the user has already supplied enough verified context.",
      input_schema: "{ topic: string, constraints?: string[] }",
      output_shape: "{ findings: string[], gaps: string[] }",
    }],
    memory: {
      short_term: stringifyValue(memory.short_term, "Track the current request, constraints, and active tool results."),
      working: stringifyValue(memory.working, "Maintain the plan, intermediate decisions, and unresolved questions during the run."),
      long_term: stringifyValue(memory.long_term, "Store reusable preferences, source rules, and successful workflow patterns when persistence is available."),
    },
    skills: skillsRaw.length > 0 ? skillsRaw.map((skill, index) => ({
      name: stringifyValue(skill.name, index === 0 ? "Workflow Execution" : `Skill ${index + 1}`),
      description: stringifyValue(skill.description, "A reusable capability bundle for this agent."),
      when_to_trigger: stringifyValue(skill.when_to_trigger, "Trigger when the user request matches this capability."),
    })) : [{
      name: "Workflow Execution",
      description: "Turns an ambiguous request into a concrete plan, executes the steps, and packages the final deliverable.",
      when_to_trigger: "When the user asks the agent to complete the core job described in the prompt.",
    }],
    system_prompt: stringifyValue(obj.system_prompt, `You are ${titleFallback}. Your job is to ${input.goal || "complete the user's requested workflow"}. Clarify only when required, use tools deliberately, follow the output contract, and produce a specific final result.`),
    output_contract: stringifyValue(obj.output_contract, "Return: summary, completed work, assumptions, risks, and next action."),
    guardrails: stringList(obj.guardrails, ["Ask for clarification when required inputs are missing.", "Never invent verified facts or tool results.", "Keep outputs specific to the user's domain."]),
    step_budget: Number.isFinite(Number(obj.step_budget)) ? Math.max(3, Math.round(Number(obj.step_budget))) : 12,
    acceptance_tests: testsRaw.length > 0 ? testsRaw.map((test, index) => ({
      name: stringifyValue(test.name, `Acceptance test ${index + 1}`),
      input: stringifyValue(test.input, input.prompt),
      expected: stringifyValue(test.expected, "The agent completes the workflow and follows the output contract."),
      pass_criteria: stringifyValue(test.pass_criteria, "The result is accurate, specific, and usable without extra cleanup."),
    })) : [{
      name: "Happy path",
      input: input.prompt,
      expected: "The agent produces the requested deliverable in the correct format.",
      pass_criteria: "All required sections are present, specific, and actionable.",
    }],
    next_steps: stringList(obj.next_steps, ["Paste the system prompt into the target platform.", "Add the listed tools or integrations.", "Run the acceptance tests and refine failures."]),
  });
}


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

Be specific to the user's domain — never generic.

Return ONLY one valid JSON object. Do not wrap it in markdown. Do not add commentary.
Use exactly these top-level keys: name, one_liner, job_to_be_done, target_user, roles, tools, memory, skills, system_prompt, output_contract, guardrails, step_budget, acceptance_tests, next_steps.
Each role needs name, purpose, responsibilities. Each tool needs name, description, when_to_use, when_not_to_use, input_schema, output_shape. Each skill needs name, description, when_to_trigger. Memory needs short_term, working, long_term. Each acceptance test needs name, input, expected, pass_criteria.`;

    let output: AgentSpec;
    try {
      const result = await generateText({
        model,
        prompt,
        maxOutputTokens: 12000,
        maxRetries: 2,
      });
      output = normalizeAgentSpec(extractJsonObject(result.text), data);
    } catch (error) {
      console.error("Agent spec generation failed", error);
      throw new Error("The agent generator returned an incomplete response. Please try again with a slightly shorter prompt or more specific goal.");
    }


    const { supabase, userId } = context;
    const { data: saved, error: saveErr } = await supabase
      .from("agent_specs")
      .insert({
        user_id: userId,
        title: output.name,
        inputs: data,
        output,
      })
      .select("id")
      .single();
    if (saveErr) throw new Error(saveErr.message);

    return { ...output, id: saved.id as string };
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
    const patch: { title?: string; output?: unknown; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (data.title !== undefined) patch.title = data.title;
    if (data.output !== undefined) patch.output = data.output;
    const { error } = await supabase.from("agent_specs").update(patch as never).eq("id", data.id);
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
