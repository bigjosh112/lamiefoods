"use client";

import { useId, useState } from "react";
import { cn } from "@lamiefoods/ui";
import { Button } from "@/components/ui/button";
import { BagIcon } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { CRUNCH_MAX, type Product } from "@/content/products";

/**
 * Shop product tile.
 *
 * A client component only because of the size selector — choosing a pack size
 * is real local state, not a stand-in for a backend. Everything else about the
 * card is static.
 *
 * "Add to bag" and "View details" are deliberately disabled: there is no cart,
 * and `/shop/[slug]` does not exist yet, so enabling them would either do
 * nothing or send the customer to a 404. The grid carries one note explaining
 * this rather than each card repeating it.
 */
export function ProductCard({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[0]);
  const groupId = useId();

  return (
    <li className="flex h-full flex-col overflow-hidden rounded border border-rule/70 bg-surface-container-low">
      <div className="relative aspect-4/5 bg-surface-container">
        <ImageSlot
          slot={product.image}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
        />
        <span className="absolute top-3 left-3 rounded-sm bg-primary-container px-2 py-1 font-label text-label-sm text-linen uppercase">
          {product.badges.shop}
        </span>
        <span className="absolute right-3 bottom-3 rounded-sm bg-surface/90 px-2 py-1 font-label text-label-sm text-cacao uppercase backdrop-blur-sm">
          In atelier shop
        </span>
      </div>

      <div className="flex flex-1 flex-col p-inset-card">
        <div className="flex items-baseline justify-between gap-gutter-sm">
          <h3 className="text-headline-sm text-cacao">{product.name}</h3>
          <span className="shrink-0 font-label text-label-md text-terracotta">
            {product.price}
          </span>
        </div>

        <p className="mt-gutter-xs flex-1 text-body-sm text-on-surface-variant">
          {product.body}
        </p>

        {/* Crunch factor. The value is stated in text beside the label, so the
            bar itself is decorative and hidden from assistive tech. */}
        <div className="mt-gutter-md rounded border border-rule/70 bg-surface p-3">
          <div className="flex items-baseline justify-between gap-gutter-sm">
            <span className="font-label text-label-sm text-nutmeg uppercase">
              Crunch Factor
            </span>
            <span className="shrink-0 font-label text-label-sm text-terracotta">
              {product.crunch.label} · {product.crunch.score}/{CRUNCH_MAX}
            </span>
          </div>
          <div
            aria-hidden="true"
            className="mt-2 h-1 w-full overflow-hidden rounded-sm bg-rule/60"
          >
            <div
              className="h-full rounded-sm bg-terracotta"
              style={{ width: `${(product.crunch.score / CRUNCH_MAX) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-body-sm text-nutmeg">
            <span className="font-label text-label-sm uppercase">Key:</span>{" "}
            {product.notes.join(" · ")}
          </p>
        </div>

        <fieldset className="mt-gutter-md">
          <legend className="font-label text-label-caps text-nutmeg uppercase">
            Select size
          </legend>
          <div className="mt-gutter-xs flex gap-gutter-xs" role="radiogroup">
            {product.sizes.map((option) => {
              const selected = option === size;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  name={groupId}
                  onClick={() => setSize(option)}
                  className={cn(
                    "min-h-11 flex-1 rounded border font-label text-label-sm transition-colors",
                    selected
                      ? "border-cacao bg-cacao text-linen"
                      : "border-rule bg-surface text-cacao hover:border-cacao",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-gutter-md flex gap-gutter-xs">
          <Button
            disabled
            aria-describedby="shop-actions-note"
            className="flex-1"
            aria-label={`Add ${product.name}, ${size}, to bag`}
          >
            <BagIcon className="h-4 w-4" />
            Add to bag
          </Button>
          <Button
            variant="secondary"
            disabled
            aria-describedby="shop-actions-note"
            aria-label={`View details for ${product.name}`}
          >
            View details
          </Button>
        </div>
      </div>
    </li>
  );
}
