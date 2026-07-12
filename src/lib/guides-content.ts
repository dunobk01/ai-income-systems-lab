// Static, long-form pillar guides for /guides.
// Each guide is a complete standalone operating manual.

export type Block =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; text: string }
  | { type: "prompt"; label: string; text: string };

export type Section = {
  id: string;
  title: string;
  blocks: Block[];
};

export type StaticGuide = {
  slug: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string; // tailwind classes
  readMinutes: number;
  publishedAt: string; // ISO
  intro: Block[];
  sections: Section[];
  next?: { slug: string; title: string };
};

const CTA_BLOCKS: Block[] = [
  {
    type: "p",
    text:
      "If this guide gave you clarity, the full AI Income Systems Lab curriculum takes you from playbook to shipped business — courses, live builds, prompt library, workflow templates, and a private community of builders.",
  },
  {
    type: "callout",
    text:
      "→ Full curriculum + community: ai-income-systems.com  ·  Free AI Business Engine prompt pack (20 prompts): ai-income-systems.netlify.app/prompt-engine",
  },
];

// ---------------------------------------------------------------------------
// GUIDE 1 — Cold Start System
// ---------------------------------------------------------------------------
const g1: StaticGuide = {
  slug: "cold-start-system",
  title:
    "The Cold Start System: How to Build and Launch a Digital Income System from Absolute Zero in 14 Days",
  description:
    "The exact 14-day operating sequence — validation, product, funnel, automation, and traffic — to go from blank page to a live income system, with every prompt included.",
  badge: "System",
  badgeColor: "bg-primary/15 text-primary border-primary/30",
  readMinutes: 26,
  publishedAt: "2026-07-08T00:00:00.000Z",
  intro: [
    {
      type: "p",
      text:
        "Most people fail at building AI income not because they lack knowledge but because they lack sequence. They have tools but no order of operations. They spin up a Notion doc, sign up for six SaaS trials, generate a logo, tweet about the project, and two weeks later they have nothing to sell and nobody to sell it to.",
    },
    {
      type: "p",
      text:
        "The people who ship do the same five things in the same order every time: validate the demand, build a small product fast, wrap it in a minimum viable funnel, automate the boring parts, and drive traffic from three specific channels. This guide is that sequence — day by day, tool by tool, decision by decision.",
    },
    {
      type: "p",
      text:
        "Follow it as written. Do not reorder it. The order is the product.",
    },
  ],
  sections: [
    {
      id: "day-1-2",
      title: "Day 1–2 · The Validation Sprint",
      blocks: [
        {
          type: "p",
          text:
            "The most expensive mistake in this entire process is building something nobody wants. It costs you nothing in dollars and everything in momentum. Before you write a single word of a product, you validate the idea in under two hours using this exact workflow.",
        },
        { type: "h3", text: "Step 1 — Pull raw demand signal from Perplexity" },
        {
          type: "p",
          text:
            "Perplexity is the fastest way to get cited, source-linked evidence that a problem is real. You are not looking for opinions here — you are looking for language people are already using to describe their pain.",
        },
        {
          type: "prompt",
          label: "Perplexity — niche pain research",
          text:
            "Research the top 5 most painful unsolved problems for [YOUR NICHE] in 2026. For each problem: what are people searching for, what solutions currently exist, what do existing solutions get wrong, and what would an ideal solution actually look like? Include real forum threads, Reddit discussions, and search data where available. Cite everything.",
        },
        { type: "h3", text: "Step 2 — Rank the problems with Claude" },
        {
          type: "p",
          text:
            "Perplexity gives you a menu. Claude gives you a decision. Paste the Perplexity output into Claude and ask it to grade the options against the criteria that actually predict whether a digital product will sell.",
        },
        {
          type: "prompt",
          label: "Claude — problem ranking",
          text:
            "I'm evaluating these 5 niche problems for a digital product business. Score each one on: (1) search demand evidence, (2) existing competition gaps, (3) willingness to pay signals, (4) how quickly I could create a solution, and (5) how clearly I could explain the value in one sentence. Give me a ranked recommendation with your reasoning. Be direct — tell me which one to build and why.",
        },
        { type: "h3", text: "Step 3 — Pressure-test the winner in ChatGPT" },
        {
          type: "p",
          text:
            "Before you commit, generate synthetic voice-of-customer data. The goal is to hear how a real frustrated human would describe this problem — the exact phrasing you will echo back in your headlines, hooks, and product copy.",
        },
        {
          type: "prompt",
          label: "ChatGPT — synthetic VOC",
          text:
            "Write 10 Reddit-style posts from real frustrated people who have this exact problem: [PROBLEM]. Make them specific, emotional, and use real language — not marketing language. These should read like actual complaints from actual people. Then tell me: what would make someone instantly click on a solution to this problem? What words would they respond to?",
        },
        { type: "h3", text: "The 20-person rule" },
        {
          type: "p",
          text:
            "A validated idea has a simple signature: you can find 20+ real people actively complaining about this problem online in the last 90 days. Threads, tweets, YouTube comments, subreddit posts. If you cannot find 20 people, the problem is not painful enough. Move on. Do not fall in love with an idea you cannot find evidence for.",
        },
        {
          type: "callout",
          text:
            "Deliverable by end of Day 2: one written problem statement, one target audience description, and 10+ pieces of copy-pasted evidence from real people describing the pain in their own words.",
        },
      ],
    },
    {
      id: "day-3-5",
      title: "Day 3–5 · Build the Product Fast",
      blocks: [
        {
          type: "p",
          text:
            "The product takes three days. Not three weeks. This is the single most important belief shift in the whole guide. The goal is a minimum viable product that delivers a clear tangible outcome, not a masterpiece. You will improve version two after you have proof someone will pay for version one.",
        },
        { type: "h3", text: "Pick the format on purpose" },
        {
          type: "ul",
          items: [
            "PDF guide — easiest to make, best for teaching a framework or process. Price band: $9–$29.",
            "Prompt pack — highest perceived value per dollar for an AI audience, easiest to sell. Price band: $17–$47.",
            "Template bundle — Notion, Airtable, spreadsheets, doc templates. Higher perceived value, slightly longer build. Price band: $27–$79.",
            "Mini-course — 3–5 short lessons + a workbook. Highest price point, most effort. Price band: $49–$149.",
          ],
        },
        {
          type: "p",
          text:
            "Pick one. The correct answer for a first launch is almost always PDF guide or prompt pack. You can always upgrade to a course later — you cannot recover the two weeks you burn trying to record perfect video before you have a single buyer.",
        },
        { type: "h3", text: "Architect the product with Claude" },
        {
          type: "prompt",
          label: "Claude — product outline",
          text:
            "You are a digital product strategist. I'm creating a [FORMAT] for people who struggle with [PROBLEM]. The product needs to deliver a clear, tangible outcome in under 60 minutes of use. Build me: (1) a complete table of contents with section descriptions, (2) the one-sentence value proposition, (3) the 3 things this product must do to feel worth 10x the price, (4) the quick win — what can someone accomplish in the first 10 minutes that makes them feel the product was worth it, and (5) what I should NOT include because it would make this feel bloated. Be ruthlessly concise.",
        },
        { type: "h3", text: "Write it at speed in ChatGPT" },
        {
          type: "p",
          text:
            "Do not write section by section as one long conversation — the quality degrades. Open a fresh chat for each section, re-anchor the tone every time, and force ChatGPT to earn every sentence.",
        },
        {
          type: "prompt",
          label: "ChatGPT — section writer",
          text:
            "Write section [X] of my digital product on [TOPIC]. The reader is [DESCRIBE THEM]. The tone is [DIRECT/CASUAL/EXPERT]. Do not use filler phrases, do not write generic advice, do not include anything someone could find in a 30-second Google search. Every sentence should either teach something specific, give an actionable instruction, or provide a real example. Write it now.",
        },
        { type: "h3", text: "Package it so it feels worth paying for" },
        {
          type: "p",
          text:
            "A great product with a bad cover looks like a bad product. Spend 30 minutes in Canva. Simple typography-driven cover, dark background, one accent color, a mockup of the PDF on a laptop or phone. That is enough. Then write the sales copy.",
        },
        {
          type: "prompt",
          label: "ChatGPT — product description",
          text:
            "Write a product description for [PRODUCT NAME]. It's a [FORMAT] that helps [AUDIENCE] achieve [OUTCOME] without [COMMON FRUSTRATION]. Price: $[PRICE]. Write: (1) a one-sentence hook, (2) three bullet points of what they get, (3) a \"who this is for\" paragraph, (4) a \"who this is NOT for\" line, and (5) a closing line that handles the price objection without being defensive.",
        },
        {
          type: "callout",
          text:
            "Deliverable by end of Day 5: finished product file, cover image, mockup, product description, and price. Ready to sell.",
        },
      ],
    },
    {
      id: "day-6-7",
      title: "Day 6–7 · The Funnel Blueprint",
      blocks: [
        {
          type: "p",
          text:
            "A funnel has exactly four components: a lead magnet, a landing page, an email sequence, and an offer. Nothing else is required to make the first sale. Anything you add beyond these four before you have paying customers is procrastination in a productivity costume.",
        },
        { type: "h3", text: "Lead magnet — the small yes" },
        {
          type: "prompt",
          label: "Claude — lead magnet",
          text:
            "Using Claude, write a free guide titled [LEAD MAGNET TITLE] for [AUDIENCE]. It should be 8-10 pages. Every section must deliver a standalone insight they can use immediately. The guide should naturally create desire for [PAID PRODUCT] without ever mentioning it directly. The reader should finish the guide thinking: I need more of this. Make it genuinely valuable — not a teaser, not a trailer. The full thing.",
        },
        { type: "h3", text: "Landing page — one goal only" },
        {
          type: "p",
          text:
            "Build the lead magnet page in Lovable. No navigation, no footer links out, no distractions. The page has one job: capture the email.",
        },
        {
          type: "prompt",
          label: "Lovable — lead magnet landing page",
          text:
            "Build a high-converting lead magnet landing page with a dark background and modern design. The lead magnet is called [NAME]. Above the fold: headline, subheadline, email capture form, and one CTA button. Below the fold: what's inside (3-5 bullets), who it's for (3 bullet points), and a simple footer. No navigation menu. No distractions. Single goal: email capture. Color scheme: dark background #0a0a0f with purple accent #6366f1. Font: clean sans-serif. Mobile responsive.",
        },
        { type: "h3", text: "The 5-email sequence" },
        {
          type: "ol",
          items: [
            "Email 1 — Deliver the lead magnet and set expectations for what's coming.",
            "Email 2 — One insight that reframes how they see the problem.",
            "Email 3 — A specific story or case study that makes the solution real.",
            "Email 4 — Directly handle the #1 objection they have about buying.",
            "Email 5 — Direct offer with a clear CTA and a real reason to act today.",
          ],
        },
        {
          type: "prompt",
          label: "Claude — sequence writer",
          text:
            "Write email [N] of a 5-part sequence for [AUDIENCE] about [TOPIC]. The job of this email is [JOB, from the list above]. Constraints: subject line under 45 characters, opens with a specific concrete moment (not a greeting), one main idea, ends with one CTA. No emojis in subject line, no exclamation points in the first line. Tone: direct, honest, no marketing gloss.",
        },
        {
          type: "callout",
          text:
            "Deliverable by end of Day 7: live landing page, working email capture, and 5 emails scheduled in your ESP.",
        },
      ],
    },
    {
      id: "day-8-10",
      title: "Day 8–10 · The Automation Layer",
      blocks: [
        {
          type: "p",
          text:
            "This is where most tutorials stop. It is also where the real leverage begins. Three workflows in n8n turn your funnel from something you babysit into something that runs itself.",
        },
        { type: "h3", text: "Workflow 1 — Lead magnet delivery" },
        {
          type: "ol",
          items: [
            "Trigger: Webhook (new subscriber from your form provider).",
            "Node: Send email with PDF link (Gmail, Resend, or your ESP).",
            "Node: HTTP request to your ESP to add a tag: prospect.",
            "Node: Append row to a Google Sheet for source tracking.",
          ],
        },
        {
          type: "callout",
          text:
            "Most common mistake: forgetting to acknowledge the webhook with a 200 response. The form provider will retry and you will send duplicate PDFs.",
        },
        { type: "h3", text: "Workflow 2 — Purchase delivery" },
        {
          type: "ol",
          items: [
            "Trigger: Stripe webhook on checkout.session.completed.",
            "Node: Send product access email with download link and login instructions.",
            "Node: Tag subscriber as buyer.",
            "Node: Remove from prospect sequence.",
            "Node: Add to buyer follow-up sequence (upsell + review request).",
          ],
        },
        { type: "h3", text: "Workflow 3 — Content repurposing" },
        {
          type: "ol",
          items: [
            "Trigger: New newsletter or blog post published (RSS trigger).",
            "Node: ChatGPT API rewrites the post as 3 Twitter/X threads.",
            "Node: Claude API rewrites the post as one LinkedIn post.",
            "Node: Append all versions to a Google Sheet for scheduling.",
          ],
        },
        {
          type: "prompt",
          label: "ChatGPT node — thread rewriter",
          text:
            "You are given a long-form article. Rewrite it as 3 different Twitter/X threads (8-12 posts each). Each thread must have: a hook post that stops the scroll, one specific concrete example per post, no hashtags, no emojis except where they replace a word. Return each thread as a JSON array of strings. Article: {{ $json.body }}",
        },
        {
          type: "callout",
          text:
            "Deliverable by end of Day 10: three workflows live and tested end-to-end with a real event, not a manual trigger.",
        },
      ],
    },
    {
      id: "day-11-14",
      title: "Day 11–14 · The Traffic Sprint",
      blocks: [
        {
          type: "p",
          text:
            "For a brand new offer with zero audience, three channels give you the fastest path to real signal: Pinterest for organic search traffic, Reddit for real feedback and first sales, and direct outreach for your first dollar.",
        },
        { type: "h3", text: "Channel 1 — Pinterest (organic traffic)" },
        {
          type: "p",
          text:
            "Pinterest is a search engine that still indexes new accounts fast. Post 10 pins per day for 14 days linking to your lead magnet page. Use vertical 1000×1500 images with bold text overlays.",
        },
        {
          type: "prompt",
          label: "ChatGPT — Pinterest descriptions",
          text:
            "Write 10 Pinterest pin descriptions for a pin about [TOPIC]. Each description should be 150-200 characters, include 3-5 relevant hashtags, start with a compelling hook, and end with a soft CTA. Use keywords someone would actually search for, not marketing language.",
        },
        { type: "h3", text: "Channel 2 — Reddit (feedback and first sales)" },
        {
          type: "p",
          text:
            "Find five subreddits where your audience actually lives — not where you wish they lived. Contribute genuinely for three days before you post anything of your own. Then post detailed answers to common questions, and include your lead magnet only as a resource in the last line.",
        },
        {
          type: "prompt",
          label: "Claude — subreddit + post strategy",
          text:
            "My audience is [DESCRIBE THEM] and my lead magnet solves [PROBLEM]. Identify the 5 most active subreddits where this audience genuinely engages (not just exists). For each subreddit: describe its unwritten rules, the type of posts that get upvoted, the type that get removed, and draft one high-value post I could write that would help members and naturally reference my lead magnet only as a P.S. resource.",
        },
        { type: "h3", text: "Channel 3 — Direct outreach (first dollar)" },
        {
          type: "prompt",
          label: "ChatGPT — cold outreach",
          text:
            "Write 5 cold DM/email templates for reaching out to [TYPE OF PERSON] about [YOUR OFFER]. Each message should be under 60 words, reference something specific about them, lead with value not pitch, and end with a single low-friction question — not a hard sell. Sound like a real human. No buzzwords.",
        },
        {
          type: "callout",
          text:
            "Deliverable by end of Day 14: 140 pins live, 5 Reddit contributions, 50 personalized outreach messages sent, and at minimum one first customer or 10+ replies to iterate against.",
        },
      ],
    },
    {
      id: "timeline",
      title: "The Full 14-Day Timeline",
      blocks: [
        {
          type: "ul",
          items: [
            "Day 1–2 · Validation — problem statement, audience, 10+ pieces of VOC evidence.",
            "Day 3–5 · Product — finished file, cover, mockup, description, price.",
            "Day 6–7 · Funnel — landing page live, 5 emails scheduled.",
            "Day 8–10 · Automation — 3 n8n workflows live and tested.",
            "Day 11–14 · Traffic — 140 pins, 5 Reddit posts, 50 outreach messages.",
          ],
        },
        {
          type: "p",
          text:
            "One primary action per day. One deliverable per phase. If you find yourself doing something that isn't on this list, you are procrastinating.",
        },
      ],
    },
    {
      id: "closing",
      title: "The Honest Closing",
      blocks: [
        {
          type: "p",
          text:
            "Most people will read this guide and not do it. Not because it is hard — it isn't. Because starting feels uncomfortable, and the internal negotiation to postpone is more familiar than the discomfort of shipping. The guide exists to remove every excuse except the one that actually matters: doing the work.",
        },
        {
          type: "p",
          text:
            "You now have the sequence. The sequence is the product. Fourteen days from today can be a launched income system or another two weeks of tab-switching. That decision is entirely in your hands.",
        },
        ...CTA_BLOCKS,
      ],
    },
  ],
  next: { slug: "digital-product-machine", title: "The Digital Product Machine" },
};

