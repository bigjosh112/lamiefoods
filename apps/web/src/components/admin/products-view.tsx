import { cn } from "@lamiefoods/ui";
import { ProductsList } from "@/components/admin/products-list";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import {
  ADMIN_PRODUCTS,
  PRODUCTS_FOOTER,
  PRODUCTS_PAGE,
  PRODUCTS_STATS,
  PRODUCTS_TABS,
} from "@/content/admin-products";

/**
 * Product catalogue & SKU management.
 *
 * The three live products come from the shared catalogue, so this view cannot
 * show a different name, image or price from the storefront. Only operational
 * fields — SKU, stock, status — are admin-specific.
 *
 * Chrome comes from `AdminShell`; every write action is disabled.
 */
export function ProductsView() {
  return (
    <>
      <div
        role="note"
        className="mb-gutter-md flex items-start gap-gutter-sm rounded border border-error/40 bg-error-container p-gutter-sm text-on-error-container"
      >
        <ICONS.shield className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-body-sm">
          <strong className="font-semibold">
            Product names, images and prices are real catalogue data.
          </strong>{" "}
          Stock counts and the two pipeline products are invented, and nothing here can be
          edited — there is no catalogue service behind it.
        </p>
      </div>

      <div className="mb-gutter-md flex flex-wrap items-start justify-between gap-gutter-md">
        <div className="max-w-2xl">
          <p className="flex flex-wrap items-center gap-gutter-xs font-label text-label-caps text-terracotta uppercase">
            {PRODUCTS_PAGE.eyebrow}
            <span aria-hidden="true" className="text-nutmeg">
              /
            </span>
            <span className="text-nutmeg">{PRODUCTS_PAGE.hub}</span>
          </p>
          <h1 className="mt-1 text-headline-lg text-cacao">{PRODUCTS_PAGE.title}</h1>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            {PRODUCTS_PAGE.body}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-gutter-xs">
          {PRODUCTS_PAGE.actions.map((action) => {
            const Icon = ICONS[action.icon];
            return (
              <Button
                key={action.label}
                variant={action.primary ? "primary" : "secondary"}
                disabled
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      <ul className="grid gap-gutter-sm sm:grid-cols-2 xl:grid-cols-4">
        {PRODUCTS_STATS.map((stat) => {
          const Icon = ICONS[stat.icon];
          return (
            <li
              key={stat.label}
              className="rounded border border-rule/70 bg-surface p-gutter-md"
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

      {/* Data passed down, never imported by the client component. */}
      <ProductsList
        products={ADMIN_PRODUCTS}
        tabs={[...PRODUCTS_TABS]}
        searchPlaceholder={PRODUCTS_PAGE.searchPlaceholder}
      />

      <section className="mt-gutter-sm flex flex-wrap items-center justify-between gap-gutter-sm rounded border border-rule/70 bg-surface-container p-gutter-md">
        <div className="flex items-start gap-gutter-sm">
          <ICONS.board className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
          <div>
            <p className="font-label text-label-sm text-cacao uppercase">
              {PRODUCTS_FOOTER.title}
            </p>
            <p className="mt-1 max-w-2xl text-body-sm text-on-surface-variant">
              {PRODUCTS_FOOTER.body}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-gutter-xs font-label text-label-sm text-nutmeg">
          <ICONS.seal className="h-4 w-4" />
          {PRODUCTS_FOOTER.note}
        </span>
      </section>
    </>
  );
}
