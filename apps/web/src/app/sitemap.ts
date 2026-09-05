import type { MetadataRoute } from "next";
import { ROUTES } from "@lamiefoods/config";
import { absoluteUrl } from "@/lib/seo";

/**
 * Static public routes only. Product URLs join this list once the catalogue is
 * served by the API — listing pages that do not exist yet would hand search
 * engines a page of 404s.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: absoluteUrl(ROUTES.home), lastModified, priority: 1 },
    { url: absoluteUrl(ROUTES.shop), lastModified, priority: 0.8 },
    { url: absoluteUrl(ROUTES.about), lastModified, priority: 0.5 },
  ];
}
