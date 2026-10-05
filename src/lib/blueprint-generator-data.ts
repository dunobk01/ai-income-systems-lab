/** Template engine for the AI Product Blueprint Generator. Deterministic, no AI call. */

export type BlueprintInput = {
  skills: string;
  hoursPerWeek: string;
  budget: string;
  platform: string;
  incomeGoal: string;
};

export type Opportunity = {
  name: string;
  description: string;
  priceRange: string;
  timeToFirstDollar: string;
  why: string;
};

export type Blueprint = {
  topic: string;
  opportunities: Opportunity[];
  recommended: Opportunity & { reasoning: string };
  sevenDayPlan: { day: string; task: string }[];
  outline: { heading: string; points: string[] }[];
  priceOffer: { price: string; offer: string };
  funnel: { stage: string; detail: string }[];
  launchContent: { type: string; text: string }[];
};

const STOP = new Set([
  "and", "the", "for", "with", "my", "me", "i", "a", "an", "of", "to", "in", "on", "at",
  "am", "is", "are", "good", "at", "like", "love", "enjoy", "years", "year", "some", "also",
]);

/** Pull the 2–3 most meaningful words out of the skills input to name products around. */
function topicFrom(skills: string): string {
  const words = skills
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  const uniq = Array.from(new Set(words));
  if (uniq.length === 0) return "your skills";
  return uniq.slice(0, 3).join(" ");
}

/** Title-case a topic for product names. */
function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

type Archetype = {
  key: string;
  keywords: string[];
  build: (topic: string, t: title) => Opportunity[];
};

type title = { title: (s: string) => string };

const archetypes: Archetype[] = [
  {
    key: "writing",
    keywords: ["writing", "copy", "blog", "content", "email", "newsletter", "story", "editing", "ghostwriting"],
    build: (topic) => [
      {
        name: `Prompt & Template Pack for ${titleCase(topic)}`,
        description: `A pack of 30–50 copy-paste templates (emails, posts, outlines) that ${topic} people would otherwise write from scratch.`,
        priceRange: "$17–$39",
        timeToFirstDollar: "3–7 days",
        why: "Templates are the fastest product to make from writing skills — you already produce this work daily.",
      },
      {
        name: `Swipe-File Vault: ${titleCase(topic)}`,
        description: `A curated, annotated collection of the best ${topic} examples, organized by situation so buyers can adapt them instantly.`,
        priceRange: "$9–$29",
        timeToFirstDollar: "2–5 days",
        why: "Swipe files are quick to assemble and sell well to beginners who want proven starting points.",
      },
      {
        name: `${titleCase(topic)} Mini-Course`,
        description: `A 5-lesson email course teaching one specific ${topic} skill, delivered over a week.`,
        priceRange: "$27–$67",
        timeToFirstDollar: "1–3 weeks",
        why: "Higher price point, but takes longer to build — a strong second product after the templates.",
      },
    ],
  },
  {
    key: "design",
    keywords: ["design", "canva", "graphic", "brand", "logo", "art", "illustration", "photo", "video", "social media"],
    build: (topic) => [
      {
        name: `${titleCase(topic)} Template Shop`,
        description: `A set of editable Canva-style templates (covers, carousels, posts) built around ${topic}, sold as instant downloads.`,
        priceRange: "$12–$49",
        timeToFirstDollar: "3–7 days",
        why: "You can produce the first batch in a weekend and sell the same files forever.",
      },
      {
        name: `${titleCase(topic)} Starter Brand Kit`,
        description: `A done-for-you brand kit: colors, fonts, cover images and post layouts for one niche.`,
        priceRange: "$29–$79",
        timeToFirstDollar: "1–2 weeks",
        why: "Bundles raise the average order value and feel like a complete solution.",
      },
      {
        name: `Custom ${titleCase(topic)} Sprint`,
        description: `A fixed-price, 5-day service where you deliver a small ${topic} package — productized so it's easy to buy.`,
        priceRange: "$150–$500",
        timeToFirstDollar: "1–2 weeks",
        why: "Services earn more per sale; productizing keeps your time bounded.",
      },
    ],
  },
  {
    key: "automation",
    keywords: ["automation", "n8n", "ai", "chatgpt", "coding", "code", "developer", "spreadsheet", "excel", "api", "data", "website", "web"],
    build: (topic) => [
      {
        name: `${titleCase(topic)} Automation Starter Kit`,
        description: `Import-ready workflows + a setup guide for the 5 automations every small business wants first.`,
        priceRange: "$19–$49",
        timeToFirstDollar: "3–7 days",
        why: "Build once, sell forever — and it proves your expertise better than any ad.",
      },
      {
        name: `Done-With-You ${titleCase(topic)} Setup`,
        description: `A paid session where you build the buyer's first ${topic} automation live, on a call, in 60–90 minutes.`,
        priceRange: "$99–$299",
        timeToFirstDollar: "1–2 weeks",
        why: "Fast cash while the kit sells in the background; buyers often upgrade to done-for-you.",
      },
      {
        name: `${titleCase(topic)} Systems Mini-Course`,
        description: `Six short lessons walking a beginner from zero to their first working ${topic} workflow.`,
        priceRange: "$49–$129",
        timeToFirstDollar: "2–4 weeks",
        why: "Course pricing fits the transformation, and lessons double as your marketing content.",
      },
    ],
  },
  {
    key: "teaching",
    keywords: ["teaching", "coach", "training", "tutor", "course", "teacher", "trainer", "fitness", "health", "finance", "money"],
    build: (topic) => [
      {
        name: `${titleCase(topic)} Quick-Win Workbook`,
        description: `A printable/interactive workbook that walks someone through their first ${topic} win in one sitting.`,
        priceRange: "$9–$29",
        timeToFirstDollar: "2–5 days",
        why: "Workbooks are fast to produce from teaching material and make perfect low-ticket entry products.",
      },
      {
        name: `${titleCase(topic)} 5-Day Email Challenge`,
        description: `A paid 5-day challenge: one short lesson and one action per day, delivered by email.`,
        priceRange: "$19–$49",
        timeToFirstDollar: "1–2 weeks",
        why: "Challenges convert well because buyers see progress in the first 48 hours.",
      },
      {
        name: `${titleCase(topic)} Group Sprint`,
        description: `A 2-week cohort where you teach ${topic} live once a week and answer questions between sessions.`,
        priceRange: "$99–$299",
        timeToFirstDollar: "3–4 weeks",
        why: "Highest price point — run it after the workbook fills your email list.",
      },
    ],
  },
];

