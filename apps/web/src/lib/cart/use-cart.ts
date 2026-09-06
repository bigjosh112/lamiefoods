"use client";

import { useSyncExternalStore } from "react";
import {
  cartCount,
  cartSubtotal,
  getServerSnapshot,
  getSnapshot,
  resolveLines,
  subscribe,
} from "./cart-store";

/**
 * Read the cart.
 *
 * `useSyncExternalStore` is the point: it renders the server snapshot during
 * hydration and only then swaps in the persisted cart, so a bag restored from
 * localStorage cannot cause a markup mismatch. No context provider is needed —
 * the store is a module, so any component can subscribe directly.
 */
export function useCart() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = resolveLines(lines);

  return {
    lines,
    items,
    count: cartCount(lines),
    subtotal: cartSubtotal(items),
    isEmpty: items.length === 0,
  };
}

export { addLine, clearCart, MAX_QUANTITY, removeLine, setQuantity } from "./cart-store";
