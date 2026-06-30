import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, Rocket, Zap, Brain, Workflow, Bot, Search, Layers,
  ArrowRight, Check, Shield, MessageSquare, Wand2, FileCode2,
  Video, Image as ImageIcon, Mic,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { CohortCountdown } from "@/components/cohort-countdown";
import { LeadCapture } from "@/components/lead-capture";
import dustinPhoto from "@/assets/dustin.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Income Systems Lab — Build Real AI Income Systems" },
      { name: "description", content: "Learn how to combine ChatGPT, Claude, Perplexity, Lovable, and n8n to create digital products, funnels, automations, and simple apps you can actually sell." },
      { property: "og:title", content: "AI Income Systems Lab — Build Real AI Income Systems" },
      { property: "og:description", content: "Learn how to combine ChatGPT, Claude, Perplexity, Lovable, and n8n to create digital products, funnels, automations, and simple apps you can actually sell." },
      { property: "og:url", content: "https://ai-income-systems.com/" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/482ab1b5-41be-4f5f-a537-63fb59a87231" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/482ab1b5-41be-4f5f-a537-63fb59a87231" },
    ],
    links: [{ rel: "canonical", href: "https://ai-income-systems.com/" }],
  }),
  component: LandingPage,
});

const tools = [
  { name: "ChatGPT", slug: "chatgpt", desc: "Execution + content", icon: MessageSquare },
  { name: "Claude", slug: "claude", desc: "Long-form + strategy", icon: Brain },
  { name: "Perplexity", slug: "perplexity", desc: "Research + validation", icon: Search },
  { name: "Lovable", slug: "lovable", desc: "Apps + funnels", icon: FileCode2 },
  { name: "n8n", slug: "n8n", desc: "Automation glue", icon: Workflow },
];

const builds = [
  { slug: "digital-products", title: "Digital products", desc: "Ebooks, templates, prompt packs, mini-courses you can sell on day one.", icon: Layers },
  { slug: "sales-funnels", title: "Sales funnels", desc: "Lead magnet → landing page → tripwire → upsell — mapped end to end.", icon: Rocket },
  { slug: "simple-saas-mvps", title: "Simple SaaS MVPs", desc: "Working web apps with auth, payments, and a real customer use case.", icon: Bot },
  { slug: "automations", title: "Automations", desc: "n8n workflows that handle delivery, follow-up, and content repurposing.", icon: Zap },
  { slug: "local-ai-services", title: "Local AI services", desc: "Productized offers for small businesses — audits, mockups, automations.", icon: Wand2 },
  { slug: "content-systems", title: "Faceless video & voiceovers", desc: "AI text-to-video, faceless YouTube/TikTok/Shorts, and ElevenLabs voiceovers — built to scale.", icon: Video },
];


const modules = [
  { n: "01", title: "AI Money Foundations", lessons: 6, outcome: "Pick a niche, an offer type, and a 90-day income target you can actually hit." },
  { n: "02", title: "Prompt Mastery", lessons: 9, outcome: "Write reusable prompts that produce expert-level output on the first try." },
  { n: "03", title: "ChatGPT for Execution", lessons: 8, outcome: "Use ChatGPT as your daily operator for content, copy, and customer work." },
  { n: "04", title: "Claude for Strategy", lessons: 8, outcome: "Plan offers, products, and launches with long-context reasoning that doesn't drift." },
  { n: "05", title: "Perplexity for Research", lessons: 7, outcome: "Validate niches, audiences, and competitors in minutes — with sources." },
  { n: "06", title: "Lovable App & Funnel Builder", lessons: 9, outcome: "Ship a real landing page, micro-SaaS, or funnel without writing code." },
  { n: "07", title: "Digital Product Factory", lessons: 9, outcome: "Produce and package a digital product (ebook, template pack, mini-course) you can sell this week." },
  { n: "08", title: "Sales Funnel Builder", lessons: 8, outcome: "Map lead magnet → landing → tripwire → upsell and write every page that converts." },
  { n: "09", title: "n8n Automation Lab", lessons: 11, outcome: "Build workflows that deliver products, follow up with buyers, and repurpose content on autopilot." },
  { n: "10", title: "Local Business AI Service Kit", lessons: 7, outcome: "Sell a productized AI service (audits, content, automations) to local clients for $500–$2k." },
  { n: "11", title: "Launch Your First Income System", lessons: 8, outcome: "Combine product + funnel + automation into a live offer in 7 days." },
  { n: "12", title: "Faceless Video Income", lessons: 8, outcome: "Faceless YouTube/TikTok/Shorts with ElevenLabs voiceovers + HeyGen/Synthesia AI avatars." },
  { n: "13", title: "AI Image Income", lessons: 7, outcome: "Midjourney / Flux 2 for print-on-demand, ads, and thumbnails that actually sell." },
  { n: "14", title: "Chatbot Agency (Botpress)", lessons: 8, outcome: "Build and resell AI chatbots to local businesses for $1k–$5k setup deals." },
];

