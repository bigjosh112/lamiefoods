"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { cn } from "@lamiefoods/ui";
import { ImageSlot } from "@/components/ui/image-slot";
import type { Product } from "@lamiefoods/types";

const SLIDE_MS = 4500;
const INTERACT_PAUSE_MS = 8000;

/**
 * Product gallery: large hero that auto-slides through uploaded photos, plus
 * a thumbnail strip (up to five).
 *
 * Client-side for thumbnail switch + carousel. Thumbnails are a `tablist`
 * rather than a row of buttons, so arrow keys move between views the way a
 * keyboard user expects, and the selected one is announced.
 *
 * Images come from `product.images` (uploaded via Vercel Blob). Order follows
 * `sort_order` from the admin form (index 0 = hero). Autoplay only runs when
 * there is more than one real image; hover/focus and thumb interaction pause it.
 */
export function ProductGallery({ product }: { product: Product }) {
  const images =
    product.images.length > 0
      ? product.images
      : [{ id: "placeholder", url: "", alt: product.name, role: "hero" as const }];
  const canAutoplay = product.images.length > 1;
  const reduceMotion = useReducedMotion();

  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [interactPausedUntil, setInteractPausedUntil] = useState(0);

  const activeRef = useRef(active);
  activeRef.current = active;

  const goTo = useCallback(
    (next: number, opts?: { pause?: boolean }) => {
      const len = images.length;
      if (len < 2) return;
      const index = ((next % len) + len) % len;
      const currentIndex = activeRef.current;
      if (index === currentIndex) return;

      const forwardWrap = currentIndex === len - 1 && index === 0;
      const backwardWrap = currentIndex === 0 && index === len - 1;
      setDirection(
        forwardWrap ? 1 : backwardWrap ? -1 : index > currentIndex ? 1 : -1,
      );
      setActive(index);

      if (opts?.pause) {
        setInteractPausedUntil(Date.now() + INTERACT_PAUSE_MS);
      }
    },
    [images.length],
  );

  const paused =
    !canAutoplay || hovered || focused || Date.now() < interactPausedUntil;

  useEffect(() => {
    if (!canAutoplay || paused) return;

    const id = window.setInterval(() => {
      goTo(activeRef.current + 1);
    }, SLIDE_MS);

    return () => window.clearInterval(id);
  }, [canAutoplay, paused, goTo, active, interactPausedUntil]);

  // Resume autoplay after an interaction pause without needing a re-render tick.
  useEffect(() => {
    if (!canAutoplay || interactPausedUntil <= Date.now()) return;
    const remaining = interactPausedUntil - Date.now();
    const id = window.setTimeout(() => {
      setInteractPausedUntil(0);
    }, remaining + 16);
    return () => window.clearTimeout(id);
  }, [canAutoplay, interactPausedUntil]);

  const current = images[active] ?? images[0];
  // Unreachable in practice — `images` always has at least the placeholder.
  if (!current) return null;

  const slideOffset = reduceMotion ? 0 : 36;
  const showProgress = canAutoplay && !paused && !reduceMotion;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
    >
      <div className="relative aspect-4/3 overflow-hidden rounded border border-rule/70 bg-surface-container-low">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <m.div
            key={current.id}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir * slideOffset,
                opacity: 0,
              }),
              center: { x: 0, opacity: 1 },
              exit: (dir: number) => ({
                x: dir * -slideOffset,
                opacity: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: reduceMotion ? 0.2 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0"
          >
            <ImageSlot
              slot={{
                src: current.url || null,
                alt: current.alt || product.name,
                note: "Product photography",
              }}
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority={active === 0}
            />
          </m.div>
        </AnimatePresence>

        {showProgress && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-cacao/15"
            aria-hidden
          >
            <m.div
              key={`progress-${current.id}-${interactPausedUntil}`}
              className="h-full origin-left bg-terracotta"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
            />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div
          role="tablist"
          aria-label={`${product.name} images`}
          className="mt-gutter-xs grid grid-cols-3 gap-gutter-xs sm:grid-cols-5"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              goTo(active + 1, { pause: true });
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              goTo(active - 1, { pause: true });
            }
          }}
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={image.alt || `${product.name} photo ${index + 1}`}
              onClick={() => goTo(index, { pause: true })}
              className={cn(
                "relative aspect-square min-h-11 overflow-hidden rounded border transition-colors",
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
