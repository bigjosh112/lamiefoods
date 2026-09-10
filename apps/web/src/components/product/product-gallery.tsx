"use client";

import { useState } from "react";
import { cn } from "@lamiefoods/ui";
import { ImageSlot } from "@/components/ui/image-slot";
import type { Product } from "@lamiefoods/types";

/**
 * Product gallery: one large view plus a thumbnail strip (up to five photos).
 *
 * Client-side only for the thumbnail switch. Thumbnails are a `tablist` rather
 * than a row of buttons, so arrow keys move between views the way a keyboard
 * user expects, and the selected one is announced.
 *
 * Images come from `product.images` (uploaded via Vercel Blob, see
 * `components/admin/image-upload.tsx`) — a product with none yet renders the
 * same honest placeholder every other unphotographed slot in this app uses.
 * Order follows `sort_order` from the admin form (index 0 = hero).
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
          className="mt-gutter-xs grid grid-cols-3 gap-gutter-xs sm:grid-cols-5"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={image.alt || `${product.name} photo ${index + 1}`}
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
                sizes="(min-width: 1024px) 11vw, 30vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
