import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://ai-income-systems.com";
const BRAND = "AI Income Systems Lab";

type Row = Record<string, string>;

const products: Row[] = [
  {
    id: "ailab_starter_onetime",
    title: "Starter — Monthly Membership",
    description: "Full 11-module course access. Learn the AI Income System end-to-end. Cancel anytime.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-starter-monthly-v2.jpg`,
    price: "29.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    product_type: "Course > Subscription > Starter Monthly",
  },
  {
    id: "ailab_starter_monthly",
    title: "Starter — Monthly Membership",
    description: "Full 11-module course access. Learn the AI Income System end-to-end. Cancel anytime.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-starter-monthly-v2.jpg`,
    price: "29.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    product_type: "Course > Subscription > Starter Monthly",
  },
  {
    id: "ailab_builder_onetime",
    title: "Builder — Monthly Membership",
    description: "Course + members-only community + template library + interactive builders. Most popular tier.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-builder-monthly-v2.jpg`,
    price: "79.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    product_type: "Course > Subscription > Builder Monthly",
  },
  {
    id: "ailab_builder_monthly",
    title: "Builder — Monthly Membership",
    description: "Course + members-only community + template library + interactive builders. Most popular tier.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-builder-monthly-v2.jpg`,
    price: "79.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    product_type: "Course > Subscription > Builder Monthly",
  },
  {
    id: "ailab_pro_onetime",
    title: "Accelerator — Monthly Membership",
    description:
      "Everything in Builder plus Faceless Video, AI Image Income, Chatbot Agency, Agent Generator, and member DMs.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-accelerator-monthly-v2.jpg`,
    price: "149.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    product_type: "Course > Subscription > Accelerator Monthly",
  },
  {
    id: "ailab_accelerator_monthly",
    title: "Accelerator — Monthly Membership",
    description:
      "Everything in Builder plus Faceless Video, AI Image Income, Chatbot Agency, Agent Generator, and member DMs.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-accelerator-monthly-v2.jpg`,
    price: "149.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    product_type: "Course > Subscription > Accelerator Monthly",
  },
];

const HEADERS = ["id", "title", "description", "link", "image_link", "price", "availability", "condition", "brand", "product_type"];

function esc(v: string): string {
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
            "Cache-Control": "public, max-age=300, s-maxage=300",
          },
        });
      },
    },
  },
});
