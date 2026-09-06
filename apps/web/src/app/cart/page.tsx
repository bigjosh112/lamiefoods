import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartRecommendations } from "@/components/cart/cart-recommendations";
import { CartView } from "@/components/cart/cart-view";
import { Eyebrow, Section } from "@/components/ui/section";
import { CART } from "@/content/cart";
import { buildMetadata } from "@/lib/seo";

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
 * clean. The page shell around it stays a Server Component.
 */
export default function CartPage() {
  return (
    <>
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

        <CartRecommendations />
      </main>

      <SiteFooter />
    </>
  );
}
