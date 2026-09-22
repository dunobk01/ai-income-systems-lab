/**
 * AI Prompt Generator — pure template logic, no AI API.
 * Produces long, specific, copy-ready prompts from business type + goal.
 */

export type BusinessType = {
  value: string;
  label: string;
  /** Who the business sells to. */
  audience: string;
  /** How the business makes money / operates, in one clause. */
  context: string;
  /** Something concrete the business worries about. */
  pain: string;
  /** Proof element that lands with this audience. */
  proof: string;
};

export const BUSINESS_TYPES: BusinessType[] = [
  {
    value: "freelancer",
    label: "Freelancer",
    audience: "small business owners and marketing managers who hire independent specialists",
    context: "sells project-based and retainer work as a one-person operation",
    pain: "inconsistent lead flow and clients who shop on price",
    proof: "before/after examples from past client projects",
  },
  {
    value: "agency",
    label: "Agency",
    audience: "founders and marketing directors at companies with $1M–$20M in revenue",
    context: "delivers done-for-you services through a small team with monthly retainers",
    pain: "long sales cycles and prospects comparing three agencies at once",
    proof: "a named client outcome with the process used to get it",
  },
  {
    value: "ecommerce",
    label: "E-commerce Store",
    audience: "online shoppers who found the brand through search, social or paid ads",
    context: "sells physical products direct-to-consumer online",
    pain: "abandoned carts, thin margins and one-time buyers who never return",
    proof: "product detail, materials, sizing and real customer reviews",
  },
  {
    value: "local-service",
    label: "Local Service Business",
    audience: "homeowners and local property managers within a defined service radius",
    context: "books on-site jobs and quotes from phone, form and map-listing enquiries",
    pain: "missed calls, slow quote follow-up and being chosen on reviews alone",
    proof: "response speed, licensing, warranty and local review counts",
  },
  {
    value: "coach",
    label: "Coach / Consultant",
    audience: "professionals and business owners considering a paid 1:1 or group engagement",
    context: "sells expertise as packages, programmes or advisory retainers",
    pain: "prospects who say they need to think about it and never return",
    proof: "a specific transformation with the steps that produced it",
  },
  {
    value: "creator",
    label: "Content Creator",
    audience: "an existing audience of followers, subscribers and email readers",
    context: "monetises attention through sponsorships, digital products and affiliates",
    pain: "algorithm swings and the constant pressure to publish",
    proof: "personal experience, receipts and behind-the-scenes specifics",
  },
  {
    value: "saas",
    label: "SaaS / Tech",
    audience: "operators and technical buyers evaluating tools during a trial",
    context: "sells a subscription product with self-serve signup and onboarding",
    pain: "trial users who activate once and churn before the first invoice",
    proof: "time-to-value, an integration list and a concrete workflow example",
  },
  {
    value: "real-estate",
    label: "Real Estate",
    audience: "buyers, sellers and investors in a specific local market",
    context: "earns commission on transactions and referrals",
    pain: "unqualified enquiries and sellers interviewing multiple agents",
    proof: "recent comparable sales, days-on-market and pricing logic",
  },
  {
    value: "restaurant",
    label: "Restaurant / Food",
    audience: "nearby diners deciding where to eat in the next few hours or days",
    context: "sells dine-in, takeaway and catering covers with tight daily margins",
    pain: "quiet weekday services and reliance on delivery platforms",
    proof: "dish photography, sourcing details and what regulars order twice",
  },
  {
    value: "other",
    label: "Other",
    audience: "the customers most likely to buy from this business in the next 30 days",
    context: "sells products or services to a defined customer base",
    pain: "getting attention from the right people without wasting budget",
    proof: "concrete details, specifics and customer evidence",
  },
];

export type Angle = {
  /** Short card title. */
  title: string;
  /** The AI persona line. */
  persona: string;
  /** The core job in one sentence. */
  job: string;
  /** 4–6 concrete instructions. */
  steps: string[];
  /** Hard constraints. */
  constraints: string[];
  /** Tone/voice line. */
  tone: string;
  /** Explicit output format + length. */
  format: string;
  /** Final deliverable sentence. */
  deliverable: string;
};

export type Goal = {
  value: string;
  label: string;
  angles: Angle[];
};

