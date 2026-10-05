import {
  Gauge,
  Calculator,
  Radar,
  Wand2,
  Package,
  SlidersHorizontal,
  Magnet,
  MessagesSquare,
  SearchCheck,
  Repeat,
  type LucideIcon,
} from "lucide-react";

export type FreeTool = {
  slug: string;
  path: string;
  name: string;
  promise: string;
  time: string;
  icon: LucideIcon;
  status: "live" | "soon";
};

export const FREE_TOOLS: FreeTool[] = [
  {
    slug: "ai-prompt-generator",
    path: "/free-tools/prompt-generator",
    name: "AI Prompt Generator",
    promise: "Get three detailed, copy-ready prompts built for your business and your goal.",
    time: "About 30 seconds",
    icon: Wand2,
    status: "live",
  },
  {
    slug: "ai-readiness-scorecard",
    path: "/free-tools/ai-readiness-scorecard",
    name: "AI Readiness Scorecard",
    promise: "Find where AI can save your business the most time — and what to automate first.",
    time: "About 2 minutes",
    icon: Gauge,
    status: "live",
  },
  {
    slug: "ai-savings-calculator",
    path: "/free-tools/ai-savings-calculator",
    name: "AI Time & Money Savings Calculator",
    promise: "See how many hours and dollars AI could give back to you every month.",
    time: "About 90 seconds",
    icon: Calculator,
    status: "live",
  },
  {
    slug: "ai-visibility-check",
    path: "/free-tools/ai-visibility-check",
    name: "AI Search Visibility Check",
    promise: "When customers ask ChatGPT for a business like yours, do you show up?",
    time: "About 60 seconds",
    icon: Radar,
    status: "live",
  },
  {
    slug: "product-blueprint-generator",
    path: "/free-tools/product-blueprint",
    name: "AI Product Blueprint Generator",
    promise: "Turn your skills into three realistic digital product ideas — with a 7-day plan, price and funnel.",
    time: "About 2 minutes",
    icon: Package,
    status: "live",
  },
  {
    slug: "ai-prompt-customizer",
    path: "/free-tools/prompt-customizer",
    name: "AI Prompt Customizer",
    promise: "Answer a few questions and get one detailed, ready-to-use prompt engineered for your exact task.",
    time: "About 60 seconds",
    icon: SlidersHorizontal,
    status: "live",
  },
  {
    slug: "lead-magnet-generator",
    path: "/free-tools/lead-magnet-generator",
    name: "Lead-Magnet Generator",
    promise: "Get lead-magnet concepts, a full outline, landing-page copy and a 5-email follow-up sequence.",
    time: "About 2 minutes",
    icon: Magnet,
    status: "live",
  },
  {
    slug: "ask-the-lab",
    path: "/free-tools/ask-the-lab",
    name: "Ask the Lab",
    promise: "Ask any question about building an AI-powered business and get an answer with the right next step.",
    time: "About 30 seconds",
    icon: MessagesSquare,
    status: "live",
  },
  {
    slug: "ai-funnel-auditor",
    path: "/free-tools/funnel-auditor",
    name: "AI Funnel Auditor",
    promise: "Get your offer and landing page scored, with fixes for weak headlines, objections and missing proof.",
    time: "About 2 minutes",
    icon: SearchCheck,
    status: "live",
  },
  {
    slug: "content-repurposing-engine",
    path: "/free-tools/content-repurposer",
    name: "Content Repurposing Engine",
    promise: "Paste one piece of content and get Pinterest pins, video scripts, social posts, an email and more.",
    time: "About 60 seconds",
    icon: Repeat,
    status: "live",
  },
];

export const freeToolBySlug = (slug: string) => FREE_TOOLS.find((t) => t.slug === slug);
