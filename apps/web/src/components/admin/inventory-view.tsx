import { cn } from "@lamiefoods/ui";
import { InventoryTable } from "@/components/admin/inventory-table";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import {
  INVENTORY_ADJUST_NOTE,
  INVENTORY_HIGHLIGHTS,
  INVENTORY_LINES,
  INVENTORY_PAGE,
  INVENTORY_STATS,
  INVENTORY_TABS,
  STATUS_LABEL,
  stockStatus,
} from "@/content/admin-inventory";

/**
 * Inventory & kettles.
 *
 * Product names, pack sizes and imagery come from the shared catalogue, so a
 * pack size cannot appear here that a customer cannot buy, and the chinchin
 * shown is the chinchin on the shop. Every total is computed from the lines in
 * the table, so no card can contradict the rows beneath it.
 *
 * Not shipped from the mock: an "auto-sync with Paystack orders active" badge
 * (orders are not connected to stock), "real-time" tracking (nothing is), a
 * "100% SKU fulfilment rate" (nothing measures fulfilment), and live kettle
 * telemetry — a vessel number, a named lead and a 185°C reading, which no
 * sensor produces.
 *
 * Chrome comes from `AdminShell`.
 */
export function InventoryView() {
  const lines = INVENTORY_LINES.map((line) => ({
    ...line,
    status: stockStatus(line),
  }));

  return (
    <>
      <div
        role="note"
        className="mb-gutter-md flex items-start gap-gutter-sm rounded border border-error/40 bg-error-container p-gutter-sm text-on-error-container"
      >
        <ICONS.shield className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-body-sm">
          <strong className="font-semibold">
            Nothing counts stock — every quantity here is invented.
          </strong>{" "}
          There is no inventory service, no kettle sensor and no link between orders and
          stock levels. Product names and pack sizes are real catalogue data; the numbers
          against them are not, and nothing can be adjusted.
        </p>
      </div>

      <div className="mb-gutter-md flex flex-wrap items-start justify-between gap-gutter-md">
        <div className="max-w-2xl">
          <p className="font-label text-label-caps text-terracotta uppercase">
            {INVENTORY_PAGE.eyebrow}
          </p>
          <h1 className="mt-1 text-headline-lg text-cacao">{INVENTORY_PAGE.title}</h1>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            {INVENTORY_PAGE.body}
          </p>
        </div>

        {/* Disabled: logging a batch writes to an inventory service. */}
        <Button variant="secondary" disabled>
          <ICONS.timer className="h-4 w-4" />
          {INVENTORY_PAGE.action.label}
        </Button>
      </div>

      <ul className="grid gap-gutter-sm sm:grid-cols-2 xl:grid-cols-4">
        {INVENTORY_STATS.map((stat) => {
          const Icon = ICONS[stat.icon];
          return (
            <li
              key={stat.label}
              className={cn(
                "rounded border border-rule/70 p-gutter-md",
                stat.alert ? "bg-error-container/40" : "bg-surface",
              )}
            >
              <div className="flex items-start justify-between gap-gutter-sm">
                <div className="min-w-0">
                  <p className="font-label text-label-sm text-nutmeg uppercase">
                    {stat.label}
                  </p>
                  <p
                    className={cn(
                      "mt-gutter-xs font-display text-headline-md",
                      stat.alert ? "text-error" : "text-cacao",
                    )}
                  >
                    {stat.value}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded",
                    stat.alert
                      ? "bg-error-container text-on-error-container"
                      : "bg-secondary-container text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-gutter-xs text-body-sm text-nutmeg">{stat.note}</p>
            </li>
          );
        })}
      </ul>

      <ul className="mt-gutter-sm grid gap-gutter-sm lg:grid-cols-3">
        {INVENTORY_HIGHLIGHTS.map((card) => (
          <li
            key={card.title}
            className="flex items-center gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-sm"
          >
            <span className="relative aspect-square w-20 shrink-0 overflow-hidden rounded border border-rule/70 bg-surface-container">
              <ImageSlot slot={card.image} sizes="80px" />
            </span>
            <div className="min-w-0">
              <p className="font-label text-label-sm text-terracotta uppercase">
                {card.eyebrow}
              </p>
              <p className="mt-1 text-headline-sm text-cacao">{card.title}</p>
              <p className="mt-1 text-body-sm text-nutmeg">{card.body}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Data passed down, never imported by the client component. */}
      <InventoryTable
        lines={lines}
        tabs={[...INVENTORY_TABS]}
        statusLabels={STATUS_LABEL}
        searchPlaceholder={INVENTORY_PAGE.searchPlaceholder}
        adjustNote={INVENTORY_ADJUST_NOTE}
        footer={INVENTORY_PAGE.footer}
      />
    </>
  );
}
