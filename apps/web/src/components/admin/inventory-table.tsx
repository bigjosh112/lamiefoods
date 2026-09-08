"use client";

import { useState } from "react";
import { cn } from "@lamiefoods/ui";
import { ICONS } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import type {
  InventoryFilter,
  InventoryLine,
  StockStatus,
} from "@/content/admin-inventory";

/**
 * Stock table with filter tabs.
 *
 * The tabs are real client state — filtering an already-loaded list is a UI
 * concern that works fine without a backend, and it is what makes the counts
 * meaningful to check.
 *
 * Quick adjustment is deliberately disabled. It is a write to authoritative
 * business data, and letting the number move on screen without saving it
 * anywhere is worse than not offering the control: the operator would walk away
 * believing the count had been corrected. Same reasoning as the disabled write
 * controls on the products and orders screens.
 *
 * Lines arrive as PROPS. A client component's imports are bundled into client
 * JavaScript, so importing the data module would ship internal stock levels
 * into a downloadable chunk, past the server-side gate (see GAP-009).
 */
const COLUMNS = [
  "Item",
  "SKU",
  "Category",
  "Pack",
  "Available",
  "Threshold",
  "Status",
  "Last batch",
  "Adjust",
];

const STATUS_STYLES: Record<StockStatus, string> = {
  "in-stock": "bg-secondary-container text-on-secondary-fixed",
  "low-stock": "bg-error-container text-on-error-container",
  "out-of-stock": "bg-error-container text-on-error-container",
};

export function InventoryTable({
  lines,
  tabs,
  statusLabels,
  searchPlaceholder,
  adjustNote,
  footer,
}: {
  lines: (InventoryLine & { status: StockStatus })[];
  tabs: { label: string; filter: InventoryFilter; count: number }[];
  statusLabels: Record<StockStatus, string>;
  searchPlaceholder: string;
  adjustNote: string;
  footer: string;
}) {
  const [filter, setFilter] = useState<InventoryFilter>("all");

  const visible = lines.filter((line) => {
    if (filter === "all") return true;
    if (filter === "materials") return line.category === "Packaging materials";
    return line.status === filter;
  });

  return (
    <>
      <section className="mt-gutter-sm flex flex-wrap items-center justify-between gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-md">
        <div
          role="tablist"
          aria-label="Filter stock lines"
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

        {/* Disabled: searching needs an inventory service behind it. */}
        <span className="flex min-h-11 items-center gap-gutter-xs rounded border border-rule/70 bg-surface-container-low px-gutter-sm text-body-sm text-nutmeg/70">
          <ICONS.seal className="h-4 w-4 shrink-0" />
          {searchPlaceholder}
        </span>
      </section>

      <div className="mt-gutter-sm overflow-x-auto rounded border border-rule/70 bg-surface">
        <table className="w-full min-w-5xl border-collapse text-left">
          <caption className="sr-only">
            Stock on hand by pack size and packaging material.
          </caption>
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
            {visible.map((line) => {
              const low = line.status !== "in-stock";

              return (
                <tr
                  key={line.id}
                  className={cn(
                    "border-b border-rule/70 last:border-b-0",
                    low && "bg-error-container/30",
                  )}
                >
                  <th scope="row" className="px-gutter-sm py-3 text-left font-normal">
                    <span className="flex items-center gap-gutter-sm">
                      <span className="relative aspect-square w-11 shrink-0 overflow-hidden rounded border border-rule/70 bg-surface-container">
                        <ImageSlot slot={line.image} sizes="44px" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-body-md font-semibold text-cacao">
                          {line.name}
                        </span>
                        <span className="block text-body-sm text-nutmeg">
                          {line.variant} · {line.note}
                        </span>
                      </span>
                    </span>
                  </th>

                  <td className="px-gutter-sm py-3 font-label text-label-sm whitespace-nowrap text-cacao">
                    {line.sku}
                  </td>

                  <td className="px-gutter-sm py-3 text-body-sm text-on-surface-variant">
                    {line.category}
                  </td>

                  <td className="px-gutter-sm py-3 text-body-sm text-on-surface-variant">
                    {line.pack}
                  </td>

                  <td className="px-gutter-sm py-3 whitespace-nowrap">
                    <span
                      className={cn(
                        "font-label text-label-md",
                        low ? "text-error" : "text-cacao",
                      )}
                    >
                      {line.available.toLocaleString("en-NG")}
                    </span>{" "}
                    <span className="text-body-sm text-nutmeg">{line.unit}</span>
                  </td>

                  <td className="px-gutter-sm py-3 text-body-sm whitespace-nowrap text-nutmeg">
                    {line.threshold.toLocaleString("en-NG")}
                  </td>

                  <td className="px-gutter-sm py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-gutter-xs rounded-sm px-2 py-0.5 font-label text-label-sm whitespace-nowrap",
                        STATUS_STYLES[line.status],
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          low ? "bg-error" : "bg-terracotta",
                        )}
                      />
                      {statusLabels[line.status]}
                    </span>
                  </td>

                  <td className="px-gutter-sm py-3 text-body-sm">
                    <span className="block text-cacao">{line.lastBatch ?? "—"}</span>
                    <span className="block text-nutmeg">{line.lastBatchWhen}</span>
                  </td>

                  {/* Disabled: see the note under the table. */}
                  <td className="px-gutter-sm py-3">
                    <span
                      aria-disabled="true"
                      title={adjustNote}
                      className="inline-flex cursor-not-allowed items-center gap-gutter-xs rounded border border-rule bg-surface-container-low px-2 py-1 font-label text-label-sm text-nutmeg/70"
                    >
                      <span aria-hidden="true">−</span>
                      {line.available.toLocaleString("en-NG")}
                      <span aria-hidden="true">+</span>
                    </span>
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

      <div className="mt-gutter-xs flex flex-wrap items-start justify-between gap-gutter-sm text-body-sm text-nutmeg">
        <p className="max-w-2xl">{adjustNote}</p>
        <p className="shrink-0 font-label text-label-sm uppercase">{footer}</p>
      </div>
    </>
  );
}