// ---------------------------------------------------------------------------
// GUIDE 2 — Digital Product Machine
// ---------------------------------------------------------------------------
const g2: StaticGuide = {
  slug: "digital-product-machine",
  title:
    "The Digital Product Machine: How to Ideate, Build, and Sell a Digital Product Using Only AI Tools",
  description:
    "From blank page to product live on Gumroad — the complete AI-powered product creation system with every prompt included.",
  badge: "Products",
  badgeColor: "bg-primary/10 text-brand-2 border-brand-2/30",
  readMinutes: 22,
  publishedAt: "2026-07-08T00:00:00.000Z",
  intro: [
    {
      type: "p",
      text:
        "Most digital products fail before launch because they were built on a hunch and a vibe. The maker liked the topic, opened a doc, and wrote 40 pages of content they thought was useful. Then nobody bought it — and the maker blamed marketing.",
    },
    {
      type: "p",
      text:
        "The products that sell are architected differently. They are built for a specific reader having a specific problem, and every section is engineered to move that reader toward one clear outcome. AI does not remove the need for that architecture. It just makes executing on it 10x faster.",
    },
    {
      type: "p",
      text:
        "This guide is the full machine: ideation, research, architecture, writing, packaging, pricing, listing, and launch — every prompt included.",
    },
  ],
  sections: [
    {
      id: "why-fail",
      title: "Why Most Digital Products Fail Before Launch",
      blocks: [
        {
          type: "p",
          text:
            "The one thing that separates products that sell from products that sit is not the writing quality, not the design, and not the platform. It is whether the product delivers one specific outcome that a buyer can name in one sentence before they open the file.",
        },
        {
          type: "p",
          text:
            'If your buyer cannot finish this sentence — "This thing helps me ___ so that I can ___" — the product will not sell no matter how good the content is. Every design and content decision downstream should be tested against whether it makes that sentence sharper.',
        },
      ],
    },
    {
      id: "format",
      title: "The 4 Formats That Work With AI",
      blocks: [
        {
          type: "ul",
          items: [
            "PDF guide — teaches a framework, process, or system. Best when your value is clarity of thinking. Build time: 2 days.",
            "Prompt pack — collection of ready-to-run prompts organized by use case. Highest perceived value per dollar for AI-native audiences. Build time: 1–2 days.",
            "Template bundle — Notion, Airtable, Google Sheets, or doc templates. Best when the buyer wants to skip setup work. Build time: 2–3 days.",
            "Mini-course — 3–5 short video lessons plus a workbook. Highest price ceiling. Build time: 5–7 days.",
          ],
        },
        {
          type: "p",
          text:
            "Decision matrix: If you have no audience yet, ship a PDF or prompt pack. If your niche is AI-native, prompt pack wins. If your buyer is a busy operator (agency owner, founder, freelancer), template bundle wins. Save the mini-course for your second product, once you have proof and buyer emails.",
        },
      ],
    },
    {
      id: "research",
      title: "Perplexity — What People Already Pay For",
      blocks: [
        {
          type: "p",
          text:
            "The best product ideas are not new. They are better-packaged versions of things people are already buying. Use Perplexity to find the paid-product graveyard in your niche — what exists, what sells, what does not, and where the gaps are.",
        },
        {
          type: "prompt",
          label: "Perplexity — market map",
          text:
            "Map the current digital product market for [NICHE]. List the top 15 paid digital products in this niche in the last 12 months. For each, include: name, format, price, platform, apparent positioning, and one visible weakness (based on reviews, comments, or what buyers wish it did differently). Cite sources.",
        },
        {
          type: "prompt",
          label: "Perplexity — angle gap",
          text:
            "Based on the market map above, identify 5 specific angles or sub-problems that are underserved by the current products. For each: what is the underserved buyer asking for that nobody is selling well, what would make it different, and roughly how big is the demand signal.",
        },
      ],
    },
    {
      id: "architecture",
      title: "Claude — Product Architecture in One Session",
      blocks: [
        {
          type: "p",
          text:
            "Once you have picked an angle, spend one uninterrupted 45-minute session with Claude to architect the whole product. Do not open your writing tool yet. Architecture first, always.",
        },
        {
          type: "prompt",
          label: "Claude — full product architecture",
          text:
            "You are a digital product strategist. I am building a [FORMAT] on [TOPIC] for [AUDIENCE]. Their #1 pain is [PAIN] and their desired outcome is [OUTCOME]. Produce: (1) a one-sentence positioning statement, (2) the exact outcome the buyer can name in one sentence, (3) the table of contents with 5-9 sections and a one-line purpose for each, (4) the quick win they should feel in the first 10 minutes, (5) the 3 things the product must do to feel worth 10x the price, (6) the 3 things I should refuse to include because they would bloat it, and (7) the launch hook I can lead with. Be ruthlessly concise.",
        },
      ],
    },
    {
      id: "writing",
      title: "ChatGPT — Writing the Whole Product in One Sitting",
      blocks: [
        {
          type: "p",
          text:
            "Give ChatGPT three things every time: a role, a reader, and a ruthlessness instruction. The ruthlessness instruction is the difference between something that reads like a Medium post and something that reads like a paid product.",
        },
        {
          type: "prompt",
          label: "ChatGPT — section writer",
          text:
            "Role: You are a specialist teacher writing for a paid audience, not a blog reader. Reader: [DESCRIBE THEM in 2 lines]. Ruthlessness: no filler phrases, no generic advice, no ideas someone could Google in 30 seconds. Task: write section [X] — [SECTION TITLE] — from the outline. Length: 800-1200 words. Every paragraph must teach something concrete, give an instruction, or provide a real example. Return only the section body, no meta commentary.",
        },
        {
          type: "prompt",
          label: "ChatGPT — self-edit pass",
          text:
            "Take the section you just wrote and cut 20% of the words without losing any information. Remove hedging phrases, adverbs, throat-clearing openings, and any sentence that summarizes what you are about to say. Return the tightened version only.",
        },
      ],
    },
    {
      id: "packaging",
      title: "Packaging — Cover, Mockup, Description",
      blocks: [
        {
          type: "h3", text: "Cover" },
        {
          type: "p",
          text:
            "In Canva, start with a 1600×2000 dark background. One accent color from your brand. Title in a heavy serif or geometric sans, subtitle in a lighter weight. That is the whole design. Bad covers are cluttered. Good covers are legible from a thumbnail.",
        },
        { type: "h3", text: "Mockup" },
        {
          type: "p",
          text:
            "Use a free mockup generator (Placeit, Smartmockups) to render your PDF on a laptop or tablet. Buyers do not price physical objects the same way as digital files — a mockup makes the digital feel tangible.",
        },
        { type: "h3", text: "Description" },
        {
          type: "prompt",
          label: "ChatGPT — product description",
          text:
            "Write a product description for [PRODUCT NAME]. It's a [FORMAT] that helps [AUDIENCE] achieve [OUTCOME] without [COMMON FRUSTRATION]. Price: $[PRICE]. Write: (1) a one-sentence hook, (2) three bullet points of what they get, (3) a \"who this is for\" paragraph, (4) a \"who this is NOT for\" line, and (5) a closing line that handles the price objection without being defensive.",
        },
      ],
    },
    {
      id: "pricing",
      title: "Pricing — Why Most People Underprice by 60%",
      blocks: [
        {
          type: "p",
          text:
            "Most first-time makers price on how long the product took to build. Buyers do not care how long it took. Buyers price on the outcome and the alternative. If your product saves them a week of research, the price ceiling is roughly one week of their time — not one hour of yours.",
        },
        {
          type: "ul",
          items: [
            "Price the outcome, not the effort.",
            "Round up, not down. $29 beats $27 in perceived confidence.",
            "Anchor with a strike-through original price when you launch — $47, launch $29.",
            "Never introduce a discount you cannot justify with a reason.",
          ],
        },
      ],
    },
    {
      id: "listing",
      title: "Gumroad / Lemon Squeezy Setup Checklist",
      blocks: [
        {
          type: "ol",
          items: [
            "Product title — outcome-forward, not clever. \"Cold DM System for Solo Founders\" beats \"DM Magic\".",
            "Cover image and 2-3 mockup images.",
            "Description written from the checklist above.",
            "Price + strike-through anchor if launching.",
            "Delivery — upload the actual file, test the download link from an incognito window.",
            "Receipt email — customize with a one-line note and a link to a Loom walkthrough.",
            "License / terms — one-line personal use license is enough for v1.",
            "Analytics — connect your Google Analytics or Fathom property.",
            "Refund policy — 7 or 14 days, stated clearly on the page.",
            "Test a real purchase with a discount code for $0.50 to confirm the whole flow.",
          ],
        },
      ],
    },
    {
      id: "launch",
      title: "Launch Day — What to Post, Where, In What Order",
      blocks: [
        {
          type: "ol",
          items: [
            "Morning — publish a long-form post (blog or newsletter) that teaches the core idea behind the product. Soft CTA at the bottom.",
            "Late morning — Twitter/X thread version of the same post. Product link in the last post.",
            "Midday — LinkedIn post with the framework, no link.",
            "Afternoon — DM the 20 warmest people in your network individually with a personal note.",
            "Evening — send the launch email to your list. Subject line focuses on the outcome, not the discount.",
            "Next 3 days — one launch update per day: proof, use case, objection handled.",
          ],
        },
        ...CTA_BLOCKS,
      ],
    },
  ],
  next: { slug: "n8n-income-automation", title: "The n8n Income Automation Playbook" },
};

