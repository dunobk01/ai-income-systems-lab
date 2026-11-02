import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Contact inbox. Visitors submit and continue threads through a secret
 * per-thread link; admins read and reply from /admin/inbox. Replies are
 * emailed from the verified sender domain.
 */

const SITE_URL = "https://ai-income-systems.com";
const HOURLY_LIMIT = 5;
const threadUrl = (token: string) => `${SITE_URL}/contact/r/${token}`;

const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();

async function ipHash() {
  const h = getRequest()?.headers;
  const ip = h?.get("cf-connecting-ip") ?? h?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`contact:${ip}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function notifyOwner(data: Record<string, unknown>, key: string) {
  try {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    await sendTemplateEmail("contact-new-message", "", { templateData: data, idempotencyKey: key });
  } catch (err) {
    console.error("[contact] owner notification failed", err);
  }
}

export const contactSubmitSchema = z.object({
  name: z.string().transform(clean).pipe(z.string().min(1, "Name is required").max(100)),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
  subject: z.string().transform(clean).pipe(z.string().min(2, "Subject is required").max(150)),
  message: z.string().transform(clean).pipe(z.string().min(10, "Message must be at least 10 characters").max(5000)),
  company: z.string().max(200).optional(), // honeypot
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSubmitSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.company) return { ok: true as const }; // bot
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const hash = await ipHash();
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await supabaseAdmin
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", hash)
      .gte("created_at", since);
    if ((count ?? 0) >= HOURLY_LIMIT) throw new Error("Too many messages. Please try again in an hour.");

    const { data: msg, error } = await supabaseAdmin
      .from("contact_messages")
      .insert({ name: data.name, email: data.email, subject: data.subject, ip_hash: hash })
      .select("id")
      .single();
    if (error || !msg) throw new Error("Could not send your message. Please try again.");
    const { error: e2 } = await supabaseAdmin
      .from("contact_entries")
      .insert({ message_id: msg.id, author: "visitor", body: data.message });
    if (e2) throw new Error("Could not send your message. Please try again.");

    await notifyOwner({ name: data.name, email: data.email, subject: data.subject, message: data.message }, `contact-new-${msg.id}`);
    return { ok: true as const };
  });

const tokenSchema = z.string().regex(/^[a-f0-9]{48}$/);

export const getContactThread = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string }) => ({ token: tokenSchema.parse(input.token) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: msg } = await supabaseAdmin
      .from("contact_messages")
      .select("id, name, subject, status, created_at")
      .eq("thread_token", data.token)
      .maybeSingle();
    if (!msg) return null;
    const { data: entries } = await supabaseAdmin
      .from("contact_entries")
      .select("id, author, body, created_at")
      .eq("message_id", msg.id)
      .order("created_at");
    return { name: msg.name, subject: msg.subject, status: msg.status, entries: entries ?? [] };
  });

export const replyToContactThread = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string; body: string }) => ({
    token: tokenSchema.parse(input.token),
    body: z.string().transform(clean).pipe(z.string().min(1).max(5000)).parse(input.body),
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: msg } = await supabaseAdmin
      .from("contact_messages")
      .select("id, name, email, subject")
      .eq("thread_token", data.token)
      .maybeSingle();
    if (!msg) throw new Error("Conversation not found");
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await supabaseAdmin
      .from("contact_entries")
      .select("id", { count: "exact", head: true })
      .eq("message_id", msg.id)
      .eq("author", "visitor")
      .gte("created_at", since);
    if ((count ?? 0) >= 10) throw new Error("Too many replies. Please try again later.");
    const { data: entry, error } = await supabaseAdmin
      .from("contact_entries")
      .insert({ message_id: msg.id, author: "visitor", body: data.body })
      .select("id")
      .single();
    if (error || !entry) throw new Error("Could not send your reply.");
    await supabaseAdmin.from("contact_messages").update({ status: "open", updated_at: new Date().toISOString() }).eq("id", msg.id);
    await notifyOwner({ name: msg.name, email: msg.email, subject: msg.subject, message: data.body, isFollowUp: true }, `contact-followup-${entry.id}`);
    return { ok: true as const };
  });

/* ------------------------------ Admin ------------------------------ */

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

export const listContactMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("contact_messages")
      .select("id, name, email, subject, status, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getContactMessageAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: z.string().uuid().parse(input.id) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: msg, error } = await context.supabase
      .from("contact_messages")
      .select("id, name, email, subject, status, created_at")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    if (msg.status === "new") {
      await context.supabase.from("contact_messages").update({ status: "open" }).eq("id", data.id);
      msg.status = "open";
    }
    const { data: entries } = await context.supabase
      .from("contact_entries")
      .select("id, author, body, email_status, created_at")
      .eq("message_id", data.id)
      .order("created_at");
    return { ...msg, entries: entries ?? [] };
  });

export const sendContactReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; body: string }) => ({
    id: z.string().uuid().parse(input.id),
    body: z.string().transform(clean).pipe(z.string().min(1, "Write a reply first").max(10000)).parse(input.body),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: msg, error } = await supabaseAdmin
      .from("contact_messages")
      .select("id, name, email, subject, thread_token")
      .eq("id", data.id)
      .single();
    if (error || !msg) throw new Error("Message not found");
    const { data: entry, error: e2 } = await supabaseAdmin
      .from("contact_entries")
      .insert({ message_id: msg.id, author: "admin", body: data.body, email_status: "sending" })
      .select("id")
      .single();
    if (e2 || !entry) throw new Error("Could not save reply");

    let status = "sent";
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      const r = await sendTemplateEmail("contact-reply", msg.email, {
        templateData: { name: msg.name, subject: msg.subject, reply: data.body, threadUrl: threadUrl(msg.thread_token) },
        idempotencyKey: `contact-reply-${entry.id}`,
      });
      if (!r.sent) status = "suppressed";
    } catch (err) {
      console.error("[contact] reply send failed", err);
      status = "failed";
    }
    await supabaseAdmin.from("contact_entries").update({ email_status: status }).eq("id", entry.id);
    await supabaseAdmin.from("contact_messages").update({ status: "replied", updated_at: new Date().toISOString() }).eq("id", msg.id);
    return { emailStatus: status };
  });

export const setContactStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) => ({
    id: z.string().uuid().parse(input.id),
    status: z.enum(["new", "open", "replied", "closed"]).parse(input.status),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("contact_messages").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteContactMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: z.string().uuid().parse(input.id) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("contact_messages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
