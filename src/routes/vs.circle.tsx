import { createFileRoute } from "@tanstack/react-router";
import { ComparisonPageView, comparisonFaqLd } from "@/components/comparison-page";
import { ogImageMeta } from "@/lib/og";

const CANONICAL = "https://ai-income-systems.com/vs/circle";

const rows = [
  { label: "Structured AI-income curriculum", us: true, them: false },
  { label: "Interactive builders (product, funnel, agent)", us: true, them: false },
  { label: "Prompt library + n8n workflow templates", us: true, them: false },
  { label: "Community + Wall of Wins", us: true, them: true },
  { label: "Courses / lessons", us: true, them: "Add-on" },
  { label: "Starts at", us: "$29/mo", them: "$89/mo (host)" },
  { label: "Focus", us: "AI income systems", them: "Host-your-own community" },
];

const whyWeWin = [
  { title: "Content, tools, and community — bundled", body: "Circle is a great host platform if you're building your own community. We are the community, plus the curriculum and builders you'd otherwise have to create yourself." },
  { title: "AI-specific by design", body: "Every module, prompt, and workflow is tuned to AI-powered income. Circle is category-agnostic — you'd need to source all of that." },
  { title: "One membership, one price", body: "$29/mo for the whole platform. Circle's plans are for hosts, and stacking a curriculum + tools on top adds up fast." },
];

const faqs = [
  { q: "Is AI Income Systems on Circle?", a: "No. We're built on our own platform because the community is only part of what we do — the builders, curriculum, and workflow library are just as important." },
  { q: "Can Circle replace this?", a: "Only if you want to build an AI-income community from scratch. If you want to skip the setup and just start earning with AI, we're the shortcut." },
  { q: "Do I need any other tools?", a: "You'll want a Stripe account to sell, and optionally n8n or Zapier for workflows. Everything else — prompts, templates, community, curriculum — is included." },
];

export const Route = createFileRoute("/vs/circle")({
  head: () => ({
    meta: [
      { title: "AI Income Systems vs. Circle (2026)" },
      { name: "description", content: "Circle hosts communities. AI Income Systems is a full AI-income platform with curriculum, builders, prompts, and workflows built in." },
      { property: "og:title", content: "AI Income Systems vs. Circle" },
      { property: "og:description", content: "Community platform vs. built-for-you AI income system. Compare features and pricing." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: CANONICAL },
      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(comparisonFaqLd(faqs)) }],
  }),
  component: () => (
    <ComparisonPageView
      competitor="Circle"
      competitorTagline="Community host platform"
      headline="Build the community or join the one that's built?"
      subline="Circle gives you the walls. AI Income Systems gives you the walls, the room, and a curriculum you can actually earn with."
      rows={rows}
      whyWeWin={whyWeWin}
      faqs={faqs}
      canonicalPath="/vs/circle"
    />
  ),
});
