import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

/* --------------------------- MailerLite --------------------------- */

const SITE_URL = "https://ai-income-systems.com";
const MAILERLITE_GROUP_ID = "199195355015808121"; // "Free Tools Leads"

const TOOL_NAMES: Record<string, string> = {
  "ai-readiness-scorecard": "AI Readiness Scorecard",
  "ai-savings-calculator": "AI Time & Money Savings Calculator",
  "ai-visibility-check": "AI Search Visibility Check",
};

export const reportUrlFor = (token: string) => `${SITE_URL}/free-tools/r/${token}`;

/** 24-char unguessable, URL-safe token. */
function makeReportToken() {
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

type MlLead = {
  email: string;
  first_name: string | null;
  tool_slug: string;
  business_type: string | null;
  score: number | null;
  report_token: string | null;
  utm_source: string | null;
};

/**
 * Upsert the lead into MailerLite. Never throws — a mail failure must not stop
 * someone seeing their report. Returns the error text when it didn't land.
 */
async function syncLeadToMailerLite(lead: MlLead): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env["MAILERLITE_API_KEY"];
  if (!apiKey) return { ok: false, error: "MAILERLITE_API_KEY is not set" };

  const fields: Record<string, string | number> = {
    name: lead.first_name ?? "",
    tool_used: TOOL_NAMES[lead.tool_slug] ?? lead.tool_slug,
    business_type: lead.business_type ?? "",
    report_url: lead.report_token ? reportUrlFor(lead.report_token) : "",
    lead_source: lead.utm_source || "direct",
    lead_magnet: lead.tool_slug,
  };
  if (typeof lead.score === "number") fields["ai_score"] = lead.score;

  try {
    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email: lead.email, fields, groups: [MAILERLITE_GROUP_ID] }),
    });
    if (res.status === 200 || res.status === 201) return { ok: true };
    const body = (await res.text()).slice(0, 500);
    console.error("[tool-leads] mailerlite sync failed", res.status, body);
    return { ok: false, error: `${res.status}: ${body}` };
  } catch (err) {
    console.error("[tool-leads] mailerlite sync error", err);
    return { ok: false, error: (err as Error).message.slice(0, 500) };
  }
}

export const submitToolLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => leadSchema.parse(d))
  .handler(async ({ data }) => {
    if (data.company && data.company.trim().length > 0) return { ok: true, report_token: null };

    const email = data.email.trim().toLowerCase();
    const reportToken = makeReportToken();
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
      report_token: reportToken,
    };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inserted, error } = await supabaseAdmin
      .from("tool_leads")
      .insert(row)
      .select("id")
      .single();
    if (error) {
      console.error("[tool-leads] insert failed", error.message);
      throw new Error("Couldn't save your details. Try again.");
    }

    await postWebhook({ ...row, report_url: reportUrlFor(reportToken) });

    const sync = await syncLeadToMailerLite({
      email,
      first_name: row.first_name,
      tool_slug: row.tool_slug,
      business_type: row.business_type,
      score: row.score,
      report_token: reportToken,
      utm_source: row.utm_source,
    });
    await supabaseAdmin
      .from("tool_leads")
      .update({
        mailerlite_synced_at: sync.ok ? new Date().toISOString() : null,
        mailerlite_error: sync.ok ? null : (sync.error ?? "unknown error"),
      })
      .eq("id", inserted.id);

    return { ok: true, report_token: reportToken };
  });

/* ------------------- Persisted report + public page ------------------- */

export const attachToolReport = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        report_token: z.string().min(16).max(64),
        report: z.record(z.string(), z.unknown()),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("tool_leads")
      .update({ report_json: data.report as never })
      .eq("report_token", data.report_token);
    if (error) console.error("[tool-leads] report persist failed", error.message);
    return { ok: !error };
  });

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

export type StoredReport = {
  tool_slug: string;
  first_name: string | null;
  business_type: string | null;
  score: number | null;
  result_summary: string | null;
  report_json: JsonValue;
  created_at: string;
};

export const getToolReport = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ token: z.string().max(64) }).parse(d))
  .handler(async ({ data }): Promise<StoredReport | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("get_tool_report", { _token: data.token });
    if (error) {
      console.error("[tool-leads] report lookup failed", error.message);
      return null;
    }
    const row = (rows as StoredReport[] | null)?.[0];
    return row ?? null;
  });

