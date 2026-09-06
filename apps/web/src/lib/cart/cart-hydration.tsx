"use client";

import { useEffect } from "react";
import { useCartStore } from "./cart-store";

/**
 * Reads the persisted bag back out of localStorage, once, after mount.
 *
 * The store is created with `skipHydration`, so it starts empty on both server
 * and client and the first client render matches the server HTML exactly.
 * Rehydrating here — after that render — is what keeps a restored cart from
 * causing a hydration mismatch.
 *
 * Renders nothing; it exists purely for the effect. Mounted once in the root
 * layout so every page gets the bag without each one remembering to ask.
 */
export function CartHydration() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return null;
}
