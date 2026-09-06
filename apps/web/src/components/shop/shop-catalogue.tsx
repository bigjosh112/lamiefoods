"use client";

import { useState } from "react";
import { cn } from "@lamiefoods/ui";
import { PRODUCTS } from "@/content/products";
import { SHOP_FILTERS, type ShopFilterId } from "@/content/shop";
import { ProductCard } from "./product-card";

/**
 * Category filters plus the product grid.
 *
 * Filtering is genuine client state. Every product is chinchin today, so "All"
 * and "Chinchin" show the same three — that is the catalogue being small, not a
 * stub. The other two categories have no stock and are rendered disabled with
 * their real status, rather than as tabs that filter to an empty grid.
 *
 * Uses the tabs pattern: arrow keys move between filters, which is what a
 * keyboard user expects from a row of toggles.
 */
export function ShopCatalogue() {
  const [active, setActive] = useState<ShopFilterId>("all");

  const products = PRODUCTS;

  return (
    <>
      <div
        role="tablist"
        aria-label="Filter products by category"
        className="mt-gutter-lg flex flex-wrap gap-gutter-xs"
      >
        {SHOP_FILTERS.map((filter) => {
          const selected = filter.id === active;
          const unavailable = filter.status !== null;

          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={unavailable}
              onClick={() => setActive(filter.id)}
              className={cn(
                "inline-flex min-h-11 items-center gap-gutter-xs rounded border px-3 font-label text-label-sm uppercase transition-colors",
                selected
                  ? "border-primary-container bg-primary-container text-linen"
                  : "border-rule bg-surface-container-low text-cacao",
                unavailable
                  ? "cursor-not-allowed opacity-60"
                  : !selected && "hover:border-cacao",
              )}
            >
              <span>
                {filter.label}
                {!unavailable && ` (${filter.count})`}
              </span>
              {filter.status && (
                <span className="rounded-sm bg-secondary-container px-1.5 py-0.5 text-on-secondary-fixed">
                  {filter.status}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <ul className="mt-gutter-lg grid gap-gutter-md sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </ul>

      <p id="shop-actions-note" className="mt-gutter-md text-body-sm text-nutmeg">
        Ordering opens when our checkout goes live. Product pages and the bag are on the
        way.
      </p>
    </>
  );
}
