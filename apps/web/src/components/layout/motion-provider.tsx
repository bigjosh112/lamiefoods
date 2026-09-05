"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Motion setup for the whole app.
 *
 * `LazyMotion` with `domAnimation` loads a reduced Framer Motion feature set,
 * which keeps the animation bundle well under the full `motion` import — worth
 * it given how much of the homepage hero will lean on it.
 *
 * `reducedMotion="user"` makes every animation defer to the OS setting, so
 * individual components do not each have to remember to check.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