// ---------------------------------------------------------------------------
// GUIDE 3 — n8n Income Automation
// ---------------------------------------------------------------------------
const g3: StaticGuide = {
  slug: "n8n-income-automation",
  title:
    "The n8n Income Automation Playbook: 7 Workflows That Run Your Business While You Sleep",
  description:
    "Seven production-ready n8n workflows for delivery, sequences, repurposing, lead routing, and revenue tracking — with node-by-node setup instructions.",
  badge: "Automation",
  badgeColor: "bg-white/5 text-foreground/80 border-white/15",
  readMinutes: 28,
  publishedAt: "2026-07-08T00:00:00.000Z",
  intro: [
    {
      type: "p",
      text:
        "n8n beats Zapier for income systems on one specific dimension: it lets you call AI models inside a workflow without paying per action. That single feature is the difference between a $500 monthly automation bill and a $20 one. Once you build even three workflows, the compounding time savings pay for the whole learning curve.",
    },
    {
      type: "p",
      text:
        "This is not an n8n tutorial for tutorial's sake. Every workflow below is one you should have running in your business by the end of the week.",
    },
  ],
  sections: [
    {
      id: "setup",
      title: "n8n in Under 10 Minutes",
      blocks: [
        {
          type: "ol",
          items: [
            "Sign up for n8n Cloud free tier (or self-host on Railway for $5/mo).",
            "Add credentials for OpenAI, Anthropic, Gmail (OAuth), and Stripe (secret key).",
            "Create a workspace-level environment variable for your ESP API key so you can reuse it across workflows.",
            "Turn on the built-in error workflow to email you when any workflow fails.",
          ],
        },
      ],
    },
    {
      id: "w1",
      title: "Workflow 1 — Lead Magnet Auto-Delivery",
      blocks: [
        {
          type: "ol",
          items: [
            "Trigger: Webhook (POST from your form provider).",
            "Function node: normalize email, name, source.",
            "Gmail / Resend: send email with PDF link.",
            "HTTP request: tag subscriber in ESP as prospect.",
            "Google Sheets: append row (email, source, timestamp).",
          ],
        },
        {
          type: "callout",
          text:
            "Common mistake: not returning a 200 response from the webhook node. The form retries and you deliver 3 PDFs to one person.",
        },
      ],
    },
    {
      id: "w2",
      title: "Workflow 2 — Stripe Purchase Delivery",
      blocks: [
        {
          type: "ol",
          items: [
            "Trigger: Stripe trigger on checkout.session.completed.",
            "Function node: extract email, product_id, amount.",
            "Switch node: route by product_id to the right delivery email template.",
            "Gmail / Resend: send product access email.",
            "HTTP request: tag buyer in ESP as buyer_[product].",
            "HTTP request: remove buyer from prospect sequence.",
            "Add to buyer follow-up sequence.",
          ],
        },
        {
          type: "callout",
          text:
            "Test with Stripe's test mode + a real webhook forwarder before you switch to live keys. Always.",
        },
      ],
    },
    {
      id: "w3",
      title: "Workflow 3 — 5-Platform Content Repurposing",
      blocks: [
        {
          type: "ol",
          items: [
            "Trigger: RSS on your newsletter or blog.",
            "Claude node: rewrite as one LinkedIn post.",
            "OpenAI node: rewrite as a Twitter/X thread.",
            "OpenAI node: generate 3 Pinterest descriptions.",
            "OpenAI node: write a 60-second Shorts script.",
            "OpenAI node: write an Instagram caption.",
            "Google Sheets: append all versions in a single row for scheduling.",
          ],
        },
        {
          type: "prompt",
          label: "Claude — LinkedIn rewrite node",
          text:
            "Rewrite the article below as a single LinkedIn post. Constraints: hook in first 2 lines that stops the scroll, 5-8 short paragraphs, one specific insight per paragraph, no emojis, one soft CTA at the end. Do not summarize — teach the same idea in LinkedIn's native rhythm. Article: {{ $json.contentSnippet }}",
        },
      ],
    },
    {
      id: "w4",
      title: "Workflow 4 — Weekly AI Business Review",
      blocks: [
        {
          type: "ol",
          items: [
            "Trigger: Cron, Monday 7am.",
            "Stripe node: get last 7 days of charges.",
            "HTTP request: get last 7 days of new subscribers from ESP.",
            "Function node: compute totals + week-over-week deltas.",
            "Claude node: write a plain-English summary and flag anything unusual.",
            "Gmail: email the summary to you.",
          ],
        },
        {
          type: "prompt",
          label: "Claude — weekly review",
          text:
            "You are the analyst for a solo AI-income business. Given this week's numbers vs last week's, write a 6-8 sentence summary: what happened, what changed, and one honest observation. Avoid corporate speak. Flag anything that looks unusual and suggest one small experiment to try this week. Data: {{ JSON.stringify($json) }}",
        },
      ],
    },
    {
      id: "w5",
      title: "Workflow 5 — Abandoned Lead Follow-Up",
      blocks: [
        {
          type: "ol",
          items: [
            "Trigger: ESP webhook (subscriber added).",
            "Wait: 48 hours.",
            "HTTP request: check if the subscriber has opened Email 1.",
            "IF node: if not opened, send re-engagement email with a different subject line.",
            "Tag as re-engaged or cold based on the response.",
          ],
        },
      ],
    },
    {
      id: "w6",
      title: "Workflow 6 — New Buyer Onboarding Sequence",
      blocks: [
        {
          type: "ol",
          items: [
            "Trigger: Purchase workflow tags buyer.",
            "Wait: 5 minutes — send welcome email with what to do first.",
            "Wait: 24 hours — send quick-start guide.",
            "Wait: 72 hours — send check-in with one question.",
            "Wait: 7 days — send upsell to the natural next product.",
          ],
        },
      ],
    },
    {
      id: "w7",
      title: "Workflow 7 — AI Customer Support Responder",
      blocks: [
        {
          type: "ol",
          items: [
            "Trigger: Gmail on new email to support@.",
            "Claude node: read the email and draft a response using your knowledge base as context.",
            "Gmail draft node: create a draft in your inbox for one-click approval.",
            "Optional: after 3 hours of no action, send the draft automatically.",
          ],
        },
        {
          type: "prompt",
          label: "Claude — support draft",
          text:
            "You are the support agent for [PRODUCT]. Read the customer email below and write a friendly, direct reply. Use the knowledge base excerpts provided. If the answer requires action from a human (refund, billing change, custom request), draft a short reply that acknowledges the request and says a human will follow up within 24 hours — do not attempt to resolve those yourself. Email: {{ $json.snippet }}. Knowledge base: {{ $json.kb }}",
        },
        ...CTA_BLOCKS,
      ],
    },
  ],
  next: { slug: "local-business-ai-service", title: "The Local Business AI Service Playbook" },
};

