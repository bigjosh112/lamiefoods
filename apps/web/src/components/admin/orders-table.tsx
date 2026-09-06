"use client";

import Link from "next/link";
import { useState } from "react";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import type { OrderRow, OrdersPagination, OrdersTab } from "@/content/admin-orders";

/**
 * Orders table with row selection.
 *
 * Selection is genuine client state — it is a UI concern that works perfectly
 * well before a backend exists, and it is what makes the batch-action bar
 * meaningful to review.
 *
 * The actions themselves are disabled, as is search, filtering and pagination:
 * those need real orders to act on, and on an operations screen a control that
 * silently does nothing is worse than one plainly not ready.
 *
 * Rows arrive as PROPS rather than being imported here. That matters: a client
 * component's imports are bundled into client JavaScript, so importing the data
 * module directly would ship every customer name, phone number and address into
 * a downloadable chunk — past the server-side gate entirely. Verified: it did.
 * Keep the data server-side and pass it down, which is also what real orders
 * will need.
 */
const COLUMNS = [
  "Order ID",
  "Date & time",
  "Customer",
  "Delivery area & landmark",
  "Batches & weight",
];

/** Two-letter monogram for the customer avatar. */
const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

export function OrdersTable({
  rows,
  tabs,
  pagination,
  batchActions,
}: {
  rows: OrderRow[];
  tabs: OrdersTab[];
  pagination: OrdersPagination;
  batchActions: { label: string; icon: "truck" | "board" }[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const allSelected = selected.length === rows.length;
  const toggleAll = () => setSelected(allSelected ? [] : rows.map((row) => row.id));
  const toggleRow = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  return (
    <>
      <section className="rounded border border-rule/70 bg-surface p-gutter-md">
        <div className="flex flex-wrap items-center gap-gutter-sm">
          {/* Disabled: filtering needs orders to filter. */}
          <span className="flex min-h-11 flex-1 items-center gap-gutter-xs rounded border border-rule/70 bg-surface-container-low px-gutter-sm text-body-sm text-nutmeg/70">
            <ICONS.seal className="h-4 w-4 shrink-0" />
            Search by order ID, customer name or phone number
          </span>
          <span className="flex min-h-11 items-center gap-gutter-xs rounded border border-rule/70 bg-surface-container-low px-gutter-sm text-body-sm text-nutmeg/70">
            <ICONS.calendar className="h-4 w-4" />
            Last 30 days
          </span>
          <span className="flex min-h-11 items-center gap-gutter-xs rounded border border-rule/70 bg-surface-container-low px-gutter-sm text-body-sm text-nutmeg/70">
            <ICONS.truck className="h-4 w-4" />
            All shipping hubs
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Filter orders by status"
          className="mt-gutter-sm flex flex-wrap gap-gutter-xs"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={index === activeTab}
              onClick={() => setActiveTab(index)}
              className={cn(
                "inline-flex min-h-11 items-center gap-gutter-xs rounded border px-3 font-label text-label-sm transition-colors",
                index === activeTab
                  ? "border-primary-container bg-primary-container text-linen"
                  : "border-rule bg-surface-container-low text-cacao hover:border-cacao",
              )}
            >
              {tab.label}
              {tab.count !== null && (
                <span
                  className={cn(
                    "rounded-sm px-1.5",
                    index === activeTab
                      ? "bg-linen/20"
                      : "bg-secondary-container text-on-secondary-fixed",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Batch bar appears only when something is selected, as in the design. */}
      {selected.length > 0 && (
        <section
          aria-live="polite"
          className="mt-gutter-sm flex flex-wrap items-center justify-between gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-sm"
        >
          <p className="text-body-sm text-on-surface-variant">
            <strong className="text-cacao">{selected.length}</strong>{" "}
            {selected.length === 1 ? "order" : "orders"} selected for batch action
          </p>
          <div className="flex flex-wrap items-center gap-gutter-xs">
            {batchActions.map((action) => {
              const Icon = ICONS[action.icon];
              return (
                <Button key={action.label} variant="secondary" disabled>
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Button>
              );
            })}
            <span
              aria-disabled="true"
              title="Deleting orders needs a backend"
              className="inline-flex h-11 w-11 cursor-not-allowed items-center justify-center rounded border border-rule text-nutmeg/70"
            >
              <ICONS.box className="h-4 w-4" />
            </span>
          </div>
        </section>
      )}

      <section className="mt-gutter-sm min-w-0 rounded border border-rule/70 bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-240 border-collapse text-left">
            <caption className="sr-only">
              Customer orders — sample data, not real orders
            </caption>
            <thead>
              <tr className="border-b border-rule/70">
                <th scope="col" className="w-10 p-gutter-sm">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all orders"
                    className="h-4 w-4 rounded-sm border border-rule accent-terracotta"
                  />
                </th>
                {COLUMNS.map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="py-3 pr-4 font-label text-label-sm text-nutmeg uppercase"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isSelected = selected.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-rule/40 last:border-b-0",
                      isSelected && "bg-secondary-container/30",
                    )}
                  >
                    <td className="p-gutter-sm align-top">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(row.id)}
                        aria-label={`Select order ${row.id}`}
                        className="h-4 w-4 rounded-sm border border-rule accent-terracotta"
                      />
                    </td>
                    <th scope="row" className="py-3 pr-4 align-top font-normal">
                      <Link
                        href={ADMIN_ROUTES.order(row.id)}
                        className="block font-label text-label-sm text-terracotta underline-offset-4 hover:underline"
                      >
                        #{row.id}
                      </Link>
                      <span className="block text-body-sm text-nutmeg">{row.kind}</span>
                    </th>
                    <td className="py-3 pr-4 align-top">
                      <span className="block text-body-sm text-cacao">{row.ago}</span>
                      <span className="block text-body-sm text-nutmeg">{row.time}</span>
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <span className="flex items-start gap-gutter-xs">
                        <span
                          aria-hidden="true"
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container font-label text-label-sm text-primary"
                        >
                          {initials(row.customer)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-body-sm text-cacao">
                            {row.customer}
                          </span>
                          <span className="block text-body-sm text-nutmeg">
                            {row.phone}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <span className="block text-body-sm text-cacao">{row.area}</span>
                      <span className="block text-body-sm text-nutmeg">
                        {row.landmark}
                      </span>
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <span className="block text-body-sm text-cacao">{row.batches}</span>
                      <span className="block text-body-sm text-nutmeg">
                        {row.batchNote}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-gutter-sm border-t border-rule/70 p-gutter-sm">
          <p className="text-body-sm text-nutmeg">
            Showing <strong className="text-cacao">{pagination.showing}</strong> of{" "}
            {pagination.total} orders · page {pagination.page} of {pagination.pages}
          </p>
          {/* Disabled: there is one page of sample rows to move through. */}
          <div className="flex items-center gap-gutter-xs">
            {["Previous", "1", "2", "3", "…", "30", "Next"].map((label) => (
              <span
                key={label}
                aria-disabled="true"
                className={cn(
                  "inline-flex min-h-9 min-w-9 cursor-not-allowed items-center justify-center rounded px-2 font-label text-label-sm",
                  label === "1"
                    ? "bg-primary-container text-linen"
                    : "border border-rule text-nutmeg/70",
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
