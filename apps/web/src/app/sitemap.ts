import type { MetadataRoute } from "next";
import { ROUTES } from "@lamiefoods/config";
import { absoluteUrl } from "@/lib/seo";
import { listPublishedProductsForPage } from "@/server/db/prerender-reads";

/**
 * Only routes that actually render today. Advertising a page before it exists
 * hands search engines a 404, which erodes trust in the whole sitemap. Add each
 * entry back the moment its route ships:
 */
// Same reasoning as app/shop/page.tsx: a raw Postgres read isn't a Next
// Request-time API, so this needs an explicit revalidation window or it
// would bake today's product list into the sitemap forever.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const products = await listPublishedProductsForPage();

  return [
    { url: absoluteUrl(ROUTES.home), lastModified, priority: 1 },
    { url: absoluteUrl(ROUTES.shop), lastModified, priority: 0.8 },
    { url: absoluteUrl(ROUTES.about), lastModified, priority: 0.6 },
    ...products.map((product) => ({
      url: absoluteUrl(ROUTES.product(product.slug)),
      lastModified,
      priority: 0.7,
    })),
  ];
}
