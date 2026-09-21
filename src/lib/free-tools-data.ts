import { Gauge, Calculator, Radar, type LucideIcon } from "lucide-react";

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
    promise: "Estimate the hours and admin cost a few automations could take off your week.",
    time: "About 90 seconds",
    icon: Calculator,
    status: "soon",
  },
  {
    slug: "ai-visibility-check",
    path: "/free-tools/ai-visibility-check",
    name: "AI Search Visibility Check",
    promise: "See whether AI assistants can actually find and recommend your business.",
    time: "About 60 seconds",
    icon: Radar,
    status: "soon",
  },
];

export const freeToolBySlug = (slug: string) => FREE_TOOLS.find((t) => t.slug === slug);
