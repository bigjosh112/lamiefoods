import type { Product } from "@lamiefoods/types";
import { cn } from "@lamiefoods/ui";
import { InventoryTable } from "@/components/admin/inventory-table";
import { ICONS } from "@/components/ui/icons";
import { stockStatus } from "@/lib/admin/stock-status";

/**
 * Inventory.
 *
 * As of 2026-09-08 this is real: `stockQuantity`/`restockThreshold` are
 * columns on `products`, fetched by `page.tsx` via
 * `server/products/repository.ts` and passed down as props — the same rule
 * every other admin data screen follows (never import PII/operational data
 * directly into a client component; see GAP-009).
 *
 * The old sample version modeled stock per PACK SIZE and included a
 * "packaging materials" section (kraft pouches, glass jars). Neither has a
 * real data source: the schema only tracks stock per PRODUCT, and there is no
 * table for raw packaging consumables. Both were dropped rather than kept as
 * invented figures — see `docs/ai-memory/gaps.md` GAP-009's 2026-09-08 update.
 *
 * Chrome comes from `AdminShell`.
 */
export function InventoryView({ products }: { products: Product[] }) {
  const finishedUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const lowStock = products.filter((p) => stockStatus(p) === "low-stock");
  const outOfStock = products.filter((p) => stockStatus(p) === "out-of-stock");

  const stats = [
    {
      label: "Total stock on hand",
      value: finishedUnits.toLocaleString("en-NG"),
      note: `Across ${products.length} product${products.length === 1 ? "" : "s"}`,
      icon: "box" as const,
      alert: false,
    },
    {
      label: "Low stock",
      value: `${lowStock.length}`,
      note: lowStock.length > 0 ? lowStock.map((p) => p.name).join(", ") : "Nothing low",
      icon: "shield" as const,
      alert: lowStock.length > 0,
    },
    {
      label: "Out of stock",
      value: `${outOfStock.length}`,
      note:
        outOfStock.length > 0
          ? outOfStock.map((p) => p.name).join(", ")
          : "Everything available",
      icon: "seal" as const,
      alert: outOfStock.length > 0,
    },
  ];

  return (
    <>
      <div className="mb-gutter-md flex flex-wrap items-start justify-between gap-gutter-md">
        <div className="max-w-2xl">
          <h1 className="text-headline-lg text-cacao">Inventory</h1>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            Stock on hand across published and draft products. Edit a product to change
            its stock or restock threshold.
          </p>
        </div>
      </div>

      <ul className="grid gap-gutter-sm sm:grid-cols-3">
        {stats.map((stat) => {
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
                  <p className="font-label text-label-sm text-nutmeg">{stat.label}</p>
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

      {/* Data passed down, never imported by the client component. */}
      <InventoryTable products={products} />
    </>
  );
}