// ---------------------------------------------------------------------------
// GUIDE 4 — Local Business AI Service
// ---------------------------------------------------------------------------
const g4: StaticGuide = {
  slug: "local-business-ai-service",
  title:
    "The Local Business AI Service Playbook: How to Land $500–$2,000 Clients Using AI Tools You Already Have",
  description:
    "The complete system for selling productized AI services to local businesses — from niche selection and cold outreach to delivery and recurring retainers.",
  badge: "Client Work",
  badgeColor: "bg-primary/10 text-primary border-primary/25",
  readMinutes: 20,
  publishedAt: "2026-07-08T00:00:00.000Z",
  intro: [
    {
      type: "p",
      text:
        "Local businesses are the single most underserved and highest-converting audience for AI services right now. Every SaaS-flavored AI product is built for tech buyers. The plumber, the dentist, the two-location restaurant, and the boutique law firm are drowning in manual work — and nobody is walking in the door to help them.",
    },
    {
      type: "p",
      text:
        "You do not need a fancy stack. You need ChatGPT, Claude, a Google Sheet, and n8n. This playbook is the exact system for finding, closing, and retaining $500–$2,000 clients using tools you already have.",
    },
  ],
  sections: [
    {
      id: "niches",
      title: "The 5 Best Local Niches",
      blocks: [
        {
          type: "ul",
          items: [
            "Restaurants — reservations, review responses, menu updates, weekly email.",
            "Real estate agents — listing descriptions, follow-up sequences, buyer questionnaires.",
            "Law firms — intake forms, FAQ responder, first-response emails.",
            "Gyms — churn win-back sequences, class descriptions, review requests.",
            "Home services (HVAC, plumbing, roofing) — quote follow-up, review capture, seasonal campaigns.",
          ],
        },
        {
          type: "p",
          text:
            "Pick one to start. All of your outreach, offer, and delivery gets sharper when the niche is narrow. \"AI for local businesses\" loses to \"AI follow-up systems for real estate agents\" every single time.",
        },
      ],
    },
    {
      id: "audit",
      title: "The AI Audit Framework",
      blocks: [
        {
          type: "p",
          text:
            "You should be able to walk into any conversation with a local business owner and, within 20 minutes, identify three things AI could automate for them. This prompt is the shortcut.",
        },
        {
          type: "prompt",
          label: "Claude — pre-meeting audit",
          text:
            "I'm meeting with a [BUSINESS TYPE] owner. Based on typical operations for this type of business, identify the 5 most time-consuming manual tasks they likely do every week, estimate hours wasted per task, and describe exactly how an AI workflow could automate or dramatically speed up each one. Make this specific enough that I could pitch it in a 20-minute conversation.",
        },
      ],
    },
    {
      id: "prospecting",
      title: "Finding Prospects on Google Maps",
      blocks: [
        {
          type: "ol",
          items: [
            "Search your niche + your city on Google Maps.",
            "Filter to businesses with 20–200 reviews (big enough to have budget, small enough to answer their own email).",
            "Copy business name, website, phone, and owner name if visible.",
            "Load 50–100 prospects into a Google Sheet before you write a single outreach message.",
          ],
        },
      ],
    },
    {
      id: "outreach",
      title: "Cold Outreach That Actually Gets Replies",
      blocks: [
        {
          type: "prompt",
          label: "ChatGPT — cold email opener",
          text:
            "Write a cold email under 75 words to [OWNER NAME] at [BUSINESS NAME]. I run an AI automation service. Reference one specific detail from their website or reviews. Offer a free 20-minute AI audit. End with one low-friction question. Sound like a real person emailing a real person. No buzzwords. No \"I hope this finds you well.\"",
        },
        {
          type: "prompt",
          label: "ChatGPT — 3-email sequence",
          text:
            "Write a 3-email cold sequence for the same prospect. Email 1 is the opener above. Email 2 (3 days later) sends one specific idea for their business as free value with no ask. Email 3 (7 days later) is a 2-sentence check-in that gives them a clear out. Total across all three emails: under 200 words.",
        },
      ],
    },
    {
      id: "free-audit",
      title: "The Free Audit — Your Real Sales Call",
      blocks: [
        {
          type: "p",
          text:
            "Leading with a free 20-minute AI audit is the fastest path to a paid project. It is not a sales call disguised as a favor. It is a genuine audit where you diagnose 2-3 concrete opportunities. The proposal writes itself at the end of it.",
        },
        {
          type: "ol",
          items: [
            "First 5 minutes — ask about their week, biggest time sinks, and what they wish they never had to do again.",
            "Next 10 minutes — walk through their current workflow with them.",
            "Last 5 minutes — recap 3 specific things AI could fix, and propose the smallest version of the first one as a paid project.",
          ],
        },
      ],
    },
    {
      id: "pricing",
      title: "Pricing — $500 Setup + $150–$300 Retainer",
      blocks: [
        {
          type: "p",
          text:
            "A $500 one-time setup fee gets past the credit-card-authorization barrier. The monthly retainer covers hosting, maintenance, prompt updates, and one small change request per month. You are selling ongoing peace of mind, not one-shot magic.",
        },
        {
          type: "ul",
          items: [
            "Setup: $500 — builds the workflow, hooks up their tools, delivers a 5-minute Loom walkthrough.",
            "Retainer: $150–$300/mo — monitoring, one change request, monthly performance email.",
            "Upsell: additional workflow at $300 flat.",
          ],
        },
      ],
    },
    {
      id: "delivery",
      title: "Delivery — How AI Actually Does the Work",
      blocks: [
        {
          type: "p",
          text:
            "The delivery pattern is almost always the same: n8n orchestrates, ChatGPT or Claude drafts the human-facing text, the client's existing tools (Gmail, CRM, Google Sheets) handle storage and distribution. You spend one afternoon setting it up per client and 15 minutes a month maintaining it.",
        },
      ],
    },
    {
      id: "ladder",
      title: "The Upsell Ladder",
      blocks: [
        {
          type: "ol",
          items: [
            "Free 20-minute AI audit.",
            "$500 one-time workflow build + $200 retainer.",
            "$1,200 3-workflow bundle + $400 retainer.",
            "$5,000 full AI systems build for the business.",
          ],
        },
        ...CTA_BLOCKS,
      ],
    },
  ],
  next: { slug: "ai-content-system", title: "The AI Content System" },
};

