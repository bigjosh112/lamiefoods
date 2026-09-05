import Image from "next/image";
import { cn } from "@lamiefoods/ui";
import type { ImageSlot as ImageSlotData } from "@/content/landing";

/**
 * Renders real photography when it exists, and an honest placeholder when it
 * does not.
 *
 * No product photography has been supplied yet. Rather than ship a stock image
 * that misrepresents the product, the fallback is a warm tonal block naming what
 * belongs there — it reads as intentional against this palette and makes the
 * gaps obvious in review. Drop files into `public/images`, set `src` in
 * `content/landing.ts`, and every slot upgrades with no component changes.
 */
export function ImageSlot({
  slot,
  className,
  sizes,
  priority = false,
}: {
  slot: ImageSlotData;
  className?: string;
  /** Required whenever the image fills its container, for correct srcset. */
  sizes?: string;
  priority?: boolean;
}) {
  if (slot.src) {
    return (
      <Image
        src={slot.src}
        alt={slot.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-container-high via-surface-container to-secondary-fixed-dim/60",
        className,
      )}
      // Decorative stand-in, not content — the real alt text ships with the
      // real image, so screen readers should skip this entirely.
      role="presentation"
    >
      <span className="px-gutter-sm text-center font-label text-label-sm text-nutmeg/70 uppercase">
        {slot.note}
      </span>
    </div>
  );
}
