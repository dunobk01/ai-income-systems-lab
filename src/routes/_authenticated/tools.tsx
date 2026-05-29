import { createFileRoute } from "@tanstack/react-router";
import { Wrench, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Header } from "./builders/product";

export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({ meta: [{ title: "AI Tool Stack — AI Income Systems Lab" }] }),
  component: ToolsPage,
});

type Tool = { name: string; category: string; price: string; useFor: string; whyWeRecommend: string; url: string; pairsWith: string[] };

const tools: Tool[] = [
  { name: "ChatGPT", category: "LLM", price: "$20/mo", useFor: "Fluent reasoning, custom GPTs, daily co-pilot", whyWeRecommend: "Best ecosystem (GPTs, Projects, voice). The default for 80% of daily tasks.", url: "https://chat.openai.com", pairsWith: ["Custom Instructions", "Projects"] },
  { name: "Claude", category: "LLM", price: "$20/mo", useFor: "Long-context analysis, careful writing, code review", whyWeRecommend: "Best at preserving voice and handling 100k+ token inputs. Projects + Artifacts are killer features.", url: "https://claude.ai", pairsWith: ["Notion", "Lovable"] },
  { name: "Perplexity", category: "Research", price: "$20/mo", useFor: "Real-time cited research, market & competitor analysis", whyWeRecommend: "Replaces 10 Google searches with one cited answer. Pro Search depth is unmatched.", url: "https://perplexity.ai", pairsWith: ["Claude", "Notion"] },
  { name: "Lovable", category: "Web Apps", price: "Free tier + paid", useFor: "Ship real web apps with auth, DB, payments, AI", whyWeRecommend: "Fastest path from idea to deployed app. You're using it right now.", url: "https://lovable.dev", pairsWith: ["Supabase", "Stripe"] },
  { name: "n8n", category: "Automation", price: "Self-host free / $20+", useFor: "Visual automations across 400+ apps", whyWeRecommend: "More powerful than Zapier at a fraction of the cost. Self-host for unlimited runs.", url: "https://n8n.io", pairsWith: ["OpenAI", "Sheets", "Slack"] },
  { name: "Cursor", category: "Coding", price: "$20/mo", useFor: "AI-first code editor for serious building", whyWeRecommend: "When Lovable isn't enough, Cursor takes over. Best in-editor AI experience.", url: "https://cursor.sh", pairsWith: ["Claude", "GitHub"] },
  { name: "Notion", category: "Knowledge", price: "Free / $10+", useFor: "Brand voice, SOPs, content library, second brain", whyWeRecommend: "Single source of truth that AI tools can pull from. Sellable as templates too.", url: "https://notion.so", pairsWith: ["Claude", "n8n"] },
  { name: "Gumroad", category: "Sales", price: "10% per sale", useFor: "Sell digital products with zero setup", whyWeRecommend: "Easiest way to start charging in 10 minutes. Great for first $1k.", url: "https://gumroad.com", pairsWith: ["ConvertKit"] },
  { name: "Stripe", category: "Payments", price: "2.9% + 30¢", useFor: "Payments on your own site (Lovable + Stripe)", whyWeRecommend: "The standard. Once you own your funnel, switch from marketplaces to Stripe.", url: "https://stripe.com", pairsWith: ["Lovable"] },
  { name: "ConvertKit / Beehiiv", category: "Email", price: "Free tier + paid", useFor: "Email list, broadcasts, automations", whyWeRecommend: "Own your audience. Email beats every other channel for $/lead.", url: "https://beehiiv.com", pairsWith: ["n8n", "Gumroad"] },
  { name: "Tally / Typeform", category: "Forms", price: "Free / $25+", useFor: "Lead magnets, intake forms, surveys", whyWeRecommend: "Tally is the fast/free choice. Typeform if you need polish.", url: "https://tally.so", pairsWith: ["n8n"] },
  { name: "Loom", category: "Async", price: "Free / $12+", useFor: "Onboarding videos, sales follow-ups, SOPs", whyWeRecommend: "Async > meetings. Record once, reuse forever.", url: "https://loom.com", pairsWith: ["Notion"] },
];

function ToolsPage() {
  const categories = Array.from(new Set(tools.map((t) => t.category)));
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <Header icon={<Wrench className="h-5 w-5" />} eyebrow="Stack" title="The AI Income Tool Stack" subtitle="Our opinionated list of tools that actually pay for themselves. Pick from each category, ignore the rest." />

      {categories.map((cat) => (
        <section key={cat} className="mt-10">
          <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">{cat}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.filter((t) => t.category === cat).map((t) => (
              <article key={t.name} className="glass rounded-2xl p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{t.name}</h3>
                  <Badge variant="outline" className="border-white/15 text-[10px]">{t.price}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{t.useFor}</p>
                <p className="text-xs text-foreground/70 mt-3 leading-relaxed"><span className="text-[color:var(--brand)] font-semibold">Why: </span>{t.whyWeRecommend}</p>
                <div className="mt-3 text-xs text-muted-foreground">Pairs with: {t.pairsWith.join(", ")}</div>
                <a href={t.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs text-[color:var(--brand)] hover:underline">
                  Visit <ExternalLink className="h-3 w-3" />
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
