import { createFileRoute } from "@tanstack/react-router";
import { ComparisonPageView, comparisonFaqLd } from "@/components/comparison-page";
import { ogImageMeta } from "@/lib/og";

const CANONICAL = "https://ai-income-systems.com/vs/mighty-networks";

const rows = [
  { label: "Structured AI-income curriculum", us: true, them: false },
  { label: "Interactive builders (product, funnel, agent)", us: true, them: false },
  { label: "Prompt library + workflow templates", us: true, them: false },
  { label: "Community & discussions", us: true, them: true },
  { label: "Cohort/event scheduling", us: false, them: true },
  { label: "White-label branding", us: false, them: true },
  { label: "Starts at", us: "$29/mo", them: "$41/mo (host)" },
  { label: "Focus", us: "AI income systems", them: "Host-your-own community" },
];

const whyWeWin = [
  { title: "You want to earn, not host", body: "Mighty Networks is for people who want to run a community. We're for people who want to build AI income streams." },
  { title: "Everything is done for you", body: "Curriculum, prompts, tools, and workflows are already loaded. On Mighty, you start with an empty canvas and have to build it all yourself." },
  { title: "Lower price, higher output", body: "$29/mo gets you full access. Mighty's host plans start higher and don't include any content or tools — you build those." },
];

const faqs = [
  { q: "Is AI Income Systems a Mighty Networks alternative?", a: "Only if you were joining a Mighty community about AI income. We're not a host-your-own platform — we're a fully-built learning platform members join." },
  { q: "Can I create my own space here?", a: "No. AI Income Systems is a curated platform, not a community-building tool. If you want to host your own space, Mighty is a fine choice — for everything else, we're likely a better fit." },
  { q: "Which is cheaper?", a: "For a member, we start at $29/mo. Mighty's host plans start higher and require you to create the content — so total cost varies." },
];

export const Route = createFileRoute("/vs/mighty-networks")({
  head: () => ({
    meta: [
      { title: "AI Income Systems vs. Mighty Networks (2026)" },
      { name: "description", content: "Mighty Networks lets you host a community. AI Income Systems gives you the full AI-income curriculum, tools, and community — done for you." },
      { property: "og:title", content: "AI Income Systems vs. Mighty Networks" },
      { property: "og:description", content: "Build vs. join: which one fits your goal?" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: CANONICAL },
      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(comparisonFaqLd(faqs)) }],
  }),
  component: () => (
    <ComparisonPageView
      competitor="Mighty Networks"
      competitorTagline="Host-your-own community"
      headline="Host a community or join one that already works?"
      subline="Mighty gives you an empty canvas. AI Income Systems hands you a curriculum, tools, and a room full of builders on day one."
      rows={rows}
      whyWeWin={whyWeWin}
      faqs={faqs}
      canonicalPath="/vs/mighty-networks"
    />
  ),
});
