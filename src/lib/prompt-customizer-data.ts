/** Template engine for the AI Prompt Customizer. Deterministic, no AI call. */

export type Question = { key: string; label: string; placeholder: string };

export type Category = {
  value: string;
  label: string;
  questions: Question[];
  build: (a: Record<string, string>, taskLabel: string) => string;
};

const ROLE_LINE = "You are a senior specialist with 15+ years of hands-on experience.";

export const CUSTOMIZER_CATEGORIES: Category[] = [
  {
    value: "digital-product",
    label: "Digital-product creation",
    questions: [
      { key: "product", label: "What product are you creating?", placeholder: "e.g. a Notion template for freelancers" },
      { key: "audience", label: "Who is it for?", placeholder: "e.g. freelancers who bill by the hour" },
      { key: "outcome", label: "What result should buyers get?", placeholder: "e.g. raise their prices with confidence" },
    ],
    build: (a, task) => `${ROLE_LINE}

# Context
I am creating a digital product: ${a.product || "[your product]"}.
Target buyer: ${a.audience || "[your audience]"}.
The result the buyer should get: ${a.outcome || "[the outcome]"}.
The specific task for this prompt: ${task}.

# Task
${task === "outline" ? "Produce a complete product outline: sections in order, what each section delivers, and the fastest possible first win for the buyer inside the first 10 minutes of using it." : "Complete the task above in full detail, as production-ready output I can use as-is."}

# Constraints
- Write for a beginner who has never used a product like this.
- No filler, no motivation talk — every paragraph must move the buyer toward the result.
- Make every instruction concrete: exact steps, exact wording, exact examples.
- If a section would need information you don't have, insert a clearly marked [FILL IN: ...] placeholder instead of inventing facts.

# Output format
- Markdown with clear section headings.
- Start with a 3-bullet summary of what the output contains.
- End with a short "Next step for the creator" list (3 items).`,
  },
  {
    value: "website",
    label: "Website building",
    questions: [
      { key: "site", label: "What is the website for?", placeholder: "e.g. a landing page for my bookkeeping service" },
      { key: "visitor", label: "Who visits it and why?", placeholder: "e.g. small business owners who hate doing books" },
      { key: "action", label: "What should visitors do?", placeholder: "e.g. book a free 15-minute call" },
    ],
    build: (a, task) => `${ROLE_LINE}

# Context
Website: ${a.site || "[your site]"}.
Visitor: ${a.visitor || "[your visitor]"} — they arrive skeptical, skim, and leave fast.
The one action the page must drive: ${a.action || "[the action]"}.
Task for this prompt: ${task}.

# Task
${task === "copy" ? "Write the full page copy in this order: headline, subheadline, 3 benefit blocks (each: benefit headline + 2 sentences + proof point), objection-handling FAQ (5 questions), and the primary call to action." : "Complete the task above in full detail."}

# Constraints
- Sixth-grade reading level; short sentences; zero jargon.
- Every claim must be specific (numbers, timeframes, outcomes) — no "high quality" or "trusted partner" phrasing.
- Address the visitor's biggest doubt explicitly at least twice.
- Use [FILL IN: ...] placeholders for facts only I know (prices, names, results).

# Output format
- Markdown, sections clearly labeled.
- After the copy, add a 3-bullet "Why this copy should convert" rationale.`,
  },
  {
    value: "pinterest",
    label: "Pinterest marketing",
    questions: [
      { key: "niche", label: "What niche / business?", placeholder: "e.g. home organization printables" },
      { key: "goal", label: "What's the goal — traffic, email signups, sales?", placeholder: "e.g. email signups for my free checklist" },
      { key: "board", label: "Any boards or keywords you already target?", placeholder: "e.g. small space organization" },
    ],
    build: (a, task) => `${ROLE_LINE}

# Context
Business: ${a.niche || "[your niche]"}.
Goal: ${a.goal || "[your goal]"}.
Existing keywords/boards: ${a.board || "[none yet]"}.
Task: ${task}.

# Task
${task === "pin-plan" ? "Create a 2-week Pinterest plan: 10 pin concepts (each: pin title under 100 chars, description under 500 chars with 2–3 natural keywords, text-overlay idea, board to post it to), scheduled 3–4 pins per week." : "Complete the task above in full detail."}

# Constraints
- Titles must read like search queries a real person would type, not clickbait.
- Descriptions must be full sentences with keywords woven in — never keyword lists.
- No engagement-bait ("follow me", "comment below").
- Use [FILL IN: ...] for anything only I know.

# Output format
- Markdown table for the pin concepts: Title | Description | Overlay text | Board.
- End with 3 tips specific to this niche.`,
  },
  {
    value: "email-funnels",
    label: "Email funnels",
    questions: [
      { key: "offer", label: "What are you selling?", placeholder: "e.g. a $27 meal-planning toolkit" },
      { key: "audience", label: "Who receives the emails?", placeholder: "e.g. busy moms who subscribed for a free recipe pack" },
      { key: "freebie", label: "What free thing did they sign up for?", placeholder: "e.g. 5 quick dinners guide" },
    ],
    build: (a, task) => `${ROLE_LINE}

# Context
Offer: ${a.offer || "[your offer]"}.
Subscribers: ${a.audience || "[your audience]"} — they joined by downloading: ${a.freebie || "[your freebie]"}.
Task: ${task}.

# Task
${task === "sequence" ? "Write a 5-email sequence that turns the freebie into the sale: (1) deliver + set expectations, (2) the story behind the offer, (3) the #1 mistake and the fix, (4) social proof + objection handling, (5) last call with a clear deadline. For each email: subject line, preview text, body under 200 words, one CTA." : "Complete the task above in full detail."}

# Constraints
- One idea per email; if it needs a second idea, it's a different email.
- Write like a helpful person, not a brand — contractions, short paragraphs, no corporate voice.
- Never invent testimonials or numbers; use [FILL IN: ...] for proof points.
- Every CTA links to the same offer page.

# Output format
- One section per email, clearly numbered.
- End with a short send schedule (which day each email goes out).`,
  },
  {
    value: "n8n",
    label: "n8n workflows",
    questions: [
      { key: "process", label: "What process do you want to automate?", placeholder: "e.g. new leads get a follow-up text and a CRM row" },
      { key: "tools", label: "Which apps/services are involved?", placeholder: "e.g. Google Sheets, Gmail, Twilio" },
      { key: "trigger", label: "What should start the workflow?", placeholder: "e.g. a form submission" },
    ],
    build: (a, task) => `${ROLE_LINE}

# Context
Process to automate: ${a.process || "[your process]"}.
Apps involved: ${a.tools || "[your apps]"}.
Trigger: ${a.trigger || "[the trigger]"}.
Task: ${task}.

# Task
${task === "workflow" ? "Design the n8n workflow: list each node in order (trigger, actions, logic, error handling), what connects to what, the configuration for each node in plain language, and how to test it safely before it runs for real. Include one failure case per node and what should happen then." : "Complete the task above in full detail."}

# Constraints
- Assume I can follow along but am not a developer — explain node settings in plain language.
- Always include an error path: what happens if an app is down or returns bad data.
- Never send customer-facing messages without a test/dry-run step.
- Use [FILL IN: ...] for credentials and account-specific values.

# Output format
- Numbered node list, then setup notes per node, then a test checklist.`,
  },
  {
    value: "social",
    label: "Social-media content",
    questions: [
      { key: "platform", label: "Which platform?", placeholder: "e.g. Instagram, TikTok, LinkedIn" },
      { key: "about", label: "What's the account about?", placeholder: "e.g. AI tools for real estate agents" },
      { key: "voice", label: "Describe your voice in 3 words", placeholder: "e.g. direct, warm, practical" },
    ],
    build: (a, task) => `${ROLE_LINE}

# Context
Platform: ${a.platform || "[platform]"}.
Account topic: ${a.about || "[topic]"}.
Voice: ${a.voice || "[voice]"}.
Task: ${task}.

# Task
${task === "content" ? "Write 7 posts for one week: 4 value posts (one specific tip each), 2 story posts (personal, ties into the topic), 1 offer post. Each post: hook (first line), body, and a natural CTA." : "Complete the task above in full detail."}

# Constraints
- The first line must stop the scroll — no "Hey everyone" openings.
- One idea per post; cut anything that doesn't serve it.
- Match the voice: ${a.voice || "[your voice]"} — in every sentence.
- No hashtags spam: max 3, only where they'd be searched.

# Output format
- Day label, post type, then the post text ready to paste.
- End with a 3-bullet note on what to measure this week.`,
  },
  {
    value: "airbnb",
    label: "Airbnb marketing",
    questions: [
      { key: "property", label: "Describe the property in one line", placeholder: "e.g. 2-bed cabin 10 min from Zion" },
      { key: "guest", label: "Who is the ideal guest?", placeholder: "e.g. couples on hiking trips" },
      { key: "problem", label: "What do guests compliment or complain about most?", placeholder: "e.g. the view / slow wifi" },
    ],
    build: (a, task) => `${ROLE_LINE}

# Context
Property: ${a.property || "[your property]"}.
Ideal guest: ${a.guest || "[ideal guest]"}.
Known strengths/weaknesses: ${a.problem || "[strengths and weaknesses]"}.
Task: ${task}.

# Task
${task === "listing" ? "Rewrite the listing for the ideal guest: title under 50 characters, summary paragraph (3 sentences max), 5 feature bullets framed as guest benefits, and 3 Frequently Asked Answers that remove booking hesitation." : "Complete the task above in full detail."}

# Constraints
- Write to one guest type only; a listing for everyone books no one.
- Lead with the experience ("wake up 10 minutes from the trailhead"), not the features ("2BR/1BA").
- Be honest about weaknesses by framing, never by hiding.
- Use [FILL IN: ...] for facts only I know (distance, amenities, rules).

# Output format
- Title, summary, bullets, FAQ answers — all clearly labeled.
- End with 3 photo ideas that match the copy.`,
  },
  {
    value: "kdp",
    label: "KDP publishing",
    questions: [
      { key: "book", label: "What's the book (topic + format)?", placeholder: "e.g. low-content gratitude journal for teachers" },
      { key: "buyer", label: "Who buys it and why?", placeholder: "e.g. teachers buying end-of-year gifts" },
      { key: "niche", label: "Any keywords you're targeting?", placeholder: "e.g. teacher appreciation gifts" },
    ],
    build: (a, task) => `${ROLE_LINE}

# Context
Book: ${a.book || "[your book]"}.
Buyer: ${a.buyer || "[the buyer]"}.
Target keywords: ${a.niche || "[keywords]"}.
Task: ${task}.

# Task
${task === "listing" ? "Write the KDP listing: title + subtitle optimized for the keywords, a 150-word description that sells the use case (not the book's contents), 7 backend keywords, and 2 category suggestions. Include 3 title variations to A/B test." : "Complete the task above in full detail."}

# Constraints
- Description sells the moment of use ("the gift the teacher actually keeps"), not page counts.
- No claims of bestseller status or guarantees — Amazon policy.
- Keywords must be phrases a buyer types, not internal tags.
- Use [FILL IN: ...] for specifics only I know.

# Output format
- Labeled sections: Title options, Description, Backend keywords, Categories.
- End with a 3-bullet launch checklist.`,
  },
];

export function buildCustomPrompt(categoryValue: string, taskKey: string, answers: Record<string, string>): string {
  const cat = CUSTOMIZER_CATEGORIES.find((c) => c.value === categoryValue);
  if (!cat) return "";
  const taskLabel = taskKey === "outline" || taskKey === "sequence" || taskKey === "workflow" ||
    taskKey === "copy" || taskKey === "content" || taskKey === "listing" || taskKey === "pin-plan"
    ? taskKey
    : "task";
  return cat.build(answers, taskLabel);
}

export const CUSTOMIZER_TASKS: Record<string, { key: string; label: string }> = {
  "digital-product": { key: "outline", label: "Outline the product" },
  website: { key: "copy", label: "Write the page copy" },
  pinterest: { key: "pin-plan", label: "Plan the pins" },
  "email-funnels": { key: "sequence", label: "Write the email sequence" },
  n8n: { key: "workflow", label: "Design the workflow" },
  social: { key: "content", label: "Write the posts" },
  airbnb: { key: "listing", label: "Rewrite the listing" },
  kdp: { key: "listing", label: "Write the book listing" },
};
