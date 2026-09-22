import { Gauge, Calculator, Radar, Wand2, type LucideIcon } from "lucide-react";

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
];

export const freeToolBySlug = (slug: string) => FREE_TOOLS.find((t) => t.slug === slug);