export const GOALS: Goal[] = [
  {
    value: "marketing-copy",
    label: "Write Marketing Copy",
    angles: [
      {
        title: "Homepage hero + offer copy",
        persona: "a direct-response copywriter with 15 years of experience writing for small businesses",
        job: "write the above-the-fold copy for the homepage so a first-time visitor understands the offer in under five seconds",
        steps: [
          "Open by naming the reader's situation in their own words before mentioning the business.",
          "Write one headline of 10 words or fewer that states the outcome, not the service.",
          "Write a sub-headline of 20–30 words explaining who it's for and how it works.",
          "List three benefit bullets, each tied to something the reader can verify.",
          "Write one primary call to action and one low-commitment secondary action.",
        ],
        constraints: [
          "No superlatives, no 'world-class', no 'revolutionary', no exclamation marks.",
          "Never promise income, results or timelines that cannot be evidenced.",
          "Every claim must be checkable or removed.",
        ],
        tone: "Confident and plain-spoken — a knowledgeable person explaining, not a brand shouting.",
        format: "Return three complete variations. Label them Variation A, B and C. Each variation uses the headings Headline, Sub-headline, Three bullets, Primary CTA, Secondary CTA.",
        deliverable: "three complete hero sections I can paste onto the page without editing, plus one sentence under each explaining the angle it takes",
      },
      {
        title: "Objection-handling sales page section",
        persona: "a conversion strategist who specialises in the middle section of long-form sales pages",
        job: "write the part of the sales page that dismantles the four objections most likely to stop a purchase",
        steps: [
          "First, list the four most likely objections for this business and audience, ranked by how often they stop a sale.",
          "For each objection, write a 60–90 word response that concedes what's fair before answering it.",
          "Use a concrete detail, number or example in every response — never a reassurance alone.",
          "Close each response with a single line that moves the reader forward.",
          "Finish with a short risk-reversal paragraph that only states terms a small business could actually honour.",
        ],
        constraints: [
          "Do not invent statistics, testimonials or client names — use placeholders in square brackets instead.",
          "No fake scarcity, countdowns or manufactured urgency.",
          "Keep sentences under 22 words.",
        ],
        tone: "Calm, specific and respectful of the reader's scepticism.",
        format: "A markdown section with an H2, then four H3 objection blocks, then a closing paragraph. 600–750 words total.",
        deliverable: "a finished sales-page section with the four objections labelled, ready to paste in",
      },
      {
        title: "Ad + landing page message match",
        persona: "a performance marketer who writes paid ads and the landing pages they point at",
        job: "write five ad variations and the matching landing page headline for each, so the click and the page say the same thing",
        steps: [
          "Pick five distinct angles: problem-aware, solution-aware, comparison, speed, and risk-reversal.",
          "For each angle write a 30-character headline, a 90-character description and the matching landing page H1.",
          "Under each, note in one line which audience segment it targets.",
          "Flag any claim that would need proof before running.",
          "Rank the five by which you would test first and say why in one sentence.",
        ],
        constraints: [
          "Respect character limits exactly and count them.",
          "No income claims, no guaranteed outcomes, no 'secret' language.",
          "Avoid clickbait that the landing page cannot honour.",
        ],
        tone: "Punchy and concrete. Every word earns its place.",
        format: "A markdown table with columns: Angle, Ad headline, Ad description, Landing H1, Segment. Then a short ranked list beneath.",
        deliverable: "a five-row table plus a test order I can run this week",
      },
      {
        title: "Plain-English offer rewrite",
        persona: "an editor who strips jargon out of business writing without losing meaning",
        job: "rewrite the description of what this business sells so a distracted stranger understands it instantly",
        steps: [
          "Write the offer in one sentence a twelve-year-old could repeat back.",
          "Then write a 60-word version for the website and a 150-word version for a proposal or profile.",
          "List every piece of jargon you removed and the plain word you replaced it with.",
          "Add three 'what this is not' lines to sharpen positioning.",
          "Suggest two headlines that could sit above the 60-word version.",
        ],
        constraints: [
          "Ban buzzwords: leverage, synergy, cutting-edge, best-in-class, game-changing, unlock.",
          "No invented credentials or awards.",
          "Keep reading level at grade 8 or below.",
        ],
        tone: "Direct, warm, slightly dry. Never corporate.",
        format: "Four labelled blocks: One-liner, 60-word version, 150-word version, Jargon swaps (as a two-column list).",
        deliverable: "three lengths of the same offer description plus the jargon list, all paste-ready",
      },
    ],
  },
  {
    value: "social-content",
    label: "Generate Social Media Content",
    angles: [
      {
        title: "Ten-post content batch",
        persona: "a social media strategist who writes for small businesses that have no in-house marketing team",
        job: "produce ten ready-to-post pieces of short-form content that do not all sound the same",
        steps: [
          "Use a mix of five formats: a lesson, a myth-bust, a behind-the-scenes, a customer question answered, and a short opinion.",
          "Write each post in full — hook, body, close — not as an idea or outline.",
          "Make each hook a first line that would stop a scroll without exaggerating.",
          "Include a soft call to action on only three of the ten posts.",
          "Suggest one simple visual or photo for each post that the owner could shoot on a phone.",
        ],
        constraints: [
          "No hashtag walls — maximum three relevant hashtags per post.",
          "No engagement bait, no 'comment YES below'.",
          "No statistics unless marked as [verify].",
        ],
        tone: "Human and conversational, like a competent person talking, not a brand account.",
        format: "Ten numbered posts. Each with: Format, Post text (60–140 words), Visual suggestion, Hashtags.",
        deliverable: "ten finished posts I can schedule today without rewriting",
      },
      {
        title: "One idea, six platforms",
        persona: "a content repurposing specialist who turns one idea into a week of platform-native posts",
        job: "take a single core idea for this business and rewrite it properly for six different places",
        steps: [
          "First, state the single core idea in one sentence and the promise it makes.",
          "Write a LinkedIn post (150–200 words, line breaks, no hashtags in the body).",
          "Write an Instagram caption (80–120 words) plus a five-slide carousel outline with the text for each slide.",
          "Write a 30-second short-form video script with the on-screen hook and spoken lines separated.",
          "Write an X/Twitter thread of five posts and a short email teaser of 90 words.",
        ],
        constraints: [
          "Do not copy-paste the same wording between platforms — rewrite for each.",
          "No hype, no 'this changed my life' framing.",
          "Keep every claim something the owner could defend in person.",
        ],
        tone: "Useful first, personality second. Specific over clever.",
        format: "Six labelled sections in the order above, each with the finished text.",
        deliverable: "one idea rewritten six ways, each ready to post as written",
      },
      {
        title: "Comment and DM reply library",
        persona: "a community manager who writes reply templates that still sound like a human wrote them",
        job: "build a reply library for the comments and DMs this business gets over and over",
        steps: [
          "List the ten most likely comment and DM types for this business, including the awkward ones.",
          "Write two reply variations for each — one short, one warmer and longer.",
          "Mark which replies should move to a private conversation and how to say that.",
          "Include three replies for negative or unfair comments that de-escalate without grovelling.",
          "Add a short note on what should never be answered publicly.",
        ],
        constraints: [
          "Never promise refunds, discounts or timelines in a template.",
          "No passive aggression, no defensiveness.",
          "Keep short replies under 25 words.",
        ],
        tone: "Friendly, unflustered, slightly informal.",
        format: "A numbered list of ten scenarios. Each with: Scenario, Short reply, Longer reply, Note.",
        deliverable: "a ten-scenario reply library I can paste into a saved-replies tool",
      },
      {
        title: "Thirty-day posting rhythm",
        persona: "a content planner who builds sustainable posting schedules for busy owners",
        job: "design a 30-day posting rhythm this business can actually keep up with at three posts per week",
        steps: [
          "Choose three recurring weekly themes and justify each in one line.",
          "Map the 12–13 posts across the month with dates, theme, format and working headline.",
          "Write the first week's posts out in full.",
          "Note which posts can be batch-filmed or batch-written in one sitting.",
          "Add a fallback plan for the weeks the owner has no time.",
        ],
        constraints: [
          "Do not plan daily posting — the schedule must survive a busy week.",
          "No trend-chasing that would date within a month.",
          "No content that requires paid tools or a videographer.",
        ],
        tone: "Practical and realistic. Assume limited time.",
        format: "A markdown table for the month, then the full text of week one beneath it.",
        deliverable: "a 30-day plan plus week one written out in full",
      },
    ],
  },
  {
    value: "email-sequence",
    label: "Create an Email Sequence",
    angles: [
      {
        title: "Five-email welcome sequence",
        persona: "an email strategist who writes onboarding sequences with high open rates and no hype",
        job: "write a five-email welcome sequence for someone who has just joined this business's list",
        steps: [
          "Map the sequence first: for each email state the job it does and the day it sends.",
          "Write all five emails in full, each 180–320 words.",
          "Give each email two subject line options and one preview text line.",
          "Deliver value in emails one to three before any offer appears in four and five.",
          "Close each email with a single clear next step, never two competing links.",
        ],
        constraints: [
          "No fake urgency, no countdown language, no income claims.",
          "No placeholder filler like [insert benefit] — write the real words.",
          "Plain text style, no heavy formatting.",
        ],
        tone: "Personal and direct, as if written by the owner to one person.",
        format: "Five blocks: Day, Job of this email, Subject A, Subject B, Preview text, Body.",
        deliverable: "a complete five-email sequence I can load into an email tool as written",
      },
      {
        title: "Re-engagement / win-back sequence",
        persona: "a lifecycle email specialist who revives cold lists without begging",
        job: "write a three-email win-back sequence for subscribers or customers who have gone quiet",
        steps: [
          "Email one: acknowledge the silence honestly and give something useful with no ask.",
          "Email two: present one specific reason to come back, tied to a change or improvement.",
          "Email three: a clean permission email that makes staying or leaving equally easy.",
          "For each, write the subject line, preview text and full body of 150–250 words.",
          "Explain in one line beneath each email what signal it is testing for.",
        ],
        constraints: [
          "No guilt-tripping, no 'we miss you' clichés, no discounts unless I ask for them.",
          "Make unsubscribing genuinely easy in the third email.",
          "No invented product updates — use bracketed placeholders for facts I must supply.",
        ],
        tone: "Honest and unbothered. Confident enough to let people go.",
        format: "Three labelled emails with Subject, Preview, Body, and a one-line note on the signal.",
        deliverable: "a three-email win-back sequence plus the signal each one measures",
      },
      {
        title: "Post-purchase / onboarding sequence",
        persona: "a retention specialist who designs the first 14 days after someone buys",
        job: "write a four-email post-purchase sequence that reduces regret and increases the chance of a second purchase",
        steps: [
          "Email one (day 0): confirm, set expectations and remove the most common first-week worry.",
          "Email two (day 3): the fastest path to a first win, written as steps.",
          "Email three (day 7): the mistake most people make at this stage and how to avoid it.",
          "Email four (day 14): invite feedback and introduce the natural next step.",
          "Give each email a subject line, preview text and 180–280 word body.",
        ],
        constraints: [
          "Do not upsell before email four.",
          "No 'congratulations on your amazing decision' flattery.",
          "Every instruction must be specific enough to follow without support.",
        ],
        tone: "Helpful, steady, quietly reassuring.",
        format: "Four labelled emails in send order, each with Day, Subject, Preview, Body.",
        deliverable: "a complete 14-day post-purchase sequence ready to schedule",
      },
      {
        title: "Weekly newsletter engine",
        persona: "a newsletter editor who makes a weekly send sustainable for a business owner",
        job: "design a repeatable weekly newsletter format and write the first two issues in full",
        steps: [
          "Propose a fixed four-section structure and explain why each section earns its place.",
          "Write issue one and issue two in full, 400–600 words each, following that structure.",
          "Give each issue three subject line options ranked by likely open rate.",
          "Include one recurring section that requires under ten minutes to write each week.",
          "Finish with a list of 12 topic ideas for the next three months.",
        ],
        constraints: [
          "No curated-links-only filler.",
          "No invented data or quotes.",
          "Keep each issue readable in under three minutes.",
        ],
        tone: "Opinionated but generous. Written by a practitioner, not a publisher.",
        format: "Structure definition, then Issue 1 and Issue 2 in full, then the 12-topic list.",
        deliverable: "a repeatable newsletter format plus two finished issues and a quarter of topics",
      },
    ],
  },
  {
    value: "sales-script",
    label: "Build a Sales Script",
    angles: [
      {
        title: "Discovery call script",
        persona: "a sales trainer who teaches consultative selling to owners who hate selling",
        job: "write a full discovery call script for a 20-minute first conversation with a prospect",
        steps: [
          "Open with a 30-second framing that sets the agenda and gives the prospect an exit.",
          "Write 12 discovery questions in order, grouped into situation, problem, impact and decision.",
          "For each question, add one line on what a good answer sounds like and what a warning sign sounds like.",
          "Write the transition into presenting the offer, plus a version for when there's no fit.",
          "End with an explicit next-step close and a follow-up message to send within the hour.",
        ],
        constraints: [
          "No manipulation tactics, no artificial pressure, no 'what would stop you from starting today'.",
          "The script must allow the honest answer of 'this isn't a fit'.",
          "Keep spoken lines short enough to say naturally.",
        ],
        tone: "Calm, curious, professional. More interview than pitch.",
        format: "Sections: Open, Discovery questions (numbered, with read-the-room notes), Transition, No-fit path, Close, Follow-up message.",
        deliverable: "a complete call script I could read on my next call without rehearsing",
      },
      {
        title: "Objection response drill",
        persona: "a sales coach who drills objection handling until the answers sound natural",
        job: "build an objection response sheet for the eight objections this business hears most",
        steps: [
          "List the eight likely objections including price, timing, trust, and 'I'll do it myself'.",
          "For each, write the underlying concern in one line before the response.",
          "Write a spoken response of 40–70 words that acknowledges, reframes and asks a question back.",
          "Add one follow-up question that keeps the conversation moving.",
          "Mark the two objections that usually mean the deal is genuinely dead.",
        ],
        constraints: [
          "No scripts that pressure someone into a decision they'll regret.",
          "No discount-first answers to price objections.",
          "Responses must sound like speech, not like a brochure.",
        ],
        tone: "Grounded and unrushed. Never defensive.",
        format: "Eight numbered blocks: Objection, Real concern, Spoken response, Follow-up question.",
        deliverable: "an eight-objection response sheet I can keep open during calls",
      },
      {
        title: "Quote and follow-up call flow",
        persona: "a sales operations consultant who fixes the gap between quote sent and deal closed",
        job: "write the call and message flow that runs from sending a quote to getting a decision",
        steps: [
          "Write the script for the call where the quote is presented, including how to say the price.",
          "Write three follow-up messages at day 2, day 5 and day 10, each under 90 words.",
          "Write a final 'closing the loop' message that makes a no easy to send.",
          "Add a decision tree for the three likely responses: yes, not now, silence.",
          "Note exactly when to stop following up.",
        ],
        constraints: [
          "No more than five touches in total.",
          "No guilt, no 'just bumping this to the top of your inbox' filler.",
          "Every message must add something, not just ask.",
        ],
        tone: "Brisk, respectful, slightly informal.",
        format: "Call script, then four labelled messages with send timing, then the decision tree as an indented list.",
        deliverable: "a complete quote-to-decision flow with every message written out",
      },
      {
        title: "Inbound enquiry qualification script",
        persona: "a sales manager who designs qualification scripts for the person answering the phone",
        job: "write the script for handling a brand-new inbound enquiry in under six minutes",
        steps: [
          "Write the first 20 seconds word for word, including the greeting.",
          "List six qualification questions in order, with the one disqualifying answer for each.",
          "Write the booking language that converts a qualified enquiry into a scheduled appointment.",
          "Write the polite decline for an unqualified enquiry, including one referral-style alternative.",
          "Add a short list of details to capture into the CRM during the call.",
        ],
        constraints: [
          "The script must work for someone with no sales training.",
          "No promises on price or timing without checking.",
          "Keep the whole call under six minutes.",
        ],
        tone: "Warm, efficient, organised.",
        format: "Opening lines, numbered questions with disqualifiers, Booking language, Decline language, CRM capture list.",
        deliverable: "a phone script someone could use on their first day answering enquiries",
      },
    ],
  },
  {
    value: "blog-post",
    label: "Write a Blog Post",
    angles: [
      {
        title: "Search-intent how-to article",
        persona: "an SEO content writer who writes for humans first and search engines second",
        job: "write a complete how-to article that answers one specific question this business's customers search for",
        steps: [
          "Start by choosing the exact search query and stating the intent behind it in one line.",
          "Write the article at 1,200–1,600 words with an H1, six to eight H2s and short paragraphs.",
          "Answer the core question inside the first 120 words before any preamble.",
          "Include one numbered step-by-step section and one short comparison table.",
          "Finish with a five-question FAQ using the real follow-up questions people ask.",
        ],
        constraints: [
          "No keyword stuffing and no 'in today's fast-paced world' openings.",
          "Mark any statistic as [verify] rather than inventing one.",
          "Every section must be usable on its own.",
        ],
        tone: "Clear, practical, quietly expert. Second person throughout.",
        format: "Full markdown article with title, meta description under 155 characters, headings, table and FAQ.",
        deliverable: "a publish-ready article including the title tag and meta description",
      },
      {
        title: "Opinion piece with a real position",
        persona: "an editor who commissions opinion pieces that take a defensible stance",
        job: "write an opinion article that argues one specific position relevant to this business's market",
        steps: [
          "State the position in the first two sentences — no throat-clearing.",
          "Give three supporting arguments, each anchored to a concrete example or scenario.",
          "Include one honest counter-argument and answer it fairly.",
          "Add one section on what the reader should do differently as a result.",
          "Close with a single line that would work as a pull quote.",
        ],
        constraints: [
          "No strawmen, no naming competitors negatively.",
          "No invented research or fabricated quotes.",
          "800–1,100 words, short paragraphs.",
        ],
        tone: "Direct and opinionated but fair. No outrage bait.",
        format: "Markdown article with title, three suggested alternative titles, and the body.",
        deliverable: "a finished opinion piece plus three title options",
      },
      {
        title: "Case-study style walkthrough",
        persona: "a case-study writer who documents a process so a reader could copy it",
        job: "write a walkthrough article documenting how this business solves one problem end to end",
        steps: [
          "Open with the situation, the constraint and the outcome in under 100 words.",
          "Break the process into five to seven stages with what happens and why at each.",
          "Include the tools, time and cost involved at each stage, using placeholders where I must supply numbers.",
          "Add a 'what went wrong' section with two honest problems and the fixes.",
          "Finish with a checklist the reader can follow themselves.",
        ],
        constraints: [
          "Do not invent client names, revenue figures or results — use [placeholder] markers.",
          "No income promises or implied guarantees.",
          "Keep it under 1,400 words.",
        ],
        tone: "Documentary and specific. Show the work.",
        format: "Markdown article with an intro box, numbered stages, a problems section and a closing checklist.",
        deliverable: "a full walkthrough article with every placeholder clearly marked",
      },
      {
        title: "Comparison / buyer's guide article",
        persona: "a buyer's guide writer who helps readers choose without pushing them",
        job: "write a comparison article helping this business's audience choose between their realistic options",
        steps: [
          "Define the three to five options a buyer actually considers, including doing nothing.",
          "Build a comparison table across cost, time, skill required, and best-fit situation.",
          "Write 150 words on each option covering who it suits and who it doesn't.",
          "Add a short 'choose this if' decision section.",
          "Disclose honestly where this business fits among the options.",
        ],
        constraints: [
          "No rigged comparison that pretends the alternatives are worthless.",
          "No fabricated pricing — mark prices as [verify].",
          "1,000–1,400 words.",
        ],
        tone: "Even-handed and useful. Trust is the point.",
        format: "Markdown article: intro, comparison table, per-option sections, decision section, honest disclosure.",
        deliverable: "a complete buyer's guide with the table filled in",
      },
    ],
  },
  {
    value: "lead-magnet",
    label: "Create a Lead Magnet",
    angles: [
      {
        title: "One-page checklist lead magnet",
        persona: "a lead magnet designer who builds assets people finish in under ten minutes",
        job: "create a one-page checklist this business can give away in exchange for an email",
        steps: [
          "Pick the single outcome the checklist delivers and name it in the title.",
          "Write 12–18 checklist items grouped into three or four phases.",
          "Make every item an action with a verb, not a topic.",
          "Add a one-line 'why this matters' under each phase heading.",
          "Write the landing page headline, three bullets and the button text that would get it downloaded.",
        ],
        constraints: [
          "It must fit on one printed page.",
          "No fluff items added to reach a number.",
          "No claims about results the checklist cannot produce.",
        ],
        tone: "Brisk and useful. Every line does work.",
        format: "Title, three or four phase headings with items as checkboxes, then the landing page copy block.",
        deliverable: "a complete one-page checklist plus the opt-in page copy",
      },
      {
        title: "Template / swipe file lead magnet",
        persona: "a product designer who turns expertise into reusable templates",
        job: "create a swipe file of ready-to-use templates that this business's audience would happily trade an email for",
        steps: [
          "Choose five templates that solve five real recurring moments for this audience.",
          "Write each template in full with bracketed variables the user fills in.",
          "Add a two-line usage note above each template explaining when to use it.",
          "Include one worked example for the most-used template.",
          "Write the delivery email that sends the file, 120 words maximum.",
        ],
        constraints: [
          "Templates must be usable without any paid tool.",
          "No placeholder templates that say 'customise as needed' and nothing else.",
          "Keep the whole file under 1,500 words.",
        ],
        tone: "Generous and practical. Give away the useful part.",
        format: "Five labelled templates with usage notes, one worked example, then the delivery email.",
        deliverable: "a finished five-template swipe file and the email that delivers it",
      },
      {
        title: "Mini-guide lead magnet",
        persona: "an instructional designer who writes short guides people actually finish",
        job: "write a five-section mini-guide this business can offer as its main opt-in",
        steps: [
          "Define the promise in one sentence and the reader's starting point in another.",
          "Write five sections of 200–250 words, each ending in one action to take.",
          "Include one simple diagram described in text that the owner could recreate in Canva.",
          "Add a 'common mistakes' box with three honest errors.",
          "Write the opt-in page copy and the thank-you page copy.",
        ],
        constraints: [
          "No income promises and no guaranteed outcomes.",
          "Readable in 12 minutes or less.",
          "No requirement to buy anything to complete it.",
        ],
        tone: "Teacherly without being patronising.",
        format: "Guide title, promise line, five sections with actions, mistakes box, opt-in copy, thank-you copy.",
        deliverable: "a complete mini-guide plus both pages of copy around it",
      },
      {
        title: "Self-scoring assessment lead magnet",
        persona: "an assessment designer who builds scorecards that give genuinely useful feedback",
        job: "design a self-scoring assessment that tells this business's audience where they stand",
        steps: [
          "Write ten questions with four scored answer options each, worth 0 to 3 points.",
          "Define three score bands with an honest label and a 100-word interpretation for each.",
          "For each band, recommend the single next action — not a list.",
          "Write the instructions so someone can score it on paper.",
          "Suggest how the business follows up with each band by email.",
        ],
        constraints: [
          "No question whose answer is obvious or flattering.",
          "Band interpretations must be honest, including the uncomfortable one.",
          "No score band that leads straight to a hard sell.",
        ],
        tone: "Straight-talking and diagnostic.",
        format: "Instructions, ten scored questions, three band interpretations, follow-up plan.",
        deliverable: "a complete scored assessment with interpretations and a follow-up plan",
      },
    ],
  },
  {
    value: "customer-responses",
    label: "Automate Customer Responses",
    angles: [
      {
        title: "FAQ answer bank for automation",
        persona: "an automation consultant who prepares answer banks for chatbots and auto-responders",
        job: "write the answer bank this business needs before automating any customer reply",
        steps: [
          "List the 15 questions this business is asked most, including pricing and availability.",
          "Write a 40–80 word answer for each, written to be read by a customer, not an employee.",
          "Tag each answer as safe-to-automate, needs-a-human, or never-automate, with a reason.",
          "Add the escalation line the bot should use when it isn't confident.",
          "Note which answers will go stale and how often they need review.",
        ],
        constraints: [
          "Never automate answers that commit to price, legal terms or medical/financial advice.",
          "No pretending the bot is a person.",
          "Every answer must state what happens next.",
        ],
        tone: "Clear, friendly, unambiguous. Zero jargon.",
        format: "A numbered list of 15 entries: Question, Answer, Automation tag, Reason. Then the escalation line and review notes.",
        deliverable: "a 15-question answer bank tagged and ready to load into a chatbot or help desk",
      },
      {
        title: "Chatbot conversation design",
        persona: "a conversation designer who builds support bots that don't frustrate people",
        job: "design the full conversation flow for a support bot on this business's website",
        steps: [
          "Write the greeting and the three opening choices offered to a visitor.",
          "Map each branch two levels deep, showing the bot's exact wording at every step.",
          "Write the handoff-to-human script, including what information gets collected first.",
          "Write the out-of-hours variant of every path.",
          "List the five things this bot must never attempt to answer.",
        ],
        constraints: [
          "Maximum two questions before the bot gives something useful.",
          "Always offer a way out to a human within two taps.",
          "No dead ends and no looping menus.",
        ],
        tone: "Brief and human. Short sentences. No corporate padding.",
        format: "An indented flow showing every node with the exact bot copy, then the never-answer list.",
        deliverable: "a complete bot flow with the wording written for every node",
      },
      {
        title: "Auto-reply and speed-to-lead templates",
        persona: "a response-time specialist who fixes the first five minutes after an enquiry",
        job: "write the automated messages that go out the moment someone contacts this business",
        steps: [
          "Write the instant auto-reply for a form, an email and a missed call, each under 70 words.",
          "Each message must set an expectation with a real time window.",
          "Write the five-minute SMS follow-up and the one-hour email follow-up.",
          "Write the next-morning message for enquiries that arrive overnight.",
          "Add the rules for when automation must stop and a person takes over.",
        ],
        constraints: [
          "Never promise a response time the business cannot keep.",
          "No message that reads as obviously robotic.",
          "SMS messages must be under 160 characters.",
        ],
        tone: "Prompt, personable, reassuring.",
        format: "Six labelled messages with channel and trigger timing, then the handover rules.",
        deliverable: "a full speed-to-lead message set with triggers and timings",
      },
      {
        title: "Refund, complaint and awkward-message scripts",
        persona: "a customer experience lead who writes the hard messages so nobody improvises them",
        job: "write the templates for the difficult customer messages this business will eventually need",
        steps: [
          "Cover eight scenarios including a late delivery, a refund request, a mistake the business made, and an unfair review.",
          "Write a 60–120 word message for each, with a clear owning-it sentence where it's deserved.",
          "Offer a concrete resolution in every message, with brackets for anything I must decide.",
          "Add one line beneath each on what to do if the customer escalates.",
          "Flag which scenarios need a phone call instead of a message.",
        ],
        constraints: [
          "No non-apologies ('we're sorry you feel that way').",
          "No admitting legal liability.",
          "No template that promises money without a bracketed decision point.",
        ],
        tone: "Accountable, calm, concrete.",
        format: "Eight numbered scenarios: Scenario, Message, Escalation note, Channel.",
        deliverable: "eight difficult-message templates I can store and adapt in minutes",
      },
    ],
  },
  {
    value: "competitor-research",
    label: "Research Competitors",
    angles: [
      {
        title: "Positioning gap analysis",
        persona: "a positioning strategist who finds the space competitors have left empty",
        job: "run a structured positioning analysis of this business against its realistic competitors",
        steps: [
          "Ask me for up to five competitor names or websites before starting, then proceed with what I give you.",
          "Build a table comparing promise, audience, price signal, proof and weakness for each.",
          "Identify three positioning gaps nobody in the set is claiming.",
          "For each gap, state what the business would have to be true about itself to claim it.",
          "Recommend one gap and write the positioning statement for it.",
        ],
        constraints: [
          "Do not invent competitor pricing or claims — mark unknowns as [unknown].",
          "No disparaging language about named competitors.",
          "Base analysis only on what I supply plus clearly labelled assumptions.",
        ],
        tone: "Analytical and blunt. Say the uncomfortable thing.",
        format: "A comparison table, a numbered gap list, then one recommended positioning statement with reasoning.",
        deliverable: "a filled comparison table and one recommended position with the reasoning behind it",
      },
      {
        title: "Competitor content and messaging teardown",
        persona: "a content strategist who reverse-engineers what a competitor is doing and why",
        job: "tear down a competitor's content and messaging so this business can compete deliberately",
        steps: [
          "Ask me to paste a competitor's homepage copy and three of their recent posts.",
          "Summarise their core promise, their audience and the objection they keep answering.",
          "List the five content themes they repeat and rank them by likely commercial intent.",
          "Identify three topics they avoid or handle badly.",
          "Propose five pieces of content for this business that attack those three gaps.",
        ],
        constraints: [
          "No copying their wording — rewrite and differentiate.",
          "No speculation presented as fact.",
          "No snark about the competitor in the output.",
        ],
        tone: "Forensic and practical.",
        format: "Summary block, themes table, gaps list, then five content briefs with working titles and angles.",
        deliverable: "a teardown summary plus five content briefs aimed at the gaps",
      },
      {
        title: "Pricing and offer comparison",
        persona: "a pricing analyst who compares offers on value, not just headline price",
        job: "compare this business's offer against competitor offers and find where the value story is weak",
        steps: [
          "Ask me for the competitor offers and prices I know about, then work only from those.",
          "Break each offer into what's included, what's excluded and what's implied.",
          "Score each on perceived value, risk to the buyer and clarity, out of five with reasons.",
          "Identify where this business is under-explaining what it includes.",
          "Recommend three specific changes to the offer's presentation, not the price.",
        ],
        constraints: [
          "Do not recommend lowering price as the first move.",
          "Mark all unverified figures as [verify].",
          "No claims about competitor margins.",
        ],
        tone: "Commercial and unsentimental.",
        format: "Offer breakdown table with scores, a weaknesses list, then three presentation changes.",
        deliverable: "a scored offer comparison and three concrete changes to make this week",
      },
      {
        title: "Review mining for real objections",
        persona: "a customer insight analyst who mines reviews for the language buyers actually use",
        job: "turn competitor reviews into a map of what this market complains about and praises",
        steps: [
          "Ask me to paste 15–30 reviews of competitors, both positive and negative.",
          "Cluster the complaints into no more than six themes with a count for each.",
          "Cluster the praise the same way.",
          "Pull out 10 verbatim phrases worth reusing in marketing copy.",
          "Turn the top three complaint themes into three specific promises this business could make and keep.",
        ],
        constraints: [
          "Do not fabricate reviews if I provide too few — ask for more instead.",
          "Do not quote reviewers by name.",
          "Only suggest promises the business could realistically deliver.",
        ],
        tone: "Evidence-led. Quote the market, don't paraphrase it away.",
        format: "Complaint themes table, praise themes table, verbatim phrase list, three promises.",
        deliverable: "a themed review analysis with ten usable customer phrases and three promises",
      },
    ],
  },
  {
    value: "proposal",
    label: "Write a Proposal / Pitch",
    angles: [
      {
        title: "Two-page client proposal",
        persona: "a proposal writer who gets short proposals signed faster than long ones",
        job: "write a two-page proposal for a prospect who has already had a discovery conversation",
        steps: [
          "Open by restating the prospect's problem and goal in their own words, in under 120 words.",
          "Present the recommended approach as three phases with what happens and what they receive.",
          "State the investment clearly with one primary option and one smaller entry option.",
          "Add timeline, what you need from them, and what happens if scope changes.",
          "Close with a single signature step and a date the proposal is valid until.",
        ],
        constraints: [
          "No portfolio padding, no company history section.",
          "Never guarantee results — describe the process and the deliverables instead.",
          "Keep it under 900 words total.",
        ],
        tone: "Assured and specific. Written to be skimmed and signed.",
        format: "Sections: Your situation, Recommended approach, What you receive, Investment, Timeline, Next step.",
        deliverable: "a complete proposal with bracketed placeholders only where I must supply a real figure",
      },
      {
        title: "Cold pitch email",
        persona: "an outbound specialist who writes cold emails that get replies without tricks",
        job: "write a cold pitch email for a specific prospect this business wants to work with",
        steps: [
          "Ask me who the prospect is and what I know about them before writing.",
          "Write a subject line under 45 characters and an email body under 130 words.",
          "Lead with a specific observation about them, not a compliment.",
          "Make one small ask — never 'a quick 30 minutes' as the first request.",
          "Write two follow-up emails at day 4 and day 10, each under 70 words and each adding something new.",
        ],
        constraints: [
          "No fake familiarity, no 'I came across your website' openings.",
          "No attachments or links in the first email.",
          "No claims about results for clients I haven't named.",
        ],
        tone: "Peer to peer. Brief, specific, easy to reply to.",
        format: "Subject, Email 1, Email 2 (day 4), Email 3 (day 10), plus a one-line note on the ask in each.",
        deliverable: "a three-email cold sequence I could send today",
      },
      {
        title: "Partnership / collaboration pitch",
        persona: "a business development lead who structures partnerships that are worth saying yes to",
        job: "write a partnership pitch from this business to a complementary organisation",
        steps: [
          "Define the shared audience and the reason this partnership makes sense in two sentences.",
          "Propose three collaboration formats ranked by how little effort the partner must contribute.",
          "For each format, state exactly who does what and what each side gets.",
          "Add a low-risk first step that tests the partnership in under two weeks.",
          "Write the outreach message that opens the conversation, under 150 words.",
        ],
        constraints: [
          "No revenue-share numbers unless I supply them.",
          "Never frame it as a favour or as free exposure.",
          "Keep the partner's effort lower than ours in every option.",
        ],
        tone: "Collaborative and commercially clear.",
        format: "Rationale, three ranked formats with responsibility splits, the pilot step, the outreach message.",
        deliverable: "a partnership pitch with three options and the outreach message written",
      },
      {
        title: "Scope, pricing and terms one-pager",
        persona: "a consultant who writes scope documents that prevent arguments later",
        job: "write the scope and terms one-pager that accompanies this business's proposals",
        steps: [
          "List exactly what is included, in deliverable terms with quantities.",
          "List what is explicitly excluded — at least six items.",
          "Define the revision policy, the response times both sides commit to, and the approval process.",
          "State payment terms, late payment handling and what pauses the project.",
          "Write a short change-request procedure with how new work gets priced.",
        ],
        constraints: [
          "Plain English only — no legalese, and note this is not legal advice.",
          "No open-ended commitments like 'unlimited revisions'.",
          "Every term must be enforceable by a small business.",
        ],
        tone: "Firm, fair and unambiguous.",
        format: "Six labelled sections with bulleted terms, under 700 words.",
        deliverable: "a one-page scope and terms document I can attach to every proposal",
      },
    ],
  },
  {
    value: "content-calendar",
    label: "Create a Content Calendar",
    angles: [
      {
        title: "Ninety-day content calendar",
        persona: "a content director who plans quarters, not weeks",
        job: "build a 90-day content calendar for this business across its two most useful channels",
        steps: [
          "Choose two channels and justify each in one line based on where this audience actually is.",
          "Define three content pillars with the buying stage each one serves.",
          "Plan 36 pieces across the quarter with date, channel, pillar, format and working title.",
          "Mark which pieces are cornerstone pieces and which are repurposed from them.",
          "Add a monthly review step with the two metrics worth checking.",
        ],
        constraints: [
          "No plan requiring more than three hours of content work per week.",
          "No seasonal content that assumes a budget or an event.",
          "Working titles must be specific, not topics.",
        ],
        tone: "Organised and realistic about time.",
        format: "Channel rationale, pillar definitions, then a markdown table of 36 rows, then the review process.",
        deliverable: "a 90-day calendar table plus the pillars and review routine behind it",
      },
      {
        title: "Repurposing engine calendar",
        persona: "a content systems designer who builds one-to-many repurposing workflows",
        job: "design a monthly calendar where one cornerstone piece produces everything else",
        steps: [
          "Define the cornerstone format and how long it takes to produce.",
          "Map the eight derivative pieces it produces and the order they publish in.",
          "Give the calendar for one full month with dates and the exact asset for each slot.",
          "Specify which steps can be handed to an assistant or automated with n8n, and how.",
          "Estimate the total hours per month honestly.",
        ],
        constraints: [
          "No derivative that requires re-researching the topic.",
          "No claim that automation removes the writing judgement.",
          "Hour estimates must be realistic, not optimistic.",
        ],
        tone: "Systems-minded and honest about effort.",
        format: "Cornerstone definition, derivative map as a list, one-month table, automation notes, hours estimate.",
        deliverable: "a repeatable monthly repurposing calendar with the automation steps marked",
      },
      {
        title: "Launch or promotion calendar",
        persona: "a launch planner who sequences promotion without exhausting an audience",
        job: "build the content calendar for a six-week promotion run by this business",
        steps: [
          "Split the six weeks into warm-up, open, and close phases with the job of each.",
          "Plan every email and post by date, with its purpose and a working subject or hook.",
          "Include at least two pieces of pure value content during the promotion.",
          "Write the three most important emails in full.",
          "Add the metrics to watch weekly and the point at which to change course.",
        ],
        constraints: [
          "No manufactured scarcity or fake deadlines — only real ones.",
          "No income or results promises in any asset.",
          "Cap total sends so the list isn't burned.",
        ],
        tone: "Purposeful and honest. Selling without theatre.",
        format: "Phase definitions, a dated table of every asset, three full emails, the metrics list.",
        deliverable: "a six-week promotion calendar with the three key emails written out",
      },
      {
        title: "Evergreen SEO content roadmap",
        persona: "an SEO strategist who plans clusters rather than one-off posts",
        job: "build an evergreen content roadmap of topic clusters for this business",
        steps: [
          "Propose three topic clusters, each with one pillar page and six supporting articles.",
          "For each article give the working title, the search intent and the internal links it should carry.",
          "Order the 21 pieces by the sequence that builds authority fastest.",
          "Note which pieces should be updated annually and when.",
          "Suggest the one metric that tells me a cluster is working.",
        ],
        constraints: [
          "No keyword volume figures invented — mark them [verify].",
          "No topics outside what this business can credibly write about.",
          "No thin 200-word filler articles.",
        ],
        tone: "Strategic and concrete.",
        format: "Three cluster blocks with pillar and supporting titles in a table, publish order list, update schedule.",
        deliverable: "a 21-piece evergreen roadmap in publish order with intents and internal links mapped",
      },
    ],
  },
];

