"use client";

import { useState } from "react";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import type { Product } from "@lamiefoods/types";
import { ButtonLink } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { STATUS_LABEL, stockStatus, type StockStatus } from "@/lib/admin/stock-status";

const STATUS_STYLES: Record<StockStatus, string> = {
  "in-stock": "bg-secondary-container text-on-secondary-fixed",
  "low-stock": "bg-error-container text-on-error-container",
  "out-of-stock": "bg-error-container text-on-error-container",
};

export type InventoryFilter = "all" | StockStatus;

const COLUMNS = ["Product", "Category", "Available", "Threshold", "Status", ""];

/**
 * Stock table, one row per product — real inventory is tracked per product
 * (`products.stock_quantity`/`restock_threshold`), not per pack size, so
 * there is no per-pack or packaging-materials breakdown to show; the old
 * sample data invented both.
 *
 * The filter tabs are real client state — filtering an already-loaded list
 * works fine without a backend. Stock itself is edited on the product's real
 * edit form (`/admin/products/:slug/edit`, where `stockQuantity` is a real,
 * saved field) rather than an inline +/- control here: a number that moves on
 * screen without being saved is worse than no control at all.
 *
 * Products arrive as PROPS, not imported — same rule as every other admin
 * table holding operational data (see GAP-009).
 */
export function InventoryTable({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<InventoryFilter>("all");

  const withStatus = products.map((product) => ({
    product,
    status: stockStatus(product),
  }));

  const tabs: { label: string; filter: InventoryFilter; count: number }[] = [
    { label: "All products", filter: "all", count: withStatus.length },
    {
      label: "In stock",
      filter: "in-stock",
      count: withStatus.filter((p) => p.status === "in-stock").length,
    },
    {
      label: "Low stock",
      filter: "low-stock",
      count: withStatus.filter((p) => p.status === "low-stock").length,
    },
    {
      label: "Out of stock",
      filter: "out-of-stock",
      count: withStatus.filter((p) => p.status === "out-of-stock").length,
    },
  ];

  const visible = withStatus.filter((p) => filter === "all" || p.status === filter);

  return (
    <>
      <section className="mt-gutter-sm flex flex-wrap items-center justify-between gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-md">
        <div
          role="tablist"
          aria-label="Filter products"
          className="flex flex-wrap gap-gutter-xs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.filter}
              type="button"
              role="tab"
              aria-selected={filter === tab.filter}
              onClick={() => setFilter(tab.filter)}
              className={cn(
                "inline-flex min-h-11 items-center gap-gutter-xs rounded-md border px-3 font-label text-label-sm transition-colors",
                filter === tab.filter
                  ? "border-primary-container bg-primary-container text-linen"
                  : "border-rule bg-surface-container-low text-cacao hover:border-cacao",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-sm px-1.5",
                  filter === tab.filter
                    ? "bg-linen/20"
                    : "bg-secondary-container text-on-secondary-fixed",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-gutter-sm overflow-x-auto rounded border border-rule/70 bg-surface">
        <table className="w-full min-w-4xl border-collapse text-left">
          <caption className="sr-only">Stock on hand by product.</caption>
          <thead>
            <tr className="border-b border-rule/70">
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-gutter-sm py-3 font-label text-label-sm text-nutmeg uppercase"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(({ product, status }) => {
              const low = status !== "in-stock";
              const heroImage =
                product.images.find((image) => image.role === "hero") ??
                product.images[0];

              return (
                <tr
                  key={product.id}
                  className={cn(
                    "border-b border-rule/70 last:border-b-0",
                    low && "bg-error-container/30",
                  )}
                >
                  <th scope="row" className="px-gutter-sm py-3 text-left font-normal">
                    <span className="flex items-center gap-gutter-sm">
                      <span className="relative aspect-square w-11 shrink-0 overflow-hidden rounded border border-rule/70 bg-surface-container">
                        <ImageSlot
                          slot={{
                            src: heroImage?.url ?? null,
                            alt: heroImage?.alt ?? product.name,
                            note: "Product photography",
                          }}
                          sizes="44px"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-body-md font-semibold text-cacao">
                          {product.name}
                        </span>
                        <span className="block text-body-sm text-nutmeg">
                          {product.storefrontActive ? "Published" : "Draft"}
                        </span>
                      </span>
                    </span>
                  </th>

                  <td className="px-gutter-sm py-3 text-body-sm text-on-surface-variant">
                    {product.category}
                  </td>

                  <td className="px-gutter-sm py-3 whitespace-nowrap">
                    <span
                      className={cn(
                        "font-label text-label-md",
                        low ? "text-error" : "text-cacao",
                      )}
                    >
                      {product.stockQuantity.toLocaleString("en-NG")}
                    </span>
                  </td>

                  <td className="px-gutter-sm py-3 text-body-sm whitespace-nowrap text-nutmeg">
                    {product.restockThreshold?.toLocaleString("en-NG") ?? "—"}
                  </td>

                  <td className="px-gutter-sm py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-gutter-xs rounded-sm px-2 py-0.5 font-label text-label-sm whitespace-nowrap",
                        STATUS_STYLES[status],
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          low ? "bg-error" : "bg-terracotta",
                        )}
                      />
                      {STATUS_LABEL[status]}
                    </span>
                  </td>

                  <td className="px-gutter-sm py-3">
                    <ButtonLink
                      href={ADMIN_ROUTES.editProduct(product.slug)}
                      variant="secondary"
                      className="inline-flex"
                    >
                      <ICONS.timer className="h-4 w-4" />
                      Edit stock
                    </ButtonLink>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {visible.length === 0 && (
          <p className="p-gutter-xl text-center text-body-sm text-nutmeg">
            Nothing in this category.
          </p>
        )}
      </div>

      <p className="mt-gutter-xs text-body-sm text-nutmeg">
        {products.length} product{products.length === 1 ? "" : "s"}
      </p>
    </>
  );
}
