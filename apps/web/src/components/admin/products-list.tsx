"use client";

import { useState } from "react";
import Link from "next/link";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import type { Product } from "@lamiefoods/types";
import { applyDiscount, formatKobo } from "@/lib/money";

/**
 * Real product table with client-side search — genuine local state, no
 * backend needed for filtering a list already fully loaded.
 *
 * Rows arrive as PROPS from the server page, never imported here — see
 * `products-view.tsx`'s comment for why that discipline holds even for
 * non-personal data.
 */
export function ProductsList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

  const filtered = products.filter((product) =>
    `${product.name} ${product.slug}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by product title or slug"
        className="mb-gutter-sm min-h-11 w-full max-w-sm rounded border border-rule bg-[#f8f3ec] px-3 text-body-md text-cacao placeholder:text-nutmeg/70 focus:border-terracotta focus:outline-none"
      />

      {filtered.length === 0 ? (
        <div className="rounded border border-rule/70 bg-surface-container-low p-gutter-xl text-center">
          <p className="text-body-md text-on-surface-variant">
            {products.length === 0
              ? "No products yet."
              : "No products match that search."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-rule/70">
          <table className="w-full min-w-[720px] text-left text-body-sm">
            <thead className="bg-surface-container-low text-label-sm text-nutmeg">
              <tr>
                <th className="px-gutter-sm py-2 font-label">Product</th>
                <th className="px-gutter-sm py-2 font-label">Category</th>
                <th className="px-gutter-sm py-2 font-label">Price</th>
                <th className="px-gutter-sm py-2 font-label">Stock</th>
                <th className="px-gutter-sm py-2 font-label">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const lowest = product.packs.reduce(
                  (min, pack) => Math.min(min, pack.price.amount),
                  Infinity,
                );
                const lowStock =
                  product.restockThreshold !== null &&
                  product.stockQuantity <= product.restockThreshold;

                return (
                  <tr
                    key={product.id}
                    className="border-t border-rule/50 hover:bg-surface-container-low"
                  >
                    <td className="px-gutter-sm py-2">
                      <Link
                        href={ADMIN_ROUTES.editProduct(product.slug)}
                        className="font-label text-label-md text-terracotta hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="text-body-sm text-nutmeg">{product.slug}</p>
                    </td>
                    <td className="px-gutter-sm py-2 text-on-surface-variant capitalize">
                      {product.category.replace("-", " ")}
                    </td>
                    <td className="px-gutter-sm py-2 font-label text-label-md text-cacao">
                      {Number.isFinite(lowest) ? (
                        product.discountPercent ? (
                          <span>
                            <span className="mr-1 text-nutmeg line-through">
                              {formatKobo(lowest)}
                            </span>
                            {formatKobo(applyDiscount(lowest, product.discountPercent))}
                          </span>
                        ) : (
                          formatKobo(lowest)
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-gutter-sm py-2">
                      <span className={cn(lowStock && "font-semibold text-error")}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-gutter-sm py-2">
                      <Badge
                        tone={product.storefrontActive ? "positive" : "neutral"}
                        label={product.storefrontActive ? "Published" : "Draft"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: "positive" | "neutral" }) {
  return (
    <span
      className={cn(
        "inline-block rounded-sm px-2 py-0.5 font-label text-label-sm",
        tone === "positive" && "bg-cacao text-tertiary-fixed-dim",
        tone === "neutral" && "bg-secondary-container text-on-secondary-fixed",
      )}
    >
      {label}
    </span>
  );
}
