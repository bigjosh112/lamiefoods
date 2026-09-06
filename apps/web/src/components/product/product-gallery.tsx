"use client";

import { useState } from "react";
import { cn } from "@lamiefoods/ui";
import { ImageSlot } from "@/components/ui/image-slot";
import type { Product } from "@/content/products";

/**
 * Product gallery: one large view plus a thumbnail strip.
 *
 * Client-side only for the thumbnail switch. Thumbnails are a `tablist` rather
 * than a row of buttons, so arrow keys move between views the way a keyboard
 * user expects, and the selected one is announced.
 *
 * Only the first slot has real photography today; the rest render the labelled
 * tonal placeholder, same as everywhere else.
 */
export function ProductGallery({ product }: { product: Product }) {
  const images = [product.image, ...product.detail.gallery];
  const [active, setActive] = useState(0);
  const current = images[active] ?? product.image;

  return (
    <div>
      <div className="relative aspect-4/3 overflow-hidden rounded border border-rule/70">
        <ImageSlot slot={current} sizes="(min-width: 1024px) 55vw, 100vw" priority />

        <span className="absolute top-4 left-4 inline-flex items-center gap-gutter-xs rounded-sm bg-cacao/85 px-3 py-1.5 font-label text-label-sm text-linen uppercase backdrop-blur-sm">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-tertiary-fixed-dim"
          />
          {product.detail.heroBadge}
        </span>

        <span className="absolute right-4 bottom-4 rounded-sm bg-cacao/85 px-3 py-1.5 text-right text-linen backdrop-blur-sm">
          <span className="block font-label text-label-sm text-linen/60 uppercase">
            {product.detail.batchSeries.label}
          </span>
          <span className="block font-label text-label-md text-tertiary-fixed-dim">
            {product.detail.batchSeries.value}
          </span>
        </span>
      </div>

      <div
        role="tablist"
        aria-label={`${product.name} images`}
        className="mt-gutter-xs grid grid-cols-4 gap-gutter-xs"
      >
        {images.map((image, index) => (
          <button
            key={image.note + index}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={image.alt}
            onClick={() => setActive(index)}
            className={cn(
              "relative aspect-square overflow-hidden rounded border transition-colors",
              index === active
                ? "border-terracotta"
                : "border-rule/70 hover:border-cacao",
            )}
          >
            <ImageSlot slot={image} sizes="(min-width: 1024px) 14vw, 25vw" />
          </button>
        ))}
      </div>
    </div>
  );
}