const audience = [
  "Beginners who've never made $1 with AI",
  "Side hustlers tired of theory-only courses",
  "Freelancers who want productized offers",
  "Creators ready to launch digital products",
  "Small business owners adding AI services",
  "People who learn by building, not watching",
];

const included = [
  "100+ structured lessons across 14 modules",
  "Faceless video, AI image, and chatbot agency modules (Accelerator)",
  "Searchable prompt library (ChatGPT, Claude, Perplexity, Lovable, n8n)",
  "Interactive Digital Product Builder + Sales Funnel Builder",
  "n8n workflow templates with setup guides",
  "Local business AI service kit + outreach scripts",
  "Members community + Wins channel + member DMs (Accelerator)",
  "Progress tracking, notes, and downloadable resources",
];


const faqs = [
  { q: "Do I need any AI experience?", a: "No. Module 1 starts from zero. If you can write a paragraph and follow steps, you can do this." },
  { q: "Will you teach me to make $X per month?", a: "No fake income promises. We teach the systems people actually use to build offers and sell them. Your results depend on the work you put in." },
  { q: "Do I need paid AI tools?", a: "Free tiers of ChatGPT, Claude, Perplexity, Lovable, and n8n are enough to complete every module. Paid tiers help, but aren't required." },
  { q: "Is this another 'AI guru' course?", a: "It's the opposite. No screenshots of fake Stripe dashboards. No upsells to a $5,000 mastermind. Just one course, three tiers, real systems." },
  { q: "How long does it take?", a: "You can ship your first income system in 7 days following Module 11. The full curriculum is paced for 4–8 weeks of part-time work." },
  { q: "What if I get stuck?", a: "Every lesson has action steps, copy-pasteable prompts, and example outputs. The builders generate plans tailored to your niche." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero" />
        <div className="absolute inset-0 -z-10 grid-fade opacity-50" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" />
            New cohort open · No fake income promises
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
            Master AI Tools by Building<br />
            <span className="text-gradient">Real Online Income Systems</span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
            Learn how to combine ChatGPT, Claude, Perplexity, Lovable, and n8n to create
            digital products, funnels, automations, and simple apps you can actually sell.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg" variant="brand" className="h-12 px-7 text-base">
              <Link to="/signup">Build My First Income System <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="glass" className="h-12 px-7 text-base">
              <Link to="/curriculum">See What You'll Build</Link>
            </Button>
          </div>
          <div className="mt-6 flex justify-center">
            <CohortCountdown compact />
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {["ChatGPT", "Claude", "Perplexity", "Lovable", "n8n"].map((t) => (
              <span key={t} className="glass rounded-full px-3 py-1">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* NEW MODULES HIGHLIGHT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-4 pb-12">
        <div className="glass-strong rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-50" style={{ background: "var(--gradient-hero)" }} />
          <div className="flex items-center gap-2 justify-center">
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-background" style={{ background: "var(--gradient-brand)" }}>
              <Sparkles className="h-3 w-3" /> New in the Lab
            </span>
          </div>
          <h2 className="mt-4 text-center text-2xl sm:text-4xl font-bold tracking-tight">
            Now teaching <span className="text-gradient">faceless video, AI image & chatbot agency</span> income
          </h2>
          <p className="mt-3 text-center text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Three new modules unlock with the Accelerator tier — built around the tools creators are using right now to scale without showing their face.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Video, title: "Faceless Video Income", body: "AI text-to-video, faceless YouTube/TikTok/Shorts pipelines, HeyGen & Synthesia avatars." },
              { icon: Mic, title: "AI Voiceovers (ElevenLabs)", body: "Studio-quality voiceovers for video, ads, courses, and audiobooks — at scale." },
              { icon: ImageIcon, title: "AI Image Income", body: "Midjourney / Flux 2 for print-on-demand, social ads, thumbnails, and product mockups." },
            ].map((h) => (
              <div key={h.title} className="glass rounded-2xl p-5">
                <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: "var(--gradient-soft)" }}>
                  <h.icon className="h-5 w-5 text-[color:var(--brand-2)]" />
                </div>
                <p className="mt-4 font-semibold">{h.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{h.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild variant="brand" className="h-11 px-6">
              <Link to="/pricing">Unlock with Accelerator <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="glass" className="h-11 px-6">
              <Link to="/curriculum">See the new lessons</Link>
            </Button>
          </div>
        </div>
      </section>



      {/* PROBLEM */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">The problem</p>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
            Most AI courses teach tools.<br/>
            <span className="text-gradient">This teaches systems.</span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto">
            Watching prompt tutorials doesn't pay your bills. The people making money with AI aren't smarter —
            they've connected the tools into <em>systems</em>: a product, a funnel, an offer, and automation
            that runs without them. That's what you'll build here.
          </p>
        </div>
      </section>

      {/* WHAT STUDENTS BUILD */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">What you'll build</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Real systems, not demos</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {builds.map((b) => (
            <Link
              key={b.title}
              to="/systems/$slug"
              params={{ slug: b.slug }}
              className="group glass rounded-2xl p-6 transition hover:bg-white/8 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] text-left"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: "var(--gradient-soft)" }}>
                <b.icon className="h-5 w-5 text-[color:var(--brand)]" />
              </div>
              <h3 className="mt-4 font-semibold group-hover:text-[color:var(--brand)] transition-colors">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-[color:var(--brand)]">
                Explore this system <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tools covered</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Five tools. One stack.</h2>
          <p className="mt-3 text-muted-foreground">Each one has a job. We teach you when to use which.</p>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
          {tools.map((t) => (
            <Link
              key={t.name}
              to="/tools/$slug"
              params={{ slug: t.slug }}
              className="group glass rounded-2xl p-5 text-center transition hover:bg-white/8 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl" style={{ background: "var(--gradient-soft)" }}>
                <t.icon className="h-6 w-6 text-[color:var(--brand-2)]" />
              </div>
              <p className="mt-4 font-semibold group-hover:text-[color:var(--brand)] transition-colors">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="glass" size="lg" className="h-11 px-6">
            <Link to="/tools">See full tool stack <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* CURRICULUM */}
      <section id="curriculum" className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Curriculum</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">14 modules. 110+ lessons.</h2>
          <p className="mt-3 text-muted-foreground">Sequenced so each module builds on the last.</p>
        </div>
        <div className="glass-strong rounded-2xl overflow-hidden divide-y divide-white/5">
          {modules.map((m) => (
            <div key={m.n} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 px-5 sm:px-7 py-4 hover:bg-white/5 transition">
              <div className="flex items-center gap-3 sm:w-56 shrink-0">
                <span className="text-xs font-mono text-muted-foreground w-8">{m.n}</span>
                <span className="font-medium">{m.title}</span>
              </div>
              <span className="flex-1 text-sm text-muted-foreground">{m.outcome}</span>
              <span className="text-xs text-muted-foreground shrink-0">{m.lessons} lessons</span>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Who this is for</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">If you'd rather build than scroll, you're in.</h2>
            <p className="mt-4 text-muted-foreground">
              This is for people who want to use AI to make money — not collect another set of bookmarks.
            </p>
          </div>
          <ul className="grid gap-3">
            {audience.map((a) => (
              <li key={a} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <Check className="h-4 w-4 text-[color:var(--success)] shrink-0" />
                <span className="text-sm">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">What's included</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to ship</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {included.map((i) => (
            <div key={i} className="glass rounded-xl px-4 py-3 flex items-start gap-3">
              <Check className="h-4 w-4 text-[color:var(--brand-2)] mt-0.5 shrink-0" />
              <span className="text-sm">{i}</span>
            </div>
          ))}
        </div>
      </section>

      {/* LEAD CAPTURE */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <LeadCapture source="landing-mid" />
      </section>

      {/* FOUNDER */}
      <section id="founder" className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
        <div className="grid gap-10 md:grid-cols-[220px_1fr] items-start">
          <div className="mx-auto md:mx-0">
            <div className="h-52 w-52 rounded-2xl glass-strong overflow-hidden">
              <img src={dustinPhoto.url} alt="Dustin, creator of AI Income Systems Lab" className="h-full w-full object-cover" />
            </div>
            <p className="mt-4 text-center md:text-left text-sm font-semibold">Dustin</p>
            <p className="text-center md:text-left text-xs text-muted-foreground">Creator of AI Income Systems Lab</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Who's behind this</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">I Stopped Chasing Tools. I Started Building Systems.</h2>

            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                I've downloaded more free prompt packs than I care to admit. I've watched the tutorials, followed the gurus, and yes — I even paid for a couple of those "AI income" courses that basically just taught me how to use ChatGPT to write captions faster.
              </p>
              <p className="text-foreground font-medium">Cool. Love captions. Still broke.</p>
              <p>
                Here's what nobody was saying out loud: a single AI tool is a hammer. What you actually need is a construction crew.
              </p>
            </div>

            <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Let me paint you a picture of where I was six months ago. I had ChatGPT open in one tab. Claude in another. Perplexity for research. Lovable bookmarked but barely touched. And n8n — which I'd heard was "the automation thing" — staring at me like a dare.
              </p>
              <p>
                I was using all of them. Individually. For random tasks. Like hiring five specialists and then making each one work alone in a room with no Wi-Fi.
              </p>
              <p>
                The results? Mediocre content. Half-finished ideas. A growing pile of "I'll get back to this" notes that I never got back to.
              </p>
              <p>
                The problem wasn't the tools. The tools are genuinely incredible. The problem was that I was treating them like productivity hacks instead of <strong className="text-foreground">infrastructure</strong>.
              </p>
              <p>
                That shift — from tool to system — is the whole game. And once I saw it, I couldn't unsee it.
              </p>
            </div>

            <div className="mt-8 glass rounded-2xl p-6">
              <p className="text-sm text-foreground font-medium mb-2">Here's what I mean in plain English:</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ChatGPT is great at brainstorming and drafting. Claude is great at thinking through logic and refining. Perplexity pulls in real research without hallucinating half the citations. Lovable builds actual web products without you needing to code. And n8n ties them all together into automated workflows that run on a schedule, trigger on events, and don't need you babysitting them at 11pm.
              </p>
              <p className="mt-3 text-sm text-foreground font-medium">
                Alone, each one is useful. Together, they're a business.
              </p>
            </div>

            <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                That's what I spent the last several months actually building — not content for content's sake, not more prompts to add to a folder — but full income-generating systems that use all five tools working in sequence. Systems where one tool's output becomes another tool's input. Where a workflow runs, delivers value, and generates revenue while I'm doing something else entirely. Like sleeping. Or watching football. Or, I don't know, having a life.
              </p>
              <p>
                I built an online course around this — <strong className="text-foreground">AI Income Systems Lab</strong> — specifically because I kept looking for this exact thing and it didn't exist. Every course was either "here's how to use ChatGPT" or "here's how to make money online" with zero overlap between the two. Nobody was connecting the dots.
              </p>
              <p>
                So I connected them myself.
              </p>
              <p>
                The biggest thing I've learned in this whole process — and I mean this genuinely — is that <strong className="text-foreground">combining AI tools is exponentially more profitable than using them in isolation</strong>. Not slightly more. Not incrementally. The difference between a single AI tool and a five-tool system working together is the difference between a flashlight and stadium lighting.
              </p>
              <p className="text-foreground font-medium">
                You're probably not bad at this stuff. You're just missing the wiring.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Button asChild size="lg" variant="brand" className="h-12 px-7 text-base">
                <Link to="/signup">Don't Get Left Behind — Start Building Systems</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP — honest, no fabricated testimonials */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-10">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { k: "Cancel", v: "Anytime — keep access through your billing period" },
            { k: "0", v: "Hidden fees, upsells, or surprise charges" },
            { k: "2 mo", v: "Free when you choose any annual plan" },
          ].map((t) => (
            <div key={t.v} className="glass rounded-2xl p-5 text-center">
              <p className="text-2xl font-black text-gradient">{t.k}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.v}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          New program — we'd rather earn testimonials than fake them. Early cohort builders get featured here.
        </p>
      </section>

      {/* PRICING TEASER */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <div className="glass-strong rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "var(--gradient-hero)" }} />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Pick your plan. Cancel anytime.</h2>
          <p className="mt-3 text-muted-foreground">Three subscription tiers — monthly or annual. Annual plans get <strong className="text-foreground">2 months free</strong>.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 text-left">
            {[
              { name: "Starter", price: "$29", note: "/mo · Core course + prompts" },
              { name: "Builder", price: "$79", note: "/mo · + community, builders, templates", featured: true },
              { name: "Accelerator", price: "$149", note: "/mo · + faceless video, AI image, chatbot agency, DMs" },
            ].map((p) => (
              <div key={p.name} className={`rounded-2xl p-5 ${p.featured ? "ring-brand bg-white/5" : "glass"}`}>
                <p className="text-sm text-muted-foreground">{p.name}</p>
                <p className="mt-2 text-3xl font-bold">{p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <CohortCountdown />
          </div>
          <Button asChild variant="brand" size="lg" className="mt-6 h-12 px-7">
            <Link to="/pricing">See full pricing <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 sm:px-6 py-20">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">FAQ</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Questions, answered straight</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="glass rounded-xl px-5 py-4 group">
              <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                {f.q}
                <span className="text-muted-foreground group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
        <div className="glass-strong rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <Shield className="mx-auto h-8 w-8 text-[color:var(--brand)]" />
          <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">
            Stop collecting tools.<br/>
            <span className="text-gradient">Start shipping systems.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Join AI Income Systems Lab and build your first real offer in the next 7 days.
          </p>
          <Button asChild size="lg" variant="brand" className="mt-7 h-12 px-8">
            <Link to="/signup">Build My First Income System <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
