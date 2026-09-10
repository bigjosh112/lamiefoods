"use client";

import { useEffect } from "react";
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
 * `lib/products/catalog-context.tsx`. When a published catalogue is present,
 * `count` / `isEmpty` follow resolvable lines only (what checkout can charge),
 * and stale deleted/unpublished lines are pruned from localStorage. On pages
 * without a `CatalogProvider`, count still uses raw lines so the header badge
 * does not flash empty before a catalogue page loads.
 */
export function useCart() {
  const lines = useCartStore((state) => state.lines);
  const hydrated = useCartStore((state) => state.hydrated);
  const removedUnavailableCount = useCartStore(
    (state) => state.removedUnavailableCount,
  );
  const pruneUnavailable = useCartStore((state) => state.pruneUnavailable);
  const catalog = useCatalog();
  const items = resolveLines(lines, catalog);
  const hasCatalog = catalog.length > 0;

  useEffect(() => {
    if (!hydrated || !hasCatalog) return;
    pruneUnavailable(catalog);
    // Not depending on `lines`: prune once the published catalogue is available
    // after rehydrate. Quantity edits cannot introduce unavailable catalogue
    // entries through the UI.
  }, [hydrated, hasCatalog, catalog, pruneUnavailable]);

  return {
    lines,
    items,
    count: hasCatalog ? cartCount(items.map((entry) => entry.line)) : cartCount(lines),
    subtotal: cartSubtotal(items),
    isEmpty: hasCatalog ? items.length === 0 : lines.length === 0,
    /** False until the persisted bag has been read back from localStorage. */
    hydrated,
    removedUnavailableCount,
  };
}

/** Cart actions, for components that only write. */
export function useCartActions() {
  return {
    addLine: useCartStore((state) => state.addLine),
    setQuantity: useCartStore((state) => state.setQuantity),
    removeLine: useCartStore((state) => state.removeLine),
    clearCart: useCartStore((state) => state.clearCart),
    dismissUnavailableNotice: useCartStore((state) => state.dismissUnavailableNotice),
  };
}

export { MAX_QUANTITY } from "./cart-store";
