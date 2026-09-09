import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { ICONS } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { Eyebrow, Section } from "@/components/ui/section";
import { CHECKOUT } from "@/content/checkout";
import { buildMetadata } from "@/lib/seo";
import { isDatabaseConfigured } from "@/config/server-env";
import { listPublishedProducts } from "@/server/products/repository";
import { CatalogProvider } from "@/lib/products/catalog-context";

// See the identical comment in app/cart/page.tsx: a raw Postgres read isn't a
// Next Request-time API, so this must opt into revalidation explicitly or it
// would bake stale prices at build time forever. Cosmetic staleness only —
// the actual charge is always the server re-price at order creation.
export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "Checkout",
  description: "Complete your Lamie Foods order.",
  path: "/checkout",
  // A checkout has nothing to offer search, and robots.txt disallows it too.
  noIndex: true,
});

/**
 * Guest checkout.
 *
 * Form validation, the order summary and placing the order are all real —
 * see `checkout-form.tsx` and `docs/ai-memory/api-integration.md`. Payment
 * itself happens on `/order-success`, not here (see that page's design
 * decision) — this page's only job is collecting details and creating the
 * order record.
 */
export default async function CheckoutPage() {
  const products = isDatabaseConfigured() ? await listPublishedProducts() : [];
  const guaranteeImage =
    products[0]?.images.find((image) => image.role === "hero") ?? products[0]?.images[0];

  return (
    <CatalogProvider products={products}>
      <SiteHeader />

      <main id="main">
        <Section className="pb-0">
          <div className="flex flex-wrap items-start justify-between gap-gutter-md">
            <div>
              <Eyebrow withRule>
                {CHECKOUT.eyebrow} · {CHECKOUT.eyebrowNote}
              </Eyebrow>
              <h1 className="mt-gutter-sm text-headline-lg text-cacao">
                {CHECKOUT.title}
              </h1>
            </div>
            <ul className="flex flex-wrap gap-gutter-sm">
              {CHECKOUT.trust.map((item) => {
                const Icon = ICONS[item.icon];
                return (
                  <li
                    key={item.label}
                    className="flex items-center gap-gutter-xs font-label text-label-sm text-nutmeg"
                  >
                    <Icon className="h-4 w-4 text-terracotta" />
                    {item.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-gutter-lg grid gap-gutter-lg lg:grid-cols-12">
            <div className="lg:col-span-7">
              <CheckoutForm />
            </div>
            <div className="lg:col-span-5">
              <CheckoutSummary />
            </div>
          </div>

          <div className="mt-gutter-md flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface-container p-gutter-sm">
            <ICONS.truck className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
            <p className="text-body-sm text-on-surface-variant">
              <span className="font-label text-label-sm text-cacao uppercase">
                {CHECKOUT.deliveryCostNotice.title}:
              </span>{" "}
              {CHECKOUT.deliveryCostNotice.body}
            </p>
          </div>

          <div className="mt-gutter-md flex flex-wrap items-center gap-gutter-md rounded border border-rule/70 bg-surface-container-low p-inset-card">
            {guaranteeImage && (
              <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded border border-rule/70">
                <ImageSlot
                  slot={{
                    src: guaranteeImage.url,
                    alt: guaranteeImage.alt,
                    note: "Product photography",
                  }}
                  sizes="80px"
                />
              </div>
            )}
            <div className="min-w-64 flex-1">
              <p className="font-label text-label-caps text-terracotta uppercase">
                {CHECKOUT.guarantee.eyebrow}
              </p>
              <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
                {CHECKOUT.guarantee.body}
              </p>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </CatalogProvider>
  );
}
