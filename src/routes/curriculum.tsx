import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ogImageMeta } from "@/lib/og";

export const Route = createFileRoute("/curriculum")({
  head: () => ({
    meta: [
      { title: "Curriculum — AI Income Systems Lab" },
      { name: "description", content: "11 modules, 90+ lessons. The full sequence that takes you from zero to a live AI income system in 7 days." },
      { property: "og:title", content: "Curriculum — AI Income Systems Lab" },
      { property: "og:description", content: "11 modules, 90+ lessons. The full sequence that takes you from zero to a live AI income system." },
      { property: "og:url", content: "https://ai-income-systems.com/curriculum" },
    
      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: "https://ai-income-systems.com/curriculum" }],
  }),
  component: CurriculumPage,
});

const modules = [
  {
    n: "01", title: "AI Money Foundations", lessons: 6,
    outcome: "Pick a niche, an offer type, and a 90-day income target you can actually hit.",
    topics: ["How AI changes the income game (and what hasn't changed)", "The Niche × Offer × Tool matrix", "Setting a realistic 90-day target", "Tracker setup: what to measure weekly"],
  },
  {
    n: "02", title: "Prompt Mastery", lessons: 9,
    outcome: "Write reusable prompts that produce expert-level output on the first try.",
    topics: ["Anatomy of a great prompt", "Role / context / format pattern", "Prompt chaining and refinement", "Building your personal prompt library"],
  },
  {
    n: "03", title: "ChatGPT for Execution", lessons: 8,
    outcome: "Use ChatGPT as your daily operator for content, copy, and customer work.",
    topics: ["Custom GPTs for repeated workflows", "Voice mode + transcripts", "Projects for client work", "Inbox triage and reply drafting"],
  },
  {
    n: "04", title: "Claude for Strategy", lessons: 8,
    outcome: "Plan offers, products, and launches with long-context reasoning that doesn't drift.",
    topics: ["200k context workflows", "Artifacts for plans and copy", "Voice matching and editing", "Self-critique loops"],
  },
  {
    n: "05", title: "Perplexity for Research", lessons: 7,
    outcome: "Validate niches, audiences, and competitors in minutes — with sources.",
    topics: ["Market research playbooks", "Competitor teardown", "Audience pain mining", "Sourced fact packs for content"],
  },
  {
    n: "06", title: "Lovable App & Funnel Builder", lessons: 9,
    outcome: "Ship a real landing page, micro-SaaS, or funnel without writing code.",
    topics: ["Project setup + design system", "Auth and payments", "Building the dashboard", "Shipping to a real domain"],
  },
  {
    n: "07", title: "Digital Product Factory", lessons: 9,
    outcome: "Produce and package a digital product (ebook, template pack, mini-course) you can sell this week.",
    topics: ["Niche → product fit", "Drafting in Claude, designing in Canva", "Pricing and packaging", "Launching on Gumroad / Lovable"],
  },
  {
    n: "08", title: "Sales Funnel Builder", lessons: 8,
    outcome: "Map lead magnet → landing → tripwire → upsell and write every page that converts.",
    topics: ["The value ladder", "Writing tripwires that liquidate ad spend", "5-day welcome sequences", "Order bumps and upsells"],
  },
  {
    n: "09", title: "n8n Automation Lab", lessons: 11,
    outcome: "Build workflows that deliver products, follow up with buyers, and repurpose content on autopilot.",
    topics: ["n8n fundamentals", "Delivery + onboarding automations", "Content repurposing pipelines", "Reporting and alerting flows"],
  },
  {
    n: "10", title: "Local Business AI Service Kit", lessons: 7,
    outcome: "Sell a productized AI service (audits, content, automations) to local clients for $500–$2k.",
    topics: ["Picking a vertical", "Productizing the offer", "Cold outreach scripts", "Delivery + retainer playbook"],
  },
  {
    n: "11", title: "Launch Your First Income System", lessons: 8,
    outcome: "Combine product + funnel + automation into a live offer in 7 days.",
    topics: ["7-day launch sprint", "Pre-launch list building", "Launch week mechanics", "Post-launch iteration"],
  },
];

function CurriculumPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Curriculum
          </div>
          <h1 className="mt-5 text-4xl sm:text-6xl font-black tracking-tight">
            11 modules. 90+ lessons.<br />
            <span className="text-gradient">One real income system.</span>
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-muted-foreground">
            Sequenced so each module builds on the last. By Module 11, your product, funnel, and automations are live — not a theory deck.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 space-y-4">
        {modules.map((m) => (
          <article key={m.n} className="glass-strong rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="sm:w-48 shrink-0">
                <p className="text-xs font-mono text-muted-foreground">Module {m.n}</p>
                <h2 className="mt-1 text-xl font-semibold">{m.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{m.lessons} lessons</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  <span className="text-[color:var(--brand)] font-semibold">Outcome: </span>{m.outcome}
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {m.topics.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-[color:var(--brand-2)] mt-0.5 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-24">
        <div className="glass-strong rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to start Module 01?</h2>
          <p className="mt-2 text-muted-foreground">Pick a tier, get instant access, and ship your first income system in 7 days.</p>
          <Button asChild size="lg" variant="brand" className="mt-6 h-12 px-7">
            <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
