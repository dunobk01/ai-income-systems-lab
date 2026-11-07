import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://ai-income-systems.com";
const BRAND = "AI Income Systems Lab";
// Google en-US taxonomy: Software > Computer Software > Educational Software.
const GOOGLE_PRODUCT_CATEGORY = "317";

type Row = Record<string, string>;

const products: Row[] = [
  {
    id: "ailab_starter_monthly",
    title: "Starter — Monthly Membership",
    description: "Modules 1–11 (69 step-by-step lessons), prompt library, downloads, and progress tracking. Learn the AI Income System at your own pace. Cancel anytime.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-starter-v3.jpg`,
    price: "19.99 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: GOOGLE_PRODUCT_CATEGORY,
    product_type: "Course > Subscription > Starter Monthly",
  },
  {
    id: "ailab_builder_monthly",
    title: "Builder — Monthly Membership",
    description: "Modules 1–12 (77 lessons), 10+ AI builder tools, The Lab build tutorials, guides, and the member AI Assistant. Cancel anytime.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-builder-v3.jpg`,
    price: "29.99 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: GOOGLE_PRODUCT_CATEGORY,
    product_type: "Course > Subscription > Builder Monthly",
  },
  {
    id: "ailab_accelerator_monthly",
    title: "Accelerator — Monthly Membership",
    description:
      "All 15 modules (89 lessons), every AI tool, The Lab, guides, and the member AI Assistant, plus advanced modules on video, images, chatbots, and agents.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-accelerator-v3.jpg`,
    price: "44.99 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: GOOGLE_PRODUCT_CATEGORY,
    product_type: "Course > Subscription > Accelerator Monthly",
  },
];

const HEADERS = ["id", "title", "description", "link", "image_link", "price", "availability", "condition", "brand", "google_product_category", "product_type"];

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
