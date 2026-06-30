export type StarterTool = {
  name: string;
  category: string;
  role: string;
  pricing: string;
  whyIts1stPick: string;
  setupSteps: string[];
  recommendedConfig: string[];
  firstWin: string;
  swapWith: string[];
};

export type StarterSection = {
  title: string;
  subtitle: string;
  tools: StarterTool[];
};

export const starterKit: StarterSection[] = [
  {
    title: "The Core 5 — Day-1 essentials",
    subtitle: "If you only set up five tools this week, make it these.",
    tools: [
      {
        name: "ChatGPT (Plus or Pro)",
        category: "LLM",
        role: "Daily AI co-pilot. Writing, planning, GPTs, voice mode, deep research.",
        pricing: "$20/mo (Plus) — required. $200/mo (Pro) — only if you live in deep research.",
        whyIts1stPick:
          "Best ecosystem (Projects, Custom GPTs, voice, image, code interpreter) and the default tool every team you collaborate with already knows.",
        setupSteps: [
          "Sign up for Plus and turn on memory.",
          "Create a Project per active client / workstream — keep instructions, files, and chats scoped per project.",
          "Build your first Custom GPT for one task you do 3+ times a week (e.g., 'cold email rewriter' or 'meeting-notes summarizer').",
          "Set Custom Instructions: who you are, what you do, how you want answers (length, tone, format).",
        ],
        recommendedConfig: [
          "Memory: ON. Review monthly and prune anything outdated.",
          "Default model: GPT-5 for daily, o-series only when you actually need reasoning.",
          "Voice mode for brainstorming on walks — transcript pastes straight into Notion.",
          "Custom Instructions template (copy-paste starter): 'I'm a [role] building [product] for [audience]. Be direct, skip preamble, use lists when comparing options, write at a 9th-grade level.'",
        ],
        firstWin:
          "Build one Custom GPT this week that replaces an hour of weekly busywork. That single GPT pays for the subscription forever.",
        swapWith: ["Claude (better for long-form writing)", "Gemini (best for video, big context)"],
      },
      {
        name: "Claude (Pro or Max)",
        category: "LLM",
        role: "Long-form writing, code review, document analysis, and any task >50k input tokens.",
        pricing: "$20/mo (Pro). $100–200/mo (Max) for power users.",
        whyIts1stPick:
          "Best writing voice (least 'AI-toned'), strongest at staying on-instruction across long docs, and the Artifacts panel makes one-shot apps and docs immediately usable.",
        setupSteps: [
          "Sign up for Pro.",
          "Create one Project per major workstream and upload your brand voice doc + style guide as project files.",
          "Pin Claude as a second tab next to ChatGPT — switch between them based on task, not loyalty.",
        ],
        recommendedConfig: [
          "Project knowledge files (max 5 per project) should include: voice/style guide, ICP doc, past 3 sample deliverables.",
          "Default to Claude Sonnet 4.5 for daily; Opus only for the hardest reasoning tasks.",
          "Use Artifacts for any one-page deliverable (landing page copy, SOP, contract) — copy out when done.",
        ],
        firstWin:
          "Take any long doc (PDF transcript, RFP, contract) that's been sitting in your inbox >1 week and ask Claude for a 1-page TL;DR + 3 next actions. Ship it before lunch.",
        swapWith: ["ChatGPT (broader ecosystem)", "Gemini (free + huge context)"],
      },
      {
        name: "Lovable",
        category: "App Builder",
        role: "Build & ship full-stack web apps via AI: landing pages, dashboards, internal tools, SaaS.",
        pricing: "Free tier available. Paid from $25/mo for serious building.",
        whyIts1stPick:
          "Only AI builder that gives you a real Git-backed codebase you can take anywhere, plus Lovable Cloud (auth + Postgres + functions) and AI Gateway (no API key juggling) built in.",
        setupSteps: [
          "Create your first project — start from a clear one-paragraph spec, not a vague vibe.",
          "Enable Lovable Cloud the moment you need auth, a DB, or any backend logic (one click).",
          "Connect a custom domain when you're ready to publish — don't ship marketing pages on the default subdomain.",
        ],
        recommendedConfig: [
          "Always describe: audience, the ONE thing the page should make happen, color/feel, examples you want to feel like.",
          "Keep prompts surgical. 'Change the hero CTA to brand-orange and shorten to 4 words' beats 'make it pop.'",
          "Set up Stripe via the integration, not raw API code — the integration handles webhooks for you.",
        ],
        firstWin:
          "Replace your most-out-of-date page (about, contact, services) with a Lovable-built version in 30 minutes.",
        swapWith: ["v0 (React-only, no backend)", "Bolt (similar AI-builder model)"],
      },
      {
        name: "n8n (Cloud or self-hosted)",
        category: "Automation",
        role: "Connect every tool you use — AI, CRM, email, Sheets — into background workflows that run 24/7.",
        pricing: "Free if self-hosted on Render/Railway. Cloud from $20/mo.",
        whyIts1stPick:
          "Open-source, AI-native (built-in OpenAI/Anthropic/HTTP nodes), self-hostable, and 10× more flexible than Zapier or Make at lower cost.",
        setupSteps: [
          "Sign up for n8n Cloud OR deploy free on Render in 10 min.",
          "Connect 3 credentials to start: OpenAI/Anthropic, Google (Sheets + Gmail), and Slack.",
          "Build your first workflow: webhook → AI processing → write to Sheets → Slack alert. That's the pattern under 80% of useful automations.",
          "Always add an Error Trigger sub-workflow that posts failures to Slack. Silent failures kill trust in automation faster than any bug.",
        ],
        recommendedConfig: [
          "Tag every workflow with status: 'production' / 'experimental' / 'paused'. Auto-pause experimental ones after 30 days.",
          "Cap external API calls (OpenAI, Apollo, etc.) with an IF node that checks daily run count from a Sheet — keeps costs predictable.",
          "Use Variables (not hardcoded values) for prompts, model names, and webhook URLs so swapping providers takes minutes.",
        ],
        firstWin:
          "Automate the one task you copy-paste between two apps daily. Even saving 10 min/day = 60 hours/year reclaimed.",
        swapWith: ["Make.com (more polished UI)", "Zapier (broadest integrations, more expensive)"],
      },
      {
        name: "Notion",
        category: "Workspace",
        role: "Source of truth: SOPs, voice profile, ICP docs, content calendar, client docs.",
        pricing: "Free for solo. $10/mo Plus for AI + unlimited file uploads.",
        whyIts1stPick:
          "Every AI workflow you build will need ONE source of truth for voice, ICP, and SOPs — Notion is the lowest-friction place to store them and pipe them into your tools.",
        setupSteps: [
          "Create 4 top-level pages: Voice Profile, ICP, SOPs, Active Projects.",
          "Set up a Content Queue database with these properties: title, status, channel, source pillar, scheduled date, AI-generated (checkbox).",
          "Add your top 5 'banned phrases' to the Voice Profile — feed this into every AI generation prompt.",
        ],
        recommendedConfig: [
          "Use a single Voice Profile page everywhere, not duplicates per project — it stays consistent.",
          "Templates > free-form pages. Make a template for: client kickoff, weekly review, content pillar.",
          "Notion API → n8n: trigger workflows when a page status changes to 'Ready to Publish'.",
        ],
        firstWin:
          "Build the Voice Profile page today. Every AI tool you use after that produces better output overnight.",
        swapWith: ["Coda (more programmable)", "Obsidian (local-first, no cloud)"],
      },
    ],
  },
  {
    title: "Outreach & Sales",
    subtitle: "For solo operators and small teams turning AI into pipeline.",
    tools: [
      {
        name: "Apollo.io",
        category: "Lead Data",
        role: "Find verified leads (email + LinkedIn), build prospect lists, fire enrichment from n8n.",
        pricing: "Free tier (limited credits). Paid from $49/mo.",
        whyIts1stPick:
          "Best price-per-verified-email at solo-operator scale. Great API for n8n enrichment workflows.",
        setupSteps: [
          "Build your ICP filter (industry, size, role, geo, tech) and save it.",
          "Export the first 100 leads to test — never blast 5,000 cold.",
          "Connect Apollo to n8n via API key for real-time enrichment of inbound form leads.",
        ],
        recommendedConfig: [
          "Always enrich BEFORE writing the email, never after. Personalization is 80% of reply rate.",
          "Daily cap of 50 cold sends per inbox to avoid deliverability damage.",
          "Track replies + meetings booked, not opens (opens are a vanity metric since iOS Mail Privacy).",
        ],
        firstWin:
          "Pull a list of 25 perfect-fit leads today and write a personalized line for each using ChatGPT + the Apollo enrichment data. Send tomorrow.",
        swapWith: ["Clay (more powerful, more expensive)", "Hunter (lighter, cheaper)"],
      },
      {
        name: "Smartlead / Instantly",
        category: "Cold Email",
        role: "Multi-inbox cold outreach with deliverability warm-up and reply detection.",
        pricing: "From $39/mo.",
        whyIts1stPick:
          "Solo-operator-friendly: rotates across multiple sender inboxes automatically so you don't burn one domain.",
        setupSteps: [
          "Buy 3+ secondary domains (e.g., yourbrand.co, .io, .so) — never send cold from your primary.",
          "Set up SPF/DKIM/DMARC on every domain. Use Google Workspace or Mailreach.",
          "Run warm-up for 14 days before any real send. Be patient — this is where everyone shortcuts and fails.",
        ],
        recommendedConfig: [
          "Cap at 30 sends per inbox per day. More = spam folder.",
          "Two follow-ups max. Anyone who hasn't replied by email 3 isn't replying.",
          "Personalization variable in every email — first line should reference something specific.",
        ],
        firstWin:
          "Run a 50-prospect test campaign before scaling. Measure positive replies, not opens.",
        swapWith: ["Lemlist (more polished)", "QuickMail (more SDR-team focused)"],
      },
    ],
  },
  {
    title: "Content & Distribution",
    subtitle: "Create once, distribute everywhere, log performance.",
    tools: [
      {
        name: "Descript",
        category: "Video / Audio",
        role: "Edit video & podcasts by editing the transcript. Remove filler words in one click.",
        pricing: "Free tier. Paid from $15/mo.",
        whyIts1stPick:
          "Lowest-friction way to turn raw recordings into polished long-form content + short clips for repurposing.",
        setupSteps: [
          "Upload your first long-form recording.",
          "Run 'Studio Sound' + remove filler words + auto-create chapters.",
          "Export clips for short-form (vertical 9:16 with auto-captions) in batch.",
        ],
        recommendedConfig: [
          "Always keep the original file backed up before editing — Descript edits are non-destructive but it's good hygiene.",
          "Templates for intros/outros saves 10 min per episode.",
          "Auto-captions ON by default for every export. Captions = 80%+ of social video watch time.",
        ],
        firstWin:
          "Take an existing podcast or talk you recorded and ship 5 short-form clips by end of week.",
        swapWith: ["Opus Clip (clips only, faster)", "Premiere/Final Cut (more powerful, much higher friction)"],
      },
      {
        name: "Buffer / Publer",
        category: "Social Scheduling",
        role: "Schedule once across LinkedIn, X, Threads, IG, Pinterest, TikTok.",
        pricing: "Free for 3 channels. Paid from $6/mo per channel.",
        whyIts1stPick:
          "Cheapest scheduler with a real API. n8n can push the output of your content engine straight into the Buffer queue.",
        setupSteps: [
          "Connect your 3 primary channels.",
          "Set posting times per channel based on your audience analytics, not generic 'best time' charts.",
          "Generate an API token and add it to n8n credentials.",
        ],
        recommendedConfig: [
          "Queue 5–7 days ahead, never further — performance feedback should drive next week's plan.",
          "Use post tags to filter analytics: 'pillar', 'repurposed', 'tripwire', 'community'.",
          "Re-share top performers after 30 days; most followers missed it the first time.",
        ],
        firstWin:
          "Schedule next week tonight. Removes daily decision fatigue and you'll post more consistently than 95% of creators.",
        swapWith: ["Hypefury (X / Threads focus)", "Metricool (more analytics)"],
      },
    ],
  },
  {
    title: "Backend & Ops",
    subtitle: "The infrastructure your AI workflows run on.",
    tools: [
      {
        name: "Stripe",
        category: "Payments",
        role: "Take money. Subscriptions, one-time, refunds, customer portal, tax.",
        pricing: "2.9% + 30¢ per transaction.",
        whyIts1stPick:
          "Universal default. Every tool integrates with it. Customer portal solves 90% of billing support emails.",
        setupSteps: [
          "Create products in test mode first. Always.",
          "Use Stripe-hosted Checkout, not custom forms — saves you a month of fraud / 3DS / wallet handling.",
          "Wire the webhook to your app with signature verification. Never trust client-side payment events.",
          "Enable the Customer Portal so users self-serve cancellations and card updates.",
        ],
        recommendedConfig: [
          "Charge taxes via Stripe Tax. Don't try to do this yourself.",
          "Save the receipt URL on every order for support lookups.",
          "Set webhook retries to ON — Cloudflare hiccups happen.",
        ],
        firstWin:
          "Run one $1 test charge through your full webhook → unlock-feature flow before you go live.",
        swapWith: ["Lemon Squeezy (handles VAT as merchant of record)", "Paddle (similar)"],
      },
      {
        name: "Resend",
        category: "Transactional Email",
        role: "Send receipts, lead-magnet delivery, password resets, in-app notifications.",
        pricing: "Free for 3k emails/mo. Paid from $20/mo.",
        whyIts1stPick:
          "Modern developer-friendly API, great deliverability, easy domain auth. Lovable Cloud integration = one click.",
        setupSteps: [
          "Add and verify your sending domain (SPF, DKIM auto-generated).",
          "Set up at least one branded React Email template for receipts and welcome emails.",
          "Pipe webhook events (bounce, complaint, open) into your DB for clean-list management.",
        ],
        recommendedConfig: [
          "Send transactional from a dedicated subdomain (e.g., mail.yourbrand.com), keep cold sends off your primary.",
          "Add an unsubscribe link to every email — even transactional. It's required and protects deliverability.",
          "Suppress bounced + complained emails permanently in your DB.",
        ],
        firstWin:
          "Move every transactional email out of personal Gmail this week. Cleaner inbox + 10× better deliverability.",
        swapWith: ["Postmark (similar)", "AWS SES (cheapest, more setup)"],
      },
      {
        name: "MailerLite",
        category: "Newsletter / CRM",
        role: "Newsletter, automated sequences, segmentation, list growth.",
        pricing: "Free up to 1k subscribers. Paid from $9/mo.",
        whyIts1stPick:
          "Most generous free tier, drag-and-drop automations, decent API. Great fit for solo creators.",
        setupSteps: [
          "Create your main list + 3 segments: leads (cold), customers (paid), engaged (opened 30d).",
          "Build one welcome automation (5 emails) for every new subscriber.",
          "Connect to n8n with an API key for programmatic adds from your funnel.",
        ],
        recommendedConfig: [
          "One newsletter per week, same day, same time. Consistency > polish.",
          "Tag-based segmentation, not list-based — tags are reusable, lists are walled off.",
          "Re-engagement campaign every 90 days. Prune unopens to keep deliverability high.",
        ],
        firstWin:
          "Send your first email to whatever list you already have, even if it's 12 people. Shipping > waiting.",
        swapWith: ["Beehiiv (creator-focused, paid tiers)", "ConvertKit/Kit (most powerful for course creators)"],
      },
    ],
  },
];
