import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) throw new Error("Forbidden");
}

const TIER = z.enum(["none", "monthly", "starter", "builder", "pro", "accelerator"]);
const slug = z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, dashes");

/* ---------------- Course content ---------------- */

export const listCourseAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase as any;
    const [c, m, l] = await Promise.all([
      sb.from("courses").select("id, title, slug").order("created_at"),
      sb.from("modules").select("*").order("order_index"),
      sb.from("lessons").select("*").order("order_index"),
    ]);
    const err = c.error || m.error || l.error;
    if (err) throw new Error(err.message);
    return { courses: c.data ?? [], modules: m.data ?? [], lessons: l.data ?? [] };
  });

const moduleSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  slug,
  summary: z.string().max(2000).default(""),
  order_index: z.number().int().min(0).max(1000),
  required_tier: TIER,
  is_preview: z.boolean(),
});

export const saveModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => moduleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase as any;
    const { id, ...rest } = data;
    const row = { ...rest, summary: rest.summary || null };
    const q = id ? sb.from("modules").update(row).eq("id", id) : sb.from("modules").insert(row);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase as any;
    const { data: ls } = await sb.from("lessons").select("id").eq("module_id", data.id);
    const ids = (ls ?? []).map((x: any) => x.id);
    if (ids.length) {
      await sb.from("lesson_progress").delete().in("lesson_id", ids);
      await sb.from("user_notes").delete().in("lesson_id", ids);
      const { error: le } = await sb.from("lessons").delete().in("id", ids);
      if (le) throw new Error(le.message);
    }
    const { error } = await sb.from("modules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const lessonSchema = z.object({
  id: z.string().uuid().optional(),
  module_id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  slug,
  content: z.string().max(200000).default(""),
  action_steps: z.string().max(20000).default(""),
  video_url: z.string().max(500).default(""),
  resource_url: z.string().max(500).default(""),
  duration_minutes: z.number().int().min(0).max(1000).nullable(),
  order_index: z.number().int().min(0).max(1000),
  is_preview: z.boolean(),
});

export const saveLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => lessonSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase as any;
    const { id, ...r } = data;
    const row = {
      ...r,
      content: r.content || null,
      action_steps: r.action_steps || null,
      video_url: r.video_url || null,
      resource_url: r.resource_url || null,
    };
    const q = id ? sb.from("lessons").update(row).eq("id", id) : sb.from("lessons").insert(row);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase as any;
    await sb.from("lesson_progress").delete().eq("lesson_id", data.id);
    await sb.from("user_notes").delete().eq("lesson_id", data.id);
    const { error } = await sb.from("lessons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- Members ---------------- */

export const listMembersAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    const users: any[] = [];
    for (let page = 1; page <= 20; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error(error.message);
      users.push(...data.users);
      if (data.users.length < 1000) break;
    }
    const [{ data: profiles }, { data: roles }, { data: subs }] = await Promise.all([
      admin.from("profiles").select("user_id, display_name, tier, onboarded_at"),
      admin.from("user_roles").select("user_id, role"),
      admin.from("subscriptions").select("user_id, status, price_id, current_period_end, cancel_at_period_end, environment"),
    ]);
    const pMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    return {
      members: users.map((u) => {
        const p: any = pMap.get(u.id);
        const s = (subs ?? []).filter((x: any) => x.user_id === u.id);
        return {
          id: u.id,
          email: u.email ?? "",
          display_name: p?.display_name ?? null,
          tier: p?.tier ?? "none",
          is_admin: (roles ?? []).some((r: any) => r.user_id === u.id && r.role === "admin"),
          provider: u.app_metadata?.provider ?? "email",
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          subscriptions: s,
        };
      }),
    };
  });

export const setMemberTier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid(), tier: TIER }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any).from("profiles").update({ tier: data.tier }).eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setMemberAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid(), admin: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.userId === context.userId && !data.admin) throw new Error("You can't remove your own admin access.");
    const sb = context.supabase as any;
    const { error } = data.admin
      ? await sb.from("user_roles").upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" })
      : await sb.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
