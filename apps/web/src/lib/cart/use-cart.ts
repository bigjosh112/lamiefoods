"use client";

import { cartCount, cartSubtotal, resolveLines, useCartStore } from "./cart-store";
import { useCatalog } from "@/lib/products/catalog-context";

/**
 * Read the cart.
 *
 * Derived values are computed here rather than stored, so there is exactly one
 * source of truth for what is in the bag and no way for a cached total to drift
 * from the lines it came from.
 *
 * `items`/`subtotal` resolve against `useCatalog()` — see
 * `lib/products/catalog-context.tsx`. A page that doesn't provide a catalogue
 * (no `<CatalogProvider>` above it) gets an empty catalogue back, so `items`
 * is empty too; `count` still reflects the real number of lines regardless,
 * since it needs no product data at all.
 */
export function useCart() {
  const lines = useCartStore((state) => state.lines);
  const hydrated = useCartStore((state) => state.hydrated);
  const catalog = useCatalog();
  const items = resolveLines(lines, catalog);

  return {
    lines,
    items,
    count: cartCount(lines),
    subtotal: cartSubtotal(items),
    isEmpty: lines.length === 0,
    /** False until the persisted bag has been read back from localStorage. */
    hydrated,
  };
}

/** Cart actions, for components that only write. */
export function useCartActions() {
  return {
    addLine: useCartStore((state) => state.addLine),
    setQuantity: useCartStore((state) => state.setQuantity),
    removeLine: useCartStore((state) => state.removeLine),
    clearCart: useCartStore((state) => state.clearCart),
  };
}

export { MAX_QUANTITY } from "./cart-store";
