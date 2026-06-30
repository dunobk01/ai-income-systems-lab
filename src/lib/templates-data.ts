export type TemplateKind = "prompt" | "n8n" | "lovable";

export type Template = {
  slug: string;
  kind: TemplateKind;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estTime: string;
  summary: string;
  useCases: string[];
  whoItsFor: string[];
  whyItWorks: string;
  setup: string[];
  // For prompt templates
  prompt?: string;
  variables?: { name: string; description: string }[];
  // For n8n templates
  nodes?: { name: string; purpose: string }[];
  jsonSnippet?: string;
  // For Lovable starters
  stack?: string[];
  pages?: { name: string; purpose: string }[];
  starterPrompt?: string;
  proTips: string[];
};

export const templates: Template[] = [
  {
    slug: "client-onboarding-mega-prompt",
    kind: "prompt",
    title: "Client Onboarding Mega-Prompt",
    category: "Service Business",
    difficulty: "Beginner",
    estTime: "10 min to first send",
    summary:
      "A single prompt that turns a 5-minute discovery call transcript into a finished welcome packet: kickoff email, scope summary, project timeline, comms expectations, and a first-week checklist for the client.",
    useCases: [
      "Freelance designers, devs, copywriters, and consultants closing 1–5 new clients per month.",
      "Agency owners standardizing onboarding so every new client gets the same A+ experience.",
      "Coaches and course operators replacing a clunky 7-email onboarding sequence with one polished packet.",
    ],
    whoItsFor: [
      "Service providers tired of writing the same welcome email 50 times.",
      "Operators who lose deals between contract signed and project started.",
      "Anyone whose onboarding currently lives in their head.",
    ],
    whyItWorks:
      "It frontloads three things buyers crave the moment money changes hands: clarity (what happens next), reassurance (you've done this before), and momentum (a small first action). The output also doubles as a scope-creep firewall — every later request can be matched against the written scope.",
    setup: [
      "Record the discovery call (Fathom, Otter, Granola, or your phone) and grab the transcript.",
      "Paste the prompt into ChatGPT/Claude with the transcript in the {{transcript}} block.",
      "Have the AI generate v1, then ask: 'Rewrite section 2 in my voice — punchier, fewer adverbs.'",
      "Drop the output into a Google Doc template and send within 1 business hour of contract sign.",
    ],
    prompt: `You are my senior client-success operator. Below is a transcript of a discovery call with a new client. Produce a complete onboarding packet I can send within one hour of the contract being signed.

CLIENT NAME: {{client_name}}
PROJECT: {{project_summary}}
PRICE: {{price}}
START DATE: {{start_date}}
MY BUSINESS NAME: {{my_business}}
MY VOICE NOTES: {{voice_notes}}

TRANSCRIPT:
"""
{{transcript}}
"""

Deliver, in order, with clear headings:

1. WELCOME EMAIL (≤180 words). Warm, confident, no fluff. End with a single CTA: schedule the kickoff call.

2. SCOPE SUMMARY (bullet form). Three sections — In Scope / Out of Scope / Assumptions. Pull every concrete deliverable named on the call. If something was ambiguous, list it under Assumptions and flag with [CONFIRM].

3. TIMELINE (week-by-week table). Columns: Week, Milestone, What I Need From You, What You Get. Cap at 8 weeks; collapse longer projects into phases.

4. COMMUNICATION GUIDE. Response times, preferred channel, meeting cadence, and the one thing you will NOT do (e.g., Slack DMs at 11pm).

5. FIRST-WEEK CHECKLIST FOR THE CLIENT. 5–7 items, each starting with a verb. Make item 1 take less than 5 minutes so they get a quick win.

6. KICKOFF CALL AGENDA. 25-minute structure with timestamps.

Rules:
- Write in second person ("you").
- No corporate jargon. No "circle back," no "synergy," no "leverage."
- Match my voice notes above. If voice notes are empty, default to: warm, direct, slightly dry humor, zero emoji.
- If any required detail is missing from the transcript, leave a [CONFIRM: …] placeholder rather than inventing it.`,
    variables: [
      { name: "{{client_name}}", description: "Full name of the new client." },
      { name: "{{project_summary}}", description: "One sentence: what you're building for them." },
      { name: "{{price}}", description: "Total project price or monthly retainer." },
      { name: "{{start_date}}", description: "Agreed kickoff date." },
      { name: "{{my_business}}", description: "Your business or personal brand name." },
      { name: "{{voice_notes}}", description: "Optional: 2–3 bullets describing your tone of voice." },
      { name: "{{transcript}}", description: "Raw transcript from the discovery call." },
    ],
    proTips: [
      "Run the output through a second pass: 'Find every claim or commitment in this packet that I cannot confidently honor in week 1. List them.' This is your scope-creep insurance.",
      "Save the rendered packet to a Notion template per client. The packet becomes the source of truth every future change request is measured against.",
      "Bill this packet as part of your onboarding fee, not free overhead. Clients value what they see produced.",
    ],
  },
  {
    slug: "viral-content-research-prompt",
    kind: "prompt",
    title: "Audience-First Content Engine Prompt",
    category: "Content",
    difficulty: "Intermediate",
    estTime: "20 min per content batch",
    summary:
      "Turns a single audience description into a research-grounded content engine: 10 post hooks, 3 long-form outlines, a 5-email sequence, and 8 short-form video scripts — all anchored to real pains pulled from Reddit, communities, and review sites.",
    useCases: [
      "Solo creators who keep posting and getting crickets because they're writing what THEY find interesting, not what their audience already searches for.",
      "Course creators and coaches whose content needs to do double duty: build authority AND drive enrollments.",
      "B2B founders writing LinkedIn / YouTube content as a one-person marketing team.",
    ],
    whoItsFor: [
      "Anyone whose 'content strategy' is currently 'post when I have time.'",
      "Operators who want one prompt run to produce a month of content, not one post.",
      "Builders who need content tied to a specific offer, not vague thought leadership.",
    ],
    whyItWorks:
      "It forces the model to extract real customer language first (verbatim phrases from the audience) and then write everything in that language. It also separates research from generation, which kills the 'generic AI tone' problem at the source.",
    setup: [
      "Pick ONE audience — narrow as possible (e.g., 'solo bookkeepers serving plumbers and electricians in the US' beats 'small business owners').",
      "Run the prompt in Claude or ChatGPT with web/research mode ON so it can pull verbatim language.",
      "Output goes into a Notion or Sheets content calendar. Each row gets a status: Draft / Scheduled / Posted.",
      "Re-run monthly for the same audience — keep what performed, replace the rest.",
    ],
    prompt: `You are my senior content strategist. Your job is to turn ONE audience description into a research-grounded month of content tied to ONE offer.

AUDIENCE: {{audience}}
THE OFFER I'M PROMOTING: {{offer}}
DESIRED OUTCOME FOR BUYER: {{outcome}}
CHANNELS I POST TO: {{channels}}
MY VOICE: {{voice}}

STEP 1 — RESEARCH (do this before writing anything).
Find 10 verbatim pains/desires/objections from this audience using Reddit threads, niche forums, Amazon reviews of competing books, YouTube comments on related videos, and X/LinkedIn posts. For each, output:
- The exact phrase (in quotes).
- The source platform.
- The underlying pain in 6 words or fewer.

STEP 2 — HOOKS.
Write 10 short-form hooks (≤220 chars each). Every hook must reuse at least one verbatim phrase from STEP 1. Label each as Pain / Desire / Belief / Status.

STEP 3 — LONG-FORM OUTLINES.
Pick the 3 strongest hooks. For each, produce a long-form outline:
- Working title.
- Promise (one sentence).
- 5 H2 sections with 2–3 bullets each.
- One concrete example or mini case study per section (you may invent realistic ones, but mark them [EXAMPLE]).
- A CTA paragraph that bridges to the offer above without sounding like an ad.

STEP 4 — EMAIL SEQUENCE.
A 5-email nurture sequence (Day 0, 2, 4, 6, 8). Each: subject, preview text, body outline (≤120 words), CTA. Day 0 = welcome + quick win. Day 8 = direct offer ask.

STEP 5 — SHORT-FORM SCRIPTS.
8 scripts ≤45 seconds for TikTok/Reels/Shorts. Format:
- Hook (≤3 seconds, on-screen text).
- Body (3 beats max).
- Pattern interrupt or visual cue.
- CTA line.

OUTPUT RULES:
- Write everything in the audience's language, not yours.
- No 'In today's fast-paced world.' No 'Are you struggling with…' openings.
- If the offer doesn't logically fit a post, say so — do not force it.
- Match my voice above. If voice is empty, default to: direct, specific, zero hedging.`,
    variables: [
      { name: "{{audience}}", description: "Narrow audience description (job + niche + context)." },
      { name: "{{offer}}", description: "The product, service, or course you're promoting." },
      { name: "{{outcome}}", description: "The transformation the buyer gets." },
      { name: "{{channels}}", description: "Where you post (e.g., LinkedIn + YouTube + email)." },
      { name: "{{voice}}", description: "2–3 bullets describing your tone." },
    ],
    proTips: [
      "Always run STEP 1 separately first. If the verbatim pains feel generic, your audience is too broad — narrow it and re-run.",
      "Keep a 'phrase bank' doc of the verbatim pains and reuse them in ads, sales pages, and onboarding emails. The same language compounds.",
      "Long-form outlines work best when you write the intro in your own voice and let the AI fill the H2 bodies — pure-AI intros are the giveaway.",
    ],
  },
  {
    slug: "n8n-lead-qualifier",
    kind: "n8n",
    title: "AI Lead Qualifier & Router",
    category: "Sales Ops",
    difficulty: "Intermediate",
    estTime: "45 min to deploy",
    summary:
      "Inbound form lead → enrich with Apollo or Hunter → Claude scores lead 1–10 against your ICP → hot leads ping you in Slack with a personalized opener, warm leads enter a nurture sequence, cold leads get auto-replied and tagged. Runs 24/7 and never forgets a lead.",
    useCases: [
      "Service providers (agencies, consultants, freelancers) drowning in mismatched inbound leads.",
      "Course creators with a free strategy call funnel who want to filter tire-kickers before booking calendar time.",
      "B2B SaaS founders running paid ads to a demo form who need same-day follow-up without hiring an SDR.",
    ],
    whoItsFor: [
      "Operators losing deals because lead response times stretch past 24 hours.",
      "Solo founders who can't manually qualify every form fill but refuse to hire too early.",
      "Teams running ads where 60%+ of leads are unqualified and clogging the pipeline.",
    ],
    whyItWorks:
      "Three forcing functions: (1) sub-5-minute response — the conversion cliff is brutal after that, (2) personalization at scale using public data, not generic templates, (3) routing — the right next action for each lead instead of one-size-fits-all. The Claude scoring step is what separates this from a basic Zapier flow: it reads context, not just keywords.",
    setup: [
      "Build a webhook trigger node in n8n and paste the webhook URL into your form (Tally, Typeform, Webflow, Framer — all work).",
      "Add an HTTP Request node to enrich the lead. Apollo, Hunter, or Clearbit all work; the free Hunter tier handles ~50/month.",
      "Add an Anthropic (Claude) node. Paste in your ICP description and the scoring prompt below; output structured JSON.",
      "Add a Switch node with three branches: score ≥ 8 → Slack alert + auto-email + CRM tag 'hot'. Score 4–7 → enter Mailchimp/ConvertKit nurture sequence. Score ≤ 3 → polite auto-reply + CRM tag 'cold'.",
      "Add an Error Trigger sub-workflow that posts every failure to Slack with the raw payload — never silently lose a lead.",
    ],
    nodes: [
      { name: "Webhook (form submission)", purpose: "Captures every new inbound lead in real time." },
      { name: "Set", purpose: "Normalizes field names (email, company, role, message)." },
      { name: "HTTP Request (Apollo/Hunter)", purpose: "Enriches with company size, industry, LinkedIn, tech stack." },
      { name: "Anthropic — Claude", purpose: "Scores 1–10 against ICP and drafts a personalized opener using one enrichment fact." },
      { name: "Switch (score-based routing)", purpose: "Splits the flow into hot / warm / cold lanes." },
      { name: "Slack (hot-lead alert)", purpose: "Pings you with the lead's data + draft opener in <60 seconds." },
      { name: "Gmail / Resend (auto-reply)", purpose: "Sends a tailored response per lane within minutes." },
      { name: "HubSpot / Sheets (CRM upsert)", purpose: "Logs the lead with score, tags, and the AI's reasoning." },
      { name: "Error Trigger sub-workflow", purpose: "Catches failures and posts the raw payload to Slack so no lead is lost." },
    ],
    jsonSnippet: `// Claude system prompt (paste into the Anthropic node)
You are my senior SDR. Score this lead against my ICP from 1 (terrible fit) to 10 (dream client).

MY ICP:
{{icp_description}}

LEAD DATA:
- Name: {{$json.name}}
- Email: {{$json.email}}
- Company: {{$json.company}}
- Role: {{$json.role}}
- Message: {{$json.message}}
- Enrichment: {{$json.enrichment}}

Output VALID JSON only, no markdown, no commentary:
{
  "score": <1-10>,
  "lane": "hot" | "warm" | "cold",
  "reason": "<≤25 words>",
  "opener": "<≤2 sentences, references 1 specific fact from enrichment>",
  "red_flags": ["<flag1>", "..."]
}

Rules:
- Hot ≥ 8: company is exact ICP, role can buy, message shows specific intent.
- Warm 4–7: partial fit; nurture.
- Cold ≤ 3: clear mismatch; polite decline.
- If enrichment is empty, never invent a fact. Reference the message instead.`,
    proTips: [
      "Cap the cost: add an IF node that skips enrichment for emails on free domains (gmail/yahoo/outlook). These rarely qualify and burn API credits.",
      "Log every Claude score + outcome to a Sheet. Once a month, review mis-scored leads and refine the ICP description — the workflow gets sharper without code changes.",
      "Never let the auto-reply lie. The opener should reference something the AI actually found — if enrichment is empty, fall back to the message body. Generic openers tank reply rates faster than slow response times.",
    ],
  },
  {
    slug: "n8n-content-engine",
    kind: "n8n",
    title: "End-to-End Content Repurposing Engine",
    category: "Content Ops",
    difficulty: "Advanced",
    estTime: "90 min to deploy, runs forever",
    summary:
      "One long-form input (YouTube transcript, podcast, blog post, or Notion doc) → AI generates a Twitter thread, 3 LinkedIn posts, 5 short-form video scripts, a newsletter, and 10 Pinterest captions — all matched to your voice, all queued in Buffer, all logged in Airtable for performance review.",
    useCases: [
      "Solo creators producing one long-form pillar per week who want 30+ derivative posts without burning 2 days.",
      "Coaches with a podcast or YouTube channel using it as a content flywheel for inbound leads.",
      "Founders running thought-leadership LinkedIn while shipping a SaaS — output without hiring a marketing team.",
    ],
    whoItsFor: [
      "Anyone whose Q1 content plan died by week 3 because creation was too manual.",
      "Operators who produce great long-form but can't distribute consistently.",
      "Teams using AI for content but getting flat, generic output because voice isn't injected systematically.",
    ],
    whyItWorks:
      "The brand voice is stored ONCE in Notion and injected into every prompt — the model never drifts toward the generic AI tone. Every output is logged with the source post, so a month later you know which long-form pieces produce the best derivatives. And because Buffer is the final step, you actually ship.",
    setup: [
      "In Notion, create a 'Voice Profile' page: 5 do's, 5 don'ts, 3 sample posts you'd kill for, banned phrases.",
      "Set the trigger: 'Webhook' (manual paste), 'YouTube new video' (Pipedream RSS), or 'Notion → status = Ready to Repurpose.'",
      "Add a Code node that fetches the Voice Profile from Notion and stores it in a variable used by every downstream AI node.",
      "Six parallel Anthropic/OpenAI branches: Twitter thread, LinkedIn (3), Shorts scripts (5), Newsletter, Pinterest captions (10). Each gets its own format-specific prompt + the voice profile.",
      "Merge node combines all outputs → Airtable 'Content Queue' table → Buffer API to schedule across the right channels at your peak times.",
      "Weekly summary: a second workflow (Cron, every Sunday) reads Buffer analytics and posts a Slack/email digest: top 3 performers, bottom 3, suggested next pillar topic.",
    ],
    nodes: [
      { name: "Trigger (Webhook / YouTube / Notion)", purpose: "Kicks off the pipeline whenever a new pillar piece is ready." },
      { name: "Notion (fetch Voice Profile)", purpose: "Single source of truth for tone, do's/don'ts, sample posts." },
      { name: "OpenAI / Claude — Twitter thread (8–12 tweets)", purpose: "Writes the thread in your voice with a hook, body, CTA." },
      { name: "OpenAI / Claude — LinkedIn x3", purpose: "Three angle variants: contrarian, story, framework." },
      { name: "OpenAI / Claude — Shorts scripts x5", purpose: "≤45-second scripts with hook, body, pattern interrupt, CTA." },
      { name: "OpenAI / Claude — Newsletter", purpose: "600–900 word email in your voice with one specific CTA." },
      { name: "OpenAI / Claude — Pinterest captions x10", purpose: "SEO-rich captions targeting saved keywords." },
      { name: "Merge → Airtable (Content Queue)", purpose: "Single source of truth for what's been generated, queued, and posted." },
      { name: "Buffer (schedule)", purpose: "Auto-queues each piece to the right channel at your tested peak time." },
      { name: "Cron (weekly analytics digest)", purpose: "Sunday review: top/bottom performers + next pillar suggestion." },
    ],
    jsonSnippet: `// Shared system prefix injected into every content node:
You are writing as {{creator_name}}. Voice profile:
DO: {{voice.dos}}
DON'T: {{voice.donts}}
BANNED PHRASES (never use): {{voice.banned}}
SAMPLE POSTS TO MATCH IN TONE (do not copy, match cadence and word choice):
{{voice.samples}}

Then format-specific instructions follow per node:

[TWITTER THREAD NODE — appended after the shared prefix]
Turn the SOURCE below into an 8–12 tweet thread. Tweet 1 is a hook (≤220 chars). Tweets 2–N are 1 idea each. Final tweet has a single CTA. No emojis unless the sample posts use them.

[LINKEDIN NODE — appended after the shared prefix]
Write 3 LinkedIn posts (≤1300 chars each). Angle 1: contrarian take. Angle 2: short story → lesson. Angle 3: numbered framework. Each ends with a single question to drive comments.

SOURCE:
"""
{{$json.source_text}}
"""`,
    proTips: [
      "Voice profile is the highest-leverage asset in this whole workflow. Spend an hour on it. Every prompt run benefits forever.",
      "Don't auto-schedule the FIRST run. Send everything to a Notion 'Review' page for the first 2 weeks while you tune voice. Then flip the switch to direct-to-Buffer.",
      "Add a 'reject' button in Notion that logs why a piece was rejected. After 50 rejections, run them through Claude to find the pattern — that's your voice profile v2.",
      "Pinterest is criminally underused for content repurposing — captions are SEO, pins drive evergreen traffic for years. Don't skip that branch.",
    ],
  },
  {
    slug: "lovable-leadmagnet-funnel",
    kind: "lovable",
    title: "Lead Magnet Funnel Starter",
    category: "Funnel",
    difficulty: "Beginner",
    estTime: "60 min to live site",
    summary:
      "A complete, conversion-tested lead magnet funnel: landing page with email capture → instant PDF delivery via Resend → 5-email nurture sequence in MailerLite → thank-you page with a tripwire offer link to Stripe checkout. Everything wired, nothing fake.",
    useCases: [
      "Creators launching a course or community who need an email list before they sell.",
      "Service businesses converting cold ad traffic into booked discovery calls.",
      "Newsletter operators who want a real funnel instead of a Beehiiv/Substack signup box.",
    ],
    whoItsFor: [
      "Anyone with a great lead magnet sitting in Google Drive doing nothing.",
      "Operators paying for ads but driving traffic to a generic homepage.",
      "Founders who want their funnel hosted on their own domain, not someone else's platform.",
    ],
    whyItWorks:
      "Every page is single-purpose (capture, deliver, sell) — zero distractions. Email goes straight to the inbox via Resend, not a delayed third-party blast. And the tripwire on the thank-you page captures the rare 2–5% of leads ready to buy NOW — usually enough to pay for ads.",
    setup: [
      "Spin up a new Lovable project with Cloud enabled (auth + database in one click).",
      "Use the starter prompt below — it scaffolds all 4 pages, the Resend integration, and the MailerLite webhook.",
      "Connect Resend (free tier = 3k emails/mo) and MailerLite (free tier = 1k subscribers) via Lovable's Connect.",
      "Upload your PDF to /public/lead-magnet.pdf — Resend attaches it on capture.",
      "Wire Stripe to the tripwire button. Lovable's Stripe integration handles checkout in one click.",
      "Point your domain at the published Lovable URL and run a test capture end-to-end before driving traffic.",
    ],
    stack: [
      "Lovable Cloud (auth + Postgres)",
      "Resend (transactional email + PDF delivery)",
      "MailerLite (5-email nurture sequence)",
      "Stripe Checkout (tripwire payment)",
      "Tailwind v4 + shadcn (UI)",
    ],
    pages: [
      { name: "/ (landing)", purpose: "Headline + 3 benefit bullets + email capture form. ONE CTA above the fold." },
      { name: "/thank-you", purpose: "Confirms email sent, then pitches the tripwire ($7–$27 product) with a 10-min countdown." },
      { name: "/checkout-success", purpose: "Confirms purchase + onboarding next steps. Honest, no upsell stacking." },
      { name: "/api/public/capture", purpose: "Webhook receiver: stores lead in DB, fires Resend email + adds to MailerLite group." },
    ],
    starterPrompt: `Build a lead magnet funnel called {{magnet_name}}.

PAGES:
1. / — Hero with headline "{{headline}}", subhead "{{subhead}}", 3 benefit bullets, and an email-only capture form (single field). One button: "{{cta_label}}". No nav, no footer links except a small privacy link.
2. /thank-you — Confirms PDF is on its way. Below the fold, pitch the tripwire: {{tripwire_name}} for {{tripwire_price}} with a 10-minute countdown timer. Single CTA button → Stripe Checkout.
3. /checkout-success — Friendly confirmation, the next 3 steps the buyer should take, and a calendar link if relevant.

BACKEND (Lovable Cloud + TanStack Start server fns):
- POST /api/public/capture validates email with Zod, upserts into a 'leads' table (email, source, created_at), sends the PDF via Resend (attach /public/lead-magnet.pdf), and adds the lead to MailerLite group "{{mailerlite_group}}" using the API key in env.
- Stripe Checkout for the tripwire uses a Lovable server fn that creates a Checkout Session and returns the URL.

DESIGN:
- Dark theme, big type, single accent color (#{{accent_hex}}).
- Mobile-first. Capture form must be the largest element on the landing page.
- No stock photos. Use simple typographic blocks.

GUARDRAILS:
- Never store the user in localStorage; rely on Cloud auth or anon flows.
- Validate the webhook input. Don't trust the client.
- Show clear error states if Resend or MailerLite fails — never silently lose a lead.`,
    proTips: [
      "Don't gate the lead magnet behind double opt-in for cold traffic — you'll lose 20%+ for almost zero spam benefit. Just verify email format and rate-limit by IP.",
      "Tripwire price sweet spot is $7–$27. Below $7 feels worthless, above $27 needs a longer sales page than a thank-you placement allows.",
      "Run a Hotjar/Microsoft Clarity session recording on the landing page for the first 100 visitors. You'll learn more in 1 hour than from a week of A/B testing.",
      "Move the MailerLite call to a background job (Cloud queue) if signups get bursty — keeps Resend on the hot path so the PDF lands fast.",
    ],
  },
  {
    slug: "lovable-ai-saas-starter",
    kind: "lovable",
    title: "Authenticated AI Tool SaaS Starter",
    category: "Micro-SaaS",
    difficulty: "Advanced",
    estTime: "2–3 hours to first paying user",
    summary:
      "Complete starter for a paid AI tool: auth (email + Google), Stripe subscription with metered usage, an AI generation page (Lovable AI Gateway), per-user history with RLS, and a dashboard showing usage vs. plan limits. Ship a $19/mo tool in a weekend.",
    useCases: [
      "Anyone with an AI prompt that consistently produces $5+ of value (resume rewriter, cold email generator, product description writer, contract summarizer).",
      "Course creators launching a paid tool as a backend bonus to their course.",
      "Devs validating a micro-SaaS idea without writing auth, billing, or DB plumbing from scratch.",
    ],
    whoItsFor: [
      "Builders who can write a great prompt but stall at auth + Stripe + RLS.",
      "Operators who want a real recurring product, not a one-time digital download.",
      "Anyone who's tried to combine 6 templates from GitHub and ended up with a Frankenstein that won't deploy.",
    ],
    whyItWorks:
      "Three pieces most starters get wrong are baked in: (1) RLS-correct history (every user only sees their own runs), (2) usage metering that actually blocks at plan limits (free 5/mo, paid 200/mo), (3) Stripe webhook that syncs profile.tier in real time so upgrades unlock immediately. Skipping any of these costs you a weekend each.",
    setup: [
      "New Lovable project with Cloud + Stripe integration enabled.",
      "Run the starter prompt below to scaffold every page, table, and server function.",
      "Add your prompt template to /src/lib/generator.functions.ts — that's the ONLY file you should need to edit to ship v1.",
      "Connect Stripe, create one $19/mo price, and paste the price ID into the env. The webhook auto-grants 'pro' tier on payment.",
      "Test the full loop: signup → free tier hits limit after 5 runs → upgrade → unlocks 200/mo → cancel → reverts at period end.",
      "Publish, point your domain, and ship. Charge from day 1 — paid feedback beats free feedback.",
    ],
    stack: [
      "Lovable Cloud (auth + Postgres + RLS)",
      "Lovable AI Gateway (Claude / Gemini / GPT — no API key juggling)",
      "Stripe (subscription + customer portal)",
      "TanStack Start server fns (typed RPC, no manual fetch)",
      "Tailwind v4 + shadcn (UI)",
    ],
    pages: [
      { name: "/ (landing)", purpose: "Sells the tool: headline, demo GIF, pricing, FAQ, signup CTA." },
      { name: "/auth", purpose: "Email + Google sign-in. Onboarding redirects new users to /welcome." },
      { name: "/_authenticated/app", purpose: "The AI tool itself. Single big input → generation → result + copy button." },
      { name: "/_authenticated/history", purpose: "Per-user list of past generations with re-run and delete." },
      { name: "/_authenticated/billing", purpose: "Current plan, usage bar (X / 200 this month), upgrade button, Stripe portal link." },
      { name: "/api/public/stripe/webhook", purpose: "Verifies signature, updates profiles.tier on checkout/cancel/refund." },
    ],
    starterPrompt: `Build an authenticated AI tool SaaS called {{product_name}}.

CORE FLOW: User signs up free → gets 5 generations → hits paywall → upgrades to {{plan_name}} ($19/mo) → unlocks 200 generations/month → can cancel anytime in Stripe portal.

PAGES TO BUILD:
- / (landing): headline "{{headline}}", 3 use cases, embedded sample output, pricing card ($19/mo, 200 runs), FAQ (5 questions), CTA → /auth.
- /auth: email + Google. New users redirect to /welcome (one onboarding step), returning users to /app.
- /_authenticated/app: one large textarea (the input), a 'Generate' button, a result panel with copy/download buttons. Show "X of {limit} runs left this month" above the button.
- /_authenticated/history: list past runs (input preview, timestamp, re-run, delete). RLS-scoped to the user.
- /_authenticated/billing: usage bar, current plan, upgrade button (Stripe Checkout), 'Manage subscription' button (Stripe portal).
- /api/public/stripe/webhook: verifies signature, updates profiles.tier on checkout.session.completed, customer.subscription.deleted, charge.refunded.

DATABASE (with RLS):
- profiles (user_id, tier, monthly_runs_used, monthly_runs_reset_at)
- generations (user_id, input, output, created_at) — RLS: users select/delete own only.
- A nightly cron resets monthly_runs_used to 0 on the user's billing anniversary.

SERVER FUNCTIONS:
- generate(input): checks tier + monthly_runs_used, calls Lovable AI Gateway with the prompt template in /src/lib/generator.functions.ts, increments counter, stores row in generations.
- listHistory(): returns user's past 50 generations.
- createCheckout(): returns Stripe Checkout URL for the {{plan_name}} price.
- openPortal(): returns Stripe Customer Portal URL.

GUARDRAILS:
- All AI calls happen server-side. Never expose the AI Gateway key to the client.
- Enforce the run limit BEFORE calling the AI (cheap check), not after.
- Stripe webhook MUST verify signature with timingSafeEqual. Reject otherwise.
- Free tier shows a friendly paywall card at the limit, not a console error.`,
    proTips: [
      "Resist the urge to add a second feature before you have 10 paying users. A great single-prompt tool will outsell a mediocre 5-feature tool every time.",
      "Set monthly_runs_used to a hard limit, not soft. Soft limits get abused and your Lovable AI bill spikes overnight.",
      "Add a 'Was this useful? 👍 / 👎' button on every output and log the feedback alongside the input. This becomes your prompt-improvement dataset for free.",
      "Show usage in the header on every page, not just /billing. Visible scarcity drives upgrades way better than a 'You hit your limit' modal.",
      "When you ship v2, do not change the existing prompt — fork it. Old users notice changes in output quality immediately and will churn.",
    ],
  },
];

export function getTemplate(slug: string) {
  return templates.find((t) => t.slug === slug);
}
