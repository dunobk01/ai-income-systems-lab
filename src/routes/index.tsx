import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, Rocket, Zap, Brain, Workflow, Bot, Search, Layers,
  ArrowRight, Check, Shield, MessageSquare, Wand2, FileCode2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { CohortCountdown } from "@/components/cohort-countdown";
import { LeadCapture } from "@/components/lead-capture";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Income Systems Lab — Master AI by building real income systems" },
      { name: "description", content: "Learn how to combine ChatGPT, Claude, Perplexity, Lovable, and n8n to create digital products, funnels, automations, and simple apps you can actually sell." },
    ],
  }),
  component: LandingPage,
});

const tools = [
  { name: "ChatGPT", desc: "Execution + content", icon: MessageSquare },
  { name: "Claude", desc: "Long-form + strategy", icon: Brain },
  { name: "Perplexity", desc: "Research + validation", icon: Search },
  { name: "Lovable", desc: "Apps + funnels", icon: FileCode2 },
  { name: "n8n", desc: "Automation glue", icon: Workflow },
];

const builds = [
  { title: "Digital products", desc: "Ebooks, templates, prompt packs, mini-courses you can sell on day one.", icon: Layers },
  { title: "Sales funnels", desc: "Lead magnet → landing page → tripwire → upsell — mapped end to end.", icon: Rocket },
  { title: "Simple SaaS MVPs", desc: "Working web apps with auth, payments, and a real customer use case.", icon: Bot },
  { title: "Automations", desc: "n8n workflows that handle delivery, follow-up, and content repurposing.", icon: Zap },
  { title: "Local AI services", desc: "Productized offers for small businesses — audits, mockups, automations.", icon: Wand2 },
  { title: "Content systems", desc: "Repeatable AI content pipelines for Pinterest, TikTok, Shorts, and SEO.", icon: Sparkles },
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
  "100+ structured lessons across 11 modules",
  "Searchable prompt library (ChatGPT, Claude, Perplexity, Lovable, n8n)",
  "Interactive Digital Product Builder",
  "Interactive Sales Funnel Builder",
  "n8n workflow templates with setup guides",
  "Local business AI service kit + outreach scripts",
  "Lifetime access to your tier",
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
              <a href="#curriculum">See What You'll Build</a>
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
            <div key={b.title} className="glass rounded-2xl p-6 transition hover:bg-white/8">
              <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: "var(--gradient-soft)" }}>
                <b.icon className="h-5 w-5 text-[color:var(--brand)]" />
              </div>
              <h3 className="mt-4 font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
            </div>
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
            <div key={t.name} className="glass rounded-2xl p-5 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl" style={{ background: "var(--gradient-soft)" }}>
                <t.icon className="h-6 w-6 text-[color:var(--brand-2)]" />
              </div>
              <p className="mt-4 font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CURRICULUM */}
      <section id="curriculum" className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Curriculum</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">11 modules. 90+ lessons.</h2>
          <p className="mt-3 text-muted-foreground">Sequenced so each module builds on the last.</p>
        </div>
        <div className="glass-strong rounded-2xl overflow-hidden divide-y divide-white/5">
          {modules.map((m) => (
            <div key={m.n} className="flex items-center gap-5 px-5 sm:px-7 py-4 hover:bg-white/5 transition">
              <span className="text-xs font-mono text-muted-foreground w-8">{m.n}</span>
              <span className="flex-1 font-medium">{m.title}</span>
              <span className="text-xs text-muted-foreground">{m.lessons} lessons</span>
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

      {/* PRICING TEASER */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
        <div className="glass-strong rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "var(--gradient-hero)" }} />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Three tiers. One-time payment.</h2>
          <p className="mt-3 text-muted-foreground">No subscriptions. No upsells. Pick your level, get lifetime access.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 text-left">
            {[
              { name: "Starter Lab", price: "$29", note: "Course + prompts" },
              { name: "Builder Lab", price: "$79", note: "+ builders + workflows", featured: true },
              { name: "Pro Systems Lab", price: "$149", note: "+ local kit + templates" },
            ].map((p) => (
              <div key={p.name} className={`rounded-2xl p-5 ${p.featured ? "ring-brand bg-white/5" : "glass"}`}>
                <p className="text-sm text-muted-foreground">{p.name}</p>
                <p className="mt-2 text-3xl font-bold">{p.price}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
              </div>
            ))}
          </div>
          <Button asChild variant="brand" size="lg" className="mt-8 h-12 px-7">
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
            <Link to="/signup">Start Learning <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
