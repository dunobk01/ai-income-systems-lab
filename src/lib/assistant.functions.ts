import { createServerFn } from "@tanstack/react-start";
import type { UIMessage } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ASSISTANT_DAILY_LIMIT, remainingMessages, startOfUtcDay } from "@/lib/assistant-rules";

const isUuid = (s: unknown): s is string =>
  typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export const listAssistantThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ai_chat_threads")
      .select("id, title, updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Could not load your chats.");
    const { count } = await context.supabase
      .from("ai_chat_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .gte("created_at", startOfUtcDay().toISOString());
    return { threads: data ?? [], remaining: remainingMessages(count ?? 0), limit: ASSISTANT_DAILY_LIMIT };
  });

export const createAssistantThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ai_chat_threads")
      .insert({ user_id: context.userId })
      .select("id")
      .single();
    if (error || !data) throw new Error("Could not start a new chat.");
    return { id: data.id };
  });

export const getAssistantMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { threadId: string }) => {
    if (!isUuid(d?.threadId)) throw new Error("Chat not found.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { data: thread } = await context.supabase
      .from("ai_chat_threads")
      .select("id, title")
      .eq("id", data.threadId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!thread) return { found: false as const, messages: [] as UIMessage[], title: "" };
    const { data: rows, error } = await context.supabase
      .from("ai_chat_messages")
      .select("message")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (error) throw new Error("Could not load this chat.");
    return {
      found: true as const,
      title: thread.title,
      messages: (rows ?? []).map((r) => r.message as unknown as UIMessage),
    };
  });

export const deleteAssistantThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { threadId: string }) => {
    if (!isUuid(d?.threadId)) throw new Error("Chat not found.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("ai_chat_threads")
      .delete()
      .eq("id", data.threadId)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not delete this chat.");
    return { ok: true };
  });
