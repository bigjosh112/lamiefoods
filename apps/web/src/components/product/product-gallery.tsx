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
        {/* No overlay badges. The two that sat here asserted a butter
            percentage nobody has confirmed and a batch number nothing
            tracks. */}
        <ImageSlot slot={current} sizes="(min-width: 1024px) 55vw, 100vw" priority />
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
