import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND, ROUTES } from "@lamiefoods/config";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { Provenance } from "@/components/product/provenance";
import { RelatedProducts } from "@/components/product/related-products";
import { JsonLd } from "@/components/seo/json-ld";
import { ArrowRightIcon, ICONS } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { PRODUCT_ASSURANCES } from "@/content/shop";
import { lowestPrice, PRODUCTS } from "@/content/products";
import { formatKobo } from "@/lib/money";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/structured-data";

/** Every product is known at build time, so all pages prerender. */
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

const findProduct = (slug: string) => PRODUCTS.find((product) => product.slug === slug);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return {};

  return buildMetadata({
    title: product.name,
    description: product.detail.description,
    path: ROUTES.product(product.slug),
    image: product.image.src ?? undefined,
  });
}

/**
 * Product detail page.
 *
 * Static for all three products. Gallery and purchase controls are the only
 * client components; everything else renders on the server.
 *
 * Still no Product structured data: `price` is an unconfirmed placeholder and
 * `availability` is unknown, so publishing an Offer would tell search engines
 * something untrue about a real business. Breadcrumbs are safe — they describe
 * navigation, not commerce. Add the Product schema with real pricing.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Shop", path: ROUTES.shop },
          { name: product.name, path: ROUTES.product(product.slug) },
        ])}
      />
      <AnnouncementBar />
      <SiteHeader />

      <main id="main">
        <Section className="pb-0">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-gutter-xs text-body-sm text-nutmeg">
              {[
                { name: "Home", href: ROUTES.home },
                { name: "Shop", href: ROUTES.shop },
              ].map((crumb) => (
                <li key={crumb.href} className="flex items-center gap-gutter-xs">
                  <Link href={crumb.href} className="hover:text-terracotta">
                    {crumb.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </li>
              ))}
              <li aria-current="page" className="text-cacao">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="mt-gutter-lg grid gap-gutter-lg lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ProductGallery product={product} />

              <div className="mt-gutter-md flex flex-wrap items-center justify-between gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-inset-card">
                <div className="flex items-start gap-gutter-sm">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded bg-secondary-container text-primary">
                    <ICONS.seal className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-headline-sm text-cacao">
                      {product.detail.proof.title}
                    </h2>
                    <p className="mt-1 max-w-sm text-body-sm text-on-surface-variant">
                      {product.detail.proof.body}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-gutter-xs font-label text-label-sm text-terracotta uppercase">
                  {product.detail.proof.cta}
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="flex flex-wrap items-center justify-between gap-gutter-sm">
                <p className="font-label text-label-caps text-terracotta uppercase">
                  {BRAND.displayName}
                </p>
                <span className="rounded-sm border border-rule/70 bg-surface-container-low px-2 py-1 font-label text-label-sm text-nutmeg">
                  {product.detail.atelier}
                </span>
              </div>

              <h1 className="mt-gutter-xs text-headline-lg text-cacao">{product.name}</h1>
              <p className="font-display text-body-lg text-terracotta italic">
                {product.detail.tagline}
              </p>

              <div className="mt-gutter-md flex flex-wrap items-center justify-between gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
                <div>
                  <p className="font-label text-label-sm text-nutmeg uppercase">
                    Fresh atelier pricing
                  </p>
                  <p className="mt-1 font-display text-headline-md text-terracotta">
                    {formatKobo(lowestPrice(product))}
                  </p>
                </div>
                <span className="inline-flex items-center gap-gutter-xs font-label text-label-sm text-nutmeg">
                  <ICONS.timer className="h-4 w-4" />
                  Fried daily to order
                </span>
              </div>

              <p className="mt-gutter-md text-body-md text-on-surface-variant">
                {product.detail.description}
              </p>

              <ProductPurchase product={product} />

              <ul className="mt-gutter-md space-y-3 rounded border border-rule/70 bg-surface-container-low p-inset-card">
                {PRODUCT_ASSURANCES.map((item) => {
                  const Icon = ICONS[item.icon];
                  return (
                    <li key={item.label} className="flex items-start gap-gutter-sm">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                      <span className="text-body-sm text-on-surface-variant">
                        {item.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Section>

        <Provenance product={product} />
        <RelatedProducts current={product} />
      </main>

      <SiteFooter />
    </>
  );
}
