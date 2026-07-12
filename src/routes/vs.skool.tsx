import { createFileRoute } from "@tanstack/react-router";
import { ComparisonPageView, comparisonFaqLd } from "@/components/comparison-page";
import { ogImageMeta } from "@/lib/og";

const CANONICAL = "https://ai-income-systems.com/vs/skool";

const rows = [
  { label: "Structured AI-income curriculum", us: true, them: false },
  { label: "Interactive builders (product, funnel, agent)", us: true, them: false },
  { label: "Community + Wall of Wins", us: true, them: true },
  { label: "Prompt library + n8n workflow templates", us: true, them: false },
  { label: "Faceless video / AI image / chatbot modules", us: true, them: false },
  { label: "Cancel-anytime monthly", us: "$29/mo", them: "Varies by group" },
  { label: "Fixed pricing across the platform", us: true, them: false },
  { label: "Focus", us: "AI income systems", them: "General communities" },
];

const whyWeWin = [
  { title: "Curriculum, not a chatroom", body: "Skool is a container — the education depends entirely on the group owner. We ship 11 modules, 90+ lessons, and builders you actually use." },
  { title: "Tools built for the outcome", body: "Digital Product Builder, Funnel Builder, Agent Generator, n8n workflow library — none of that exists on Skool." },
  { title: "One flat price, all AI", body: "Pay us once per month for the full stack. On Skool you're paying per community, often for content that never gets updated." },
];

const faqs = [
  { q: "Is AI Income Systems a Skool community?", a: "No. We're a full learning platform with a curriculum, interactive builders, prompt library, workflows, and a dedicated members-only community — all in one login." },
  { q: "Can I get similar AI training inside Skool?", a: "You can find AI-themed groups on Skool, but quality varies wildly. Our platform is purpose-built for AI-powered income systems with a fixed curriculum, live-updated tools, and hands-on builders." },
  { q: "How much does it cost vs. a Skool group?", a: "We start at $29/mo for the full curriculum. Skool groups typically charge $39–$99/mo each, and you'd need several to match what we ship in one plan." },
];

export const Route = createFileRoute("/vs/skool")({
  head: () => ({
    meta: [
      { title: "AI Income Systems vs. Skool — Which is right for AI income? (2026)" },
      { name: "description", content: "Skool is a community platform. AI Income Systems is a full AI-income curriculum with interactive builders, workflows, and community. Compare features and pricing." },
      { property: "og:title", content: "AI Income Systems vs. Skool" },
      { property: "og:description", content: "Structured AI curriculum vs. a general community platform. See the full feature comparison." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: CANONICAL },
      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(comparisonFaqLd(faqs)) }],
  }),
  component: () => (
    <ComparisonPageView
      competitor="Skool"
      competitorTagline="Community-first platform"
      headline="Which one actually teaches you to earn with AI?"
      subline="Skool hosts communities. AI Income Systems ships a full curriculum, builders, and templates to help you make money with AI — not just talk about it."
      rows={rows}
      whyWeWin={whyWeWin}
      faqs={faqs}
      canonicalPath="/vs/skool"
    />
  ),
});
