"use client";

import { useId, useState } from "react";
import { ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import type { Product } from "@lamiefoods/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { BagIcon } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { applyDiscount, formatKobo } from "@/lib/money";
import { useCartActions } from "@/lib/cart/use-cart";

/**
 * Shop product tile.
 *
 * A client component only because of the size selector — choosing a pack
 * size is real local state, not a stand-in for a backend. Everything else
 * about the card is static.
 *
 * Both actions work: "View details" opens the product page, "Add to bag" adds
 * the selected pack to the browser-side bag. "Add to bag" is disabled once
 * the selected size is out of stock. The card badge only says "Sold out" when
 * every size is gone.
 */
export function ProductCard({ product }: { product: Product }) {
  const packs = product.packs;
  const [size, setSize] = useState(packs[0]?.name ?? "");
  const selectedPack = packs.find((pack) => pack.name === size);
  const { addLine } = useCartActions();
  const groupId = useId();
  const heroImage =
    product.images.find((image) => image.role === "hero") ?? product.images[0];
  const packSoldOut = !selectedPack || selectedPack.stockQuantity <= 0;
  const allSoldOut = packs.every((pack) => pack.stockQuantity <= 0);

  return (
    <li className="group relative flex h-full flex-col">
      <div className="relative aspect-4/5 overflow-hidden rounded bg-surface-container">
        <ImageSlot
          slot={{
            src: heroImage?.url ?? null,
            alt: heroImage?.alt ?? product.name,
            note: "Product photography",
          }}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
        />
        {/* Real state wins over the launch status. "New" is a literal because
            it applies to everything until the brand has sold anything — see
            question 8 in api-integration.md for what a "Best seller" badge
            would need first. The "In atelier shop" tag that sat bottom-right is
            gone; it labelled the page you were already on. */}
        {allSoldOut ? (
          <span className="absolute top-3 left-3 rounded-sm bg-cacao px-2 py-1 font-label text-label-sm text-linen uppercase">
            Sold out
          </span>
        ) : (
          <span className="absolute top-3 left-3 rounded-sm bg-primary-container px-2 py-1 font-label text-label-sm text-linen">
            New
          </span>
        )}
      </div>

      <div className="mt-gutter-sm flex flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-gutter-sm">
          <h3 className="text-headline-sm text-cacao group-hover:text-terracotta">
            {product.name}
          </h3>
          <span className="shrink-0 font-numeral text-label-md text-terracotta">
            {selectedPack ? (
              product.discountPercent ? (
                <span className="flex flex-col items-end">
                  <span className="text-nutmeg line-through">
                    {formatKobo(selectedPack.price.amount)}
                  </span>
                  {formatKobo(
                    applyDiscount(selectedPack.price.amount, product.discountPercent),
                  )}
                </span>
              ) : (
                formatKobo(selectedPack.price.amount)
              )
            ) : (
              ""
            )}
          </span>
        </div>

        <p className="mt-gutter-xs flex-1 text-body-sm text-on-surface-variant">
          {product.teaser}
        </p>

        {/* Crunch factor. The value is stated in text beside the label, so the
            bar itself is decorative and hidden from assistive tech. */}
        <div className="mt-gutter-md">
          <div className="flex items-baseline justify-between gap-gutter-sm">
            <span className="font-label text-label-sm text-nutmeg uppercase">
              Crunch Factor
            </span>
            <span className="shrink-0 font-label text-label-sm text-terracotta">
              {product.crunchScore}/10
            </span>
          </div>
          <div
            aria-hidden="true"
            className="mt-2 h-1 w-full overflow-hidden rounded-sm bg-rule/60"
          >
            <div
              className="h-full rounded-sm bg-terracotta"
              style={{ width: `${(product.crunchScore / 10) * 100}%` }}
            />
          </div>
        </div>

        <fieldset className="mt-gutter-md">
          <legend className="font-label text-label-caps text-nutmeg uppercase">
            Select size
          </legend>
          <div
            className="relative z-10 mt-gutter-xs grid grid-cols-3 gap-gutter-xs"
            role="radiogroup"
          >
            {packs.map((pack) => {
              const option = pack.name;
              const selected = option === size;
              const optionSoldOut = pack.stockQuantity <= 0;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-disabled={optionSoldOut}
                  name={groupId}
                  onClick={() => setSize(option)}
                  className={cn(
                    "min-h-11 rounded-md border px-1 font-label text-label-sm transition-colors",
                    selected
                      ? "border-cacao bg-cacao text-linen"
                      : "border-rule text-cacao hover:border-cacao",
                    optionSoldOut && "opacity-60",
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
            onClick={() => addLine(product.slug, size)}
            disabled={packSoldOut}
            className="relative z-10 flex-1 text-label-md normal-case"
            aria-label={
              packSoldOut
                ? allSoldOut
                  ? `${product.name} is sold out`
                  : `${product.name}, ${size}, is sold out`
                : `Add ${product.name}, ${size}, to bag`
            }
          >
            <BagIcon className="h-4 w-4" />
            {packSoldOut ? "Sold out" : "Add to bag"}
          </Button>
          <ButtonLink
            href={ROUTES.product(product.slug)}
            variant="secondary"
            className="text-label-md normal-case after:absolute after:inset-0 after:content-['']"
            aria-label={`View details for ${product.name}`}
          >
            View details
          </ButtonLink>
        </div>
      </div>
    </li>
  );
}
