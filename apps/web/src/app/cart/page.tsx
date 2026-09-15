import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductSuggestions } from "@/components/product/product-suggestions";
import { CartView } from "@/components/cart/cart-view";
import { Eyebrow, Section } from "@/components/ui/section";
import { CART } from "@/content/cart";
import { buildMetadata } from "@/lib/seo";
import { listPublishedProductsForPage } from "@/server/db/prerender-reads";
import { CatalogProvider } from "@/lib/products/catalog-context";

// `listPublishedProducts()` is a raw Postgres query, not a Next Request-time
// API — unlike `cookies()`, Next does NOT auto-detect it and mark this route
// dynamic. Left unset, this page would bake stale prices at build time
// forever. `revalidate` re-reads the DB at most once a minute; ANY staleness
// here is purely cosmetic — the actual charge is always the server re-price
// at order-creation time (`server/orders/pricing.ts`), never what this page
// happened to render.
export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "Your Shopping Bag",
  description: "Review the batches reserved in your Lamie Foods bag.",
  path: "/cart",
  // A personal bag has nothing to offer search, and robots.txt already
  // disallows the checkout funnel.
  noIndex: true,
});

/**
 * The shopping bag.
 *
 * The bag itself is client-rendered because it lives in the browser — there is
 * no server-side cart to prerender, and `useSyncExternalStore` keeps hydration
 * clean. The page shell around it stays a Server Component, which is also
 * what fetches the published catalogue and wraps the client tree in
 * `CatalogProvider` — `CartView` needs it to resolve line prices now that
 * products live in Postgres. See `lib/products/catalog-context.tsx`.
 */
export default async function CartPage() {
  const products = await listPublishedProductsForPage();

  return (
    <CatalogProvider products={products}>
      <AnnouncementBar />
      <SiteHeader />

      <main id="main">
        <Section className="pb-0">
          <Eyebrow withRule>{CART.eyebrow}</Eyebrow>
          <h1 className="mt-gutter-sm text-headline-lg text-cacao">{CART.title}</h1>
          <p className="mt-gutter-sm max-w-2xl text-body-md text-on-surface-variant">
            {CART.body}
          </p>

          <div className="mt-gutter-lg">
            <CartView />
          </div>
        </Section>

        <ProductSuggestions
          products={products}
          className="bg-surface-container-low"
          excludeInBag
          eyebrow={CART.recommendations.eyebrow}
          title={CART.recommendations.title}
          linkLabel={CART.recommendations.link}
        />
      </main>

      <SiteFooter />
    </CatalogProvider>
  );
}
