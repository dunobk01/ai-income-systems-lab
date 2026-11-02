import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import type { Database } from "@/integrations/supabase/types";
import { ASSISTANT_DAILY_LIMIT, canUseAssistant, startOfUtcDay } from "@/lib/assistant-rules";

const MODEL = "openai/gpt-6-astra";
const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

function json(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function textOf(m: UIMessage) {
  return (m.parts ?? [])
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
}

const STOP = new Set(
  "the a an and or to of in on for with how what why is are do does i my me can you it this that be at by from your our about".split(" "),
);
const keywords = (s: string) =>
  Array.from(new Set(s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))));

const stripHtml = (s: string) =>
  s.replace(/<svg[\s\S]*?<\/svg>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const score = (title: string, words: string[]) => {
  const t = title.toLowerCase();
  return words.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
};

type Sb = ReturnType<typeof createClient<Database>>;

/** Builds a compact knowledge block from course lessons and Lab posts the member can read (RLS enforces tier). */
async function buildKnowledge(supabase: Sb, question: string) {
  const words = keywords(question);
  const [{ data: lessons }, { data: posts }] = await Promise.all([
    supabase.from("lessons").select("id, title, module_id, modules(title, order_index)").limit(200),
    supabase.from("newsletter_posts").select("id, slug, title, excerpt, post_type").eq("post_type", "lab").limit(50),
  ]);

  const lessonRows = (lessons ?? []) as Array<{ id: string; title: string; modules: { title: string } | null }>;
  const catalog = lessonRows.map((l) => `- ${l.modules?.title ?? "Module"} › ${l.title}`).join("\n");
  const labRows = posts ?? [];
  const labCatalog = labRows.map((p) => `- ${p.title}: ${p.excerpt ?? ""} (https://ai-income-systems.com/thelab/${p.slug})`).join("\n");

  const topLessons = lessonRows
    .map((l) => ({ l, s: score(`${l.title} ${l.modules?.title ?? ""}`, words) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);
  const topPosts = labRows
    .map((p) => ({ p, s: score(`${p.title} ${p.excerpt ?? ""}`, words) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2);

  const [lessonBodies, postBodies] = await Promise.all([
    topLessons.length
      ? supabase.from("lessons").select("title, content, action_steps").in("id", topLessons.map((x) => x.l.id))
      : Promise.resolve({ data: [] as Array<{ title: string; content: string | null; action_steps: string | null }> }),
    topPosts.length
      ? supabase.from("newsletter_posts").select("title, content").in("id", topPosts.map((x) => x.p.id))
      : Promise.resolve({ data: [] as Array<{ title: string; content: string | null }> }),
  ]);

  const details = [
    ...(lessonBodies.data ?? []).map(
      (l) => `### Lesson: ${l.title}\n${stripHtml(l.content ?? "").slice(0, 3500)}\n${l.action_steps ? `Action steps: ${stripHtml(l.action_steps).slice(0, 800)}` : ""}`,
    ),
    ...(postBodies.data ?? []).map((p) => `### Lab post: ${p.title}\n${stripHtml(p.content ?? "").slice(0, 3500)}`),
  ].join("\n\n");

  return { catalog, labCatalog, details };
}

function systemPrompt(k: { catalog: string; labCatalog: string; details: string }, tierName: string) {
  return `You are the AI Income Systems Lab Assistant, a practical, honest helper for members building AI-powered income systems with tools like ChatGPT, Claude, Perplexity, Lovable and n8n.

You can help with anything a general AI assistant can: answering questions, writing, editing, brainstorming, planning, explaining code and automations. When relevant, connect answers to the member's course and Lab content below and point to specific lessons or Lab posts.

Rules:
- Be practical, beginner friendly and implementation focused. Use clear steps.
- Never promise or estimate specific income. No get-rich-quick framing. Encourage realistic expectations.
- If course content below doesn't cover something, say so and answer from general knowledge.
- The member is on the ${tierName} plan. They can only see the lessons listed below; if they ask about locked material, explain it is included in a higher plan without revealing its contents.
- Format answers in Markdown.

Course lessons this member can open:
${k.catalog || "(none listed)"}

Lab posts this member can open:
${k.labCatalog || "(Lab posts are included with Builder and Accelerator.)"}

Relevant content for this question:
${k.details || "(no closely matching lesson found)"}`;
}

export async function handleAssistantChat(request: Request): Promise<Response> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!url || !key || !apiKey) return json(500, "The assistant is not configured yet.");

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return json(401, "Please sign in to use the assistant.");

  const supabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData.user) return json(401, "Your session expired. Please sign in again.");
  const userId = userData.user.id;

  let body: { messages?: UIMessage[]; threadId?: string };
  try {
    body = await request.json();
  } catch {
    return json(400, "Invalid request.");
  }
  const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
  const threadId = typeof body.threadId === "string" ? body.threadId : "";
  const last = messages[messages.length - 1];
  if (!threadId || !last || last.role !== "user") return json(400, "Invalid request.");
  const question = textOf(last);
  if (!question || question.length > 8000) return json(400, "Please enter a message under 8,000 characters.");

  const [{ data: profile }, { data: roles }, { data: thread }] = await Promise.all([
    supabase.from("profiles").select("tier").eq("user_id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("ai_chat_threads").select("id, title").eq("id", threadId).eq("user_id", userId).maybeSingle(),
  ]);
  const isAdmin = (roles ?? []).some((r) => r.role === "admin");
  const tier = profile?.tier ?? "none";
  if (!canUseAssistant(tier, isAdmin)) return json(403, "The AI Assistant is included with every paid plan. Upgrade to use it.");
  if (!thread) return json(404, "Chat not found.");

  const { count } = await supabase
    .from("ai_chat_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfUtcDay().toISOString());
  if ((count ?? 0) >= ASSISTANT_DAILY_LIMIT) {
    return json(429, `You've used all ${ASSISTANT_DAILY_LIMIT} assistant messages for today. Your limit resets at midnight UTC.`);
  }

  const { error: usageErr } = await supabase.from("ai_chat_usage").insert({ user_id: userId });
  if (usageErr) return json(500, "Could not start the chat. Please try again.");
  const { error: saveErr } = await supabase
    .from("ai_chat_messages")
    .insert({ thread_id: threadId, user_id: userId, role: "user", sdk_id: last.id, message: last as never });
  if (saveErr) return json(500, "Could not save your message. Please try again.");

  const knowledge = await buildKnowledge(supabase, question);
  const tierName = isAdmin ? "Accelerator (admin)" : tier.charAt(0).toUpperCase() + tier.slice(1);

  let runId = request.headers.get(RUN_ID_HEADER)?.trim() || undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(RUN_ID_HEADER)) headers.set(RUN_ID_HEADER, runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get(RUN_ID_HEADER)?.trim() || undefined;
      return res;
    },
  });

  const result = streamText({
    model: provider.responses(MODEL),
    system: systemPrompt(knowledge, tierName),
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
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

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    sendReasoning: true,
    onError: (err) => {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 429) return "The assistant is busy right now. Please try again in a minute.";
      if (status === 402 || status === 403) return "The assistant is temporarily unavailable. Please try again later.";
      console.error("[assistant] stream error", err);
      return "Something went wrong generating a reply. Please try again.";
    },
    onFinish: async ({ responseMessage }) => {
      const { error } = await supabase.from("ai_chat_messages").insert({
        thread_id: threadId,
        user_id: userId,
        role: "assistant",
        sdk_id: responseMessage.id,
        message: responseMessage as never,
      });
      if (error) console.error("[assistant] failed to save reply", error);
      const patch: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
      if (thread.title === "New chat") patch.title = question.slice(0, 60);
      const { error: tErr } = await supabase.from("ai_chat_threads").update(patch).eq("id", threadId);
      if (tErr) console.error("[assistant] failed to update thread", tErr);
    },
  });
}
