"use client";

import { CheckIcon, ICONS } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { CHECKOUT } from "@/content/checkout";
import { formatKobo } from "@/lib/money";
import { useCart } from "@/lib/cart/use-cart";

/**
 * Order summary beside the checkout form.
 *
 * Reads the same cart store as every other surface, so what someone pays for is
 * what they put in the bag — there is no second copy of the totals to drift.
 *
 * Payment itself still happens on `/order-success`; this panel only shows the
 * product subtotal (with discounts applied) and an honest delivery note.
 */
export function CheckoutSummary() {
  const { items, count, subtotal, isEmpty } = useCart();

  return (
    <aside className="rounded border border-rule/70 bg-surface-container p-inset-card">
      <div className="flex items-center justify-between gap-gutter-sm">
        <h2 className="text-headline-sm text-cacao">{CHECKOUT.summary.title}</h2>
        {!isEmpty && (
          <span className="rounded-sm bg-secondary-container px-2 py-1 font-label text-label-sm text-on-secondary-fixed uppercase">
            {items.length} {items.length === 1 ? "batch" : "batches"}
          </span>
        )}
      </div>

      {isEmpty ? (
        <p className="mt-gutter-md text-body-sm text-on-surface-variant">
          Your bag is empty. Add a batch from the shop to check out.
        </p>
      ) : (
        <ul className="mt-gutter-md space-y-3">
          {items.map(({ line, product, listUnitPrice, unitPrice, lineTotal }) => {
            const hero =
              product.images.find((image) => image.role === "hero") ?? product.images[0];
            const discounted = unitPrice !== listUnitPrice;
            return (
              <li
                key={`${line.slug}-${line.pack}`}
                className="flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-xs"
              >
                <div className="relative aspect-square w-14 shrink-0 overflow-hidden rounded border border-rule/70 bg-surface-container">
                  <ImageSlot
                    slot={{
                      src: hero?.url ?? null,
                      alt: hero?.alt ?? product.name,
                      note: "Product photography",
                    }}
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-gutter-xs">
                    <p className="text-body-md font-semibold text-cacao">
                      {product.name}
                    </p>
                    <p className="shrink-0 font-numeral text-label-md text-terracotta">
                      {formatKobo(lineTotal)}
                    </p>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">{line.pack}</p>
                  <p className="text-body-sm text-nutmeg">
                    Quantity: {line.quantity} ·{" "}
                    {discounted ? (
                      <>
                        <span className="line-through">{formatKobo(listUnitPrice)}</span>
                        {" "}
                        <span className="text-terracotta">{formatKobo(unitPrice)}</span>
                        {" "}
                        each
                        {product.discountPercent
                          ? ` · ${product.discountPercent}% off`
                          : ""}
                      </>
                    ) : (
                      <>{formatKobo(unitPrice)} each</>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <dl className="mt-gutter-md space-y-3 border-t border-rule/70 pt-gutter-sm">
        <div className="flex items-baseline justify-between">
          <dt className="text-body-sm text-on-surface-variant">
            {CHECKOUT.summary.subtotalLabel}
            <span className="text-nutmeg"> ({count})</span>
          </dt>
          <dd className="font-numeral text-label-md text-cacao">
            {formatKobo(subtotal)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-gutter-sm">
          <dt className="text-body-sm text-on-surface-variant">
            {CHECKOUT.summary.dispatchLabel}
          </dt>
          <dd className="shrink-0 text-right font-label text-label-sm text-nutmeg uppercase">
            {CHECKOUT.summary.dispatchValue}
          </dd>
        </div>
      </dl>

      <div className="mt-gutter-md border-t border-rule/70 pt-gutter-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-headline-sm text-cacao">
            {CHECKOUT.summary.totalLabel}
          </span>
          <span className="font-display text-headline-md text-terracotta">
            {formatKobo(subtotal)}
          </span>
        </div>
        <p className="mt-1 text-right text-body-sm text-nutmeg">
          {CHECKOUT.summary.totalNote}
        </p>
      </div>

      <div className="mt-gutter-md rounded border border-rule/70 bg-surface p-gutter-sm">
        <p className="font-label text-label-sm text-cacao uppercase">
          {CHECKOUT.summary.paymentTitle}
        </p>
        <p className="mt-gutter-xs flex items-start gap-gutter-xs text-body-sm text-on-surface-variant">
          <ICONS.shield className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
          {CHECKOUT.summary.paymentNote}
        </p>
      </div>

      <ul className="mt-gutter-sm flex flex-wrap justify-center gap-gutter-sm">
        {CHECKOUT.summary.badges.map((badge) => (
          <li
            key={badge}
            className="flex items-center gap-gutter-xs text-body-sm text-nutmeg"
          >
            <CheckIcon className="h-3.5 w-3.5 text-terracotta" />
            {badge}
          </li>
        ))}
      </ul>
    </aside>
  );
}
