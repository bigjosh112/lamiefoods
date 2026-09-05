import { BRAND } from "@lamiefoods/config";
import { SITE } from "@/config/site";
import { absoluteUrl } from "./seo";

/**
 * JSON-LD builders. Every field here is a confirmed brand fact — no invented
 * addresses, phone numbers, ratings or certifications, which would be both a
 * search-guidelines violation and a lie to customers.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.displayName,
    slogan: BRAND.tagline,
    url: SITE.url,
    sameAs: [BRAND.instagramUrl],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.displayName,
    url: SITE.url,
  };
}

export interface BreadcrumbEntry {
  name: string;
  /** Site-relative path. */
  path: string;
}

export function breadcrumbSchema(entries: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}
