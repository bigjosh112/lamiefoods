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

export const metadata: Metadata = buildMetadata({
  title: "Shop Chinchin",
  description:
    "Browse Lamie Foods chinchin — Milky Velvet, Coco Velvet and Cinnamon, kettle-fried in small batches and shipped nationwide.",
  path: "/shop",
});

/**
 * The shop.
 *
 * The header block and assurances are Server Components; only the catalogue
 * opts into the client, for its filters and per-card size selection.
 *
 * No ItemList or Product structured data yet. Prices and availability in the
 * catalogue are unconfirmed placeholders, and publishing them as machine-
 * readable offers would misrepresent the business to search engines. Breadcrumbs
 * are safe because they describe navigation, not commerce.
 */
export default function ShopPage() {
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

          <ShopCatalogue />
        </Section>

        <AtelierLab />
        <AssuranceBand />
      </main>

      <SiteFooter />
    </>
  );
}
