/**
 * The free-tier lead magnet: "The 7-Day AI Income System Map".
 *
 * A real, self-contained plan a beginner can work through in a week. Every day
 * has one outcome, concrete steps, and a copy-paste prompt. Deliberately tool
 * agnostic where possible so it stays useful as tools change.
 */

export const FREE_KIT = {
  slug: "7-day-ai-income-system-map",
  name: "The 7-Day AI Income System Map",
  promise:
    "Seven days, about 45 minutes a day. You finish with one validated offer, one landing page, one automated follow-up, and a repeatable weekly operating rhythm.",
  outcomes: [
    "A specific audience and a problem you can actually name",
    "One offer you can deliver with AI in under a week",
    "A live landing page with an email capture that works",
    "An automated welcome + follow-up sequence",
    "A one-page weekly operating rhythm you can keep running",
  ],
  honesty:
    "This is a system-building plan, not an income guarantee. Nothing here promises a number. What it gives you is the sequence most beginners skip — and the reason most tool-first learners stall.",
} as const;

export type FreeKitDay = {
  day: number;
  title: string;
  outcome: string;
  minutes: number;
  tools: string[];
  steps: string[];
  prompt: { label: string; text: string };
  pitfall: string;
};

export const FREE_KIT_DAYS: FreeKitDay[] = [
  {
    day: 1,
    title: "Pick a problem, not a niche",
    outcome: "One sentence: who you help and what breaks for them.",
    minutes: 40,
    tools: ["ChatGPT or Claude", "A notes app"],
    steps: [
      "List the last 10 things people asked you for help with — work, hobbies, side projects, group chats.",
      "Circle any that cost the other person money, time, or embarrassment. Those are payable problems.",
      "Write one sentence: “I help [specific person] stop [specific painful thing] so they can [specific result].”",
      "Say it out loud to one real person and note where they look confused. Rewrite until they don't.",
    ],
    prompt: {
      label: "Problem sharpener",
      text: "Act as a blunt positioning strategist. Here are 10 things people have asked me for help with: [PASTE LIST]. For each, tell me (1) who the buyer actually is, (2) what it costs them today in money or hours, (3) how urgent it is on a 1-5 scale, and (4) whether AI meaningfully reduces the delivery cost. Then rank all 10 and tell me the single best starting problem and why the others lose. Be specific and do not flatter me.",
    },
    pitfall:
      "Choosing a niche (“fitness coaches”) instead of a problem (“fitness coaches lose leads because nobody follows up within 24 hours”). Niches don't buy; problems do.",
  },
  {
    day: 2,
    title: "Validate before you build",
    outcome: "Five real signals that the problem is worth solving.",
    minutes: 45,
    tools: ["Perplexity", "Reddit / niche forums", "ChatGPT"],
    steps: [
      "Search the exact words your buyer would use — not industry jargon. Collect 15 real quotes from forums, reviews, or comments.",
      "Note what people currently pay for to solve it (a tool, a VA, an agency, their own weekends).",
      "Find 3 existing paid solutions. Read their 1- and 2-star reviews; that's your opening.",
      "Message 5 real people with a single question: “How are you handling [problem] right now?” No pitch.",
    ],
    prompt: {
      label: "Demand evidence scan",
      text: "You are a research analyst. Problem statement: [PASTE YOUR DAY 1 SENTENCE]. Find and summarise the evidence that people already pay to solve this: existing products, typical price points, and the recurring complaints in their negative reviews. Present it as a table with columns: Solution, Price, What buyers love, What buyers complain about, Gap I could fill. Cite sources. If the evidence is weak, say so plainly and tell me what that means.",
    },
    pitfall:
      "Treating enthusiasm as validation. “That sounds cool” is not evidence. Someone already spending money is.",
  },
  {
    day: 3,
    title: "Design the smallest deliverable offer",
    outcome: "One offer you can deliver in under a week with AI doing the heavy lifting.",
    minutes: 45,
    tools: ["ChatGPT or Claude", "Google Docs / Notion"],
    steps: [
      "Write the outcome your buyer gets, in their words, with a timeframe.",
      "List every step required to deliver it. Mark each step: AI does it, you do it, or delete it.",
      "Delete anything that isn't required for the outcome. This is where most first offers die — too much scope.",
      "Set a price you'd feel slightly uncomfortable saying out loud. That's usually close to right for a first offer.",
    ],
    prompt: {
      label: "Offer compressor",
      text: "Act as a product strategist for solo operators. My buyer: [WHO]. Their problem: [PROBLEM]. My rough offer idea: [IDEA]. Break the delivery into every discrete step. For each step, label it AI-AUTOMATABLE, HUMAN-REQUIRED, or CUT. Then rebuild the offer as the smallest version that still delivers the full outcome, and estimate my real delivery hours per customer. Flag anything that would not scale past 10 customers.",
    },
    pitfall:
      "Building a course, membership, or platform first. Sell the outcome manually a few times before you productise it.",
  },
  {
    day: 4,
    title: "Ship one page that converts",
    outcome: "A live page with a headline, proof of the mechanism, and one email capture.",
    minutes: 50,
    tools: ["Lovable", "ChatGPT"],
    steps: [
      "Headline = the outcome + the timeframe. Subhead = who it's for and what makes it different.",
      "Show the mechanism: three steps of how it works. People buy systems they can picture.",
      "One call to action, repeated. Not four competing ones.",
      "Only claim what's true. No fake counts, no invented testimonials — they cost you more than they earn.",
    ],
    prompt: {
      label: "Landing page brief",
      text: "Write a landing page brief for this offer: [OFFER]. Audience: [WHO]. Outcome: [OUTCOME]. Price: [PRICE]. Give me: 5 headline options, 3 subheads, a 3-step 'how it works' section, an objection-handling FAQ of 5 questions drawn from real buyer doubts, and one CTA repeated in 3 placements. Constraint: I have zero testimonials and no results to cite yet, so every line must be credible without social proof. No hype words.",
    },
    pitfall:
      "Perfecting design before the words work. Test the message on a plain page first; make it pretty after someone converts.",
  },
  {
    day: 5,
    title: "Automate the follow-up",
    outcome: "A welcome email plus a 3-email sequence that runs without you.",
    minutes: 45,
    tools: ["MailerLite or your email tool", "n8n", "ChatGPT"],
    steps: [
      "Connect your page's form to your email tool. Test it with your own address end to end.",
      "Write a welcome email that delivers something useful immediately — not just “thanks for subscribing”.",
      "Add three follow-ups: the problem in depth, the mechanism, then the offer.",
      "Use n8n to notify you in Slack or email whenever a new lead arrives, so you can reply personally in the first week.",
    ],
    prompt: {
      label: "Sequence writer",
      text: "Write a 4-email welcome sequence for people who opt in to [LEAD MAGNET] and may later buy [OFFER]. Email 1 delivers the resource and sets expectations. Email 2 goes deep on the problem using this evidence: [PASTE DAY 2 QUOTES]. Email 3 explains my mechanism in 3 steps. Email 4 makes the offer with a clear, low-pressure CTA. Rules: no fake urgency, no income claims, plain language, under 250 words each, one idea per email. Give subject lines with a second option for each.",
    },
    pitfall:
      "Automating before anyone is in the list. Build the sequence, but keep answering the first 20 people by hand — that's where your real copy comes from.",
  },
  {
    day: 6,
    title: "Build one distribution habit",
    outcome: "A single channel you'll actually post to three times a week.",
    minutes: 40,
    tools: ["ChatGPT", "Your one chosen platform"],
    steps: [
      "Pick one channel where your buyer already is. One. Not four.",
      "Turn your Day 2 research into 12 content ideas — every real quote is a post.",
      "Batch three posts now. Publishing beats planning.",
      "Add one line to every post that points to your page. Distribution without a destination is a hobby.",
    ],
    prompt: {
      label: "Content engine",
      text: "Here are 15 real quotes from my target buyers: [PASTE]. Turn them into 12 post ideas for [PLATFORM], each framed as a specific problem and a specific insight — not generic advice. For each, give the hook line, the core point, and a soft CTA to my page about [OFFER]. Avoid buzzwords, avoid listicles that say nothing, and never invent statistics or results.",
    },
    pitfall:
      "Spreading across five platforms in week one. One channel, three months, then judge it.",
  },
  {
    day: 7,
    title: "Lock in the weekly operating rhythm",
    outcome: "A one-page routine that keeps the system running when motivation drops.",
    minutes: 30,
    tools: ["Notion or a plain doc"],
    steps: [
      "Write down four recurring blocks: create (2h), distribute (2h), talk to buyers (1h), improve the system (1h).",
      "Pick the one metric that matters this month — usually new qualified leads, not followers.",
      "Schedule a 20-minute Friday review: what worked, what broke, what to automate next.",
      "Choose the next single automation to add. One per month is faster than ten at once.",
    ],
    prompt: {
      label: "Operating rhythm builder",
      text: "I have [X hours] per week outside my main commitments. My system so far: offer [OFFER], page [URL], email sequence live, posting on [PLATFORM]. Build me a realistic weekly schedule with named blocks, the single metric I should track this month, and a Friday review checklist of 6 questions. Then tell me the one automation that would save me the most time next, and why the alternatives are lower priority.",
    },
    pitfall:
      "Restarting from scratch every time results are slow. The rhythm is the asset; the first offer rarely is.",
  },
];

export const FREE_KIT_FAQS = [
  {
    q: "Is this really free?",
    a: "Yes. The 7-day map is free and stays free. Creating an account is also free and permanent — no card, no trial clock.",
  },
  {
    q: "Do I need paid AI tools to do this?",
    a: "No. Every day can be completed on free tiers of ChatGPT or Claude plus a free email tool. Paid tools make it faster, not possible.",
  },
  {
    q: "How much will I earn?",
    a: "We don't make income claims and you should be sceptical of anyone who does. This plan builds the system; results depend on your market, your offer, and how consistently you run it.",
  },
  {
    q: "What happens after day 7?",
    a: "You'll have a working system and a clear list of what to improve. Your free account keeps Module 1 of the full course, the tool guides, and sample prompts open forever — upgrade only if you want the rest.",
  },
  {
    q: "Will you spam me?",
    a: "No. You get the plan, a short follow-up sequence, and the weekly newsletter. One-click unsubscribe on every email.",
  },
];
