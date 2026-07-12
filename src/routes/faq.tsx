import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ogImageMeta } from "@/lib/og";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — AI Income Systems Lab" },
      { name: "description", content: "Honest answers about how the program works, what's included, refunds, pacing, and who it's for." },
      { property: "og:title", content: "FAQ — AI Income Systems Lab" },
      { property: "og:description", content: "Honest answers about how the program works, what's included, refunds, pacing, and who it's for." },
      { property: "og:url", content: "https://ai-income-systems.com/faq" },
    
      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: "https://ai-income-systems.com/faq" }],
  }),
  component: FAQPage,
});

const groups = [
  {
    label: "Getting started",
    faqs: [
      { q: "Do I need any AI experience?", a: "No. Module 1 starts from zero. If you can write a paragraph and follow steps, you can do this. Most students arrive having tried ChatGPT a few times and nothing else." },
      { q: "Do I need paid AI tools?", a: "Free tiers of ChatGPT, Claude, Perplexity, Lovable, and n8n are enough to complete every module. Paid tiers help (longer context, faster models, more workflow runs), but they aren't required to ship your first income system." },
      { q: "How long does it take?", a: "You can ship your first income system in 7 days following Module 11. The full curriculum is paced for 4–8 weeks of part-time work (about 4–6 hours/week). Lifetime access means you go at your pace." },
      { q: "What if I'm not technical?", a: "The whole program is built for non-technical operators. Lovable handles the code, n8n handles the integrations, and the AI tools handle most of the writing. If you can drag, drop, and copy-paste, you're qualified." },
    ],
  },
  {
    label: "Program & content",
    faqs: [
      { q: "Will you teach me to make $X per month?", a: "No fake income promises. We teach the systems people actually use to build offers and sell them. Your results depend on the work you put in, the market you pick, and how willing you are to iterate. Anyone promising a guaranteed dollar amount is selling fiction." },
      { q: "Is this another 'AI guru' course?", a: "It's the opposite. No screenshots of fake Stripe dashboards. No upsells to a $5,000 mastermind. No 'limited spots' theater. Just one course, four tiers, real systems, lifetime updates." },
      { q: "What if I get stuck?", a: "Every lesson has action steps, copy-pasteable prompts, and example outputs. The interactive builders (on Builder + Pro tiers) generate plans tailored to your niche. If a lesson confuses you, email support — we read every message." },
      { q: "How often is the content updated?", a: "AI tools change monthly. We update the relevant modules whenever a major change ships (new GPT version, new n8n features, new Lovable capabilities). Lifetime access includes all updates." },
    ],
  },
  {
    label: "Pricing & access",
    faqs: [
      { q: "What's the difference between Monthly and the lifetime tiers?", a: "Monthly ($14.99/mo) gives you full access for as long as you stay subscribed — best if you want low commitment. Lifetime tiers (Starter $29, Builder $79, Pro $149) are one-time payments and yours forever, including future updates. Lifetime is cheaper if you plan to stick around more than 6–12 months." },
      { q: "What do the lifetime tiers include?", a: "Starter = course + prompt library. Builder = adds interactive builders + n8n workflow templates. Pro = adds the local business service kit + advanced templates + priority support. Full comparison on the pricing page." },
      { q: "Can I upgrade later?", a: "Yes — upgrade any time and pay only the difference. No 'gotcha' pricing." },
      { q: "Do you offer refunds?", a: "Yes. 14-day refund window on every one-time (lifetime) tier — no questions asked. Monthly is cancel-anytime. Email support and you'll get it processed within 48 hours." },
      { q: "Is there a payment plan?", a: "The monthly tier is effectively the payment plan — start there, upgrade to a lifetime tier whenever it makes sense." },
    ],
  },
  {
    label: "Who it's for",
    faqs: [
      { q: "I'm a complete beginner. Is this for me?", a: "Yes — most students start here. The first three modules assume zero experience." },
      { q: "I already use ChatGPT and Claude. Will I get value?", a: "Yes, most likely. Knowing how to use a single tool is not the same as wiring them together into a system that ships products and runs without you. That's the whole curriculum." },
      { q: "I'm a freelancer / agency operator. Will this work for me?", a: "Yes — Modules 8, 9, and 10 are especially relevant. The local business kit alone is built to be sold as a productized service at $500–$2k per client." },
      { q: "I don't have an audience. Does that matter?", a: "It doesn't. We teach systems that don't depend on an existing following — Pinterest, SEO, cold outreach, and paid traffic all work without one." },
    ],
  },
];

function FAQPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> FAQ
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">
            Questions, <span className="text-gradient">answered straight.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">No fluff. If your question isn't here, email <a className="underline hover:text-foreground" href="mailto:support@ai-income-systems.com">support@ai-income-systems.com</a>.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20 space-y-10">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{g.label}</p>
            <div className="space-y-3">
              {g.faqs.map((f) => (
                <details key={f.q} className="glass rounded-xl px-5 py-4 group">
                  <summary className="font-medium cursor-pointer list-none flex justify-between items-center gap-3">
                    <span>{f.q}</span>
                    <span className="text-muted-foreground group-open:rotate-45 transition shrink-0">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-24">
        <div className="glass-strong rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="text-2xl sm:text-3xl font-bold">Still on the fence?</h2>
          <p className="mt-2 text-muted-foreground">Start month-to-month at $14.99 — cancel anytime, keep what you've built.</p>
          <Button asChild size="lg" variant="brand" className="mt-6 h-12 px-7">
            <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
