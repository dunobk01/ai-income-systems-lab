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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: "https://ai-income-systems.com/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: groups.flatMap((g) => g.faqs).map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    }],
  }),
  component: FAQPage,
});

const groups = [
  {
    label: "Getting started",
    faqs: [
      { q: "Do I need any AI experience?", a: "No. Module 1 starts from zero. If you can write a paragraph and follow steps, you can do this. Most students arrive having tried ChatGPT a few times and nothing else." },
      { q: "Do I need paid AI tools?", a: "You can use free access to ChatGPT, Claude, Perplexity, and Lovable for the core lessons. For n8n, the managed Cloud service offers a limited free trial before a paid plan; the Community Edition is free to self-host, but you are responsible for the server, setup, updates, security, backups, and uptime. Connected AI services may also charge separately for API usage." },
      { q: "How long does it take?", a: "You can ship your first income system in 7 days following Module 11. The full curriculum is paced for 4–8 weeks of part-time work (about 4–6 hours/week), and you can learn at your own pace while your plan is active." },
      { q: "What if I'm not technical?", a: "The whole program is built for non-technical operators. Lovable handles the code, n8n handles the integrations, and the AI tools handle most of the writing. If you can drag, drop, and copy-paste, you're qualified." },
    ],
  },
  {
    label: "Program & content",
    faqs: [
      { q: "Will you teach me to make $X per month?", a: "No fake income promises. We teach the systems people actually use to build offers and sell them. Your results depend on the work you put in, the market you pick, and how willing you are to iterate. Anyone promising a guaranteed dollar amount is selling fiction." },
      { q: "Is this another 'AI guru' course?", a: "It's the opposite. No screenshots of fake Stripe dashboards. No upsells to a $5,000 mastermind. No 'limited spots' theater. Just practical lessons, real systems, and clear monthly plans." },
      { q: "What if I get stuck?", a: "Every lesson has action steps, copy-pasteable prompts, and example outputs. The interactive builders (on Builder and Accelerator plans) generate plans tailored to your niche. If a lesson confuses you, email support — we read every message." },
      { q: "How often is the content updated?", a: "AI tools change monthly. We update the relevant modules whenever a major change ships, and active members receive those updates as part of their plan." },
    ],
  },
  {
    label: "Pricing & access",
    faqs: [
      { q: "What do the plans cost?", a: "The Free plan costs $0. Starter is $19.99/month, Builder is $29.99/month, and Accelerator is $44.99/month. Every paid plan is billed monthly and can be canceled anytime." },
      { q: "What does each tier include?", a: "Starter opens Modules 1–11 and the Starter prompt library. Builder adds Module 12, the community, template library and interactive builders. Accelerator opens all 15 modules, including faceless video, AI image and chatbot agency, plus member DMs. Full comparison is on the pricing page." },
      { q: "Can I upgrade later?", a: "Yes — upgrade any time and pay only the difference. No 'gotcha' pricing." },
      { q: "Do you offer refunds?", a: "Yes. Your first payment for any subscription tier has a 14-day money-back guarantee. Email support within 14 days of that initial purchase for a full refund. Renewals are not refundable, but you can cancel anytime and keep access through the paid billing period." },
      { q: "Is there a payment plan?", a: "There are no long-term payment plans. Starter, Builder, and Accelerator are billed monthly, and you can cancel anytime." },
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
          <p className="mt-2 text-muted-foreground">Start with Starter at $19.99/month — cancel anytime.</p>
          <Button asChild size="lg" variant="brand" className="mt-6 h-12 px-7">
            <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
