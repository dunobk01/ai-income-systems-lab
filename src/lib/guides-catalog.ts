import type { StaticGuide } from "@/lib/guides-content";
export const STATIC_GUIDES: Omit<StaticGuide, "intro" | "sections">[] = [
{
  slug: "cold-start-system",
  title:
    "The Cold Start System: How to Build and Launch a Digital Income System from Absolute Zero in 14 Days",
  description:
    "The exact 14-day operating sequence — validation, product, funnel, automation, and traffic — to go from blank page to a live income system, with every prompt included.",
  badge: "System",
  badgeColor: "bg-primary/15 text-primary border-primary/30",
  readMinutes: 26,
  publishedAt: "2026-07-08T00:00:00.000Z",
},
{
  slug: "digital-product-machine",
  title:
    "The Digital Product Machine: How to Ideate, Build, and Sell a Digital Product Using Only AI Tools",
  description:
    "From blank page to product live on Gumroad — the complete AI-powered product creation system with every prompt included.",
  badge: "Products",
  badgeColor: "bg-primary/10 text-brand-2 border-brand-2/30",
  readMinutes: 22,
  publishedAt: "2026-07-08T00:00:00.000Z",
},
{
  slug: "n8n-income-automation",
  title:
    "The n8n Income Automation Playbook: 7 Workflows That Run Your Business While You Sleep",
  description:
    "Seven production-ready n8n workflows for delivery, sequences, repurposing, lead routing, and revenue tracking — with node-by-node setup instructions.",
  badge: "Automation",
  badgeColor: "bg-white/5 text-foreground/80 border-white/15",
  readMinutes: 28,
  publishedAt: "2026-07-08T00:00:00.000Z",
},
{
  slug: "local-business-ai-service",
  title:
    "The Local Business AI Service Playbook: How to Land $500–$2,000 Clients Using AI Tools You Already Have",
  description:
    "The complete system for selling productized AI services to local businesses — from niche selection and cold outreach to delivery and recurring retainers.",
  badge: "Client Work",
  badgeColor: "bg-primary/10 text-primary border-primary/25",
  readMinutes: 20,
  publishedAt: "2026-07-08T00:00:00.000Z",
},
{
  slug: "ai-content-system",
  title:
    "The AI Content System: How to Build a Content Engine That Drives Traffic, Grows Your List, and Sells Your Offer on Autopilot",
  description:
    "The complete AI content operation — ideation, writing, repurposing, publishing — in under two hours a week.",
  badge: "Traffic",
  badgeColor: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  readMinutes: 24,
  publishedAt: "2026-07-08T00:00:00.000Z",
},
{
  slug: "ai-funnel-system",
  title:
    "The AI Funnel System: How to Build a Complete Lead-to-Buyer Funnel Using ChatGPT, Claude, and Lovable",
  description:
    "The end-to-end funnel build — lead magnet, landing page, email sequence, tripwire, and core offer — written, designed, and automated entirely with AI.",
  badge: "Funnels",
  badgeColor: "bg-white/5 text-foreground/80 border-white/15",
  readMinutes: 26,
  publishedAt: "2026-07-08T00:00:00.000Z",
}
];
export const getStaticGuideBySlug = (slug: string) => STATIC_GUIDES.find(g => g.slug === slug);
