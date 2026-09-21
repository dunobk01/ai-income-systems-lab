/**
 * AI Readiness Scorecard — questions, weights, and scoring.
 *
 * Every question is worth up to 10 points, so a full run scores 0–100.
 * Scoring is deliberately client-side: the instant result must appear with
 * no signup and no network round-trip.
 */

export type Option = {
  value: string;
  label: string;
  /** 0 (most manual) → 10 (already automated). */
  points: number;
};

export type Question = {
  id: string;
  /** Short key used in the opportunity engine. */
  area: string;
  question: string;
  options: Option[];
  /** Copy used when this area is the biggest gap. */
  opportunity: {
    title: string;
    detail: string;
    /** Estimated hours/week saved when this is automated. */
    hours: number;
  };
};

export const BUSINESS_TYPES = [
  { value: "local-service", label: "Local service (plumber, salon, contractor)" },
  { value: "real-estate", label: "Real estate" },
  { value: "restaurant-retail", label: "Restaurant / retail" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "coach-agency", label: "Coach, consultant or agency" },
  { value: "creator", label: "Creator" },
  { value: "other", label: "Other" },
] as const;

export const TEAM_SIZES = [
  { value: "solo", label: "Just me" },
  { value: "2-5", label: "2–5" },
  { value: "6-20", label: "6–20" },
  { value: "20+", label: "20+" },
] as const;

export const QUESTIONS: Question[] = [
  {
    id: "leads",
    area: "Lead intake",
    question: "How do new leads usually reach you?",
    options: [
      { value: "scattered", label: "Everywhere — calls, DMs, texts, email. Nothing is tracked.", points: 0 },
      { value: "inbox", label: "Mostly one inbox or phone, tracked in my head", points: 3 },
      { value: "spreadsheet", label: "A form or spreadsheet I check manually", points: 6 },
      { value: "crm", label: "A CRM or pipeline that captures them automatically", points: 10 },
    ],
    opportunity: {
      title: "Put every lead in one automated intake",
      detail: "One form that routes to a single pipeline, so nothing lives in a phone or a sticky note.",
      hours: 3,
    },
  },
  {
    id: "response",
    area: "Response speed",
    question: "How fast does a new enquiry get a first reply?",
    options: [
      { value: "days", label: "Sometimes a couple of days — if I catch it", points: 0 },
      { value: "same-day", label: "Same day, when I get a gap", points: 4 },
      { value: "hour", label: "Usually within an hour during work hours", points: 7 },
      { value: "instant", label: "Instantly — an automation replies for me", points: 10 },
    ],
    opportunity: {
      title: "Automate the first reply",
      detail: "An instant, useful acknowledgement with next steps beats a perfect reply three days later.",
      hours: 4,
    },
  },
  {
    id: "followup",
    area: "Follow-up",
    question: "What happens to a lead who doesn't buy right away?",
    options: [
      { value: "nothing", label: "Honestly? Nothing.", points: 0 },
      { value: "memory", label: "I follow up when I remember", points: 3 },
      { value: "manual-list", label: "I work a list manually every week", points: 6 },
      { value: "sequence", label: "An automated sequence follows up for me", points: 10 },
    ],
    opportunity: {
      title: "Build a 5-touch follow-up sequence",
      detail: "Most quotes go cold from silence, not from price. A sequence removes the remembering.",
      hours: 3,
    },
  },
  {
    id: "content",
    area: "Content & social",
    question: "How does content or social posting get done?",
    options: [
      { value: "never", label: "It doesn't. I keep meaning to.", points: 0 },
      { value: "sporadic", label: "Whenever inspiration hits", points: 3 },
      { value: "manual-batch", label: "I batch it manually once or twice a month", points: 6 },
      { value: "system", label: "A repeatable system drafts and schedules it", points: 10 },
    ],
    opportunity: {
      title: "Run a content repurposing pipeline",
      detail: "One source piece a week, split automatically into posts for each channel.",
      hours: 4,
    },
  },
  {
    id: "reviews",
    area: "Reviews & reputation",
    question: "How do you collect and respond to reviews?",
    options: [
      { value: "none", label: "We don't ask, and replies are hit or miss", points: 0 },
      { value: "sometimes", label: "I ask when I remember", points: 3 },
      { value: "manual", label: "I ask every customer manually", points: 6 },
      { value: "automated", label: "Requests and reply drafts are automated", points: 10 },
    ],
    opportunity: {
      title: "Automate review requests and reply drafts",
      detail: "A timed request after each job, plus drafted replies you approve in seconds.",
      hours: 2,
    },
  },
  {
    id: "scheduling",
    area: "Scheduling & booking",
    question: "How do appointments or jobs get booked?",
    options: [
      { value: "phone-tag", label: "Phone tag and back-and-forth messages", points: 0 },
      { value: "manual-calendar", label: "I type them into a calendar myself", points: 4 },
      { value: "link", label: "A booking link most people use", points: 7 },
      { value: "full", label: "Self-serve booking with automatic reminders", points: 10 },
    ],
    opportunity: {
      title: "Move to self-serve booking with reminders",
      detail: "Kills phone tag and cuts no-shows without another person on the phone.",
      hours: 3,
    },
  },
  {
    id: "admin",
    area: "Invoicing & admin",
    question: "How much of invoicing, quoting and admin is manual?",
    options: [
      { value: "all", label: "All of it, mostly at night", points: 0 },
      { value: "most", label: "Most of it — templates help a bit", points: 4 },
      { value: "some", label: "Some of it is automated", points: 7 },
      { value: "little", label: "Quotes, invoices and chasing mostly run themselves", points: 10 },
    ],
    opportunity: {
      title: "Template and automate quotes, invoices and chasing",
      detail: "Generate the document from the job record, then let the reminders run on their own.",
      hours: 4,
    },
  },
  {
    id: "faqs",
    area: "Answering customer questions",
    question: "How often do you answer the same customer questions?",
    options: [
      { value: "constantly", label: "Constantly — the same ten questions all day", points: 0 },
      { value: "often", label: "Often, and it interrupts real work", points: 3 },
      { value: "faq-page", label: "We have an FAQ page that handles some", points: 6 },
      { value: "assistant", label: "An assistant or chatbot handles them", points: 10 },
    ],
    opportunity: {
      title: "Put a trained assistant on your repeat questions",
      detail: "A chatbot fed with your real answers handles the top ten questions and hands off the rest.",
      hours: 5,
    },
  },
  {
    id: "ai-usage",
    area: "Current AI usage",
    question: "How are you using AI tools today?",
    options: [
      { value: "none", label: "Not at all yet", points: 0 },
      { value: "curious", label: "I've poked at ChatGPT a few times", points: 3 },
      { value: "regular", label: "I use it regularly for writing or research", points: 7 },
      { value: "workflows", label: "It's wired into workflows that run without me", points: 10 },
    ],
    opportunity: {
      title: "Turn one AI habit into one saved workflow",
      detail: "Pick the task you already ask AI for and make it a repeatable, documented step.",
      hours: 2,
    },
  },
  {
    id: "timesink",
    area: "Biggest time sink",
    question: "What eats the most time in a normal week?",
    options: [
      { value: "chasing", label: "Chasing leads and quotes", points: 2 },
      { value: "messaging", label: "Answering messages and calls", points: 2 },
      { value: "admin", label: "Admin, invoicing and scheduling", points: 2 },
      { value: "marketing", label: "Marketing and content", points: 2 },
      { value: "delivery", label: "Actually delivering the work", points: 8 },
    ],
    opportunity: {
      title: "Attack your stated time sink first",
      detail: "You already know where the hours go — that's the first thing to systemise.",
      hours: 3,
    },
  },
];

