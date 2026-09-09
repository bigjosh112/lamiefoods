import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { AssuranceBand, AtelierLab } from "@/components/shop/atelier-lab";
import { ShopCatalogue } from "@/components/shop/shop-catalogue";
import { Eyebrow, Section } from "@/components/ui/section";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/structured-data";
import { SHOP } from "@/content/shop";
import { isDatabaseConfigured } from "@/config/server-env";
import { listPublishedProducts } from "@/server/products/repository";

export const metadata: Metadata = buildMetadata({
  title: "Shop Chinchin",
  description:
    "Browse Lamie Foods chinchin, kettle-fried in small batches and shipped nationwide.",
  path: "/shop",
});

/**
 * The shop — real products from Postgres now, not the static `content/
 * products.ts` catalogue.
 *
 * A published catalogue this small changes rarely enough that ISR fits
 * better than `force-dynamic`: `revalidate` re-fetches at most once a minute,
 * so a newly-published product appears within a minute of saving rather than
 * only on the next deploy, without paying a full server round trip on every
 * single request the way the security-critical admin pages must.
 *
 * The header block and assurances are Server Components; only the catalogue
 * opts into the client, for its filters and per-card size selection.
 *
 * No ItemList or Product structured data yet — see GAP-004 for why prices are
 * still owner-unverified, which is the actual blocker for machine-readable
 * Offers, not the data source. Breadcrumbs are safe because they describe
 * navigation, not commerce.
 */
export const revalidate = 60;

export default async function ShopPage() {
  const products = isDatabaseConfigured() ? await listPublishedProducts() : [];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
        ])}
      />
      <SiteHeader />

      <main id="main">
        <Section className="pb-0">
          <div className="max-w-xl">
            <Eyebrow className="text-label-sm normal-case">{SHOP.eyebrow}</Eyebrow>
            <h1 className="mt-gutter-sm text-headline-lg text-cacao">{SHOP.title}</h1>
            <p className="mt-gutter-sm text-body-md text-on-surface-variant">
              {SHOP.body}
            </p>
          </div>

          <ShopCatalogue products={products} />
        </Section>

        <AtelierLab />
        <AssuranceBand />
      </main>

      <SiteFooter />
    </>
  );
}
