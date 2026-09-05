"use client";

import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Scroll-triggered entrance used across the page's sections.
 *
 * `whileInView` with `once` means the browser's IntersectionObserver does the
 * work — no scroll listener, so nothing runs on the main thread per frame.
 *
 * `MotionConfig reducedMotion="user"` already neutralises transforms, but a
 * reduced-motion visitor should not sit staring at `opacity: 0` if the observer
 * never fires, so the animation is skipped outright instead.
 *
 * Uses `m` rather than `motion`: the app is wrapped in `LazyMotion`, which
 * requires the lightweight component and rejects the full one in strict mode.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <m.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
