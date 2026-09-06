import { cn } from "@lamiefoods/ui";
import { OrdersTable } from "@/components/admin/orders-table";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ICONS } from "@/components/ui/icons";
import {
  ORDERS_BATCH_ACTIONS,
  ORDERS_CLUSTERS,
  ORDERS_PAGE,
  ORDERS_PAGINATION,
  ORDERS_RESERVES,
  ORDERS_ROWS,
  ORDERS_STATS,
  ORDERS_TABS,
} from "@/content/admin-orders";
import { formatKobo } from "@/lib/money";

/**
 * Orders & fulfilment screen.
 *
 * Uses the same `AdminShell` as the dashboard — sidebar, top bar and operator
 * card come from the layout, so the two screens cannot drift apart.
 *
 * Everything that would act on real data is disabled: export, print, courier
 * assignment, search, filters and pagination. Row selection IS live, since that
 * is UI state rather than a stand-in for a backend.
 */
export function OrdersView() {
  return (
    <>
      <div
        role="note"
        className="mb-gutter-md flex items-start gap-gutter-sm rounded border border-error/40 bg-error-container p-gutter-sm text-on-error-container"
      >
        <ICONS.shield className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-body-sm">
          <strong className="font-semibold">Sample data — nothing here is real.</strong>{" "}
          There are no orders and no customers; the names, phone numbers and addresses
          below are invented for layout review. This screen exists in development only.
        </p>
      </div>

      <div className="mb-gutter-md flex flex-wrap items-start justify-between gap-gutter-md">
        <div className="max-w-2xl">
          <p className="flex items-center gap-gutter-xs font-label text-label-caps text-terracotta uppercase">
            {ORDERS_PAGE.eyebrow}
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-terracotta" />
            <span className="text-nutmeg">{ORDERS_PAGE.batchCycle}</span>
          </p>
          <h1 className="mt-1 text-headline-lg text-cacao">{ORDERS_PAGE.title}</h1>
          <p className="mt-gutter-sm inline-block rounded-sm bg-secondary-container px-2 py-1 font-label text-label-sm text-on-secondary-fixed">
            {ORDERS_PAGE.totalChip}
          </p>
          <p className="mt-gutter-sm text-body-sm text-on-surface-variant">
            {ORDERS_PAGE.body}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-gutter-xs">
          {ORDERS_PAGE.actions.map((action) => {
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
        {ORDERS_STATS.map((stat) => {
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
                  <p className="mt-gutter-xs font-display text-headline-md text-cacao">
                    {stat.isMoney && typeof stat.value === "number"
                      ? formatKobo(stat.value)
                      : stat.value}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded bg-secondary-container text-primary"
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-gutter-xs text-body-sm text-nutmeg">{stat.note}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-gutter-sm">
        {/* Data is passed down, never imported by the client component — see
            the note in orders-table.tsx. */}
        <OrdersTable
          rows={ORDERS_ROWS}
          tabs={ORDERS_TABS}
          pagination={ORDERS_PAGINATION}
          batchActions={ORDERS_BATCH_ACTIONS}
        />
      </div>

      <div className="mt-gutter-sm grid gap-gutter-sm xl:grid-cols-3">
        <section className="rounded border border-rule/70 bg-surface p-gutter-md xl:col-span-2">
          <p className="font-label text-label-caps text-terracotta uppercase">
            {ORDERS_CLUSTERS.eyebrow}
          </p>
          <h2 className="mt-1 text-headline-sm text-cacao">{ORDERS_CLUSTERS.title}</h2>

          {/* No mapping provider is wired, and no GPS feed exists — the mock's
              "Live GPS feed" badge would be a false claim, so the map area is a
              labelled placeholder and the cluster counts carry the information. */}
          <div className="mt-gutter-md flex aspect-21/9 items-center justify-center rounded border border-rule/70 bg-surface-container">
            <p className="font-label text-label-sm text-nutmeg/70 uppercase">
              {ORDERS_CLUSTERS.placeholder}
            </p>
          </div>

          <ul className="mt-gutter-sm grid gap-gutter-sm sm:grid-cols-3">
            {ORDERS_CLUSTERS.zones.map((zone) => (
              <li
                key={zone.name}
                className="flex items-start gap-gutter-xs rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-terracotta"
                />
                <span className="min-w-0">
                  <span className="block text-body-sm text-cacao">{zone.name}</span>
                  <span className="block text-body-sm text-nutmeg">
                    {zone.orders} orders
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-gutter-sm flex flex-wrap justify-between gap-gutter-sm border-t border-rule/70 pt-gutter-sm">
            {[
              {
                label: "Average transit",
                value: ORDERS_CLUSTERS.transit.replace("Average transit ", ""),
              },
              ...ORDERS_CLUSTERS.footer,
            ].map((entry) => (
              <div key={entry.label} className="flex items-baseline gap-gutter-xs">
                <dt className="font-label text-label-sm text-nutmeg uppercase">
                  {entry.label}
                </dt>
                <dd className="font-label text-label-sm text-cacao">{entry.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded border border-rule/70 bg-surface p-gutter-md">
          <div className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
            <p className="font-label text-label-caps text-terracotta uppercase">
              {ORDERS_RESERVES.eyebrow}
            </p>
            <p className="font-label text-label-sm text-tertiary">
              {ORDERS_RESERVES.status}
            </p>
          </div>
          <h2 className="mt-1 text-headline-sm text-cacao">{ORDERS_RESERVES.title}</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {ORDERS_RESERVES.body}
          </p>

          <dl className="mt-gutter-md space-y-4">
            {ORDERS_RESERVES.items.map((item) => (
              <div key={item.name}>
                <div className="flex items-baseline justify-between gap-gutter-sm">
                  <dt className="min-w-0 text-body-sm text-cacao">{item.name}</dt>
                  <dd className="shrink-0 text-right font-label text-label-sm text-terracotta">
                    {item.pct}% {item.state}
                  </dd>
                </div>
                <div
                  aria-hidden="true"
                  className="mt-1 h-1.5 w-full overflow-hidden rounded-sm bg-rule/50"
                >
                  <div
                    className={cn("h-full rounded-sm", "bg-terracotta")}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </dl>

          {/* Disabled: there is no QA sign-off flow behind this. */}
          <span
            aria-disabled="true"
            className="mt-gutter-md flex min-h-11 cursor-not-allowed items-center gap-gutter-xs rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
          >
            <ICONS.shield className="h-4 w-4 shrink-0 text-terracotta" />
            <span className="flex-1 text-body-sm text-on-surface-variant">
              {ORDERS_RESERVES.signOff}
            </span>
            <ArrowRightIcon className="h-4 w-4 text-nutmeg/70" />
          </span>
        </section>
      </div>
    </>
  );
}
