import { createFileRoute } from "@tanstack/react-router";
import { FREE_KIT, FREE_KIT_DAYS } from "@/lib/free-kit-data";

/**
 * Downloadable version of the free lead magnet: a plain-markdown checklist
 * with every day's outcome, steps, prompt and pitfall. Served as an
 * attachment so the browser saves it rather than rendering it.
 */
function buildChecklist(): string {
  const lines: string[] = [];
  lines.push(`# ${FREE_KIT.name}`, "", FREE_KIT.promise, "");
  lines.push("## What you finish with", "");
  for (const o of FREE_KIT.outcomes) lines.push(`- [ ] ${o}`);
  lines.push("");

  for (const d of FREE_KIT_DAYS) {
    lines.push(`## Day ${d.day} — ${d.title} (~${d.minutes} min)`, "");
    lines.push(`**Outcome:** ${d.outcome}`, "");
    lines.push(`**Tools:** ${d.tools.join(", ")}`, "");
    for (const s of d.steps) lines.push(`- [ ] ${s}`);
    lines.push("", `**Prompt — ${d.prompt.label}:**`, "", "```", d.prompt.text, "```", "");
    lines.push(`**Avoid:** ${d.pitfall}`, "");
  }

  lines.push("---", "", FREE_KIT.honesty, "");
  lines.push(
    "Free account (Module 1, tool guides, sample prompts, progress tracking): https://ai-income-systems.com/signup",
    "",
    "Full course and builder tools: https://ai-income-systems.com/pricing",
    "",
  );
  return lines.join("\n");
}

export const Route = createFileRoute("/free/checklist.md")({
  server: {
    handlers: {
      GET: async () =>
        new Response(buildChecklist(), {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Disposition": `attachment; filename="${FREE_KIT.slug}.md"`,
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