// ---------------------------------------------------------------------------
// GUIDE 5 — AI Content System
// ---------------------------------------------------------------------------
const g5: StaticGuide = {
  slug: "ai-content-system",
  title:
    "The AI Content System: How to Build a Content Engine That Drives Traffic, Grows Your List, and Sells Your Offer on Autopilot",
  description:
    "The complete AI content operation — ideation, writing, repurposing, publishing — in under two hours a week.",
  badge: "Traffic",
  badgeColor: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  readMinutes: 24,
  publishedAt: "2026-07-08T00:00:00.000Z",
  intro: [
    {
      type: "p",
      text:
        "Most AI content fails to drive revenue because the maker built a content operation with no conversion architecture attached to it. They optimize for output — three posts a day, five platforms, endless repurposing — and forget that content without a destination is just noise with a signature.",
    },
    {
      type: "p",
      text:
        "This guide flips that. Every piece of content in this system has one job: move a specific reader one step closer to your lead magnet or your offer. Once that architecture is in place, AI turns two hours of writing into a full week of published content across five platforms.",
    },
  ],
  sections: [
    {
      id: "overview",
      title: "The One-to-Eight Content System",
      blocks: [
        {
          type: "p",
          text:
            "Every week you produce exactly one core piece of content — a newsletter or long-form post. AI repurposes it into 7 more platform-specific pieces. That is 8 published assets a week from one 60-minute writing session.",
        },
      ],
    },
    {
      id: "stage-1",
      title: "Stage 1 — Research & Ideation with Perplexity",
      blocks: [
        {
          type: "prompt",
          label: "Perplexity — trending topics",
          text:
            "Find the 10 topics in [NICHE] that are getting the most search and social discussion in the last 30 days. For each: what specific question are people asking, what is the current best answer online, and what would a sharper or more contrarian angle look like. Cite sources.",
        },
      ],
    },
    {
      id: "stage-2",
      title: "Stage 2 — Core Content with Claude",
      blocks: [
        {
          type: "prompt",
          label: "Claude — newsletter draft",
          text:
            "Write a newsletter for [AUDIENCE] on [TOPIC]. Structure: one specific concrete opening moment (not a greeting), one clear thesis, 3 sections that each teach something, one honest observation, and a soft CTA to [LEAD MAGNET or OFFER]. Length: 500-800 words. Voice: direct, warm, no hype. No emojis in body. Subject line under 45 characters, no clickbait.",
        },
      ],
    },
    {
      id: "stage-3",
      title: "Stage 3 — Repurposing with ChatGPT + n8n",
      blocks: [
        {
          type: "prompt",
          label: "ChatGPT — Twitter/X thread",
          text:
            "Turn this article into a Twitter/X thread of 8-12 posts. Post 1 is the hook — one specific claim that stops the scroll. Each subsequent post teaches one micro-idea from the article. Last post: single soft CTA to the lead magnet. No hashtags, no emojis. Article: [PASTE].",
        },
        {
          type: "prompt",
          label: "ChatGPT — LinkedIn post",
          text:
            "Turn this article into one LinkedIn post. First 2 lines are the scroll-stopper. 5-8 short paragraphs, one insight per paragraph. End with one soft question, not a CTA. Article: [PASTE].",
        },
        {
          type: "prompt",
          label: "ChatGPT — Pinterest descriptions",
          text:
            "Turn the main idea of this article into 3 Pinterest pin descriptions. Each: 150-200 characters, 3-5 relevant hashtags, hook first, soft CTA last. Use keywords a real searcher would type.",
        },
        {
          type: "prompt",
          label: "ChatGPT — YouTube Shorts script",
          text:
            "Turn this article into a 60-second Shorts script. Line 1 = hook. 4-6 lines of content, one idea each. Final line = CTA to the newsletter. Include on-screen text suggestions in brackets.",
        },
        {
          type: "prompt",
          label: "ChatGPT — Instagram caption",
          text:
            "Turn this article into an Instagram caption. Hook first line. 4-6 short paragraphs. One line CTA. No hashtag block — write 5 tightly relevant hashtags inline in the last line.",
        },
      ],
    },
    {
      id: "stage-4",
      title: "Stage 4 — Publishing & Scheduling with n8n",
      blocks: [
        {
          type: "ol",
          items: [
            "n8n workflow triggers when you mark a row \"ready\" in your content sheet.",
            "Posts to Twitter/X, LinkedIn, and Pinterest via their APIs.",
            "Drops YouTube Shorts script and Instagram caption into a Todoist task for you to record.",
            "Logs published time to the sheet.",
          ],
        },
      ],
    },
    {
      id: "pinterest",
      title: "The Pinterest SEO System",
      blocks: [
        {
          type: "ol",
          items: [
            "Create 5-8 boards, one per pillar topic, each with a keyword-rich title and description.",
            "Every pin: keyword-first title, 200-character keyword-rich description, link to the lead magnet or blog post.",
            "Generate 20 pins per week in Canva from 2-3 templates.",
            "Batch write descriptions in ChatGPT using the prompt above.",
          ],
        },
      ],
    },
    {
      id: "newsletter",
      title: "The Newsletter Formula",
      blocks: [
        {
          type: "ul",
          items: [
            "Subject line: 3-6 words, curiosity or specific benefit, no exclamation points.",
            "Opening: one concrete moment or observation, never a greeting.",
            "One insight — do not chase three ideas in one email.",
            "One CTA — the lead magnet, the offer, or a reply prompt. Never all three.",
          ],
        },
      ],
    },
    {
      id: "seo",
      title: "SEO — Perplexity + Claude for Rankable Posts",
      blocks: [
        {
          type: "prompt",
          label: "Perplexity — low-competition keywords",
          text:
            "Find 20 long-tail keywords for [NICHE] with clearly low competition (few high-authority articles ranking) and clear search intent. For each: the query, the current top result, why it is weak, and what a better post could add. Cite sources.",
        },
      ],
    },
    {
      id: "bridge",
      title: "The Content-to-Conversion Bridge",
      blocks: [
        {
          type: "p",
          text:
            "Every piece of content on every platform must have exactly one downstream action: it moves the reader toward the lead magnet, or toward the offer. Not both, not brand awareness, not vibes. If a piece of content has no downstream action, do not publish it. Reroute the time to a piece that does.",
        },
      ],
    },
    {
      id: "weekly",
      title: "The 2-Hour Weekly Content Workflow",
      blocks: [
        {
          type: "ol",
          items: [
            "0:00–0:20 — Perplexity ideation, pick one topic.",
            "0:20–1:20 — Claude core piece (newsletter or long-form).",
            "1:20–1:40 — ChatGPT repurposing pass (thread, LinkedIn, Pinterest, Shorts script, Instagram caption).",
            "1:40–1:50 — Drop everything into the content sheet and mark ready.",
            "1:50–2:00 — n8n does the rest.",
          ],
        },
        ...CTA_BLOCKS,
      ],
    },
  ],
  next: { slug: "ai-funnel-system", title: "The AI Funnel System" },
};