/* ---------------------- Admin: MailerLite retries ---------------------- */

export const retryMailerliteSync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("tool_leads")
      .select("id, email, first_name, tool_slug, business_type, score, report_token, utm_source")
      .is("mailerlite_synced_at", null)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);

    let synced = 0;
    let failed = 0;
    for (const lead of rows ?? []) {
      const res = await syncLeadToMailerLite(lead as MlLead);
      if (res.ok) synced++;
      else failed++;
      await supabaseAdmin
        .from("tool_leads")
        .update({
          mailerlite_synced_at: res.ok ? new Date().toISOString() : null,
          mailerlite_error: res.ok ? null : (res.error ?? "unknown error"),
        })
        .eq("id", lead.id);
    }
    return { attempted: (rows ?? []).length, synced, failed };
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

/* --------------------- AI Search Visibility Check --------------------- */

const VISIBILITY_SLUG = "ai-visibility-check";
const VISIBILITY_RATE_LIMIT = 2;
const VISIBILITY_CACHE_DAYS = 7;

const visibilityInput = z.object({
  business_name: z.string().min(2).max(120),
  website: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  category: z.string().min(2).max(120),
  competitors: z.array(z.string().max(120)).max(2).default([]),
});

export type VisibilityQuestionResult = {
  question: string;
  mentioned: boolean;
  competitors_named: string[];
  businesses_named: string[];
  excerpt: string;
};

export type VisibilityResult = {
  score: number;
  questions: VisibilityQuestionResult[];
  cached: boolean;
  checked_at: string;
};

/** Normalises a URL to a bare domain for matching and cache keys. */
export function toDomain(website?: string) {
  if (!website) return "";
  return website
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]!
    .trim();
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function mentions(answer: string, needles: string[]) {
  const hay = norm(answer);
  return needles.some((n) => {
    const needle = norm(n);
    return needle.length >= 3 && hay.includes(needle);
  });
}

function makeGateway(apiKey: string) {
  return async () => {
    const { createOpenAI } = await import("@ai-sdk/openai");
    return createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
  };
}

const REASONING = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
};

export const runVisibilityCheck = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => visibilityInput.parse(d))
  .handler(async ({ data }): Promise<VisibilityResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured right now. Try again shortly.");

    const domain = toDomain(data.website);
    const cacheKey = [domain || norm(data.business_name), norm(data.category), norm(data.city ?? "")].join("|");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cached } = await supabaseAdmin
      .from("tool_visibility_cache")
      .select("payload, created_at, expires_at")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      const payload = cached.payload as { score: number; questions: VisibilityQuestionResult[] };
      return { ...payload, cached: true, checked_at: cached.created_at };
    }

    await assertRateLimit(VISIBILITY_SLUG, {
      limit: VISIBILITY_RATE_LIMIT,
      scopeToTool: true,
      message:
        "This check runs several AI queries per business, so it's capped at 2 per hour. Try again in an hour — or check a different business next time.",
    });

    const { streamText, Output } = await import("ai");
    const lovable = await makeGateway(apiKey)();
    const model = lovable.responses("openai/gpt-6-astra");
    const place = data.city?.trim() ? ` in ${data.city.trim()}` : "";

    // 1. Generate five realistic customer questions.
    const qGen = streamText({
      model,
      system:
        "You write the exact questions real customers type into AI assistants when they are ready to hire or buy. Short, specific, natural. Never mention any business by name.",
      prompt: `Business category: ${data.category}${place}. Write 5 different questions a customer would ask an AI assistant to find and choose a business like this. Vary the intent: best-of, urgent need, price/quote, a specific problem, and a comparison.`,
      output: Output.object({ schema: z.object({ questions: z.array(z.string()).min(5).max(5) }) }),
      providerOptions: REASONING,
    });
    const { questions } = (await qGen.output) as { questions: string[] };

    const answerSchema = z.object({
      answer: z.string(),
      businesses_named: z.array(z.string()),
    });

    // 2. Ask each question and record who the model actually names.
    const results = await Promise.all(
      questions.slice(0, 5).map(async (question): Promise<VisibilityQuestionResult> => {
        try {
          const run = streamText({
            model,
            system:
              "You are a helpful assistant answering a consumer's question. Recommend specific, real businesses by name where you reasonably can. Also return the list of business names you named in `businesses_named` (empty if you named none).",
            prompt: question,
            output: Output.object({ schema: answerSchema }),
            providerOptions: REASONING,
          });
          const out = (await run.output) as z.infer<typeof answerSchema>;
          const named = out.businesses_named ?? [];
          const haystack = `${out.answer}\n${named.join("\n")}`;
          const needles = [data.business_name, ...(domain ? [domain, domain.split(".")[0]!] : [])];
          const mentioned = mentions(haystack, needles);
          const competitorsNamed = data.competitors.filter((c) => c.trim() && mentions(haystack, [c]));
          return {
            question,
            mentioned,
            competitors_named: competitorsNamed,
            businesses_named: named.slice(0, 6),
            excerpt: out.answer.slice(0, 400),
          };
        } catch (err) {
          console.error("[visibility] question failed", err);
          return {
            question,
            mentioned: false,
            competitors_named: [],
            businesses_named: [],
            excerpt: "This question couldn't be checked this time.",
          };
        }
      }),
    );

    const score = results.filter((r) => r.mentioned).length;
    const payload = { score, questions: results };

    await supabaseAdmin.from("tool_visibility_cache").upsert(
      {
        cache_key: cacheKey,
        payload,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + VISIBILITY_CACHE_DAYS * 86400_000).toISOString(),
      },
      { onConflict: "cache_key" },
    );

    return { ...payload, cached: false, checked_at: new Date().toISOString() };
  });

const fixListSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  actions: z
    .array(
      z.object({
        rank: z.number(),
        area: z.string(),
        title: z.string(),
        why: z.string(),
        steps: z.array(z.string()),
        prompt: z.string(),
      }),
    )
    .min(7)
    .max(7),
});

export type VisibilityFixList = z.infer<typeof fixListSchema>;

const fixListInput = z.object({
  business_name: z.string().max(120),
  website: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  category: z.string().max(120),
  score: z.number().int().min(0).max(5),
  questions: z.array(z.object({ question: z.string().max(300), mentioned: z.boolean() })).max(5),
  competitors_seen: z.array(z.string().max(120)).max(12),
});

export const generateVisibilityFixList = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => fixListInput.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured right now. Try again shortly.");

    await assertRateLimit(VISIBILITY_SLUG, {
      limit: VISIBILITY_RATE_LIMIT + 1,
      scopeToTool: true,
      message:
        "This tool is capped at a couple of runs per hour so it stays free. Try again in an hour — your details are saved.",
    });

    const { streamText, Output } = await import("ai");
    const lovable = await makeGateway(apiKey)();

    const prompt = [
      `Business: ${data.business_name}`,
      data.website ? `Website: ${data.website}` : "Website: not given",
      data.city ? `Area: ${data.city}` : "Area: not given",
      `Category: ${data.category}`,
      `AI visibility score: ${data.score} of 5 test questions mentioned them.`,
      "Questions tested:",
      ...data.questions.map((q) => `- ${q.question} — ${q.mentioned ? "mentioned them" : "did not mention them"}`),
      data.competitors_seen.length
        ? `Businesses the model named instead: ${data.competitors_seen.join(", ")}`
        : "The model named no specific businesses.",
    ].join("\n");

    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      system: [
        "You write an AI Visibility Fix List for a small business owner.",
        "Return exactly 7 actions, ranked by impact, covering these areas in this order:",
        "Google Business Profile completeness; reviews strategy; FAQ content on their site; schema markup;",
        "consistent NAP citations; answering common customer questions in blog posts; getting mentioned on local or industry sites.",
        "Each action: 3-5 concrete steps and one copy-paste prompt the owner can paste into ChatGPT or Claude, written in second person and tailored to their business, category and area.",
        "Tone: plain English, specific, honest, lightly witty. Builder, not guru.",
        "Never promise rankings, traffic, revenue or income. Be clear that AI answers vary by model, location and time.",
      ].join(" "),
      prompt,
      output: Output.object({ schema: fixListSchema }),
      providerOptions: REASONING,
    });

    return (await result.output) as VisibilityFixList;
  });
