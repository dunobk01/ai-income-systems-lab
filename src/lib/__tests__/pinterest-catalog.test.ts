import { describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => ({ get: undefined as (() => Promise<Response>) | undefined }));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { server: { handlers: { GET: () => Promise<Response> } } }) => {
    route.get = options.server.handlers.GET;
    return options;
  },
}));

import "../../routes/api/public/pinterest/catalog[.]tsv";

describe("Pinterest product categories", () => {
  it.each(["ailab_starter_monthly", "ailab_builder_monthly", "ailab_accelerator_monthly"])(
    "exports the official Google Educational Software category for %s",
    async (id) => {
      if (!route.get) throw new Error("Catalog handler missing");
      const response = await route.get();
      const [header, ...lines] = (await response.text()).split("\n");
      const headers = header.split("\t");
      const products = lines.map((line) => Object.fromEntries(line.split("\t").map((value, i) => [headers[i], value])));
      expect(products.find((product) => product.id === id)?.google_product_category).toBe("317");
    },
  );
});