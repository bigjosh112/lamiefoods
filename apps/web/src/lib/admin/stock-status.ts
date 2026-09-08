import type { Product } from "@lamiefoods/types";

/**
 * Shared between `inventory-view.tsx` (Server Component) and
 * `inventory-table.tsx` (Client Component, for the status badge/filter tabs)
 * — a plain function like this can't live in a `"use client"` file and be
 * called from server code across that boundary.
 */
export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function stockStatus(
  product: Pick<Product, "stockQuantity" | "restockThreshold">,
): StockStatus {
  if (product.stockQuantity <= 0) return "out-of-stock";
  if (
    product.restockThreshold !== null &&
    product.stockQuantity <= product.restockThreshold
  ) {
    return "low-stock";
  }
  return "in-stock";
}

export const STATUS_LABEL: Record<StockStatus, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "out-of-stock": "Out of stock",
};
