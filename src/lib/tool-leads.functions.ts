import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Shared backend for the public Free Tools.
 *
 * - `submitToolLead` stores the lead in `tool_leads` and mirrors it to an
 *   optional outbound webhook (`LEAD_WEBHOOK_URL`), failing silently if unset.
 * - `generateScorecardReport` produces the email-gated report through Lovable
 *   AI, rate limited to 5 generations per IP per hour.
 */

const utmSchema = {
  utm_source: z.string().max(120).optional(),
  utm_medium: z.string().max(120).optional(),
  utm_campaign: z.string().max(120).optional(),
};

const leadSchema = z.object({
  email: z.string().email().max(255),
  first_name: z.string().max(80).optional(),
  tool_slug: z.string().max(80),
  business_type: z.string().max(80).optional(),
  answers: z.record(z.string(), z.unknown()).default({}),
  score: z.number().int().min(0).max(100).nullable().optional(),
  result_summary: z.string().max(4000).optional(),
  ...utmSchema,
  // Honeypot
  company: z.string().max(100).optional(),
});

async function postWebhook(payload: Record<string, unknown>) {
  const url = process.env["LEAD_WEBHOOK_URL"];
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[tool-leads] webhook post failed", err);
  }
}

export const submitToolLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => leadSchema.parse(d))
  .handler(async ({ data }) => {
    if (data.company && data.company.trim().length > 0) return { ok: true };

    const email = data.email.trim().toLowerCase();
    const row = {
      email,
      first_name: data.first_name?.trim() || null,
      tool_slug: data.tool_slug,
      business_type: data.business_type ?? null,
      answers: (data.answers ?? {}) as Record<string, string>,
      score: data.score ?? null,
      result_summary: data.result_summary ?? null,
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
    };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("tool_leads").insert(row);
    if (error) {
      console.error("[tool-leads] insert failed", error.message);
      throw new Error("Couldn't save your details. Try again.");
    }

    await postWebhook(row);
    return { ok: true };
  });

/* ----------------------------- AI report ----------------------------- */

const RATE_LIMIT = 5;

