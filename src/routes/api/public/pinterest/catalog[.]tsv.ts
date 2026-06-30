import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://ai-income-systems.com";
const BRAND = "AI Income Systems Lab";


type Row = Record<string, string>;

const products: Row[] = [
  {
    id: "ailab_starter_monthly",
    title: "Starter — Monthly Membership",
    description:
      "Full 11-module course access. Learn the AI Income System end-to-end. Cancel anytime.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-starter.jpg`,
    price: "29.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Education > Online Courses",
    product_type: "Course > Subscription > Starter Monthly",
  },
  {
    id: "ailab_starter_annual",
    title: "Starter — Annual Membership (2 months free)",
    description:
      "Annual access to the full 11-module course. Save vs. monthly with 2 months free.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-starter.jpg`,
    price: "290.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Education > Online Courses",
    product_type: "Course > Subscription > Starter Annual",
  },
  {
    id: "ailab_builder_monthly",
    title: "Builder — Monthly Membership",
    description:
      "Course + members-only community + template library + interactive builders. Most popular tier.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-builder.jpg`,
    price: "79.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Education > Online Courses",
    product_type: "Course > Subscription > Builder Monthly",
  },
  {
    id: "ailab_builder_annual",
    title: "Builder — Annual Membership (2 months free)",
    description:
      "Annual Builder access: course, community, templates, and builders. 2 months free vs. monthly.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-builder.jpg`,
    price: "790.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Education > Online Courses",
    product_type: "Course > Subscription > Builder Annual",
  },
  {
    id: "ailab_accelerator_monthly",
    title: "Accelerator — Monthly Membership",
    description:
      "Everything in Builder plus Faceless Video, AI Image Income, Chatbot Agency (Botpress), Agent Generator, and member DMs.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-pro.jpg`,
    price: "149.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Education > Online Courses",
    product_type: "Course > Subscription > Accelerator Monthly",
  },
  {
    id: "ailab_accelerator_annual",
    title: "Accelerator — Annual Membership (2 months free)",
    description:
      "Annual Accelerator access: every module, every builder, faceless video + image + chatbot tracks, and member DMs.",
    link: `${BASE_URL}/pricing`,
    image_link: `${BASE_URL}/pinterest/pin-pro.jpg`,
    price: "1490.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Education > Online Courses",
    product_type: "Course > Subscription > Accelerator Annual",
  },
  {
    id: "ailab_starter_kit_free",
    title: "AI Income Starter Kit (Free)",
    description:
      "Free 14-page guide + prompt pack to start earning with AI. Instant download, no credit card required.",
    link: `${BASE_URL}/#lead-capture`,
    image_link: `${BASE_URL}/pinterest/pin-starter-kit.jpg`,
    price: "0.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Education > Online Courses",
    product_type: "Lead Magnet > Free Guide",
  },
  {
    id: "ailab_prompt_engine_free",
    title: "AI Business Engine — Free Prompt Tool",
    description:
      "Free interactive prompt engine that generates a customized AI business plan in minutes.",
    link: "https://ai-income-systems.netlify.app/prompt-engine",
    image_link: `${BASE_URL}/pinterest/pin-prompt-engine.jpg`,
    price: "0.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Education > Online Courses",
    product_type: "Free Tool > Prompt Engine",
  },
  {
    id: "ailab_newsletter_free",
    title: "AI Income Systems Weekly Newsletter",
    description:
      "Free weekly newsletter: the AI tools, prompts, and workflows actually making money this week.",
    link: `${BASE_URL}/newsletter`,
    image_link: `${BASE_URL}/pinterest/pin-newsletter.jpg`,
    price: "0.00 USD",
    availability: "in stock",
    condition: "new",
    brand: BRAND,
    google_product_category: "Media > Newsletters",
    product_type: "Newsletter > Weekly",
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
