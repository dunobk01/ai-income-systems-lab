import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertBuilderAccess } from "@/lib/entitlements";

const text = z.string().max(20000);

export const buildProductBlueprint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ skills: text, hoursPerWeek: text, budget: text, platform: text, incomeGoal: text }).parse(d))
  .handler(async ({ data, context }) => {
    await assertBuilderAccess(context);
    const { generateBlueprint } = await import("@/lib/blueprint-generator-data");
    return generateBlueprint(data);
  });

export const customizeMemberPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ category: text, task: text, answers: z.record(z.string().max(100), text) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertBuilderAccess(context);
    const { buildCustomPrompt } = await import("@/lib/prompt-customizer-data");
    return buildCustomPrompt(data.category, data.task, data.answers);
  });

export const buildMemberLeadMagnet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ niche: text, audience: text, offer: text }).parse(d))
  .handler(async ({ data, context }) => {
    await assertBuilderAccess(context);
    const { generateLeadMagnet } = await import("@/lib/lead-magnet-generator-data");
    return generateLeadMagnet(data);
  });

export const askMemberLab = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ question: text }).parse(d))
  .handler(async ({ data, context }) => {
    await assertBuilderAccess(context);
    const { askTheLab } = await import("@/lib/ask-the-lab-data");
    return askTheLab(data.question);
  });

export const auditMemberFunnel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ offer: text, audience: text, price: text, pageText: text }).parse(d))
  .handler(async ({ data, context }) => {
    await assertBuilderAccess(context);
    const { auditFunnel } = await import("@/lib/funnel-auditor-data");
    return auditFunnel(data);
  });

export const repurposeMemberContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ content: text, angle: text }).parse(d))
  .handler(async ({ data, context }) => {
    await assertBuilderAccess(context);
    const { repurpose } = await import("@/lib/repurposing-engine-data");
    return repurpose(data);
  });