export const MAX_SCORE = QUESTIONS.length * 10;

export type Tier = {
  key: "manual" | "curious" | "integrated";
  label: string;
  blurb: string;
  cta: { label: string; tier: string };
};

export function tierFor(score: number): Tier {
  if (score < 40) {
    return {
      key: "manual",
      label: "Running on caffeine and sticky notes",
      blurb:
        "Nothing is broken — it's just all running through you. That's the most fixable position to be in, because the first two automations usually give back a whole evening a week.",
      cta: { label: "Start with the Starter tier", tier: "starter" },
    };
  }
  if (score < 70) {
    return {
      key: "curious",
      label: "AI-curious",
      blurb:
        "You've got pieces working and you're already using AI in places. The gap is glue: the handoffs between tools are still manual, so the system stops when you do.",
      cta: { label: "Wire it together with Builder", tier: "builder" },
    };
  }
  return {
    key: "integrated",
    label: "AI-integrated",
    blurb:
      "Most of your operation already runs on rails. The remaining leverage is in customer-facing automation — the part that answers, qualifies and books while you sleep.",
    cta: { label: "Go deeper with Accelerator", tier: "accelerator" },
  };
}

export type Answers = Record<string, string>;

export function scoreFor(answers: Answers): number {
  let total = 0;
  for (const q of QUESTIONS) {
    const chosen = q.options.find((o) => o.value === answers[q.id]);
    total += chosen?.points ?? 0;
  }
  return Math.round((total / MAX_SCORE) * 100);
}

/** The single biggest opportunity: the lowest-scoring answered area. */
export function topOpportunity(answers: Answers) {
  const scored = QUESTIONS.filter((q) => answers[q.id] !== undefined && q.id !== "timesink").map((q) => ({
    q,
    points: q.options.find((o) => o.value === answers[q.id])?.points ?? 0,
  }));
  if (!scored.length) return null;
  scored.sort((a, b) => a.points - b.points);
  const winner = scored[0]!.q;
  return { area: winner.area, ...winner.opportunity };
}

/** Which paid tier the end CTA should point at. */
export function ctaTierFor(score: number, answers: Answers): "starter" | "builder" | "accelerator" {
  if (answers["faqs"] === "constantly" || answers["faqs"] === "often" || answers["timesink"] === "messaging") {
    return "accelerator";
  }
  if (score >= 70) return "accelerator";
  if (score >= 40) return "builder";
  return "starter";
}
