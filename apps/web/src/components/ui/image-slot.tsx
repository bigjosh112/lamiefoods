import Image from "next/image";
import { cn } from "@lamiefoods/ui";
import type { ImageSlot as ImageSlotData } from "@/content/landing";

/**
 * Vercel Blob is already a CDN. Routing those URLs through `/_next/image`
 * forces the local (or edge) optimizer to re-download the full original
 * within Next's hard 7s upstream timeout — multi‑MB product photos fail with
 * TimeoutError / 500. Serve the blob URL as-is; local `/images/…` still go
 * through the optimizer.
 */
function isVercelBlobUrl(src: string): boolean {
  try {
    const host = new URL(src).hostname;
    return host.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

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
        unoptimized={isVercelBlobUrl(slot.src)}
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
