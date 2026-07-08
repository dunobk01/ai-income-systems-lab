import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listWins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("wins" as never)
      .select("id, user_id, amount, system, note, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as Array<{
      id: string; user_id: string; amount: number | string; system: string; note: string | null; created_at: string;
    }>;
    const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
    const { data: profs } = userIds.length
      ? await context.supabase.from("profiles").select("user_id, display_name").in("user_id", userIds)
      : { data: [] as Array<{ user_id: string; display_name: string | null }> };
    const names: Record<string, string> = Object.fromEntries(
      (profs ?? []).map((p) => [p.user_id as string, (p.display_name as string) ?? "Member"]),
    );

    const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);
    return {
      total,
      count: rows.length,
      wins: rows.map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        system: r.system,
        note: r.note,
        created_at: r.created_at,
        author: names[r.user_id] ?? "Member",
        author_id: r.user_id,
      })),
    };
  });

export const createWin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        amount: z.number().positive().max(10_000_000),
        system: z.string().min(1).max(120),
        note: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("wins" as never).insert({
      user_id: context.userId,
      amount: data.amount,
      system: data.system.trim(),
      note: data.note?.trim() || null,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteWin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("wins" as never).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
