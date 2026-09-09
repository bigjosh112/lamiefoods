"use client";

import { useState } from "react";
import { cn } from "@lamiefoods/ui";
import { ImageSlot } from "@/components/ui/image-slot";
import type { Product } from "@lamiefoods/types";

/**
 * Product gallery: one large view plus a thumbnail strip.
 *
 * Client-side only for the thumbnail switch. Thumbnails are a `tablist` rather
 * than a row of buttons, so arrow keys move between views the way a keyboard
 * user expects, and the selected one is announced.
 *
 * Images come from `product.images` (uploaded via Vercel Blob, see
 * `components/admin/image-upload.tsx`) — a product with none yet renders the
 * same honest placeholder every other unphotographed slot in this app uses.
 * The hero badge and batch-series overlay from the old design are gone: they
 * were never backed by a real field, and inventing one now would repeat the
 * exact mistake this codebase already refused to make elsewhere.
 */
export function ProductGallery({ product }: { product: Product }) {
  const images =
    product.images.length > 0
      ? product.images
      : [{ id: "placeholder", url: "", alt: product.name, role: "hero" as const }];
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  // Unreachable in practice — `images` always has the placeholder fallback
  // above if `product.images` is empty — but satisfies strict indexed-access
  // typing without an assertion.
  if (!current) return null;

  return (
    <div>
      <div className="relative aspect-4/3 overflow-hidden rounded border border-rule/70">
        {/* No overlay badges. The two that sat here asserted a butter
            percentage nobody has confirmed and a batch number nothing
            tracks. */}
        <ImageSlot
          slot={{
            src: current.url || null,
            alt: current.alt || product.name,
            note: "Product photography",
          }}
          sizes="(min-width: 1024px) 55vw, 100vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div
          role="tablist"
          aria-label={`${product.name} images`}
          className="mt-gutter-xs grid grid-cols-4 gap-gutter-xs"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={image.alt || product.name}
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded border transition-colors",
                index === active
                  ? "border-terracotta"
                  : "border-rule/70 hover:border-cacao",
              )}
            >
              <ImageSlot
                slot={{
                  src: image.url || null,
                  alt: image.alt || product.name,
                  note: "",
                }}
                sizes="(min-width: 1024px) 14vw, 25vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
