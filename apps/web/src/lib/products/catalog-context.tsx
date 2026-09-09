"use client";

import { createContext, useContext } from "react";
import type { Product } from "@lamiefoods/types";

/**
 * The published catalogue, made available to client components without a
 * client-side fetch.
 *
 * Products moved from a static import (`content/products.ts`) to Postgres —
 * `resolveLines()` in `cart-store.ts` can no longer resolve a cart line
 * synchronously against a bundled array. Rather than add a public
 * `GET /api/products` endpoint and a client-side fetch-and-cache layer, the
 * Server Component page that needs cart/checkout pricing
 * (`app/cart/page.tsx`, `app/checkout/page.tsx`) fetches
 * `listPublishedProducts()` directly and wraps its client children in this
 * provider — the exact "Server Component fetches, Client Component receives
 * via props/context" pattern already used everywhere else in this app,
 * applied to a cross-cutting concern instead of a single prop.
 *
 * The default (no provider) is an empty array, not a thrown error:
 * `resolveLines` already drops any cart line it can't resolve, the same
 * graceful behaviour as a since-removed product — a page that doesn't wrap
 * its tree in this provider just shows nothing priced rather than crashing.
 */
const CatalogContext = createContext<Product[]>([]);

export function CatalogProvider({
  products,
  children,
}: {
  products: Product[];
  children: React.ReactNode;
}) {
  return <CatalogContext.Provider value={products}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Product[] {
  return useContext(CatalogContext);
}
