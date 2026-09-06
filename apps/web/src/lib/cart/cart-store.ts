import type { Kobo } from "@lamiefoods/types";
import { findPack, findProduct, type Product } from "@/content/products";
import { sumKobo } from "@/lib/money";

/**
 * The shopping bag.
 *
 * A cart is genuinely a frontend concern until checkout — the backend only
 * needs to hear about it when an order is placed — so this is real, working
 * state rather than a stand-in. It lives in a small external store read through
 * `useSyncExternalStore`, which is what makes it SSR-safe: React renders the
 * server snapshot (always empty) during hydration and only then swaps in the
 * persisted cart, so there is no markup mismatch.
 *
 * Only `{slug, pack, quantity}` is persisted. Names, prices and images are
 * looked up from the catalogue on read, so a price or product change can never
 * be served from a stale copy sitting in someone's browser.
 */
export interface CartLine {
  slug: string;
  /** Pack option name, e.g. "250g Pouch". */
  pack: string;
  quantity: number;
}

const STORAGE_KEY = "lamie.cart.v1";
const MAX_QUANTITY = 20;

/** Stable empty reference — getSnapshot must not return a new array each call. */
const EMPTY: CartLine[] = [];

let state: CartLine[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode, blocked storage, quota. The cart still works for this
    // session; losing persistence is not worth breaking the page over.
  }
}

/** Drop anything that no longer matches the catalogue. */
function sanitise(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return EMPTY;

  const lines: CartLine[] = [];
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const { slug, pack, quantity } = entry as Partial<CartLine>;
    if (typeof slug !== "string" || typeof pack !== "string") continue;
    if (typeof quantity !== "number" || !Number.isFinite(quantity)) continue;

    const product = findProduct(slug);
    if (!product || !findPack(product, pack)) continue;

    lines.push({
      slug,
      pack,
      quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity))),
    });
  }
  return lines.length > 0 ? lines : EMPTY;
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = sanitise(JSON.parse(raw));
  } catch {
    state = EMPTY;
  }
}

export function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  // A second tab changing the cart should update this one.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    state = sanitise(event.newValue ? JSON.parse(event.newValue) : null);
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): CartLine[] {
  hydrate();
  return state;
}

/** Server render always sees an empty bag — nothing else is knowable there. */
export function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function commit(next: CartLine[]) {
  state = next;
  persist();
  emit();
}

export function addLine(slug: string, pack: string, quantity = 1) {
  const existing = state.find((line) => line.slug === slug && line.pack === pack);
  if (existing) {
    commit(
      state.map((line) =>
        line === existing
          ? {
              ...line,
              quantity: Math.min(MAX_QUANTITY, line.quantity + quantity),
            }
          : line,
      ),
    );
    return;
  }
  commit([...state, { slug, pack, quantity: Math.min(MAX_QUANTITY, quantity) }]);
}

export function setQuantity(slug: string, pack: string, quantity: number) {
  if (quantity < 1) return removeLine(slug, pack);
  commit(
    state.map((line) =>
      line.slug === slug && line.pack === pack
        ? { ...line, quantity: Math.min(MAX_QUANTITY, quantity) }
        : line,
    ),
  );
}

export function removeLine(slug: string, pack: string) {
  commit(state.filter((line) => !(line.slug === slug && line.pack === pack)));
}

export function clearCart() {
  commit(EMPTY);
}

/** A cart line resolved against the catalogue, ready to render. */
export interface ResolvedLine {
  line: CartLine;
  product: Product;
  packNote: string;
  unitPrice: Kobo;
  lineTotal: Kobo;
}

/** Resolve lines against the catalogue, skipping anything since removed. */
export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  return lines.flatMap((line) => {
    const product = findProduct(line.slug);
    const pack = product && findPack(product, line.pack);
    if (!product || !pack) return [];
    return [
      {
        line,
        product,
        packNote: pack.note,
        unitPrice: pack.price,
        lineTotal: pack.price * line.quantity,
      },
    ];
  });
}

export const cartSubtotal = (resolved: ResolvedLine[]): Kobo =>
  sumKobo(resolved.map((entry) => entry.lineTotal));

export const cartCount = (lines: CartLine[]): number =>
  lines.reduce((total, line) => total + line.quantity, 0);

export { MAX_QUANTITY };