const fallbackArchetype = (topic: string): Opportunity[] => [
  {
    name: `${titleCase(topic)} Checklist & Toolkit`,
    description: `A practical checklist plus the 5–10 templates someone needs to get a first result with ${topic}.`,
    priceRange: "$9–$29",
    timeToFirstDollar: "2–5 days",
    why: "The fastest credible product you can build from general skills — and it validates demand before you build more.",
  },
  {
    name: `${titleCase(topic)} Starter Guide`,
    description: `A focused 20–30 page guide that solves one narrow problem end to end, not a general overview.`,
    priceRange: "$17–$39",
    timeToFirstDollar: "1–2 weeks",
    why: "Short, specific guides sell better than broad ebooks and take a week or two to write.",
  },
  {
    name: `Done-With-You ${titleCase(topic)} Session`,
    description: `A fixed-price working session where you help one person set up or do the thing, step by step.`,
    priceRange: "$75–$250",
    timeToFirstDollar: "1–2 weeks",
    why: "Immediate revenue and raw material: every session teaches you what to productize next.",
  },
];

function pickArchetype(skills: string): Opportunity[] {
  const s = skills.toLowerCase();
  for (const a of archetypes) {
    if (a.keywords.some((k) => s.includes(k))) {
      return a.build(topicFrom(skills), { title: titleCase });
    }
  }
  return fallbackArchetype(topicFrom(skills));
}

const HOUR_PACE: Record<string, string> = {
  "under-5": "Keep each task to a single evening — this plan assumes roughly 4 focused hours a week.",
  "5-10": "This plan fits comfortably in a week with 5–10 focused hours.",
  "10-20": "With 10–20 hours a week you can move faster — treat each day as a half-day block.",
  "20-plus": "Full-time pace: you can compress the 7-day plan into 3–4 days if you stay off social media while building.",
};

const BUDGET_NOTE: Record<string, string> = {
  "0": "Budget: $0. Sell on Gumroad's free tier, post organically on Pinterest and one other channel, and let the product page do the selling.",
  "under-100": "Budget: under $100. Spend it on a domain and one month of an email tool; everything else stays free.",
  "100-500": "Budget: $100–$500. A small Pinterest-ads test ($5/day for two weeks) is the highest-leverage spend for a digital product.",
  "500-plus": "Budget: $500+. Cover organic first, then test $10/day on Pinterest and Facebook against the same landing page and keep the winner.",
};

const GOAL_LADDER: Record<string, { first: string; next: string }> = {
  "first-100": { first: "$27", next: "One $27 sale is the whole goal — then decide if you enjoy this before building more." },
  "1k-month": { first: "$47", next: "At $47 you need about 8 sales a month for $1k. Templates scale without more of your time." },
  "5k-month": { first: "$47 with a $199 upsell", next: "$5k needs either ~107 small sales or ~30 sales with a high-ticket back end. Build the $47 product first, add the upsell by month two." },
};

