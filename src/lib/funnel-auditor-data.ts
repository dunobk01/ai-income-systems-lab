/** Template engine for the AI Funnel Auditor. Deterministic, no AI call. */

export type FunnelInput = {
  offer: string;
  audience: string;
  price: string;
  pageText: string;
};

export type FunnelAudit = {
  score: number;
  grade: string;
  checks: { label: string; pass: boolean; tip: string }[];
  missingInfo: string[];
  weakHeadlines: string[];
  objections: { objection: string; response: string }[];
  improvedOffer: string;
  revisedSections: { section: string; example: string }[];
  emailSequence: { subject: string; purpose: string }[];
  nextActions: string[];
};

const clean = (s: string) => s.trim();
const hasAny = (text: string, needles: string[]) => needles.some((n) => text.includes(n));

export function auditFunnel(input: FunnelInput): FunnelAudit {
  const offer = clean(input.offer) || "your offer";
  const audience = clean(input.audience) || "your audience";
  const price = clean(input.price) || "";
  const text = input.pageText.toLowerCase();
  const rawSentences = input.pageText
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const firstLines = input.pageText
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const checks = [
    {
      label: "Clear audience callout",
      pass: hasAny(text, [audience.toLowerCase().split(/\s+/)[0]].filter(Boolean)) || firstLines[0]?.toLowerCase().includes(audience.toLowerCase().split(/\s+/)[0] || "") || false,
      tip: `The opening of the page should name ${audience} in the first two sentences — visitors decide in seconds whether this is for them.`,
    },
    {
      label: "Specific outcome promised",
      pass: /\d/.test(text) && hasAny(text, ["in ", "days", "minutes", "hours", "week", "month", "%"]),
      tip: "Add a specific, believable outcome with a number and a timeframe to the headline or first paragraph.",
    },
    {
      label: "Proof included",
      pass: hasAny(text, ["said", "review", "testimonial", "result", "used this", "client", "student", "member"]),
      tip: "Add one real quote or result — even from a beta tester. No proof reads as no risk taken by you.",
    },
    {
      label: "Objection handled",
      pass: hasAny(text, ["refund", "guarantee", "if you", "what if", "faq", "questions"]),
      tip: "Answer the biggest doubt on the page — usually 'will this work for me?' or 'what if it doesn't work?' — with a guarantee or an FAQ block.",
    },
    {
      label: "Single clear call to action",
      pass: hasAny(text, ["get ", "start ", "buy ", "join ", "download ", "book ", "claim "]),
      tip: "Use one primary CTA repeated 2–3 times, always the same wording. Multiple different CTAs split the decision.",
    },
    {
      label: "Price anchored",
      pass: price !== "" || hasAny(text, ["$", "price", "worth", "value"]),
      tip: "State the price or anchor its value. Hiding the price adds friction at the exact moment trust is highest.",
    },
    {
      label: "Urgency without fake scarcity",
      pass: hasAny(text, ["this week", "deadline", "closing", "ends", "bonus ends", "enrollment", "limited to"]) || false,
      tip: "If there is a real reason to act now (a bonus that ends, a cohort starting), say it plainly. Never invent fake countdowns.",
    },
    {
      label: "Enough substance to decide",
      pass: input.pageText.trim().length > 400,
      tip: "The page is thin — aim for at least a headline, a story paragraph, 5 benefit bullets, proof, an objection section and the CTA.",
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  const grade = score >= 85 ? "Strong" : score >= 60 ? "Needs work" : "Losing buyers";

  const missingInfo = [
    !checks[1].pass && "A specific outcome: what changes for the buyer, in what timeframe",
    !checks[2].pass && "Proof: one real quote, screenshot or result",
    !checks[3].pass && "Objection handling: a guarantee, FAQ, or 'who this is NOT for' section",
    !checks[5].pass && "The price or value anchor — do not make people ask",
    !checks[7].pass && "What's actually included: a concrete list of deliverables",
  ].filter(Boolean) as string[];

  const weakHeadlines = firstLines
    .slice(0, 3)
    .filter((l) => {
      const low = l.toLowerCase();
      return (
        l.length < 25 ||
        hasAny(low, ["welcome", "home", "hi", "hello", "about us", "we are", "our story"]) ||
        (!/\d/.test(low) && low.split(/\s+/).length < 5)
      );
    })
    .map((l) => l.slice(0, 80));

  const objections = [
    {
      objection: "Will this actually work for me?",
      response: `Show someone like ${audience} getting the result. One specific before/after beats ten generic claims.`,
    },
    {
      objection: `Is it worth ${price || "the price"}?`,
      response: `Anchor to the alternative: the hours ${audience} would spend doing this by hand, or what solving this poorly already costs them.`,
    },
    {
      objection: "What if it doesn't work?",
      response: "Add a plain-language guarantee: a refund window with one condition — 'do the work, tell me it didn't help, full refund.'",
    },
    {
      objection: "I don't have time for this",
      response: "State the real time cost: 'Set it up in one 45-minute sitting, then it runs.' Vague time promises create hesitation.",
    },
  ];

  const improvedOffer = `${offer} — rewritten as a promise: "${audience.replace(/^(the )?/i, "")} get [SPECIFIC RESULT] in [TIMEFRAME] without [THE THING THEY HATE]." Fill the brackets with your specifics. If your current offer can't be written that way, the funnel isn't the problem — the offer framing is.`;

  const revisedSections = [
    {
      section: "Headline",
      example: `How ${audience.replace(/^(the )?/i, "")} get [specific result] in [timeframe] — without [common frustration]`,
    },
    {
      section: "Subheadline",
      example: `Same process, minus the guesswork: [offer name] walks you through it step by step.`,
    },
    {
      section: "Benefit bullets",
      example: "Five bullets, each one outcome-focused: 'You'll finish this page knowing X' — not feature lists.",
    },
    {
      section: "Proof block",
      example: "One quote with a name and a specific detail. If you have no customers yet, use your own before/after.",
    },
    {
      section: "Objection + guarantee",
      example: "A 3-question FAQ answering the three doubts above, then your guarantee in one sentence.",
    },
    {
      section: "Call to action",
      example: `${price ? `One button: "Get ${offer} — ${price}"` : `One button: "Get ${offer}"`} — repeated at the top, middle and end, same words every time.`,
    },
  ];

  const emailSequence = [
    { subject: `The ${offer.split(":")[0].slice(0, 40)} page is live`, purpose: "Announce plainly: what it is, who it's for, one link." },
    { subject: "The question I keep getting", purpose: "Answer the #1 objection in the buyer's words, then link." },
    { subject: "What most people miss", purpose: "Teach one useful thing related to the offer — generosity builds the trust that sells." },
    { subject: "One specific result", purpose: "Tell one real (or your own) before/after story tied to the offer." },
    { subject: "Closing this at [time]", purpose: "Honest last call with the real deadline and the single link." },
  ];

  const failedTips = checks.filter((c) => !c.pass).slice(0, 3).map((c) => c.tip);
  const nextActions = [
    ...failedTips,
    `Read your page out loud as ${audience.replace(/^(the )?/i, "a")} — wherever you'd naturally say "so what?", rewrite that line.`,
  ].slice(0, 4);

  return {
    score,
    grade,
    checks,
    missingInfo: missingInfo.length ? missingInfo : ["Nothing major missing — now split-test the headline."],
    weakHeadlines: weakHeadlines.length ? weakHeadlines : ["No obvious weak openers detected — test a version with a number and a timeframe in the headline."],
    objections,
    improvedOffer,
    revisedSections,
    emailSequence,
    nextActions,
  };
}
