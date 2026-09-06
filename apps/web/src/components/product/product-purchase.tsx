"use client";

import { useState } from "react";
import { cn } from "@lamiefoods/ui";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, BagIcon, CheckIcon } from "@/components/ui/icons";
import type { Product } from "@/content/products";

const MAX_QUANTITY = 20;

/**
 * Packaging choice, quantity, and the buy actions.
 *
 * Selection and quantity are genuine client state — they are UI concerns that
 * work perfectly well before a cart exists, so they are live.
 *
 * The two actions are disabled: there is no cart and no checkout, and a button
 * that silently does nothing is worse than one that is honestly unavailable.
 * One note below explains it rather than each control repeating itself.
 */
export function ProductPurchase({ product }: { product: Product }) {
  const [pack, setPack] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const selected = product.detail.packaging[pack];

  return (
    <div>
      <div className="mt-gutter-md flex items-baseline justify-between gap-gutter-sm">
        <p className="font-label text-label-caps text-nutmeg uppercase">
          Select measure &amp; packaging
        </p>
        <p className="shrink-0 font-label text-label-sm text-terracotta">
          {selected?.name}
        </p>
      </div>

      <div className="mt-gutter-xs grid gap-gutter-xs sm:grid-cols-2" role="radiogroup">
        {product.detail.packaging.map((option, index) => {
          const isSelected = index === pack;
          return (
            <button
              key={option.name}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setPack(index)}
              className={cn(
                "rounded border p-gutter-sm text-left transition-colors",
                isSelected
                  ? "border-terracotta bg-secondary-container/40"
                  : "border-rule bg-surface hover:border-cacao",
              )}
            >
              <span className="flex items-start justify-between">
                <span className="font-label text-label-md text-cacao">{option.name}</span>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-terracotta text-linen"
                  >
                    <CheckIcon className="h-3 w-3" />
                  </span>
                )}
              </span>
              <span className="mt-1 block text-body-sm text-on-surface-variant">
                {option.note}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-gutter-md flex items-center gap-gutter-sm">
        <span id="qty-label" className="font-label text-label-caps text-nutmeg uppercase">
          Quantity
        </span>
        <div className="flex items-center gap-gutter-xs rounded border border-rule">
          <QuantityButton
            label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((n) => Math.max(1, n - 1))}
          >
            &minus;
          </QuantityButton>
          {/* Live region: the count changes without moving focus, so it must be
              announced rather than silently updated. */}
          <span
            aria-live="polite"
            aria-labelledby="qty-label"
            className="w-8 text-center font-label text-label-md text-cacao"
          >
            {quantity}
          </span>
          <QuantityButton
            label="Increase quantity"
            disabled={quantity >= MAX_QUANTITY}
            onClick={() => setQuantity((n) => Math.min(MAX_QUANTITY, n + 1))}
          >
            +
          </QuantityButton>
        </div>
      </div>

      <div className="mt-gutter-md grid gap-gutter-xs sm:grid-cols-2">
        <Button
          disabled
          aria-describedby="purchase-note"
          aria-label={`Add ${quantity} ${selected?.name} of ${product.name} to bag`}
        >
          <BagIcon className="h-4 w-4" />
          Add to bag
        </Button>
        <Button
          disabled
          aria-describedby="purchase-note"
          className="bg-cacao hover:bg-primary-container"
        >
          Instant checkout
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>

      <p id="purchase-note" className="mt-gutter-xs text-body-sm text-nutmeg">
        Ordering opens when our checkout goes live.
      </p>
    </div>
  );
}

function QuantityButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 w-11 items-center justify-center text-cacao transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
