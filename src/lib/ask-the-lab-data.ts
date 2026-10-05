/**
 * Knowledge index for Ask the Lab. Deterministic keyword retrieval over the
 * site's own teaching — no AI call, no external data.
 */

type Entry = {
  keywords: string[];
  title: string;
  answer: string;
  links: { label: string; href: string }[];
};

export const LAB_LINKS = [
  { label: "Free tools", href: "/free-tools" },
  { label: "Guides", href: "/guides" },
  { label: "Curriculum", href: "/curriculum" },
  { label: "The Lab", href: "/thelab" },
  { label: "Pricing", href: "/pricing" },
];

const ENTRIES: Entry[] = [
  {
    keywords: ["niche", "choose", "what should i sell", "idea", "ideas", "product idea", "start with"],
    title: "Choosing a niche and first product",
    answer:
      "Pick the overlap of three things: a skill you already have, people you can describe in one sentence, and a problem they'll pay to remove. Then build the smallest product that delivers one real result — a checklist, a template pack, or a short guide. A small finished product teaches you more than a big planned one.",
    links: [
      { label: "Run the AI Product Blueprint Generator", href: "/free-tools/product-blueprint" },
      { label: "Curriculum — Module 1 covers choosing your system", href: "/curriculum" },
    ],
  },
  {
    keywords: ["price", "pricing", "charge", "how much", "cost", "expensive"],
    title: "How to price a digital product",
    answer:
      "Price the result, not the page count. A template that saves someone 5 hours is worth far more than $9. Practical starting points: checklists and single templates $9–$29, complete toolkits and guides $17–$49, mini-courses $49–$129. If ten people see the offer and nobody buys, change the promise or the audience before cutting the price.",
    links: [{ label: "Blueprint tool includes a price recommendation", href: "/free-tools/product-blueprint" }],
  },
  {
    keywords: ["prompt", "chatgpt", "claude", "write a prompt", "better prompts", "ai prompt"],
    title: "Writing prompts that produce usable output",
    answer:
      "A production-ready prompt has five parts: a role, the context, the specific task, the constraints, and the output format. Most bad AI output is a missing-context problem, not a model problem — tell it who it is, who the audience is, and exactly what 'done' looks like.",
    links: [
      { label: "AI Prompt Generator — three copy-ready prompts", href: "/free-tools/prompt-generator" },
      { label: "AI Prompt Customizer — prompt built from your answers", href: "/free-tools/prompt-customizer" },
    ],
  },
  {
    keywords: ["lead magnet", "freebie", "email list", "subscribers", "grow list", "opt-in"],
    title: "Lead magnets that actually convert",
    answer:
      "The best lead magnet is one specific promise your audience wants now: a checklist, a 5-mistakes guide, or a template pack. Name the outcome in the title, keep it under 10 pages, and put exactly one next step at the end — your paid offer.",
    links: [
      { label: "Lead-Magnet Generator — concepts, outline and emails", href: "/free-tools/lead-magnet-generator" },
      { label: "Guides on building your list", href: "/guides" },
    ],
  },
  {
    keywords: ["email", "sequence", "follow up", "newsletter", "welcome"],
    title: "Email follow-up that sells without being pushy",
    answer:
      "A simple 5-email sequence outperforms clever campaigns: deliver the freebie, tell the story behind your offer, teach the #1 mistake and its fix, handle the biggest objection, then a clear last call. One idea per email, under 200 words, and every email links to the same offer page.",
    links: [{ label: "Lead-Magnet Generator includes a 5-email sequence", href: "/free-tools/lead-magnet-generator" }],
  },
  {
    keywords: ["landing page", "convert", "conversion", "not selling", "no sales", "traffic but"],
    title: "When traffic doesn't convert",
    answer:
      "Traffic without sales almost always means one of four things is missing: a specific promise in the headline, proof, a single clear call to action, or the objection handled. Audit the page against those four before blaming the traffic source.",
    links: [
      { label: "AI Funnel Auditor — score and fixes for your page", href: "/free-tools/funnel-auditor" },
    ],
  },
  {
    keywords: ["n8n", "automation", "workflow", "automate", "workflow automation"],
    title: "Getting started with n8n automation",
    answer:
      "Start with one repetitive task you do weekly — following up with leads, posting content, moving data between apps. Build it in n8n with a clear trigger, add an error path for when an app is down, and test with your own data before it touches anything customer-facing.",
    links: [
      { label: "The Lab — real automation walkthroughs", href: "/thelab" },
      { label: "Curriculum — the automation modules", href: "/curriculum" },
    ],
  },
  {
    keywords: ["pinterest", "traffic", "get visitors", "marketing channel", "free traffic"],
    title: "Pinterest as a traffic source",
    answer:
      "Pinterest is a search engine, not social media. Pins built around phrases people actually search, posted consistently 3–4 times a week, compound over months. Titles should read like the search query; descriptions should be full sentences with keywords woven in.",
    links: [{ label: "AI Prompt Customizer — Pinterest plan prompt", href: "/free-tools/prompt-customizer" }],
  },
  {
    keywords: ["ai tools", "which ai", "chatgpt or", "best tool", "tool stack", "what tools"],
    title: "Which AI tools to use",
    answer:
      "Use one assistant (ChatGPT or Claude) for thinking and drafting, one automation tool (n8n) for the repetitive work, and one builder (Lovable) for anything that needs to exist as a website or app. Learn the stack as a system, not as 20 separate tools.",
    links: [
      { label: "Our full tool stack and why we picked it", href: "/tools" },
      { label: "Curriculum — the tools module", href: "/curriculum" },
    ],
  },
  {
    keywords: ["time", "busy", "full-time job", "side hustle", "how long", "hours"],
    title: "Building this around a full-time job",
    answer:
      "Plan on 5 focused hours a week and protect them like meetings. One evening to outline, one to build, one to write the page, one to tell ten people. Consistency at 5 hours beats bursts at 20 — most people quit during the burst.",
    links: [{ label: "AI Time & Money Savings Calculator", href: "/free-tools/ai-savings-calculator" }],
  },
  {
    keywords: ["membership", "lab membership", "course", "what do i get", "subscription", "upgrade", "plan"],
    title: "What the Lab membership includes",
    answer:
      "The Lab teaches the systems behind the tools: 15 modules covering the full AI business stack, from your first product to working automations. Free members keep the free tools and starter lessons; paid tiers unlock the full course and premium builders.",
    links: [
      { label: "See the full curriculum", href: "/curriculum" },
      { label: "Compare membership tiers", href: "/pricing" },
    ],
  },
  {
    keywords: ["beginner", "begin", "new to", "no experience", "where do i start", "start here"],
    title: "Where to start as a beginner",
    answer:
      "Start with one free tool — the AI Readiness Scorecard shows where your time goes and what to automate first. Then read one guide, then build one small thing this week. One finished small thing beats a month of research.",
    links: [
      { label: "Start with the AI Readiness Scorecard", href: "/free-tools/ai-readiness-scorecard" },
      { label: "Free AI business guides", href: "/guides" },
    ],
  },
];

