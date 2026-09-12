import type { Metadata } from "next";
import { ROUTES } from "@lamiefoods/config";
import type { Order } from "@lamiefoods/types";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { OrderConfirmation } from "@/components/order/order-confirmation";
import { PaymentActions } from "@/components/order/payment-actions";
import { ProductSuggestions } from "@/components/product/product-suggestions";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon, ICONS } from "@/components/ui/icons";
import { Eyebrow, Section } from "@/components/ui/section";
import { ORDER_STATUS_COPY, ORDER_SUCCESS } from "@/content/order-success";
import { buildSampleOrder } from "@/lib/orders/sample-order";
import { buildMetadata } from "@/lib/seo";
import { isDatabaseConfigured } from "@/config/server-env";
import { findOrderByToken } from "@/server/orders/repository";
import { listPublishedProducts } from "@/server/products/repository";
import { getSettings } from "@/server/settings/repository";
import { CatalogProvider } from "@/lib/products/catalog-context";

export const metadata: Metadata = buildMetadata({
  title: "Order confirmed",
  description: "Your Lamie Foods order confirmation.",
  path: "/order-success",
  // Personal to one customer, and robots.txt disallows it too.
  noIndex: true,
});

/**
 * Order confirmation.
 *
 * Three states, in priority order:
 *   1. `?token=…` resolves to a real order → the real confirmation, fetched
 *      server-side by calling `findOrderByToken` directly (an in-process call,
 *      not a self-fetch back into this app's own API — see lib/api/README.md).
 *   2. `?preview=1` → a clearly-labelled sample, purely so the layout stays
 *      reviewable without a database. Fabricating an unlabelled receipt would
 *      be the most damaging thing to fake on the whole site.
 *   3. Neither → an honest "no order to show" card. This also covers a token
 *      that matches nothing and a token given while the database is unset.
 *
 * `products` (the published catalogue) is fetched once here and threaded
 * through `CatalogProvider` (for `PaymentActions`'/`ProductSuggestions`'
 * `useCart()`) and as a plain prop into `OrderConfirmation` (for its
 * per-item photo lookup) — one fetch, three consumers.
 */
