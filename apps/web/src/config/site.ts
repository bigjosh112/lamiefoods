import { BRAND } from "@lamiefoods/config";
import { siteUrl } from "./env";

/**
 * Site-level defaults for metadata. Copy here is deliberately factual — the
 * owner supplies final marketing copy, and invented claims would ship straight
 * into search results.
 */
export const SITE = {
  name: BRAND.name,
  displayName: BRAND.displayName,
  tagline: BRAND.tagline,
  url: siteUrl,
  locale: "en_NG",
  /** Placeholder until brand OG artwork is supplied. */
  ogImage: "/og-image.png",
} as const;
