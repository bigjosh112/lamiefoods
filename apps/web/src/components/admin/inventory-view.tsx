import type { Product } from "@lamiefoods/types";
import { cn } from "@lamiefoods/ui";
import { InventoryTable } from "@/components/admin/inventory-table";
import { ICONS } from "@/components/ui/icons";
import { stockStatus } from "@/lib/admin/stock-status";

/**
 * Inventory — one sellable unit per packaging size.
 *
 * Stock / restock threshold live on `product_packs` (see architecture.md,
 * 2026-09-10). Stats and the table flatten products → packs so a sold-out
 * 100g pouch does not hide that the 500g is still available.
 *
 * Chrome comes from `AdminShell`.
 */
export function InventoryView({ products }: { products: Product[] }) {
  const packs = products.flatMap((product) =>
    product.packs.map((pack) => ({
      product,
      pack,
      status: stockStatus(pack),
      label: `${product.name} · ${pack.name}`,
    })),
  );

  const finishedUnits = packs.reduce((sum, row) => sum + row.pack.stockQuantity, 0);
  const lowStock = packs.filter((row) => row.status === "low-stock");
  const outOfStock = packs.filter((row) => row.status === "out-of-stock");

  const stats = [
    {
      label: "Total stock on hand",
      value: finishedUnits.toLocaleString("en-NG"),
      note: `Across ${packs.length} size${packs.length === 1 ? "" : "s"}`,
      icon: "box" as const,
      alert: false,
    },
    {
      label: "Low stock",
      value: `${lowStock.length}`,
      note:
        lowStock.length > 0 ? lowStock.map((row) => row.label).join(", ") : "Nothing low",
      icon: "shield" as const,
      alert: lowStock.length > 0,
    },
    {
      label: "Out of stock",
      value: `${outOfStock.length}`,
      note:
        outOfStock.length > 0
          ? outOfStock.map((row) => row.label).join(", ")
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
            Stock on hand for each pouch size. Edit a product to update its stock, SKU, or
            restock threshold.
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

      <InventoryTable products={products} />
    </>
  );
}
