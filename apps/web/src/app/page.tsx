import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Crunch } from "@/components/landing/crunch";
import { FinalCta } from "@/components/landing/final-cta";
import { Flavours } from "@/components/landing/flavours";
import { Hero } from "@/components/landing/hero";
import { Horizon } from "@/components/landing/horizon";
import { Manifesto } from "@/components/landing/manifesto";
import { Pillars } from "@/components/landing/pillars";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/structured-data";
import { isDatabaseConfigured } from "@/config/server-env";
import { listPublishedProducts } from "@/server/products/repository";

/*
 * Copy here stays natural and descriptive. The category terms that matter for
 * search — Nigerian chinchin, premium snacks — appear because they genuinely
 * describe the product, not because they were stuffed in.
 */
export const metadata: Metadata = buildMetadata({
  title: "Premium Nigerian Chinchin",
  description:
    "Lamie Foods makes small-batch Nigerian chinchin, kettle-fried fresh. Crafted for good taste.",
  path: "/",
});

// Same reasoning as app/shop/page.tsx: a raw Postgres read isn't a Next
// Request-time API, so this must opt into revalidation explicitly.
export const revalidate = 60;

/**
 * The landing page.
 *
 * Every section is a Server Component. Only the header (mobile menu), the hero
 * sequence and the scroll-reveal wrapper opt into the client, which keeps the
 * page's JavaScript to the parts that genuinely need interaction.
 *
 * `Flavours` shows published products with `featureOnHomepage` set (an admin
 * toggle — `lib/admin/product-schema.ts`), not the whole catalogue.
 *
 * No Product structured data yet: GAP-004 has prices as owner-unverified
 * placeholders, and publishing them as machine-readable offers would
 * misrepresent the business to search engines. It lands with real pricing.
 */
export default async function HomePage() {
  const products = isDatabaseConfigured() ? await listPublishedProducts() : [];
  const featured = products.filter((product) => product.featureOnHomepage);

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }])} />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Manifesto />
        <Pillars />
        <Crunch />
        <Flavours products={featured} />
        <Horizon />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