export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; token?: string }>;
}) {
  const { preview, token } = await searchParams;
  const isPreview = preview === "1";
  const dbConfigured = isDatabaseConfigured();

  let order: Order | null = null;
  let resolvedToken = "";
  let lookupFailed = false;
  if (token && !isPreview) {
    if (dbConfigured) {
      order = await findOrderByToken(token);
      resolvedToken = token;
    } else {
      lookupFailed = true;
    }
  }

  const showRealOrder = order !== null;
  const showSample = !showRealOrder && isPreview;
  const noOrderCopy = lookupFailed ? ORDER_SUCCESS.notConfigured : ORDER_SUCCESS.none;

  const [sampleOrder, products, paymentSettings] = await Promise.all([
    showSample && dbConfigured ? buildSampleOrder() : Promise.resolve(null),
    showRealOrder || showSample ? (dbConfigured ? listPublishedProducts() : []) : [],
    showRealOrder ? getSettings() : Promise.resolve(null),
  ]);

  return (
    <CatalogProvider products={products}>
      <SiteHeader />

      <main id="main">
        <Section>
          {showRealOrder && order ? (
            <>
              <div className="text-center">
                <span
                  aria-hidden="true"
                  className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded bg-primary-container text-linen"
                >
                  <CheckIcon className="h-7 w-7" />
                </span>
                <Eyebrow className="mt-gutter-sm">{ORDER_SUCCESS.real.eyebrow}</Eyebrow>
                <h1 className="mt-gutter-xs text-headline-lg text-cacao">
                  {ORDER_SUCCESS.real.title}
                </h1>
                <p className="mx-auto mt-gutter-sm max-w-xl text-body-md text-on-surface-variant">
                  {order.paymentStatus === "paid"
                    ? ORDER_SUCCESS.real.paidBody
                    : ORDER_SUCCESS.real.unpaidBody}
                </p>

                <p className="mx-auto mt-gutter-md inline-flex items-center gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
                  <ICONS.timer className="h-4 w-4 text-terracotta" />
                  <span className="text-left">
                    <span className="block font-label text-label-sm text-nutmeg uppercase">
                      {ORDER_SUCCESS.real.statusLabel}
                    </span>
                    <span className="block font-label text-label-md text-cacao">
                      {ORDER_STATUS_COPY[order.status]}
                    </span>
                  </span>
                </p>
              </div>

              {order.paymentStatus !== "paid" && paymentSettings && (
                <div className="mx-auto mt-gutter-lg max-w-xl">
                  <PaymentActions
                    token={resolvedToken}
                    reference={order.reference}
                    amountKobo={order.total?.amount ?? order.subtotal.amount}
                    initialMethod={order.paymentMethod}
                    whatsappNumber={paymentSettings.whatsappNumber}
                    bankTransfer={paymentSettings.bankTransfer}
                  />
                </div>
              )}

              <div className="mt-gutter-lg">
                <OrderConfirmation
                  order={order}
                  products={products}
                  receiptToken={resolvedToken}
                />
              </div>
            </>
          ) : showSample && sampleOrder ? (
            <>
              {/* Loud, permanent and not dismissible. */}
              <div
                role="note"
                className="mb-gutter-lg flex items-start gap-gutter-sm rounded border border-error/40 bg-error-container p-gutter-sm text-on-error-container"
              >
                <ICONS.shield className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-body-sm">
                  <strong className="font-semibold">
                    {ORDER_SUCCESS.preview.title}.
                  </strong>{" "}
                  {ORDER_SUCCESS.preview.body}
                </p>
              </div>

              <div className="text-center">
                <span
                  aria-hidden="true"
                  className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded bg-primary-container text-linen"
                >
                  <CheckIcon className="h-7 w-7" />
                </span>
                <Eyebrow className="mt-gutter-sm">{ORDER_SUCCESS.eyebrow}</Eyebrow>
                <h1 className="mt-gutter-xs text-headline-lg text-cacao">
                  {ORDER_SUCCESS.title}
                </h1>
                <p className="mx-auto mt-gutter-sm max-w-xl text-body-md text-on-surface-variant">
                  {ORDER_SUCCESS.body}
                </p>

                <p className="mx-auto mt-gutter-md inline-flex items-center gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
                  <ICONS.timer className="h-4 w-4 text-terracotta" />
                  <span className="text-left">
                    <span className="block font-label text-label-sm text-nutmeg uppercase">
                      {ORDER_SUCCESS.statusLabel}
                    </span>
                    <span className="block font-label text-label-md text-cacao">
                      {ORDER_SUCCESS.statusValue}
                    </span>
                  </span>
                </p>
              </div>

              <div className="mt-gutter-lg">
                <OrderConfirmation order={sampleOrder} products={products} />
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded border border-rule/70 bg-surface-container-low p-gutter-xl text-center">
              <ICONS.seal className="mx-auto h-8 w-8 text-terracotta" />
              <h1 className="mt-gutter-sm text-headline-md text-cacao">
                {noOrderCopy.title}
              </h1>
              <p className="mt-gutter-xs text-body-md text-on-surface-variant">
                {noOrderCopy.body}
              </p>
              <ButtonLink href={ROUTES.shop} className="mt-gutter-md">
                {noOrderCopy.cta}
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            </div>
          )}
        </Section>

        {(showRealOrder || showSample) && (
          <ProductSuggestions
            products={products}
            className="bg-surface-container-low"
            eyebrow={ORDER_SUCCESS.suggestions.eyebrow}
            title={ORDER_SUCCESS.suggestions.title}
            linkLabel={ORDER_SUCCESS.suggestions.link}
            ctaLabel={ORDER_SUCCESS.suggestions.cta}
          />
        )}
      </main>

      <SiteFooter />
    </CatalogProvider>
  );
}
