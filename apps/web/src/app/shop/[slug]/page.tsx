import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND, ROUTES } from "@lamiefoods/config";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductDetails } from "@/components/product/product-details";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { RelatedProducts } from "@/components/product/related-products";
import { JsonLd } from "@/components/seo/json-ld";
import { ICONS } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { PRODUCT_ASSURANCES } from "@/content/shop";
import { applyDiscount, formatKobo } from "@/lib/money";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/structured-data";
import { isDatabaseConfigured } from "@/config/server-env";
import { DiscountBadge } from "@/components/product/price";
import { getProductBySlug, listPublishedProducts } from "@/server/products/repository";
import { CatalogProvider } from "@/lib/products/catalog-context";

/**
 * Every published product prerenders at build time; anything published
 * afterward renders on demand (`dynamicParams` defaults to `true`) and joins
 * the prerendered set on the next `revalidate` window — see `/shop`'s page
 * comment for why ISR fits this catalogue better than `force-dynamic`.
 */
export async function generateStaticParams() {
  if (!isDatabaseConfigured()) return [];
  const products = await listPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isDatabaseConfigured()) return {};
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const hero = product.images.find((image) => image.role === "hero") ?? product.images[0];

  return buildMetadata({
    title: product.name,
    description: product.teaser,
    path: ROUTES.product(product.slug),
    image: hero?.url,
  });
}

/**
 * Product detail page.
 *
 * Real product data from Postgres now (`getProductBySlug`, `listPublishedProducts`
 * for the related-products row) — superseding the static `content/products.ts`
 * catalogue. The "proof"/"provenance" narrative sections from the old design
 * are gone; see `ProductDetails`'s own comment for why.
 *
 * `ProductPurchase` and `RelatedProducts` need `useCart()`/`useCartActions()`
 * for pricing display and adding to the bag — wrapped in `CatalogProvider`
 * with the same product list already fetched for this page, so nothing here
 * needs a second client-side fetch. See `lib/products/catalog-context.tsx`.
 *
 * Still no Product structured data: `packs[].price` is an unconfirmed
 * placeholder (GAP-004), and publishing an Offer would tell search engines
 * something untrue about a real business. Breadcrumbs are safe — they
 * describe navigation, not commerce.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isDatabaseConfigured()) notFound();

  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    listPublishedProducts(),
  ]);
  if (!product) notFound();

  const cheapest = product.packs.reduce(
    (min, pack) => Math.min(min, pack.price.amount),
    Infinity,
  );

  return (
    <CatalogProvider products={allProducts}>
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

          {/*
            Side by side from 768px, not 1024px. On a tablet the single-column
            fallback put a full-width product photograph above the fold and
            pushed the price and pack picker off it entirely — the two things a
            buyer came for.
          */}
          <div className="mt-gutter-lg grid gap-gutter-lg md:grid-cols-12">
            <div className="md:col-span-7">
              <ProductGallery product={product} />
            </div>

            <div className="md:col-span-5">
              {/* Wordmark casing, as in the nav — not tracked-out capitals. The
                  "Master Atelier" badge and the tagline beneath the title are
                  gone. */}
              <p className="font-label text-label-md text-terracotta">
                {BRAND.displayName}
              </p>

              <h1 className="mt-gutter-xs text-headline-lg text-cacao">{product.name}</h1>

              <div className="mt-gutter-md flex flex-wrap items-center justify-between gap-gutter-sm">
                <div>
                  <p className="font-label text-label-sm text-nutmeg">
                    {product.discountPercent ? "Discounted from" : "Price"}
                  </p>
                  {product.discountPercent && Number.isFinite(cheapest) ? (
                    <p className="mt-1 flex flex-wrap items-baseline gap-gutter-xs">
                      <span className="font-numeral text-label-md text-nutmeg line-through">
                        <span className="sr-only">Original price </span>
                        {formatKobo(cheapest)}
                      </span>
                      <span className="font-display text-headline-md text-terracotta">
                        <span className="sr-only">Discounted price </span>
                        {formatKobo(applyDiscount(cheapest, product.discountPercent))}
                      </span>
                      {/* Inline rather than cornered: the price block here is
                          text, with no photograph to pin a badge to. */}
                      <DiscountBadge percent={product.discountPercent} />
                    </p>
                  ) : (
                    <p className="mt-1 font-display text-headline-md text-terracotta">
                      {Number.isFinite(cheapest) ? formatKobo(cheapest) : "—"}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center gap-gutter-xs font-label text-label-sm text-nutmeg">
                  <ICONS.timer className="h-4 w-4" />
                  Fried daily to order
                </span>
              </div>

              {/* The same sentence the shop grid shows, from one field, so the
                  two pages cannot describe the product differently. */}
              <p className="mt-gutter-md text-body-md text-on-surface-variant">
                {product.teaser}
              </p>

              <ProductPurchase product={product} />

              <ul className="mt-gutter-md space-y-3">
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

        <ProductDetails product={product} />
        <RelatedProducts current={product} products={allProducts} />
      </main>

      <SiteFooter />
    </CatalogProvider>
  );
}
