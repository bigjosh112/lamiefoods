"use client";

import { useCart, useCartActions } from "@/lib/cart/use-cart";

/**
 * Shown after catalogue prune drops deleted/unpublished bag lines so the
 * customer understands why the badge/summary changed — not a stock warning.
 */
export function CartUnavailableNotice() {
  const { removedUnavailableCount } = useCart();
  const { dismissUnavailableNotice } = useCartActions();

  if (removedUnavailableCount <= 0) return null;

  return (
    <div
      role="status"
      className="mb-gutter-sm flex flex-wrap items-start justify-between gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
    >
      <p className="text-body-sm text-on-surface-variant">
        {removedUnavailableCount === 1
          ? "One item was removed from your bag because it is no longer in the shop."
          : `${removedUnavailableCount} items were removed from your bag because they are no longer in the shop.`}
      </p>
      <button
        type="button"
        onClick={dismissUnavailableNotice}
        className="shrink-0 font-label text-label-sm text-terracotta uppercase underline-offset-4 hover:underline"
      >
        Dismiss
      </button>
    </div>
  );
}
