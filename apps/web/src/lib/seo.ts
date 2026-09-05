import type { Metadata } from "next";
import { SITE } from "@/config/site";

/** Build an absolute URL from a site-relative path, for canonicals and OG tags. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE.url).toString();
}

interface PageMetadataInput {
  title: string;
  description: string;
  /** Site-relative path, used for the canonical URL. */
  path: string;
  /** Site-relative or absolute image URL. Falls back to the brand OG image. */
  image?: string;
  /** Set for pages that should stay out of search results, e.g. /admin. */
  noIndex?: boolean;
}

/**
 * Per-page metadata with canonical, Open Graph and Twitter tags kept in sync.
 * Titles pass through the layout's template, so pass the bare page title.
 */
export function buildMetadata({
  title,
  description,
  path,
  image = SITE.ogImage,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      title,
      description,
      url,
      images: [{ url: imageUrl, alt: `${SITE.displayName} — ${title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
