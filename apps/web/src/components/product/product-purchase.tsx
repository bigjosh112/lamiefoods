"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import type { Product } from "@lamiefoods/types";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, BagIcon, CheckIcon } from "@/components/ui/icons";
import { applyDiscount, formatKobo } from "@/lib/money";
import { useCartActions } from "@/lib/cart/use-cart";

const MAX_QUANTITY = 20;

/**
 * Packaging choice, quantity, and the buy actions.
 *
 * Selection and quantity are genuine client state — they are UI concerns that
 * work perfectly well before a cart exists, so they are live.
 *
 * Both buttons are live: "Add to bag" writes to the browser cart, and
 * "Instant checkout" does the same and then goes straight to `/checkout`.
 * Both are disabled once stock reaches zero — a real state now that stock
 * actually decrements on payment (`server/products/repository.ts:
 * decrementStockInTx`).
 */
export function ProductPurchase({ product }: { product: Product }) {
  const [pack, setPack] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addLine } = useCartActions();
  const router = useRouter();
  const selected = product.packs[pack];
  const soldOut = product.stockQuantity <= 0;

  return (
    <div>
      {/* The selected pack used to be repeated to the right of this label; the
          options below already show which one is chosen. */}
      <p className="mt-gutter-md font-label text-label-caps text-nutmeg">Select size</p>

      {/* Three across from `sm`. A two-column grid left the third pack
          orphaned on its own row once the range went from two sizes to three. */}
      <div className="mt-gutter-xs grid gap-gutter-xs sm:grid-cols-3" role="radiogroup">
        {product.packs.map((option, index) => {
          const isSelected = index === pack;
          const discounted = applyDiscount(option.price.amount, product.discountPercent);
          return (
            <button
              key={option.name}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setPack(index)}
              className={cn(
                "rounded-md border p-gutter-sm text-left transition-colors",
                isSelected
                  ? "border-terracotta bg-secondary-container/40"
                  : "border-rule hover:border-cacao",
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
              {product.discountPercent ? (
                <span className="mt-1 flex items-baseline gap-gutter-xs">
                  <span className="font-label text-label-sm text-nutmeg line-through">
                    {formatKobo(option.price.amount)}
                  </span>
                  <span className="font-label text-label-md text-terracotta">
                    {formatKobo(discounted)}
                  </span>
                </span>
              ) : (
                <span className="mt-1 block font-label text-label-md text-terracotta">
                  {formatKobo(option.price.amount)}
                </span>
              )}
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

      {soldOut ? (
        <p className="mt-gutter-md rounded border border-rule/70 bg-surface-container p-gutter-sm text-center font-label text-label-md text-cacao uppercase">
          Sold out
        </p>
      ) : (
        <div className="mt-gutter-md grid gap-gutter-xs sm:grid-cols-2">
          <Button
            onClick={() => {
              if (!selected) return;
              addLine(product.slug, selected.name, quantity);
              setAdded(true);
            }}
            className="text-label-md normal-case"
            aria-label={`Add ${quantity} ${selected?.name} of ${product.name} to bag`}
          >
            <BagIcon className="h-4 w-4" />
            Add to bag
          </Button>
          <Button
            onClick={() => {
              if (!selected) return;
              addLine(product.slug, selected.name, quantity);
              router.push(ROUTES.checkout);
            }}
            aria-describedby="purchase-note"
            className="bg-cacao text-label-md normal-case hover:bg-primary-container"
          >
            Instant checkout
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Announced, not just shown: the button keeps focus, so a screen reader
          would otherwise get no confirmation that anything happened. */}
      <p aria-live="polite" className="mt-gutter-xs text-body-sm text-terracotta">
        {added ? (
          <Link href={ROUTES.cart} className="underline underline-offset-4">
            Added to your bag — view bag
          </Link>
        ) : (
          ""
        )}
      </p>

      <p id="purchase-note" className="text-body-sm text-nutmeg">
        Pay online with Paystack, or by bank transfer — you&apos;ll choose at checkout.
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
