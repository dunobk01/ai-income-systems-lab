import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertBuilderAccess } from "@/lib/entitlements";

export const getMemberStaticGuide = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertBuilderAccess(context);
    const { getStaticGuideBySlug } = await import("@/lib/guides-content");
    return { guide: getStaticGuideBySlug(data.slug) ?? null };
  });