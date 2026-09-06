"use client";

import { useState } from "react";
import { cn } from "@lamiefoods/ui";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import type { AdminProduct, ProductFilter } from "@/content/admin-products";
import { formatKobo } from "@/lib/money";

/**
 * Filterable product list.
 *
 * The tabs are real client state — filtering an already-loaded list is a UI
 * concern that works fine without a backend, and it is what makes the counts
 * meaningful to review. Search, edit, sold-out and launch controls are disabled:
 * they need somewhere to write to.
 *
 * Products arrive as props rather than being imported here, keeping the client
 * bundle free of catalogue internals — the same rule that stopped customer PII
 * shipping from the orders table.
 */
export function ProductsList({
  products,
  tabs,
  searchPlaceholder,
}: {
  products: AdminProduct[];
  tabs: { label: string; count: number; filter: ProductFilter }[];
  searchPlaceholder: string;
}) {
  const [filter, setFilter] = useState<ProductFilter>("all");

  const visible = products.filter((product) => {
    if (filter === "all") return true;
    if (filter === "live") return product.status !== "development";
    if (filter === "development") return product.status === "development";
    return false; // seasonal — nothing carries that flag yet
  });

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
                "inline-flex min-h-11 items-center gap-gutter-xs rounded border px-3 font-label text-label-sm transition-colors",
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

        {/* Disabled: searching needs a catalogue service behind it. */}
        <span className="flex min-h-11 items-center gap-gutter-xs rounded border border-rule/70 bg-surface-container-low px-gutter-sm text-body-sm text-nutmeg/70">
          <ICONS.seal className="h-4 w-4 shrink-0" />
          {searchPlaceholder}
        </span>
      </section>

      {visible.length === 0 ? (
        <p className="mt-gutter-sm rounded border border-rule/70 bg-surface p-gutter-xl text-center text-body-sm text-nutmeg">
          Nothing in this category yet.
        </p>
      ) : (
        <ul className="mt-gutter-sm space-y-3">
          {visible.map((product) => (
            <li
              key={product.sku}
              className={cn(
                "flex flex-wrap items-start gap-gutter-md rounded border border-rule/70 p-gutter-md",
                product.status === "development"
                  ? "bg-surface-container-low"
                  : "bg-surface",
              )}
            >
              <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded border border-rule/70 bg-surface-container">
                <ImageSlot slot={product.image} sizes="80px" />
              </div>

              <div className="min-w-56 flex-1">
                <div className="flex flex-wrap items-center gap-gutter-xs">
                  <span className="font-label text-label-sm text-nutmeg uppercase">
                    {product.category}
                  </span>
                  <span className="rounded-sm border border-rule/70 px-2 py-0.5 font-label text-label-sm text-cacao">
                    SKU: {product.sku}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-gutter-xs rounded-sm px-2 py-0.5 font-label text-label-sm",
                      product.status === "low-stock"
                        ? "bg-error-container text-on-error-container"
                        : "bg-secondary-container text-on-secondary-fixed",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        product.status === "low-stock" ? "bg-error" : "bg-terracotta",
                      )}
                    />
                    {product.statusLabel}
                  </span>
                </div>

                <h3 className="mt-1 flex flex-wrap items-center gap-gutter-xs text-headline-sm text-cacao">
                  {product.name}
                  {product.pipeline && (
                    <span className="rounded-sm bg-tertiary-container px-2 py-0.5 font-label text-label-sm text-on-tertiary-container">
                      {product.pipeline.chip}
                    </span>
                  )}
                </h3>

                <p className="mt-1 text-body-sm text-on-surface-variant">
                  {product.body}
                </p>

                <p className="mt-gutter-xs flex flex-wrap items-center gap-gutter-xs text-body-sm text-nutmeg">
                  {product.sizes ? (
                    <>
                      <ICONS.box className="h-4 w-4" />
                      {product.prices?.length} sizes active · {product.sizes}
                    </>
                  ) : (
                    <>
                      <ICONS.timer className="h-4 w-4" />
                      {product.pipeline?.detail}
                    </>
                  )}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-gutter-sm">
                {product.prices ? (
                  <div className="flex flex-wrap justify-end gap-gutter-md">
                    <div className="text-right">
                      <p className="font-label text-label-sm text-nutmeg uppercase">
                        Tiered price
                      </p>
                      <p className="font-label text-label-md text-cacao">
                        {product.prices.map((price) => formatKobo(price)).join(" / ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-label text-label-sm text-nutmeg uppercase">
                        Inventory
                      </p>
                      <p
                        className={cn(
                          "flex items-center justify-end gap-gutter-xs font-label text-label-md",
                          product.status === "low-stock" ? "text-error" : "text-cacao",
                        )}
                      >
                        <ICONS.box className="h-4 w-4" />
                        {product.stock} units
                        {product.status === "low-stock" && " left"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="font-label text-label-sm text-nutmeg uppercase">
                      Catalogue visibility
                    </p>
                    <p className="text-body-sm text-cacao">
                      {product.pipeline?.visibility}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap justify-end gap-gutter-xs">
                  {product.pipeline ? (
                    <>
                      <Button disabled>
                        <ICONS.sparkle className="h-4 w-4" />
                        Configure launch
                      </Button>
                      <Button variant="secondary" disabled>
                        Edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="secondary" disabled>
                        Edit
                      </Button>
                      <Button variant="secondary" disabled>
                        Mark sold out
                      </Button>
                      <span
                        aria-disabled="true"
                        title="More actions need a backend"
                        className="inline-flex h-11 w-11 cursor-not-allowed items-center justify-center rounded border border-rule font-label text-nutmeg/70"
                      >
                        …
                      </span>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
