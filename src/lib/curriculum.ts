/**
 * Canonical curriculum data.
 *
 * Single source of truth for every marketing / app surface that mentions the
 * course. Titles, order and lesson counts mirror the `modules` / `lessons`
 * tables — when content changes, update this list once and every page (and the
 * "N modules · N lessons" counts, which are derived) follows.
 */
export type CurriculumModule = {
  n: string;
  title: string;
  lessons: number;
  outcome: string;
  topics: string[];
};

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    n: "01", title: "AI Money Foundations", lessons: 6,
    outcome: "Pick a niche, an offer type, and a 90-day income target you can actually hit.",
    topics: ["How AI changes the income game (and what hasn't changed)", "The Niche × Offer × Tool matrix", "Setting a realistic 90-day target", "Tracker setup: what to measure weekly"],
  },
  {
    n: "02", title: "Master ChatGPT", lessons: 7,
    outcome: "Use ChatGPT as your daily operator for content, copy, and customer work.",
    topics: ["Custom GPTs for repeated workflows", "Voice mode + transcripts", "Projects for client work", "Inbox triage and reply drafting"],
  },
  {
    n: "03", title: "Master Claude", lessons: 6,
    outcome: "Plan offers, products, and launches with long-context reasoning that doesn't drift.",
    topics: ["Long-context workflows", "Artifacts for plans and copy", "Voice matching and editing", "Self-critique loops"],
  },
  {
    n: "04", title: "Master Perplexity", lessons: 5,
    outcome: "Validate niches, audiences, and competitors in minutes — with sources.",
    topics: ["Market research playbooks", "Competitor teardown", "Audience pain mining", "Sourced fact packs for content"],
  },
  {
    n: "05", title: "Prompt Engineering Mastery", lessons: 6,
    outcome: "Write reusable prompts that produce expert-level output on the first try.",
    topics: ["Anatomy of a great prompt", "Role / context / format pattern", "Prompt chaining and refinement", "Building your personal prompt library"],
  },
  {
    n: "06", title: "Digital Products with AI", lessons: 7,
    outcome: "Produce and package a digital product (ebook, template pack, mini-course) you can sell this week.",
    topics: ["Niche → product fit", "Drafting in Claude, designing in Canva", "Pricing and packaging", "Launching on Gumroad / Lovable"],
  },
  {
    n: "07", title: "Sales Funnels & Copywriting", lessons: 8,
    outcome: "Map lead magnet → landing → tripwire → upsell and write every page that converts.",
    topics: ["The value ladder", "Writing tripwires that liquidate ad spend", "5-day welcome sequences", "Order bumps and upsells"],
  },
  {
    n: "08", title: "Building Web Apps with Lovable", lessons: 6,
    outcome: "Ship a real landing page, micro-SaaS, or funnel without writing code.",
    topics: ["Project setup + design system", "Auth and payments", "Building the dashboard", "Shipping to a real domain"],
  },
  {
    n: "09", title: "Automations with n8n", lessons: 6,
    outcome: "Build workflows that deliver products, follow up with buyers, and repurpose content on autopilot.",
    topics: ["n8n fundamentals", "Delivery + onboarding automations", "Content repurposing pipelines", "Reporting and alerting flows"],
  },
  {
    n: "10", title: "Launching & Selling", lessons: 6,
    outcome: "Combine product + funnel + automation into a live offer in 7 days.",
    topics: ["7-day launch sprint", "Pre-launch list building", "Launch week mechanics", "Post-launch iteration"],
  },
  {
    n: "11", title: "Scaling AI Income Systems", lessons: 6,
    outcome: "Turn one working system into repeatable revenue without adding hours.",
    topics: ["Finding the constraint", "Productizing delivery", "Hiring and delegating with AI", "Reinvesting into paid traffic"],
  },
  {
    n: "12", title: "AI Agents & Skills", lessons: 8,
    outcome: "Build agents and reusable skills that run parts of the business for you.",
    topics: ["Agent design patterns", "Tools, memory, and guardrails", "Reusable skill libraries", "Monitoring and handoffs"],
  },
  {
    n: "13", title: "Faceless Video Income (ElevenLabs + HeyGen + Synthesia)", lessons: 4,
    outcome: "Faceless YouTube/TikTok/Shorts with AI voiceovers and avatars.",
    topics: ["Scripting for short-form", "ElevenLabs voiceovers", "HeyGen / Synthesia avatars", "Publishing and monetization"],
  },
  {
    n: "14", title: "AI Image Income (Midjourney + Flux)", lessons: 4,
    outcome: "Midjourney / Flux for print-on-demand, ads, and thumbnails that actually sell.",
    topics: ["Image prompt systems", "Print-on-demand pipelines", "Ad creative batches", "Thumbnail testing"],
  },
  {
    n: "15", title: "Chatbot Agency (Botpress)", lessons: 4,
    outcome: "Build and resell AI chatbots to local businesses as setup + retainer deals.",
    topics: ["Botpress fundamentals", "Packaging the offer", "Client onboarding", "Retainers and support"],
  },
];

export const CURRICULUM = {
  modules: CURRICULUM_MODULES.length,
  lessons: CURRICULUM_MODULES.reduce((sum, m) => sum + m.lessons, 0),
} as const;

/** "15 modules · 89 lessons" */
export const CURRICULUM_LABEL = `${CURRICULUM.modules} modules · ${CURRICULUM.lessons} lessons`;

/** "15 modules, 89 lessons" — for prose/SEO copy. */
export const CURRICULUM_SENTENCE = `${CURRICULUM.modules} modules, ${CURRICULUM.lessons} lessons`;
