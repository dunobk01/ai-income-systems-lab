import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { freeToolBySlug } from "@/lib/free-tools-data";
import { dlToolCtaClick } from "@/lib/free-tools";

export type InlineToolProps = {
  toolSlug: string;
  /** page slug, used as utm_campaign */
  campaign: string;
  heading: string;
  blurb: string;
  cta?: string;
  /** "guide" matches the pillar-guide article styling, "prose" the blog article */
  variant?: "guide" | "prose";
};

/**
 * Contextual mid-article card pointing at one free tool.
 * Links carry UTMs so the tool's lead capture records where the lead came from.
 */
export function InlineToolCard({
  toolSlug,
  campaign,
  heading,
  blurb,
  cta = "Start the free tool",
  variant = "guide",
}: InlineToolProps) {
  const tool = freeToolBySlug(toolSlug);
  if (!tool) return null;
  const Icon = tool.icon;
  const href = `${tool.path}?utm_source=guide&utm_medium=inline&utm_campaign=${encodeURIComponent(campaign)}`;

  const shell =
    variant === "prose"
      ? "my-10 rounded-2xl border border-[color:var(--brand)]/25 bg-[color:var(--brand)]/[0.06] p-5 sm:p-6"
      : "my-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[color:var(--brand)]/10 to-[color:var(--brand-2)]/5 p-5 sm:p-6";

  return (
    <aside className={shell}>
      <div className="flex items-start gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
          style={{ background: "var(--gradient-soft)" }}
        >
          <Icon className="h-5 w-5 text-[color:var(--brand-2)]" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-[color:var(--brand)]">
            Free tool · no signup to start
          </div>
          <h3 className="mt-1 text-lg font-bold leading-snug">{heading}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{blurb}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              to={href}
              onClick={() => dlToolCtaClick(tool.slug, { location: `inline-${campaign}` })}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[color:var(--brand)] px-4 text-sm font-semibold text-[#0a0a0f] transition hover:opacity-90"
            >
              {cta} <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {tool.time}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Which guide gets which tool, and where in the article it belongs. */
export const GUIDE_INLINE_TOOLS: Record<
  string,
  InlineToolProps & { afterSectionIndex: number }
> = {
  "local-business-ai-service": {
    toolSlug: "ai-readiness-scorecard",
    campaign: "local-business-ai-service",
    heading: "Not sure which local business task to automate first?",
    blurb:
      "Answer 10 questions about how leads, follow-up and admin currently work, and get a readiness score plus the single automation worth building first.",
    cta: "Score my business",
    afterSectionIndex: 1,
  },
  "n8n-income-automation": {
    toolSlug: "ai-savings-calculator",
    campaign: "n8n-income-automation",
    heading: "Work out what these workflows are actually worth to you",
    blurb:
      "Drag a few sliders for the hours you spend on leads, follow-up, content and admin, and see the hours and dollars a month automation could hand back. Estimates, not promises.",
    cta: "Run the numbers",
    afterSectionIndex: 1,
  },
  "ai-content-system": {
    toolSlug: "ai-visibility-check",
    campaign: "ai-content-system",
    heading: "Do you show up when someone asks ChatGPT for a business like yours?",
    blurb:
      "Before you write another post, check it. We ask an AI model five real customer questions for your category and city, and show you who it names instead of you.",
    cta: "Check my visibility",
    afterSectionIndex: 1,
  },
};