export const businessByValue = (v: string) => BUSINESS_TYPES.find((b) => b.value === v);
export const goalByValue = (v: string) => GOALS.find((g) => g.value === v);

export type GeneratedPrompt = { id: string; title: string; text: string };

const CONTEXT_OPENERS = [
  "You are working for",
  "You have been hired by",
  "You are consulting for",
  "You are embedded with",
];

const QUALITY_LINES = [
  "If anything you need is missing, ask me for it in one short list before you produce the final output — do not guess a fact about my business.",
  "Where you need a number, a name or a price I haven't given you, use a clearly marked [placeholder] rather than inventing one.",
  "Before you write, restate in one line what you understand the job to be. Then produce the output.",
  "After the output, add two lines: one thing you would test first, and one assumption you made that I should correct.",
];

function pick<T>(arr: T[], index: number): T {
  return arr[((index % arr.length) + arr.length) % arr.length]!;
}

function buildPrompt(
  business: BusinessType,
  goal: Goal,
  angle: Angle,
  seed: number,
  description: string,
): string {
  const desc = description.trim();
  const descLine = desc
    ? `Here is how the owner describes the business in their own words: "${desc}". Treat this description as the source of truth and reflect its specifics — the words, the offer and the niche — throughout your output.`
    : `The owner has not given extra detail, so infer sensible specifics for a ${business.label.toLowerCase()} of this kind and clearly label any assumption you make.`;

  return [
    `You are ${angle.persona}.`,
    ``,
    `${pick(CONTEXT_OPENERS, seed)} a ${business.label.toLowerCase()} that ${business.context}. Its customers are ${business.audience}. The business's most persistent problem right now is ${business.pain}, and the thing that builds trust fastest with this audience is ${business.proof}. ${descLine}`,
    ``,
    `Your task: ${angle.job}. The goal of this work is "${goal.label.toLowerCase()}", so everything you produce must serve that outcome and nothing else.`,
    ``,
    `Target audience: write every word for ${business.audience}. Picture one of them reading it on a phone, half-distracted, mid-day. If a sentence would not survive that moment, cut it.`,
    ``,
    `Instructions — follow these in order:`,
    ...angle.steps.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `Constraints — these are hard rules:`,
    ...angle.constraints.map((c) => `- ${c}`),
    `- Never use hype, income promises or guaranteed-results language of any kind.`,
    `- Do not pad. If a section can be shorter without losing meaning, make it shorter.`,
    ``,
    `Tone and voice: ${angle.tone} Write in plain English at roughly a grade 8 reading level, in second person where you are addressing the reader.`,
    ``,
    `Output format: ${angle.format}`,
    ``,
    pick(QUALITY_LINES, seed),
    ``,
    `Your output should be ${angle.deliverable}.`,
  ].join("\n");
}

/**
 * Generate three distinct, fully-written prompts.
 * `round` rotates the angle set so "Regenerate" returns fresh prompts.
 */
export function generatePrompts(opts: {
  businessValue: string;
  goalValue: string;
  description?: string;
  round?: number;
}): GeneratedPrompt[] {
  const business = businessByValue(opts.businessValue);
  const goal = goalByValue(opts.goalValue);
  if (!business || !goal) return [];
  const round = opts.round ?? 0;
  const total = goal.angles.length;

  return [0, 1, 2].map((i) => {
    const seed = round + i;
    const angle = pick(goal.angles, round * 2 + i);
    return {
      id: `${goal.value}-${business.value}-${round}-${i}`,
      title: `${angle.title} — for ${business.label}`,
      text: buildPrompt(business, goal, angle, seed + total, opts.description ?? ""),
    };
  });
}
