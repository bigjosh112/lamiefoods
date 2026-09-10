import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Kobo, Product } from "@lamiefoods/types";
import { applyDiscount, sumKobo } from "@/lib/money";

/**
 * The shopping bag, as a zustand store.
 *
 * A cart is genuinely a frontend concern until checkout — the backend only
 * needs to hear about it when an order is placed — so this is real, working
 * state rather than a stand-in.
 *
 * `skipHydration` is the important bit. With it off, zustand would read
 * localStorage during the first client render while the server rendered an
 * empty bag, and React would report a hydration mismatch. Instead the store
 * starts empty on both sides and `CartHydration` rehydrates it after mount.
 *
 * Only `{slug, pack, quantity}` is persisted. Names, prices and images are
 * looked up from the catalogue on read (`resolveLines`, below), so a price or
 * discount change can never be served from a stale copy sitting in someone's
 * browser.
 */
export interface CartLine {
  slug: string;
  /** Pack option name, e.g. "250g Pouch". */
  pack: string;
  quantity: number;
}

export const MAX_QUANTITY = 20;
const STORAGE_KEY = "lamie.cart.v1";

interface CartState {
  lines: CartLine[];
  hydrated: boolean;
  /**
   * How many distinct bag lines were dropped on the last catalogue prune
   * (deleted/unpublished products). Cleared when the notice is dismissed.
   */
  removedUnavailableCount: number;
  addLine: (slug: string, pack: string, quantity?: number) => void;
  setQuantity: (slug: string, pack: string, quantity: number) => void;
  removeLine: (slug: string, pack: string) => void;
  clearCart: () => void;
  setHydrated: () => void;
  /** Drop lines that no longer resolve against the published catalogue. */
  pruneUnavailable: (catalog: Product[]) => void;
  dismissUnavailableNotice: () => void;
}

const clampQuantity = (value: number) =>
  Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(value)));

/**
 * Structural validation only — shape and type, nothing catalogue-aware.
 *
 * This used to also check a line's product/pack still existed in the
 * catalogue, back when the catalogue was a static import available
 * synchronously at rehydration time. Products now live in Postgres, and
 * rehydration (zustand's `persist` `merge`) runs before any React render, so
 * no catalogue fetch could possibly have resolved yet — there's nothing to
 * check against here. `resolveLines()` below is the real safety net: it
 * already drops any line whose product/pack no longer resolves, the exact
 * behaviour a since-removed product always needed anyway.
 */
function sanitise(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];

  const lines: CartLine[] = [];
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const { slug, pack, quantity } = entry as Partial<CartLine>;
    if (typeof slug !== "string" || !slug) continue;
    if (typeof pack !== "string" || !pack) continue;
    if (typeof quantity !== "number" || !Number.isFinite(quantity)) continue;

    lines.push({ slug, pack, quantity: clampQuantity(quantity) });
  }
  return lines;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,
      removedUnavailableCount: 0,

      addLine: (slug, pack, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find(
            (line) => line.slug === slug && line.pack === pack,
          );
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line === existing
                  ? { ...line, quantity: clampQuantity(line.quantity + quantity) }
                  : line,
              ),
            };
          }
          return {
            lines: [...state.lines, { slug, pack, quantity: clampQuantity(quantity) }],
          };
        }),

      setQuantity: (slug, pack, quantity) =>
        set((state) => {
          if (quantity < 1) {
            return {
              lines: state.lines.filter(
                (line) => !(line.slug === slug && line.pack === pack),
              ),
            };
          }
          return {
            lines: state.lines.map((line) =>
              line.slug === slug && line.pack === pack
                ? { ...line, quantity: clampQuantity(quantity) }
                : line,
            ),
          };
        }),

      removeLine: (slug, pack) =>
        set((state) => ({
          lines: state.lines.filter(
            (line) => !(line.slug === slug && line.pack === pack),
          ),
        })),

      clearCart: () => set({ lines: [], removedUnavailableCount: 0 }),
      setHydrated: () => set({ hydrated: true }),

      pruneUnavailable: (catalog) =>
        set((state) => {
          // No catalogue yet (header on a page without CatalogProvider) — do
          // not wipe the bag just because resolve would return nothing.
          if (catalog.length === 0) return state;

          const next = state.lines.filter((line) =>
            catalog.some(
              (product) =>
                product.slug === line.slug &&
                product.packs.some((pack) => pack.name === line.pack),
            ),
          );
          const removed = state.lines.length - next.length;
          if (removed === 0) return state;
          return {
            lines: next,
            removedUnavailableCount: state.removedUnavailableCount + removed,
          };
        }),

      dismissUnavailableNotice: () => set({ removedUnavailableCount: 0 }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Persist the lines only — runtime flags and actions stay ephemeral.
      partialize: (state) => ({ lines: state.lines }),
      // Rehydration is driven from CartHydration after mount, not during the
      // first render, so server and client markup agree.
      skipHydration: true,
      version: 1,
      merge: (persisted, current) => ({
        ...current,
        lines: sanitise((persisted as { lines?: unknown } | undefined)?.lines),
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/** A cart line resolved against the catalogue, ready to render. */
export interface ResolvedLine {
  line: CartLine;
  product: Product;
  /** Catalogue pack price before any discount. */
  listUnitPrice: Kobo;
  /** Already discount-adjusted — never the pre-discount price. */
  unitPrice: Kobo;
  lineTotal: Kobo;
}

/**
 * Resolve lines against a catalogue, skipping anything since removed or
 * unpublished. `catalog` comes from `useCatalog()` (React context, populated
 * by a Server Component page fetching `listPublishedProducts()`) — see
 * `lib/products/catalog-context.tsx` for why this isn't a static import or a
 * client-side fetch.
 */
export function resolveLines(lines: CartLine[], catalog: Product[]): ResolvedLine[] {
  return lines.flatMap((line) => {
    const product = catalog.find((candidate) => candidate.slug === line.slug);
    const pack = product?.packs.find((candidate) => candidate.name === line.pack);
    if (!product || !pack) return [];

    const listUnitPrice = pack.price.amount;
    const unitPrice = applyDiscount(listUnitPrice, product.discountPercent);
    return [
      {
        line,
        product,
        listUnitPrice,
        unitPrice,
        lineTotal: unitPrice * line.quantity,
      },
    ];
  });
}

export const cartSubtotal = (resolved: ResolvedLine[]): Kobo =>
  sumKobo(resolved.map((entry) => entry.lineTotal));

export const cartCount = (lines: CartLine[]): number =>
  lines.reduce((total, line) => total + line.quantity, 0);
