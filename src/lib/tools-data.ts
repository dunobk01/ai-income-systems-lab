export type Tool = {
  slug: string;
  name: string;
  category: string;
  price: string;
  useFor: string;
  whyWeRecommend: string;
  url: string;
  pairsWith: string[];
  description: string;
  howToUse: string[];
  whoItsFor: string[];
  benefits: string[];
  examples: { title: string; detail: string }[];
  stackFit: string;
};

export const tools: Tool[] = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    category: "LLM",
    price: "$20/mo",
    useFor: "Fluent reasoning, custom GPTs, daily co-pilot",
    whyWeRecommend: "Best ecosystem (GPTs, Projects, voice). The default for 80% of daily tasks.",
    url: "https://chat.openai.com",
    pairsWith: ["Custom Instructions", "Projects"],
    description:
      "ChatGPT is OpenAI's flagship assistant. With Projects, Custom GPTs, voice mode, and code interpreter, it is the most flexible daily AI co-pilot — strong at reasoning, writing, summarizing, and lightweight coding.",
    howToUse: [
      "Sign up for ChatGPT Plus ($20/mo) for GPT-5, voice, and file uploads.",
      "Create a Project per client or workstream — keep instructions, files, and chats scoped.",
      "Build a Custom GPT for any task you repeat 3+ times a week (e.g., a 'cold-email rewriter').",
      "Use voice mode for brainstorming on walks; paste the transcript into Notion later.",
    ],
    whoItsFor: [
      "Solo operators who need one assistant for writing, planning, and analysis.",
      "Founders who want to ship Custom GPTs as a freebie or paid offer.",
      "Anyone replacing 5+ subscription apps with a single AI workspace.",
    ],
    benefits: [
      "Largest plugin/GPT ecosystem of any LLM.",
      "Reliable voice + multimodal input (images, PDFs, spreadsheets).",
      "Memory across chats keeps it personalized over time.",
    ],
    examples: [
      { title: "Daily inbox triage", detail: "Forward emails into a Custom GPT trained on your reply voice; it drafts responses in seconds." },
      { title: "Client deliverables", detail: "A 'Brand Voice GPT' loaded with style guides writes first drafts of blog posts and LinkedIn copy." },
      { title: "Spreadsheet analysis", detail: "Upload a CSV, ask 'what are the top 3 trends?' and get a chart + summary back." },
    ],
    stackFit:
      "ChatGPT is your generalist front door. Use it for ideation, drafting, and quick analysis, then pass complex long-context work to Claude and live research to Perplexity.",
  },
  {
    slug: "claude",
    name: "Claude",
    category: "LLM",
    price: "$20/mo",
    useFor: "Long-context analysis, careful writing, code review",
    whyWeRecommend: "Best at preserving voice and handling 100k+ token inputs. Projects + Artifacts are killer features.",
    url: "https://claude.ai",
    pairsWith: ["Notion", "Lovable"],
    description:
      "Claude (by Anthropic) is the most thoughtful writer in the LLM market. Its 200k-token context window and Projects feature make it ideal for long documents, codebases, and any work where tone and nuance matter.",
    howToUse: [
      "Subscribe to Claude Pro and create a Project per ongoing engagement.",
      "Upload your style guide, transcripts, and reference docs into the Project knowledge.",
      "Use Artifacts for any output you'll iterate on (code, copy, plans) — they render live in a side panel.",
      "Ask Claude to 'critique its own draft' before you accept it — it self-edits exceptionally well.",
    ],
    whoItsFor: [
      "Writers, consultants, and analysts working with long source material.",
      "Developers reviewing or refactoring large code files.",
      "Anyone whose output needs to sound like them, not like AI.",
    ],
    benefits: [
      "Best-in-class writing quality and voice matching.",
      "Massive context window — paste whole books, code repos, or research dumps.",
      "Artifacts make it feel like pair-programming and pair-writing.",
    ],
    examples: [
      { title: "Course outline from transcripts", detail: "Drop 10 hours of Zoom transcripts into a Project; Claude returns a module-by-module outline." },
      { title: "Voice-matched newsletter", detail: "Feed it 20 past issues; it drafts new editions that sound exactly like you." },
      { title: "Codebase audit", detail: "Paste a full repo; ask 'where is auth handled and what's brittle?' for a thorough review." },
    ],
    stackFit:
      "Claude is your deep-work LLM. Pair it with Notion (source of truth) and Lovable (where its code lands). Use ChatGPT for speed, Claude for craft.",
  },
  {
    slug: "perplexity",
    name: "Perplexity",
    category: "Research",
    price: "$20/mo",
    useFor: "Real-time cited research, market & competitor analysis",
    whyWeRecommend: "Replaces 10 Google searches with one cited answer. Pro Search depth is unmatched.",
    url: "https://perplexity.ai",
    pairsWith: ["Claude", "Notion"],
    description:
      "Perplexity is an AI answer engine — every response is backed by live web citations. Pro Search runs multi-step research loops that would take you 30+ minutes of Googling.",
    howToUse: [
      "Use Pro Search for any question where you'd normally open 5+ tabs.",
      "Save threads as Collections to revisit research later.",
      "Switch the underlying model (GPT, Claude, Sonar) per query for best results.",
      "Export findings to Markdown and paste straight into Notion or Claude for synthesis.",
    ],
    whoItsFor: [
      "Consultants doing market, competitor, or industry research.",
      "Writers who need cited sources for credibility.",
      "Founders validating new offer ideas with current data.",
    ],
    benefits: [
      "Citations on every claim — no hallucinated sources.",
      "Pro Search digs deeper than any single LLM web tool.",
      "Faster than Google for any 'what's the current state of X' question.",
    ],
    examples: [
      { title: "Competitor teardown", detail: "Ask 'Compare top 5 AI newsletter pricing and audience size'; get a sourced table." },
      { title: "Lead research", detail: "Paste a company URL, get a one-page brief on their stack, hiring, and recent news." },
      { title: "Content angles", detail: "'What are people complaining about regarding [topic] in 2026?' returns a list of pain points with sources." },
    ],
    stackFit:
      "Perplexity is your research layer. Feed its outputs into Claude for synthesis, then store the final brief in Notion. It does NOT replace an LLM for writing or reasoning.",
  },
  {
    slug: "lovable",
    name: "Lovable",
    category: "Web Apps",
    price: "Free tier + paid",
    useFor: "Ship real web apps with auth, DB, payments, AI",
    whyWeRecommend: "Fastest path from idea to deployed app. You're using it right now.",
    url: "https://lovable.dev",
    pairsWith: ["Supabase", "Stripe"],
    description:
      "Lovable is an AI app builder that turns prompts into production React apps with a real backend, auth, payments, and AI built in. No deploys, no DevOps — describe what you want, ship it, sell it.",
    howToUse: [
      "Start with a clear one-liner: who it's for, what it does, what they pay.",
      "Enable Lovable Cloud for auth + database the moment you need user accounts.",
      "Add Stripe via the built-in integration when you're ready to charge.",
      "Connect a custom domain in Settings; you're live in minutes.",
    ],
    whoItsFor: [
      "Operators who want SaaS-grade apps without hiring a dev team.",
      "Coaches and creators productizing their service into a tool.",
      "Indie hackers shipping 1-2 micro-SaaS per month.",
    ],
    benefits: [
      "Full-stack: frontend, backend, auth, payments, AI — all in one place.",
      "Real React code you own and can export.",
      "AI Gateway gives you LLMs without managing keys.",
    ],
    examples: [
      { title: "Member portal", detail: "This very app — gated course, AI builders, Stripe checkout, all built in Lovable." },
      { title: "Lead-gen tool", detail: "A free 'AI readiness audit' that captures emails and feeds your CRM." },
      { title: "Internal dashboard", detail: "Client reporting dashboards you spin up in an afternoon instead of a sprint." },
    ],
    stackFit:
      "Lovable is the chassis your business runs on. Pair with Stripe for revenue, Supabase (via Cloud) for data, and Claude/ChatGPT for the AI features inside your app.",
  },
  {
    slug: "n8n",
    name: "n8n",
    category: "Automation",
    price: "Self-host free / $20+",
    useFor: "Visual automations across 400+ apps",
    whyWeRecommend: "More powerful than Zapier at a fraction of the cost. Self-host for unlimited runs.",
    url: "https://n8n.io",
    pairsWith: ["OpenAI", "Sheets", "Slack"],
    description:
      "n8n is an open-source visual workflow builder — think Zapier without the per-task pricing. Drag nodes, connect APIs, run AI inside steps, and ship complex automations without code.",
    howToUse: [
      "Self-host on a $5 VPS for unlimited workflow executions, or use n8n Cloud.",
      "Map each business process (lead → CRM → email → Slack) as a workflow.",
      "Drop an OpenAI/Claude node mid-workflow for classification, summarization, or generation.",
      "Use webhook triggers to connect Lovable apps and Tally forms.",
    ],
    whoItsFor: [
      "Operators automating client delivery and back-office work.",
      "Agencies replacing Zapier to cut $200+/mo in tooling.",
      "Builders shipping AI agents that span multiple SaaS apps.",
    ],
    benefits: [
      "Unlimited runs when self-hosted — no per-task ceiling.",
      "AI nodes built in; agents are first-class citizens.",
      "Code nodes for the 5% Zapier can't handle.",
    ],
    examples: [
      { title: "Lead enrichment", detail: "Tally form → n8n enriches with Perplexity → writes brief in Notion → pings Slack." },
      { title: "Content repurposing", detail: "New YouTube upload → transcribe → Claude rewrites into 5 LinkedIn posts → schedule." },
      { title: "Daily digest", detail: "Pull RSS + Twitter + emails → Claude summarizes → emails you at 7am." },
    ],
    stackFit:
      "n8n is your glue layer. It connects Lovable, Stripe, Notion, your inbox, and your LLM of choice into one running business — the closest thing to an unattended back office.",
  },
  {
    slug: "cursor",
    name: "Cursor",
    category: "Coding",
    price: "$20/mo",
    useFor: "AI-first code editor for serious building",
    whyWeRecommend: "When Lovable isn't enough, Cursor takes over. Best in-editor AI experience.",
    url: "https://cursor.sh",
    pairsWith: ["Claude", "GitHub"],
    description:
      "Cursor is a fork of VS Code built around AI. Composer mode edits multiple files at once, Tab autocomplete predicts whole functions, and Claude/GPT live inside the editor with full repo context.",
    howToUse: [
      "Install Cursor, sign in, point it at your repo.",
      "Use Composer (Cmd+I) for multi-file changes; ask in plain English.",
      "Use Tab for fast in-line edits — it predicts the next 5-10 lines correctly most of the time.",
      "Add docs as @Docs references so Cursor knows your stack's APIs.",
    ],
    whoItsFor: [
      "Developers maintaining real codebases (not just prototypes).",
      "Lovable users who export their app and want to keep iterating.",
      "Indie devs doing the work of a team of three.",
    ],
    benefits: [
      "Editor-grade AI with full project awareness.",
      "Multi-file refactors that actually work.",
      "Bring-your-own-key option for power users.",
    ],
    examples: [
      { title: "Lovable handoff", detail: "Export your Lovable app, open in Cursor, add advanced features the prompt couldn't reach." },
      { title: "Bug squashing", detail: "Paste a stack trace; Composer finds the root cause across 4 files and patches it." },
      { title: "Test generation", detail: "Highlight a function, ask for tests; Cursor writes them with realistic edge cases." },
    ],
    stackFit:
      "Cursor sits one layer below Lovable. Build fast in Lovable, graduate to Cursor when you need surgical control. Both run on the same Claude/GPT brain.",
  },
  {
    slug: "notion",
    name: "Notion",
    category: "Knowledge",
    price: "Free / $10+",
    useFor: "Brand voice, SOPs, content library, second brain",
    whyWeRecommend: "Single source of truth that AI tools can pull from. Sellable as templates too.",
    url: "https://notion.so",
    pairsWith: ["Claude", "n8n"],
    description:
      "Notion is a flexible doc + database hybrid. It's where your brand voice, SOPs, swipe files, and content calendar live — and the place every other tool reads from and writes back to.",
    howToUse: [
      "Set up a 'Brain' workspace: Brand Voice, SOPs, Swipes, Clients, Content.",
      "Connect Claude/ChatGPT to read from it (paste pages as context).",
      "Use Notion AI for quick rewrites inside documents.",
      "Package great Notion systems as digital products on Gumroad.",
    ],
    whoItsFor: [
      "Solo operators building a second brain.",
      "Agencies standardizing client delivery with SOPs.",
      "Creators selling Notion templates as a side product.",
    ],
    benefits: [
      "Docs + databases in one — flexible enough for any workflow.",
      "Easy to share with clients or sell as a product.",
      "Plays nicely with every automation tool.",
    ],
    examples: [
      { title: "Brand Voice Bible", detail: "A single page with tone rules, banned words, and 20 example posts — fed to Claude on every write." },
      { title: "Client portal", detail: "One Notion page per client with deliverables, files, and async updates." },
      { title: "Sellable template", detail: "Productize your operating system into a $97 template — recurring passive income." },
    ],
    stackFit:
      "Notion is your knowledge base. Claude reads from it, n8n writes back to it, and your team (or future you) finds everything in one place.",
  },
  {
    slug: "gumroad",
    name: "Gumroad",
    category: "Sales",
    price: "10% per sale",
    useFor: "Sell digital products with zero setup",
    whyWeRecommend: "Easiest way to start charging in 10 minutes. Great for first $1k.",
    url: "https://gumroad.com",
    pairsWith: ["ConvertKit"],
    description:
      "Gumroad is the simplest place to sell a digital product. Upload a file, set a price, share a link — you're collecting payments globally in under 10 minutes.",
    howToUse: [
      "Create a product, upload your file (PDF, Notion link, zip, video).",
      "Set a price (or pay-what-you-want) and a checkout URL.",
      "Share the link in your bio, newsletter, and DMs.",
      "Reinvest revenue into a real funnel (Lovable + Stripe) once you cross $1k.",
    ],
    whoItsFor: [
      "First-time digital product sellers.",
      "Creators validating an offer before building infrastructure.",
      "Anyone wanting a fast checkout for a one-off product.",
    ],
    benefits: [
      "Zero setup — handles taxes, delivery, refunds.",
      "Built-in audience discovery on Gumroad Discover.",
      "10% fee is reasonable for the speed-to-revenue.",
    ],
    examples: [
      { title: "Prompt pack", detail: "Sell 50 cold-email prompts as a $19 PDF; first sale within an hour of launch." },
      { title: "Notion template", detail: "Package your operating system as a $47 template." },
      { title: "Mini-course", detail: "5 Loom videos + a workbook = a $97 lead-magnet course." },
    ],
    stackFit:
      "Gumroad is your starter checkout. Once you're past $1-3k MRR or want to own the customer relationship, graduate to Lovable + Stripe.",
  },
  {
    slug: "stripe",
    name: "Stripe",
    category: "Payments",
    price: "2.9% + 30¢",
    useFor: "Payments on your own site (Lovable + Stripe)",
    whyWeRecommend: "The standard. Once you own your funnel, switch from marketplaces to Stripe.",
    url: "https://stripe.com",
    pairsWith: ["Lovable"],
    description:
      "Stripe is the payments infrastructure for the modern internet. Once you own your funnel (your site, your list), Stripe gives you full control of pricing, subscriptions, and upsells.",
    howToUse: [
      "Enable Stripe in Lovable's Payments integration — products and checkout in one click.",
      "Create products and prices (one-time or subscription).",
      "Use Stripe Customer Portal to let users manage their own billing.",
      "Set up webhooks to grant access on payment events.",
    ],
    whoItsFor: [
      "Anyone past validation, ready to own their checkout.",
      "SaaS founders charging recurring fees.",
      "Coaches selling packages, payment plans, or memberships.",
    ],
    benefits: [
      "Subscriptions, payment plans, coupons, taxes — all built in.",
      "Lower fees than Gumroad once volume picks up.",
      "Owns the customer relationship; you keep the email and data.",
    ],
    examples: [
      { title: "Membership site", detail: "Lovable app + Stripe subscription = a $49/mo community in a weekend." },
      { title: "Course checkout", detail: "Stripe Checkout for a $497 cohort with payment plans." },
      { title: "Usage billing", detail: "Charge per API call or per AI generation in your own tool." },
    ],
    stackFit:
      "Stripe is the heart of your revenue stack. Lovable hosts the app, Stripe collects the money, n8n provisions access — the loop runs itself.",
  },
  {
    slug: "convertkit",
    name: "ConvertKit / Beehiiv",
    category: "Email",
    price: "Free tier + paid",
    useFor: "Email list, broadcasts, automations",
    whyWeRecommend: "Own your audience. Email beats every other channel for $/lead.",
    url: "https://beehiiv.com",
    pairsWith: ["n8n", "Gumroad"],
    description:
      "ConvertKit (creator-focused) and Beehiiv (newsletter-focused) are the two best email platforms for solo operators. Pick one — your list is the only asset no algorithm can take from you.",
    howToUse: [
      "Pick Beehiiv if your offer revolves around a newsletter; ConvertKit if it's products.",
      "Set up a welcome sequence (5 emails) so every new subscriber gets warmed up.",
      "Send a weekly broadcast — consistency beats brilliance.",
      "Tag subscribers based on what they click for laser-targeted launches.",
    ],
    whoItsFor: [
      "Anyone selling digital products, courses, or services online.",
      "Newsletter operators monetizing with sponsors or paid tiers.",
      "Operators graduating away from social-only audiences.",
    ],
    benefits: [
      "Direct line to your audience — no algorithm in the middle.",
      "Highest $/subscriber of any marketing channel.",
      "Built-in automations replace expensive marketing stacks.",
    ],
    examples: [
      { title: "Lead magnet → sequence", detail: "Free PDF → 5-day sequence → soft pitch on day 5 = passive sales." },
      { title: "Paid newsletter", detail: "Beehiiv subscriptions: 1,000 paying readers at $10/mo = $120k ARR." },
      { title: "Launch broadcast", detail: "Send a 3-email launch sequence to drop a new product to a warm list." },
    ],
    stackFit:
      "Email is the long game. Tally captures leads → ConvertKit nurtures → Gumroad/Stripe converts. Without this loop, paid ads bleed money.",
  },
  {
    slug: "tally",
    name: "Tally / Typeform",
    category: "Forms",
    price: "Free / $25+",
    useFor: "Lead magnets, intake forms, surveys",
    whyWeRecommend: "Tally is the fast/free choice. Typeform if you need polish.",
    url: "https://tally.so",
    pairsWith: ["n8n"],
    description:
      "Forms are how leads enter your world. Tally is unlimited and free; Typeform is polished and conversational. Both push to anywhere via webhook.",
    howToUse: [
      "Build a 3-question intake form for every offer (problem, urgency, email).",
      "Embed the form on your Lovable site or share the standalone link.",
      "Wire the webhook into n8n to enrich, tag, and notify automatically.",
      "Iterate on questions monthly — what you ask shapes who applies.",
    ],
    whoItsFor: [
      "Consultants and agencies qualifying leads.",
      "Course creators running launches with waitlists.",
      "Anyone running customer research surveys.",
    ],
    benefits: [
      "Spin up a form in 2 minutes.",
      "Tally is genuinely unlimited on the free plan.",
      "Webhook into anything — perfect glue with n8n.",
    ],
    examples: [
      { title: "Qualification form", detail: "5 questions → only fit leads land on your calendar." },
      { title: "Waitlist", detail: "Capture demand for a future offer; launch only when you have 100+ on the list." },
      { title: "Customer research", detail: "Survey buyers post-purchase to shape your next product." },
    ],
    stackFit:
      "Tally is the front door. It's where curiosity becomes a lead — then n8n + email + Stripe do the rest.",
  },
  {
    slug: "loom",
    name: "Loom",
    category: "Async",
    price: "Free / $12+",
    useFor: "Onboarding videos, sales follow-ups, SOPs",
    whyWeRecommend: "Async > meetings. Record once, reuse forever.",
    url: "https://loom.com",
    pairsWith: ["Notion"],
    description:
      "Loom is screen + camera recording with a magic link share. It turns 30-minute meetings into 4-minute videos and SOPs into reusable assets.",
    howToUse: [
      "Replace any meeting that's one-way info with a Loom.",
      "Record SOPs once; embed in Notion for every future hire.",
      "Send personalized Looms to high-value leads (3x reply rates).",
      "Use AI summaries to convert videos into written docs instantly.",
    ],
    whoItsFor: [
      "Operators reclaiming 5-10 hours/week from meetings.",
      "Agencies onboarding clients with consistent quality.",
      "Sales pros standing out in cold outreach.",
    ],
    benefits: [
      "Time-shift collaboration — work across time zones.",
      "Higher information density than text in half the time.",
      "Built-in transcripts make every video searchable.",
    ],
    examples: [
      { title: "Client update", detail: "5-min weekly Loom replaces the standing call; client loves it." },
      { title: "Sales follow-up", detail: "Personalized 2-min walkthrough of their site → meeting booked." },
      { title: "Hire onboarding", detail: "20 Looms = your full onboarding course, ready for every future contractor." },
    ],
    stackFit:
      "Loom is the async layer. It feeds Notion (SOPs), accelerates sales, and lets you scale without scaling meetings.",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
