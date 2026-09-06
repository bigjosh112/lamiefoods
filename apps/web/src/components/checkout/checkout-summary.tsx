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
 * The gateway panel deliberately carries no "LIVE" badge: payments are not
 * connected, and badging a dead gateway as live would be a false claim about
 * the business.
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
          {items.map(({ line, product, unitPrice, lineTotal }) => (
            <li
              key={`${line.slug}-${line.pack}`}
              className="flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-xs"
            >
              <div className="relative aspect-square w-14 shrink-0 overflow-hidden rounded border border-rule/70 bg-surface-container">
                <ImageSlot slot={product.image} sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-gutter-xs">
                  <p className="text-body-md font-semibold text-cacao">{product.name}</p>
                  <p className="shrink-0 font-label text-label-md text-terracotta">
                    {formatKobo(lineTotal)}
                  </p>
                </div>
                <p className="text-body-sm text-on-surface-variant">{line.pack}</p>
                <p className="text-body-sm text-nutmeg">
                  Quantity: {line.quantity} · {formatKobo(unitPrice)} each
                </p>
                <p className="mt-1 font-label text-label-sm text-tertiary uppercase">
                  {product.crunch.label}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-gutter-md space-y-3 border-t border-rule/70 pt-gutter-sm">
        <div className="flex items-baseline justify-between">
          <dt className="text-body-sm text-on-surface-variant">
            {CHECKOUT.summary.subtotalLabel}
            <span className="text-nutmeg"> ({count})</span>
          </dt>
          <dd className="font-label text-label-md text-cacao">{formatKobo(subtotal)}</dd>
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
        <ul className="mt-gutter-xs flex flex-wrap gap-gutter-xs">
          {CHECKOUT.summary.methods.map((method) => (
            <li
              key={method}
              className="rounded-sm border border-rule/70 bg-surface-container-low px-2 py-1 font-label text-label-sm text-cacao"
            >
              {method}
            </li>
          ))}
        </ul>
        <p className="mt-gutter-sm flex items-center gap-gutter-xs font-label text-label-sm text-nutmeg">
          <ICONS.shield className="h-4 w-4 text-terracotta" />
          {CHECKOUT.summary.gateway}
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
