export type System = {
  slug: string;
  title: string;
  tagline: string;
  icon: "layers" | "rocket" | "bot" | "zap" | "wand" | "sparkles";
  summary: string;
  whatYouBuild: string[];
  examples: { title: string; detail: string }[];
  toolsUsed: { name: string; role: string }[];
  steps: { title: string; detail: string }[];
  monetization: string[];
  realisticOutcome: string;
  startingPrice: string;
  timeToShip: string;
};

export const systems: System[] = [
  {
    slug: "digital-products",
    title: "Digital products",
    tagline: "Ebooks, templates, prompt packs, mini-courses you can sell on day one.",
    icon: "layers",
    summary:
      "Digital products are downloadable assets people pay for once and you deliver automatically — forever. No inventory, no shipping, no support load. The AI stack lets one person produce in a week what used to take a small studio a quarter.",
    whatYouBuild: [
      "A 20–60 page ebook or guide in your niche, written in your voice and laid out in Canva or Notion.",
      "A pack of 50–200 prompts solving a specific problem (e.g. 'cold email prompts for B2B SaaS founders').",
      "A bundle of Notion / Google Sheets / Figma templates that buyers duplicate and use immediately.",
      "A short mini-course (5–15 video lessons or written modules) delivered through Gumroad, Podia, or your own Lovable site.",
      "An audio companion or AI-narrated version of any of the above.",
    ],
    examples: [
      { title: "'Cold DM Vault' for coaches", detail: "120 outreach prompts + 8 scripts. Built in a weekend with Claude, sold at $27 on Gumroad. Realistic first-month revenue: $400–$1,500." },
      { title: "'Notion Client OS' for freelancers", detail: "Project tracker, invoice log, and SOP library — all templates. ChatGPT writes the docs, Lovable hosts the sales page. Sells for $49." },
      { title: "'AI Side-Hustle Starter Pack' ebook", detail: "Researched in Perplexity, drafted in Claude, designed in Canva. 45 pages. $19 entry product." },
      { title: "'Pinterest Prompt Pack' for creators", detail: "Image-gen prompts + caption templates. Niche product, $14, sells well as a Pinterest-promoted lead-in." },
    ],
    toolsUsed: [
      { name: "Perplexity", role: "Validate niche pain + scan competitor offers." },
      { name: "Claude", role: "Write long-form content in your voice (200k context handles whole outlines)." },
      { name: "ChatGPT", role: "Generate prompts, captions, sales copy, and email sequences." },
      { name: "Lovable", role: "Sales page + checkout + thank-you flow without a Webflow subscription." },
      { name: "n8n", role: "Auto-deliver the file, tag the buyer, and trigger a 5-email follow-up." },
    ],
    steps: [
      { title: "Pick a buyer, not a topic", detail: "Choose one painful problem for one specific person. 'Prompts for solo coaches who hate writing DMs' beats 'AI for entrepreneurs.'" },
      { title: "Validate in 30 minutes", detail: "Use Perplexity to find 5 communities where this buyer hangs out and 3 competing products. If competitors exist and are selling, demand is real." },
      { title: "Draft the product in one sitting", detail: "Use the Module 7 templates to brief Claude. Output a full first draft of ebook / prompt pack / template set in 2–4 hours." },
      { title: "Package it cleanly", detail: "Canva for PDFs, Notion for templates, Gumroad or Lovable checkout for delivery. Looks professional in under an hour." },
      { title: "Launch to a real channel", detail: "Pinterest for visual products, LinkedIn for B2B, TikTok / Reels for niche creators. Run for 14 days, measure, iterate." },
    ],
    monetization: [
      "One-time price between $9–$97 depending on perceived value and audience.",
      "Bundle 2–3 products into a $79–$149 'starter kit' for 3–4x AOV.",
      "Add an order bump ($17–$27) at checkout — converts 20–35% with zero traffic increase.",
      "Use the product as a tripwire that leads into a higher-ticket service or coaching offer.",
    ],
    realisticOutcome:
      "A focused first product launched in 7–14 days. Realistic first 30 days for a complete beginner with a small audience: $200–$2,000. Compounding gains as you stack products and traffic.",
    startingPrice: "$9–$49 typical entry product",
    timeToShip: "7–14 days for v1",
  },
  {
    slug: "sales-funnels",
    title: "Sales funnels",
    tagline: "Lead magnet → landing page → tripwire → upsell — mapped end to end.",
    icon: "rocket",
    summary:
      "A funnel is the path a stranger walks from 'never heard of you' to 'paying customer' to 'buys again.' Without one, every sale is a coincidence. With one, traffic turns into predictable revenue.",
    whatYouBuild: [
      "A high-converting lead magnet (checklist, mini-guide, Notion template, or 5-day email course).",
      "A landing page that captures emails and sets up the offer in under 30 seconds of reading.",
      "A $7–$27 tripwire offer that liquidates ad spend and converts 5–15% of new subscribers.",
      "A core offer ($49–$497) sold via a longer sales page or VSL with bullet-proof copy.",
      "A 5-day welcome email sequence that builds trust and presents the offer with no pressure.",
      "An order-bump + one-click upsell flow that 1.5–2x's average order value with zero traffic increase.",
    ],
    examples: [
      { title: "Coach funnel", detail: "Free '10 LinkedIn lead prompts' → $17 'DM scripts' tripwire → $297 1:1 strategy call. Stack converts 1–3% of opt-ins to the call." },
      { title: "Digital product funnel", detail: "Pinterest pin → free Notion template → $27 template pack → $79 bundle upsell. Self-liquidates ads within 14 days." },
      { title: "Local service funnel", detail: "Google Business profile → free AI website audit → $499 site rebuild → $99/mo maintenance. Sells 2–4 a month for an indie operator." },
    ],
    toolsUsed: [
      { name: "Perplexity", role: "Find what your audience is already buying and where they hang out." },
      { name: "Claude", role: "Write the long-form sales page and VSL script in your voice." },
      { name: "ChatGPT", role: "Generate 30+ ad hooks, subject lines, and email variations." },
      { name: "Lovable", role: "Build the landing page, checkout, and thank-you flow with Stripe wired in." },
      { name: "n8n", role: "Tag subscribers, send drip emails, fire abandoned-cart sequences, sync to your CRM." },
    ],
    steps: [
      { title: "Reverse-engineer one winning funnel", detail: "Pick a competitor making money in your niche. Sign up for their list. Map every page, email, and offer. That's your blueprint." },
      { title: "Design the value ladder", detail: "Free → $9–$27 tripwire → $49–$297 core → $497+ premium. Each step delivers a win that earns the next sale." },
      { title: "Use the Funnel Builder", detail: "Inside the Lab, the Sales Funnel Builder generates landing copy, 5-day emails, sales page outline, and upsell pitch tailored to your offer." },
      { title: "Ship the pages in Lovable", detail: "Landing, checkout, thank-you, and upsell — built from the generated outline in a single afternoon." },
      { title: "Drive a small amount of traffic and measure", detail: "100 visitors is enough to know if the opt-in works. Iterate copy weekly until conversion targets hit." },
    ],
    monetization: [
      "Liquidate ad spend with the tripwire within 14 days.",
      "Compounding email revenue from the welcome sequence + weekly broadcasts.",
      "1.5–2x AOV from order bumps and one-click upsells.",
      "Funnel-as-a-service: build these for local businesses at $1.5k–$5k a build.",
    ],
    realisticOutcome:
      "First funnel live in 7–10 days. Target metrics: 20–40% opt-in rate, 5–15% tripwire conversion, 1–3% core offer conversion. From there it's a math problem, not a mystery.",
    startingPrice: "Funnel build-outs: $1.5k–$5k for clients",
    timeToShip: "7–10 days for a full funnel",
  },
  {
    slug: "simple-saas-mvps",
    title: "Simple SaaS MVPs",
    tagline: "Working web apps with auth, payments, and a real customer use case.",
    icon: "bot",
    summary:
      "Micro-SaaS is the leverage play of the decade. One narrow tool, one obvious buyer, one recurring price. With Lovable + AI as your dev team, you can ship a real app in a week and bill for it like a real product.",
    whatYouBuild: [
      "A focused single-purpose web app (one job done excellently, no scope creep).",
      "User auth, profile, and tier-based access (free / pro / team).",
      "Stripe checkout, subscription billing, customer portal — wired and tested.",
      "An AI feature at the core (gen, summarize, classify, automate) powered by an LLM API.",
      "A landing page that pre-sells the app and a dashboard that delivers it.",
    ],
    examples: [
      { title: "'PromptVault' — team prompt library", detail: "Teams store, tag, and version their best prompts. $19/user/mo. Sells to agencies and content teams." },
      { title: "'PinScribe' — Pinterest caption generator", detail: "Paste a pin URL, get 10 SEO-ready captions. $14/mo. Pinterest creators eat this." },
      { title: "'AuditBot' — local SEO audits", detail: "Enter a business URL, get a branded PDF audit. $99 one-time or $29/mo unlimited. Agencies white-label it." },
      { title: "'ClientBrief' — onboarding form → project plan", detail: "Client fills a form, AI returns a scoped plan + estimate. $39/mo. Freelancers replace 4 SaaS tools with it." },
    ],
    toolsUsed: [
      { name: "Perplexity", role: "Validate idea + find buyers + scan competing tools." },
      { name: "Claude", role: "Design the data model, write the spec, review code in 200k context." },
      { name: "ChatGPT", role: "Generate marketing copy, onboarding emails, support templates." },
      { name: "Lovable", role: "Build the full-stack app — UI, auth, database, payments — without writing code." },
      { name: "n8n", role: "Background jobs, scheduled emails, integrations with Stripe / Slack / your CRM." },
    ],
    steps: [
      { title: "Pick a sharp, painful, narrow problem", detail: "One persona. One job. One outcome. 'Cold-DM script generator for B2B SaaS founders' beats 'AI marketing assistant.'" },
      { title: "Spec it in Claude", detail: "Get a one-page PRD: user stories, screens, data model, billing tiers. This becomes the brief for Lovable." },
      { title: "Build the MVP in Lovable", detail: "Auth, dashboard, the one AI feature, and Stripe — typically 2–5 days of focused building." },
      { title: "Ship to 20 early users", detail: "Manual outreach to communities. Half free, half paid. Collect feedback, fix the top 3 issues, raise price." },
      { title: "Layer automation with n8n", detail: "Trial reminders, churn alerts, customer-success nudges — all hands-off." },
    ],
    monetization: [
      "$9–$49/mo per user (most micro-SaaS lives here).",
      "Lifetime deals ($79–$199) on AppSumo or your own list to fund early growth.",
      "Annual plans at 20–30% discount — improves cash flow and lowers churn.",
      "White-label / agency tier at 3–5x personal price.",
    ],
    realisticOutcome:
      "MVP shipped in 7–14 days. First 20 paying users in 30–60 days from focused outreach. Realistic path to $1k–$5k MRR in 90 days with consistent shipping. Real businesses (not lifestyle wishes) live above $10k MRR.",
    startingPrice: "$9–$49 per user / month",
    timeToShip: "7–14 days for the MVP",
  },
  {
    slug: "automations",
    title: "Automations",
    tagline: "n8n workflows that handle delivery, follow-up, and content repurposing.",
    icon: "zap",
    summary:
      "Automations are the silent revenue layer. While you sleep, n8n delivers products, follows up with buyers, posts content, syncs leads, and reclaims hours you used to spend in tabs. Build them once; they pay you forever.",
    whatYouBuild: [
      "A product-delivery workflow (Stripe purchase → file delivery → CRM tag → welcome sequence).",
      "A content-repurposing pipeline (one long-form piece → 5 social posts → 3 email sections → 1 newsletter).",
      "A lead-routing workflow (form submission → enrichment → Slack alert → personalized email).",
      "A reporting workflow (weekly metrics pulled from Stripe + GA + email → AI-summarized digest in your inbox).",
      "An AI-powered triage flow (inbound messages → classify → draft reply → flag for review).",
    ],
    examples: [
      { title: "Stripe → delivery → onboarding", detail: "New purchase triggers file delivery, CRM tagging, 5-email welcome sequence, and a Slack notification. Zero manual touches." },
      { title: "Long-form to atomic content", detail: "One blog post → ChatGPT splits into 5 LinkedIn posts, 3 tweets, 1 newsletter section, 2 Pinterest captions. Schedules the lot." },
      { title: "Lead enrichment + alerting", detail: "Form fill → Clearbit enrichment → AI scoring → Slack ping for hot leads → drip for cold ones." },
      { title: "Weekly AI metrics digest", detail: "Pulls Stripe revenue, email opens, GA traffic. Claude writes a one-screen summary. Lands in your inbox Sunday night." },
    ],
    toolsUsed: [
      { name: "n8n", role: "The orchestrator — visual workflows with 400+ integrations." },
      { name: "ChatGPT / Claude", role: "Reasoning, summarization, and content transformation inside each workflow." },
      { name: "Perplexity", role: "Live data fetches and enrichment steps." },
      { name: "Lovable", role: "Customer-facing dashboards or admin UI when the workflow needs one." },
    ],
    steps: [
      { title: "Pick a repeating manual task", detail: "Anything you do 3+ times a week that doesn't require judgment is a candidate." },
      { title: "Map it on paper first", detail: "Trigger → steps → outputs. If you can't draw it, you can't automate it yet." },
      { title: "Build in n8n using Lab templates", detail: "We ship pre-built workflow templates in Module 9 — drop in API keys and customize." },
      { title: "Add an AI step where judgment is needed", detail: "Classification, summarization, drafting. Keep humans on review for high-stakes outputs." },
      { title: "Test, version, monitor", detail: "Run on a test record, log failures to a Slack channel, version the workflow before any change." },
    ],
    monetization: [
      "Sell setup-and-maintain packages to small businesses at $500–$2k per workflow.",
      "Bundle 3 workflows + monthly retainer ($199–$499/mo) for recurring revenue.",
      "Productize a vertical solution ('AI delivery flow for course creators') as a one-time $299 install.",
      "Internal use: every automation saves 2–10 hours/week — direct margin gain on your own offers.",
    ],
    realisticOutcome:
      "First workflow shipped same day you start Module 9. Operator selling automations to local businesses can hit $2k–$8k/month within 60 days of focused outreach.",
    startingPrice: "$500–$2k per workflow build",
    timeToShip: "1–3 days per workflow",
  },
  {
    slug: "local-ai-services",
    title: "Local AI services",
    tagline: "Productized offers for small businesses — audits, mockups, automations.",
    icon: "wand",
    summary:
      "Local businesses know AI matters. Almost none of them know how to use it. A productized AI service kit lets you walk into any small business and sell a $500–$2,000 outcome in a 15-minute conversation.",
    whatYouBuild: [
      "An AI website audit (PDF report generated from one URL + a Claude analysis pass).",
      "An AI-rebuilt website or landing page in Lovable, delivered in 3–5 days.",
      "A 'Google Business Profile + review reply' automation set up in n8n.",
      "An AI chatbot or lead-capture form embedded on their existing site.",
      "A monthly content pack: 8 social posts + 1 newsletter + replies handled — productized at $299–$499/mo.",
    ],
    examples: [
      { title: "Dental office", detail: "AI audit ($199) → website rebuild ($1,499) → monthly content + reviews ($349/mo). Single client, $5k year one." },
      { title: "Local trades (HVAC, plumbing, roofing)", detail: "Lead-capture form + AI quote estimator + SMS follow-up automation. $999 setup + $199/mo." },
      { title: "Restaurant", detail: "AI-generated menu copy + weekly social pack + reservations form rebuild. $799 launch + $249/mo." },
      { title: "Realtor", detail: "AI listing descriptions + property landing pages + buyer drip emails. $599/mo retainer." },
    ],
    toolsUsed: [
      { name: "Perplexity", role: "Research the local business + competitors in 10 minutes before any call." },
      { name: "ChatGPT", role: "Draft the proposal, the contract, and all client-facing copy." },
      { name: "Claude", role: "Audit reports and long-form deliverables." },
      { name: "Lovable", role: "Ship the website / landing page / chatbot UI fast." },
      { name: "n8n", role: "All the recurring automations that justify the monthly retainer." },
    ],
    steps: [
      { title: "Pick one vertical", detail: "Dentists, lawyers, gyms, restaurants, contractors. Specializing lets you reuse 80% of every deliverable." },
      { title: "Build one templated offer", detail: "Use the Module 10 Local Service Kit to build a single $999–$1,999 productized offer + a $199–$499/mo retainer." },
      { title: "Pre-record the demo audit", detail: "A 5-minute Loom showing the AI audit + sample fixes. This is your entire sales asset." },
      { title: "Outreach: 20 businesses per week", detail: "Cold email, Instagram DM, in-person walk-ins, or a $5/day local ad. Aim for 1 close per 20 conversations." },
      { title: "Deliver, document, raise prices", detail: "After 3 paid clients, raise prices 20%. After 10, productize harder and hire help." },
    ],
    monetization: [
      "$999–$1,999 setup fees per client.",
      "$199–$499/mo recurring retainers (this is the gold).",
      "Bundle deals at $3k–$5k for full 'AI starter kit' packages.",
      "Referral commissions from local-business networks (BNI, chambers, etc.)",
    ],
    realisticOutcome:
      "First paid client in 14–30 days from cold outreach. $3k–$10k MRR within 90 days for a focused operator working part-time. Local services scale via hiring more cleanly than any other path.",
    startingPrice: "$999–$1,999 setup + $199–$499/mo",
    timeToShip: "3–5 days per client delivery",
  },
  {
    slug: "content-systems",
    title: "Content systems",
    tagline: "Repeatable AI content pipelines for Pinterest, TikTok, Shorts, and SEO.",
    icon: "sparkles",
    summary:
      "Posting once and hoping is not a strategy. A content system produces, schedules, and repurposes assets on a fixed cadence — and uses AI to do 80% of the labor. The output: real reach, real list growth, real sales.",
    whatYouBuild: [
      "A Pinterest pipeline: 20–40 pins/week generated, scheduled, and tracked against keyword targets.",
      "A short-form video pipeline: hooks → scripts → captions → on-screen text for TikTok / Reels / Shorts.",
      "An SEO pipeline: keyword research → outline → 1,500-word draft → publish → internal linking.",
      "A newsletter pipeline: 1 weekly issue assembled from the week's other content in under 30 minutes.",
      "A 'repurpose once' workflow: every long-form piece becomes 8–12 micro-assets across platforms.",
    ],
    examples: [
      { title: "Pinterest funnel for digital products", detail: "30 pins/week → opt-in page → $27 product. Operators routinely hit 100k+ monthly impressions in 90 days." },
      { title: "SEO content engine for affiliate revenue", detail: "Niche site publishes 3 long-form posts/week. AI handles outlines + first drafts; you edit. Revenue compounds for years." },
      { title: "Shorts pipeline for a coach", detail: "5 hooks/day generated by ChatGPT, filmed in one batch, edited in CapCut, scheduled. 1–2 reels go viral per month." },
      { title: "Newsletter from existing content", detail: "Claude reads the week's blog posts, tweets, and YouTube transcripts; assembles a 600-word weekly issue. Reader growth: 5–15% month-over-month." },
    ],
    toolsUsed: [
      { name: "Perplexity", role: "Keyword research, trend scanning, competitor monitoring." },
      { name: "ChatGPT", role: "Hooks, captions, short-form scripts, batch ideation." },
      { name: "Claude", role: "Long-form drafts, newsletters, multi-piece repurposing." },
      { name: "Lovable", role: "Landing pages, lead-capture forms, and any owned-media hub." },
      { name: "n8n", role: "Scheduling, cross-posting, performance tracking, repurpose-on-publish flows." },
    ],
    steps: [
      { title: "Pick one platform first", detail: "Pinterest for digital products, SEO for affiliate / lead gen, Shorts for personal brand. Win one before adding another." },
      { title: "Define the cadence", detail: "20 pins/week or 3 blog posts/week or 1 long video + 5 shorts. Pick a number you can hit forever." },
      { title: "Build the production line in Lab templates", detail: "Module 6 (Lovable), Module 7 (Product), and the prompt library give you the entire pipeline ready to clone." },
      { title: "Batch produce + schedule", detail: "One half-day a week. Produce 7 days' worth in one sitting. Schedule with n8n, Buffer, or Tailwind." },
      { title: "Measure weekly, double down monthly", detail: "Track impressions, clicks, opt-ins, sales. Cut what doesn't work. Compound what does." },
    ],
    monetization: [
      "Traffic → opt-in → digital product (own content drives own sales).",
      "Affiliate commissions on niche SEO sites.",
      "Sponsorships once you cross 5k–10k engaged followers in a niche.",
      "Sell the content system itself as a $999–$2,999 service to other operators.",
    ],
    realisticOutcome:
      "First 90 days: 10k–100k monthly impressions on one platform with consistent posting. Direct revenue lags reach by 60–90 days — but compounds for years once flywheel turns.",
    startingPrice: "$0 setup, time + tool cost only",
    timeToShip: "First batch live in week 1",
  },
];

export const getSystemBySlug = (slug: string) => systems.find((s) => s.slug === slug);