const STOP = new Set([
  "the", "a", "an", "is", "are", "to", "for", "of", "in", "on", "how", "what", "do", "i",
  "my", "can", "should", "with", "and", "or", "it", "be", "get", "you", "me", "about",
  "best", "good", "there", "this", "that", "from", "help", "need", "want",
]);

export type LabAnswer = {
  matched: boolean;
  title: string;
  answer: string;
  links: { label: string; href: string }[];
  alsoTry: string[];
};

export function askTheLab(question: string): LabAnswer {
  const q = question.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = q.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

  let best: { entry: Entry; score: number } | null = null;
  for (const entry of ENTRIES) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (kw.includes(" ")) {
        if (q.includes(kw)) score += 3;
      } else if (words.includes(kw)) {
        score += 2;
      } else if (words.some((w) => w.startsWith(kw.slice(0, 4)) && kw.length > 3)) {
        score += 1;
      }
    }
    if (!best || score > best.score) best = { entry, score };
  }

  if (best && best.score >= 2) {
    const related = ENTRIES.filter((e) => e !== best!.entry)
      .slice(0, 2)
      .map((e) => e.title);
    return {
      matched: true,
      title: best.entry.title,
      answer: best.entry.answer,
      links: best.entry.links,
      alsoTry: related,
    };
  }

  return {
    matched: false,
    title: "Here's where I'd start",
    answer:
      "I don't have a focused answer for that exact question yet, so here's the honest default: pick one small, specific outcome you want in the next 7 days, and use one tool or guide below to get it. If you rephrase your question around that outcome — pricing, prompts, lead magnets, automation — I can answer it directly.",
    links: LAB_LINKS,
    alsoTry: [
      "How do I price my first digital product?",
      "How do I write a better AI prompt?",
      "How do I get my first email subscribers?",
    ],
  };
}