// ---------------------------------------------------------------------------
// GUIDE 6 — AI Funnel System
// ---------------------------------------------------------------------------
const g6: StaticGuide = {
  slug: "ai-funnel-system",
  title:
    "The AI Funnel System: How to Build a Complete Lead-to-Buyer Funnel Using ChatGPT, Claude, and Lovable",
  description:
    "The end-to-end funnel build — lead magnet, landing page, email sequence, tripwire, and core offer — written, designed, and automated entirely with AI.",
  badge: "Funnels",
  badgeColor: "bg-white/5 text-foreground/80 border-white/15",
  readMinutes: 26,
  publishedAt: "2026-07-08T00:00:00.000Z",
  intro: [
    {
      type: "p",
      text:
        "A funnel that converts and a funnel that just exists look almost identical from the outside. Same lead magnet page, same email sequence, same product. What separates them is three specific things: the psychology of the first small yes, the sharpness of the reframe in email 2, and the courage of the offer email.",
    },
    {
      type: "p",
      text:
        "This guide walks the entire funnel — every stage, every prompt, every failure mode — built end-to-end with AI tools you already pay for.",
    },
  ],
  sections: [
    {
      id: "architecture",
      title: "The 4-Stage Funnel Architecture",
      blocks: [
        {
          type: "ol",
          items: [
            "Lead magnet — the first small yes.",
            "Email sequence — the 7-email arc from stranger to buyer.",
            "Tripwire — a $9–$17 first purchase that changes the relationship.",
            "Core offer — the real product this whole thing was built for.",
          ],
        },
      ],
    },
    {
      id: "stage-1",
      title: "Stage 1 — Lead Magnet (Claude)",
      blocks: [
        {
          type: "p",
          text:
            "The lead magnet must deliver genuine value in the first two minutes of reading. If the opening does not teach one thing they can use immediately, the whole sequence downstream collapses. It cannot feel like a trailer.",
        },
        {
          type: "prompt",
          label: "Claude — lead magnet writer",
          text:
            "Write a lead magnet titled [TITLE] for [AUDIENCE]. Format: [PDF/checklist/template]. 8-10 pages. Every section must deliver a standalone insight they can use immediately. It should naturally create desire for [PAID PRODUCT] without ever mentioning it directly. The reader should finish it thinking: I need more of this. Full thing, not a teaser.",
        },
      ],
    },
    {
      id: "stage-2",
      title: "Stage 2 — Landing Page (Lovable)",
      blocks: [
        {
          type: "prompt",
          label: "Lovable — landing page brief",
          text:
            "Build a high-converting lead magnet landing page with a dark background and modern design. The lead magnet is called [NAME]. Above the fold: headline that names the outcome, subheadline that names who it's for, email capture form, one CTA button. Below the fold: what's inside (3-5 bullets), who it's for (3 bullets), social proof placeholder, simple footer with only privacy + contact. No navigation menu. No distractions. Single goal: email capture. Colors: dark background, purple accent. Font: clean sans-serif. Mobile responsive.",
        },
        {
          type: "ul",
          items: [
            "Must-have: headline that names the outcome in 8 words or fewer.",
            "Must-have: one form, one CTA. Nothing else clickable above the fold.",
            "Must-have: mobile-first — 70%+ of traffic will be mobile.",
            "Kills conversion: navigation menu, external links, more than one color of CTA, generic stock photos.",
          ],
        },
      ],
    },
    {
      id: "stage-3",
      title: "Stage 3 — The 7-Email Sequence (Claude)",
      blocks: [
        {
          type: "p",
          text:
            "Every email has one job. Do not try to do two jobs in one email. The arc only works if each step is clean.",
        },
        {
          type: "prompt",
          label: "Email 1 — deliver + welcome",
          text:
            "Write email 1 of a 7-part sequence. Job: deliver the lead magnet and set expectations for what's coming. Constraints: under 150 words, subject line under 45 characters, no exclamation points, one CTA (download link), warm but not gushing.",
        },
        {
          type: "prompt",
          label: "Email 2 — reframe the problem",
          text:
            "Write email 2. Job: reframe how the reader sees the core problem so that the solution they were considering feels incomplete. Open with a specific concrete moment. One clean insight. No CTA except a soft reply prompt.",
        },
        {
          type: "prompt",
          label: "Email 3 — story + proof",
          text:
            "Write email 3. Job: tell a specific story or case study that makes the solution feel real and possible. Include specific numbers or details. End with one takeaway line, no CTA.",
        },
        {
          type: "prompt",
          label: "Email 4 — handle the objection",
          text:
            "Write email 4. Job: directly handle the #1 objection [AUDIENCE] has about [OFFER]. Name the objection out loud in the first line. Address it honestly. End with one line that reframes the objection as a decision they get to make on their own timeline.",
        },
        {
          type: "prompt",
          label: "Email 5 — introduce the offer",
          text:
            "Write email 5. Job: introduce [OFFER] for the first time. Open by finishing the story arc from email 3. Position the offer as the natural next step, not a pivot. Include what it is, who it's for, and the price. One clear CTA.",
        },
        {
          type: "prompt",
          label: "Email 6 — urgency without fake scarcity",
          text:
            "Write email 6. Job: create real urgency. Use only true reasons — cohort close, price increase, real deadline. No fake countdown timers. If there is no real deadline, do not fake one; instead make the urgency about the cost of not acting.",
        },
        {
          type: "prompt",
          label: "Email 7 — the honest close",
          text:
            "Write email 7. Job: the honest close. Acknowledge that this is the last email in the sequence. Restate the outcome plainly. Give one last CTA. Give them permission to say no. No hype, no pressure.",
        },
      ],
    },
    {
      id: "tripwire",
      title: "Stage 4 — The Tripwire ($9–$17)",
      blocks: [
        {
          type: "p",
          text:
            "A tripwire is a small first purchase that costs less than a coffee-and-pastry. Its purpose is not revenue. Its purpose is to convert a subscriber into a buyer — because a buyer's next purchase is 5–10x more likely than a subscriber's first. Insert it between email 3 and email 4 as a soft P.S. offer, and again in the offer email as a lower-price alternative.",
        },
      ],
    },
    {
      id: "core-offer",
      title: "Stage 5 — Core Offer Presentation",
      blocks: [
        {
          type: "prompt",
          label: "Claude — core offer email frame",
          text:
            "Write an email that introduces [CORE OFFER] to a warm list. The email must sell without feeling like it is selling. Structure: 1) open with the specific moment the reader is in right now, 2) name what they've been trying, 3) name why it hasn't worked, 4) introduce the offer as the missing piece, 5) list what's included in 3-5 bullets, 6) one honest sentence on price, 7) one CTA. Under 300 words. No hype language.",
        },
      ],
    },
    {
      id: "metrics",
      title: "Conversion Metrics That Actually Matter",
      blocks: [
        {
          type: "ul",
          items: [
            "Landing page: 30–50% opt-in from cold traffic is healthy.",
            "Email 1: 60%+ open, 40%+ click on the download link.",
            "Sequence: 25%+ average open across all 7 emails.",
            "Offer email: 1–3% purchase rate from the sequence is a working funnel; under 0.5% means the offer or the sequence needs work.",
            "Tripwire → core offer: 15–25% of tripwire buyers should buy the core within 30 days.",
          ],
        },
      ],
    },
    {
      id: "failure",
      title: "The 5 Most Common Failure Points",
      blocks: [
        {
          type: "ol",
          items: [
            "Landing page opt-in below 20% → headline is not naming a clear outcome.",
            "Email 1 open rate under 45% → subject line is too clever or the lead magnet promise is fuzzy.",
            "Sequence engagement drops after email 2 → the reframe was weak; rewrite it.",
            "Offer email under 0.5% purchase → offer is not the obvious next step, or price is not clearly justified.",
            "High opt-in, no sales → wrong audience for the offer; the lead magnet is attracting freebie seekers, not future buyers.",
          ],
        },
        ...CTA_BLOCKS,
      ],
    },
  ],
  next: { slug: "cold-start-system", title: "The Cold Start System" },
};

export const STATIC_GUIDES: StaticGuide[] = [g1, g2, g3, g4, g5, g6];

export function getStaticGuideBySlug(slug: string): StaticGuide | undefined {
  return STATIC_GUIDES.find((g) => g.slug === slug);
}
