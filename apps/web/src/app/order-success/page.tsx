import type { Metadata } from "next";
import { ROUTES } from "@lamiefoods/config";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { OrderConfirmation } from "@/components/order/order-confirmation";
import { ProductSuggestions } from "@/components/product/product-suggestions";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon, ICONS } from "@/components/ui/icons";
import { Eyebrow, Section } from "@/components/ui/section";
import { ORDER_SUCCESS } from "@/content/order-success";
import { SAMPLE_ORDER } from "@/lib/orders/sample-order";
import { buildMetadata } from "@/lib/seo";

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
 * There is no real order to show. Checkout does not submit, no ordering API
 * exists, and Paystack is not integrated — so by default this page says exactly
 * that. Fabricating a receipt would be the most damaging thing to fake on the
 * whole site: a page reading "Paid via Paystack · Total ₦16,100" is one a
 * customer would reasonably believe.
 *
 * `?preview=1` renders a clearly-labelled sample so the layout stays reviewable.
 * When the backend lands: read the reference from the query, fetch the order,
 * and pass it to the same `OrderConfirmation` — it already takes an `Order` from
 * `@lamiefoods/types`, so nothing here needs reshaping.
 */
export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  return (
    <>
      <SiteHeader />

      <main id="main">
        <Section>
          {isPreview ? (
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
                <OrderConfirmation order={SAMPLE_ORDER} />
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded border border-rule/70 bg-surface-container-low p-gutter-xl text-center">
              <ICONS.seal className="mx-auto h-8 w-8 text-terracotta" />
              <h1 className="mt-gutter-sm text-headline-md text-cacao">
                {ORDER_SUCCESS.none.title}
              </h1>
              <p className="mt-gutter-xs text-body-md text-on-surface-variant">
                {ORDER_SUCCESS.none.body}
              </p>
              <ButtonLink href={ROUTES.shop} className="mt-gutter-md">
                {ORDER_SUCCESS.none.cta}
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            </div>
          )}
        </Section>

        {isPreview && (
          <ProductSuggestions
            className="bg-surface-container-low"
            eyebrow={ORDER_SUCCESS.suggestions.eyebrow}
            title={ORDER_SUCCESS.suggestions.title}
            linkLabel={ORDER_SUCCESS.suggestions.link}
            ctaLabel={ORDER_SUCCESS.suggestions.cta}
          />
        )}
      </main>

      <SiteFooter />
    </>
  );
}
