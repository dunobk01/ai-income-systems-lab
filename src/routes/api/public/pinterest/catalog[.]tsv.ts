import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://ai-income-systems.com";
const BRAND = "AI Income Systems Lab";
const IMAGE = `${BASE_URL}/og-default.jpg`;

type Row = Record<string, string>;

const products: Row[] = [
  {
    id: "ailab_monthly_subscription",
    title: "All-Access Monthly Membership",
    description:
      "Full access to all 11 modules and 90+ lessons inside the AI Income Systems Lab course platform. Cancel anytime.",
    link: `${BASE_URL}/pricing`,
    image_link: IMAGE,
    price: "14.99 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Education > Online Courses",
    product_type: "Course > Membership > Monthly",
  },
  {
    id: "ailab_starter_onetime",
    title: "Starter — Lifetime Access",
    description:
      "Lifetime access to the Starter tier of AI Income Systems Lab. Foundations to start earning with AI online.",
    link: `${BASE_URL}/pricing`,
    image_link: IMAGE,
    price: "49.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Education > Online Courses",
    product_type: "Course > Lifetime > Starter",
  },
  {
    id: "ailab_builder_onetime",
    title: "Builder — Lifetime Access",
    description:
      "Lifetime access to Builder tier: every module plus the AI Agents & Skills builders and templates.",
    link: `${BASE_URL}/pricing`,
    image_link: IMAGE,
    price: "149.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Education > Online Courses",
    product_type: "Course > Lifetime > Builder",
  },
  {
    id: "ailab_pro_onetime",
    title: "Pro Systems Lab — Lifetime Access",
    description:
      "Top tier lifetime access: full curriculum, all builders, Pro Systems Lab, and every future update.",
    link: `${BASE_URL}/pricing`,
    image_link: IMAGE,
    price: "299.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Education > Online Courses",
    product_type: "Course > Lifetime > Pro",
  },
];

const HEADERS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "price",
  "availability",
  "condition",
  "brand",
  "google_product_category",
  "product_type",
];

function esc(v: string): string {
  // TSV: strip tabs/newlines from field values
  return v.replace(/[\t\r\n]+/g, " ").trim();
}

export const Route = createFileRoute("/api/public/pinterest/catalog.tsv")({
  server: {
    handlers: {
      GET: async () => {
        const lines = [HEADERS.join("\t")];
        for (const row of products) {
          lines.push(HEADERS.map((h) => esc(row[h] ?? "")).join("\t"));
        }
        return new Response(lines.join("\n"), {
          headers: {
            "Content-Type": "text/tab-separated-values; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
