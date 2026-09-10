import { ADMIN_ROUTES } from "@lamiefoods/config";
import type { Product } from "@lamiefoods/types";
import { ButtonLink } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import { ProductsList } from "@/components/admin/products-list";
import { stockStatus } from "@/lib/admin/stock-status";

/**
 * Real product catalogue. Replaces the sample-data screen that used to live
 * at this route — see `docs/ai-memory/architecture.md`'s 2026-09-07 decision
 * log ("real product catalog"). The two fictional "pipeline" products
 * (Spiced Plantain Crisps, Honey Glazed Chin-Chin) are gone: a real,
 * unpublished product (`storefrontActive: false`) is what "not live yet"
 * actually looks like now, not a hardcoded placeholder nobody can edit.
 *
 * Rows arrive as PROPS, never imported directly — the exact rule that closed
 * the client-bundle PII leak documented in GAP-009 for orders; the same
 * discipline applies here even though product data isn't personal, for
 * consistency with every other admin list in this app.
 */
export function ProductsView({ products }: { products: Product[] }) {
  const published = products.filter((product) => product.storefrontActive);
  const drafts = products.filter((product) => !product.storefrontActive);
  const lowStockCount = products.reduce(
    (count, product) =>
      count + product.packs.filter((pack) => stockStatus(pack) === "low-stock").length,
    0,
  );

  return (
    <div className="p-gutter-lg">
      <div className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
        <div>
          <h1 className="text-headline-lg text-cacao">Products</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Every product, published or draft.
          </p>
        </div>
        <ButtonLink href={ADMIN_ROUTES.newProduct} className="normal-case">
          <ICONS.gift className="h-4 w-4" />
          Add new product
        </ButtonLink>
      </div>

      <div className="mt-gutter-md grid gap-gutter-sm sm:grid-cols-3">
        <StatCard icon="gift" label="Published" value={String(published.length)} />
        <StatCard icon="box" label="Drafts" value={String(drafts.length)} />
        <StatCard
          icon="shield"
          label="Low stock"
          value={
            lowStockCount > 0
              ? `${lowStockCount} size${lowStockCount === 1 ? "" : "s"}`
              : "Healthy"
          }
          highlight={lowStockCount > 0}
        />
      </div>

      <div className="mt-gutter-md">
        <ProductsList products={products} />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: keyof typeof ICONS;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const Icon = ICONS[icon];
  return (
    <div
      className={
        highlight
          ? "rounded border border-terracotta bg-secondary-container/40 p-gutter-sm"
          : "rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
      }
    >
      <p className="flex items-center gap-gutter-xs font-label text-label-sm text-nutmeg">
        <Icon className="h-4 w-4 text-terracotta" />
        {label}
      </p>
      <p className="mt-1 font-numeral text-headline-md text-cacao">{value}</p>
    </div>
  );
}
