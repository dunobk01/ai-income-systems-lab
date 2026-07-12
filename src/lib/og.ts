import ogBrand from "@/assets/og-brand.jpg.asset.json";

export const SITE_URL = "https://ai-income-systems.com";

/**
 * Canonical Open Graph image for the whole site.
 * 1200x630 JPEG served from the CDN — the exact size Google, Facebook,
 * LinkedIn, X/Twitter (summary_large_image), Pinterest, and Slack expect.
 */
export const DEFAULT_OG_IMAGE = `${SITE_URL}${ogBrand.url}`;
export const OG_IMAGE_WIDTH = "1200";
export const OG_IMAGE_HEIGHT = "630";
export const OG_IMAGE_TYPE = "image/jpeg";
export const OG_IMAGE_ALT = "AI Income Systems Lab";

/**
 * Meta tag array for a page's social preview image.
 * Pass a custom absolute URL (e.g. a post's cover image) to override the default.
 */
export function ogImageMeta(url: string = DEFAULT_OG_IMAGE, alt: string = OG_IMAGE_ALT) {
  return [
    { property: "og:image", content: url },
    { property: "og:image:secure_url", content: url },
    { property: "og:image:type", content: OG_IMAGE_TYPE },
    { property: "og:image:width", content: OG_IMAGE_WIDTH },
    { property: "og:image:height", content: OG_IMAGE_HEIGHT },
    { property: "og:image:alt", content: alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: url },
    { name: "twitter:image:alt", content: alt },
  ];
}
