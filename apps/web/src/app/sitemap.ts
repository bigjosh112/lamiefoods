import type { MetadataRoute } from "next";
import { ROUTES } from "@lamiefoods/config";
import { PRODUCTS } from "@/content/products";
import { absoluteUrl } from "@/lib/seo";

/**
 * Only routes that actually render today. Advertising a page before it exists
 * hands search engines a 404, which erodes trust in the whole sitemap. Add each
 * entry back the moment its route ships:
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: absoluteUrl(ROUTES.home), lastModified, priority: 1 },
    { url: absoluteUrl(ROUTES.shop), lastModified, priority: 0.8 },
    { url: absoluteUrl(ROUTES.about), lastModified, priority: 0.6 },
    ...PRODUCTS.map((product) => ({
      url: absoluteUrl(ROUTES.product(product.slug)),
      lastModified,
      priority: 0.7,
    })),
  ];
}