export function generateBlueprint(input: BlueprintInput): Blueprint {
  const topic = topicFrom(input.skills || "");
  const opportunities = pickArchetype(input.skills || topic);
  const recommended = opportunities[0];
  const goal = GOAL_LADDER[input.incomeGoal] ?? GOAL_LADDER["first-100"];
  const pace = HOUR_PACE[input.hoursPerWeek] ?? HOUR_PACE["5-10"];
  const budgetNote = BUDGET_NOTE[input.budget] ?? BUDGET_NOTE["0"];
  const T = titleCase(topic || "your skills");
  const pinPrice = (goal.first.split(" ")[0] || "$27").replace("$", "$");
  const platformNote: Record<string, string> = {
    gumroad: "Gumroad — simplest checkout, built-in affiliate system, no monthly fee.",
    stan: "Stan — one link in bio for the product, the emails and the booking call.",
    lovable: "Your own site (Lovable) — full control of the page and the data, connect Stripe checkout.",
    etsy: "Etsy — buyers are already searching for digital downloads; fees are the trade-off.",
    other: "Wherever your audience already is — a simple checkout beats a perfect one.",
  };

  return {
    topic,
    opportunities,
    recommended: {
      ...recommended,
      reasoning: `${recommended.why} ${pace}`,
    },
    sevenDayPlan: [
      { day: "Day 1", task: `Write the promise: finish the sentence "This helps ${topic} people go from X to Y in one sitting." Everything else hangs off this line.` },
      { day: "Day 2", task: `Outline ${recommended.name} on one page. Sections only — no writing yet.` },
      { day: "Day 3", task: "Build section 1 and 2. Done beats polished: ship the draft quality." },
      { day: "Day 4", task: "Build the remaining sections. Set a timer; no research rabbit holes." },
      { day: "Day 5", task: `Create the product page: promise headline, 5 bullet points, price (${goal.first}), and a "what's inside" list.` },
      { day: "Day 6", task: `Set up checkout on ${platformNote[input.platform] ?? platformNote.gumroad}` },
      { day: "Day 7", task: `Tell 10 people directly (email, DMs, one post). Ask for replies, not sales. ${budgetNote}` },
    ],
    outline: [
      {
        heading: "Part 1 — The Quick Win",
        points: [
          `What ${topic} result the buyer gets in the first 30 minutes`,
          "The exact steps, numbered, no background theory",
          "A fill-in template so they finish, not just read",
        ],
      },
      {
        heading: "Part 2 — The System",
        points: [
          `The repeatable version of Part 1 for ${topic}`,
          "The 3 mistakes that waste the most time (and the fix for each)",
          "A one-page cheat sheet of the whole system",
        ],
      },
      {
        heading: "Part 3 — Going Further",
        points: [
          "What to do in week 2 once the first result lands",
          "Where this fits into a bigger system (your natural upsell)",
          "Resources and tools worth their time — and what to skip",
        ],
      },
    ],
    priceOffer: {
      price: goal.first,
      offer: `${recommended.name} — ${goal.first}. Includes lifetime updates and a 14-day "do the work" refund policy. ${goal.next}`,
    },
    funnel: [
      { stage: "Free", detail: `A free checklist or mini version of the product, offered on Pinterest and one social channel, delivered by email.` },
      { stage: "Email 1–3", detail: "Deliver the freebie, then tell the story of why you built the paid product and what changed for you." },
      { stage: "Core offer", detail: `${recommended.name} at ${goal.first} — the email sequence points here, the page closes.` },
      { stage: "Back end", detail: "Buyers get a single, well-timed invitation to your next thing (course, membership or session)." },
    ],
    launchContent: [
      {
        type: "Pinterest pin title",
        text: `${T}: The ${pinPrice} Blueprint That Works While You Sleep`,
      },
      {
        type: "Launch post",
        text: `I kept doing the same ${topic} work over and over for free — so I turned it into ${recommended.name}. It's the exact system I wish someone had handed me: Part 1 gets you a result today, Part 2 makes it repeatable. ${goal.first}. Link below.`,
      },
      {
        type: "Email to your list",
        text: `Subject: I finally packaged it. — I built ${recommended.name} this week. It's the shortest path from "I want to try" to "done" for ${topic}. First 20 buyers get it at ${goal.first}. Reply and tell me what you're stuck on — I read everything.`,
      },
      {
        type: "Follow-up DM",
        text: `Hey — quick one: I just released ${recommended.name} (${goal.first}). It's built for people working on ${topic}. If it's not for you, no worries — but if you know someone who needs it, a share helps more than you know.`,
      },
    ],
  };
}