async function clientIpHash() {
  let ip = "unknown";
  try {
    const req = getRequest();
    const h = req.headers;
    ip =
      h.get("cf-connecting-ip") ??
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      "unknown";
  } catch {
    // no request context
  }
  const bytes = new TextEncoder().encode(`tool-ai:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const reportSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  automations: z
    .array(
      z.object({
        rank: z.number(),
        title: z.string(),
        impact: z.string(),
        effort: z.string(),
        why: z.string(),
        tools: z.array(z.string()),
      }),
    )
    .min(3)
    .max(3),
  plan: z
    .array(z.object({ window: z.string(), focus: z.string(), actions: z.array(z.string()) }))
    .min(3)
    .max(4),
  prompts: z.array(z.object({ title: z.string(), prompt: z.string() })).min(3).max(3),
});

export type ScorecardReport = z.infer<typeof reportSchema>;

const reportInput = z.object({
  business_type: z.string().max(80),
  team_size: z.string().max(40),
  score: z.number().int().min(0).max(100),
  tier_label: z.string().max(120),
  answers: z.record(z.string(), z.string()),
  answer_summary: z.array(z.string()).max(20),
});

export const generateScorecardReport = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => reportInput.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured right now. Your report is on its way by email instead.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ipHash = await clientIpHash();
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("tool_ai_usage")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);

    if ((count ?? 0) >= RATE_LIMIT) {
      throw new Error(
        "You've generated 5 reports in the last hour — that's our cap so the free tools stay free. Try again in an hour; your emailed copy is already saved.",
      );
    }
    await supabaseAdmin.from("tool_ai_usage").insert({ ip_hash: ipHash, tool_slug: "ai-readiness-scorecard" });

    const { streamText, Output } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");

    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    const prompt = [
      `Business type: ${data.business_type}`,
      `Team size: ${data.team_size}`,
      `AI readiness score: ${data.score}/100 (${data.tier_label})`,
      "Their answers:",
      ...data.answer_summary.map((a) => `- ${a}`),
    ].join("\n");

    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      system: [
        "You advise small business owners on practical AI automation.",
        "Tone: plain English, specific, honest, lightly witty. Builder, not guru.",
        "Never promise income, revenue, or growth figures. Never use hype.",
        "Talk about hours saved, fewer dropped balls, and faster replies instead.",
        "Recommend only from: ChatGPT, Claude, Perplexity, Lovable, n8n, and Botpress (chatbots only).",
        "Effort must be one of: low, medium, high. Impact must be one of: low, medium, high.",
        "The 30-day plan uses week-sized windows (e.g. 'Days 1-7').",
        "Prompts must be copy-paste ready and tailored to the business type.",
      ].join(" "),
      prompt,
      output: Output.object({ schema: reportSchema }),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    return (await result.output) as ScorecardReport;
  });

/* ------------------------ Savings blueprint ------------------------ */

const blueprintSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  workflows: z
    .array(
      z.object({
        rank: z.number(),
        task: z.string(),
        title: z.string(),
        why: z.string(),
        trigger: z.string(),
        steps: z.array(z.string()),
        output: z.string(),
        tools: z.array(z.string()),
      }),
    )
    .min(3)
    .max(3),
  caveats: z.array(z.string()).min(2).max(4),
});

export type SavingsBlueprint = z.infer<typeof blueprintSchema>;

const blueprintInput = z.object({
  hourly_rate: z.number().min(1).max(10000),
  hours_week_saved: z.number().min(0).max(400),
  money_month_saved: z.number().min(0),
  top_tasks: z
    .array(z.object({ label: z.string().max(120), hours: z.number(), saved_hours: z.number() }))
    .max(12),
});

/**
 * Shared IP rate-limit guard for the free tools' AI generations.
 *
 * `scopeToTool` counts only this tool's runs (used by the visibility check,
 * which is more expensive per run and therefore capped tighter).
 */
async function assertRateLimit(
  toolSlug: string,
  opts: { limit?: number; scopeToTool?: boolean; message?: string } = {},
) {
  const limit = opts.limit ?? RATE_LIMIT;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ipHash = await clientIpHash();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  let query = supabaseAdmin
    .from("tool_ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (opts.scopeToTool) query = query.eq("tool_slug", toolSlug);
  const { count } = await query;
  if ((count ?? 0) >= limit) {
    throw new Error(
      opts.message ??
        "You've generated 5 reports in the last hour — that's our cap so the free tools stay free. Try again in an hour; your emailed copy is already saved.",
    );
  }
  await supabaseAdmin.from("tool_ai_usage").insert({ ip_hash: ipHash, tool_slug: toolSlug });
}

export const generateSavingsBlueprint = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => blueprintInput.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured right now. Try again shortly.");

    await assertRateLimit("ai-savings-calculator");

    const { streamText, Output } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");

    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    const prompt = [
      `The owner values their time at $${data.hourly_rate}/hour.`,
      `Estimated savings if automated: ${data.hours_week_saved.toFixed(1)} hours/week (about $${Math.round(data.money_month_saved)}/month).`,
      "Hours per week they currently spend, and the estimated hours automation could remove:",
      ...data.top_tasks.map(
        (t) => `- ${t.label}: ${t.hours}h/week now, ~${t.saved_hours.toFixed(1)}h/week potentially saved`,
      ),
    ].join("\n");

    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      system: [
        "You design practical n8n automations for small business owners.",
        "Pick the three tasks with the best saved-hours-to-effort ratio and design one concrete n8n workflow for each.",
        "Each workflow: a real n8n trigger (Webhook, Gmail Trigger, Schedule Trigger, Form Trigger, etc.),",
        "4-7 ordered node-level steps naming real nodes or services, and a single clear output.",
        "Recommend only from: n8n, ChatGPT, Claude, Perplexity, Lovable, Botpress (chatbots only), plus common apps they already use (Gmail, Sheets, Stripe, Calendly).",
        "Tone: plain English, specific, honest, lightly witty. Builder, not guru.",
        "Never promise income or revenue. Speak in hours saved and fewer dropped balls.",
        "Caveats must be honest about setup time, review steps, and what stays manual.",
      ].join(" "),
      prompt,
      output: Output.object({ schema: blueprintSchema }),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    return (await result.output) as SavingsBlueprint;
  });
