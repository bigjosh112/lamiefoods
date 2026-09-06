import type { MetadataRoute } from "next";
import { ROUTES } from "@lamiefoods/config";
import { absoluteUrl } from "@/lib/seo";

/**
 * Only routes that actually render today. Advertising a page before it exists
 * hands search engines a 404, which erodes trust in the whole sitemap. Add each
 * entry back the moment its route ships:
 *   - ROUTES.about (priority 0.5) — when the about page is built
 *   - product URLs — once the catalogue is served by the API
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: absoluteUrl(ROUTES.home), lastModified, priority: 1 },
    { url: absoluteUrl(ROUTES.shop), lastModified, priority: 0.8 },
  ];
}
