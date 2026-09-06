import { cn } from "@lamiefoods/ui";
import { Delta, RevenueChart } from "@/components/admin/revenue-chart";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ICONS } from "@/components/ui/icons";
import {
  ADMIN_BEST_SELLERS,
  ADMIN_DISPATCHES,
  ADMIN_FLEET,
  ADMIN_FLEET_CARD,
  ADMIN_RANGES,
  ADMIN_REVENUE_SERIES,
  ADMIN_STATS,
  ADMIN_STOCK,
} from "@/content/admin-dashboard";
import { formatKobo } from "@/lib/money";

/**
 * Operations dashboard.
 *
 * Every figure here is sample data — there is no backend. The banner says so,
 * and the route only exists in development (see the portal layout).
 *
 * Controls that would act on real data (date range, CSV export, reorder, log a
 * batch) are disabled rather than wired to nothing: on an operations screen, a
 * button that silently does nothing is worse than one that is plainly not ready.
 */
export function AdminDashboard() {
  return (
    <>
      <div
        role="note"
        className="mb-gutter-md flex items-start gap-gutter-sm rounded border border-error/40 bg-error-container p-gutter-sm text-on-error-container"
      >
        <ICONS.shield className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-body-sm">
          <strong className="font-semibold">Sample data — nothing here is real.</strong>{" "}
          There is no backend, no orders and no customers; the people and figures below
          are invented for layout review. This page exists in development only and is
          compiled out of production builds, because it would otherwise show customer data
          on an unauthenticated URL.
        </p>
      </div>

      <div className="mb-gutter-md flex flex-wrap items-end justify-between gap-gutter-sm">
        <div>
          <p className="font-label text-label-caps text-terracotta uppercase">
            Executive terminal
          </p>
          <h1 className="mt-1 text-headline-lg text-cacao">
            Atelier Overview &amp; Operations
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Production dispatch, settlement and inventory at a glance.
          </p>
        </div>

        {/* Ranges do not filter anything yet — there is no data to filter. */}
        <div
          role="group"
          aria-label="Date range (not active)"
          className="flex rounded border border-rule/70 bg-surface"
        >
          {ADMIN_RANGES.map((range, index) => {
            const RangeIcon = range.icon ? ICONS[range.icon] : null;
            return (
              <span
                key={range.label}
                aria-disabled="true"
                className={cn(
                  "flex min-h-11 items-center gap-gutter-xs px-gutter-sm font-label text-label-sm",
                  index === 1 ? "bg-primary-container text-linen" : "text-nutmeg/70",
                )}
              >
                {range.label}
                {RangeIcon && <RangeIcon className="h-4 w-4" />}
              </span>
            );
          })}
        </div>
      </div>

      <ul className="grid gap-gutter-sm sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_STATS.map((stat) => (
          <li
            key={stat.label}
            className="rounded border border-rule/70 bg-surface p-gutter-md"
          >
            <div className="flex items-start justify-between gap-gutter-sm">
              <p className="font-label text-label-sm text-nutmeg uppercase">
                {stat.label}
              </p>
              <Delta value={stat.delta} />
            </div>
            <p className="mt-gutter-xs font-display text-headline-lg text-cacao">
              {stat.isMoney ? formatKobo(stat.value) : stat.value}
            </p>
            <p className="mt-1 text-body-sm text-nutmeg">{stat.note}</p>
          </li>
        ))}
      </ul>

      <div className="mt-gutter-sm grid gap-gutter-sm xl:grid-cols-3">
        <section className="rounded border border-rule/70 bg-surface p-gutter-md xl:col-span-2">
          <p className="font-label text-label-caps text-terracotta uppercase">
            Trajectory &amp; yield
          </p>
          <h2 className="mt-1 text-headline-sm text-cacao">Flavour revenue</h2>

          <div className="mt-gutter-md">
            <RevenueChart />
          </div>

          <dl className="mt-gutter-md grid gap-gutter-sm border-t border-rule/70 pt-gutter-sm sm:grid-cols-3">
            {ADMIN_REVENUE_SERIES.totals.map((total) => (
              <div key={total.name}>
                <dt className="font-label text-label-sm text-nutmeg uppercase">
                  {total.name}
                </dt>
                <dd className="mt-1 flex items-baseline gap-gutter-xs">
                  <span className="font-display text-headline-sm text-cacao">
                    {formatKobo(total.value)}
                  </span>
                  <Delta value={total.delta} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded border border-rule/70 bg-surface p-gutter-md">
          <p className="font-label text-label-caps text-terracotta uppercase">
            Atelier volume
          </p>
          <h2 className="mt-1 text-headline-sm text-cacao">Best selling</h2>

          <ul className="mt-gutter-md space-y-4">
            {ADMIN_BEST_SELLERS.map((item) => (
              <li key={item.name}>
                <div className="flex items-baseline justify-between gap-gutter-sm">
                  <p className="text-body-sm font-semibold text-cacao">{item.name}</p>
                  <p className="shrink-0 font-label text-label-sm text-terracotta">
                    {item.jars} · {item.share}%
                  </p>
                </div>
                <div
                  aria-hidden="true"
                  className="mt-1 h-1.5 w-full overflow-hidden rounded-sm bg-rule/50"
                >
                  <div
                    className="h-full rounded-sm bg-terracotta"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
                <p className="mt-1 text-body-sm text-nutmeg">{item.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-gutter-sm grid gap-gutter-sm xl:grid-cols-3">
        <section className="min-w-0 rounded border border-rule/70 bg-surface p-gutter-md xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-gutter-sm">
            <div>
              <p className="font-label text-label-caps text-terracotta uppercase">
                Culinary dispatch log
              </p>
              <h2 className="mt-1 text-headline-sm text-cacao">Recent dispatches</h2>
            </div>
            <div className="flex items-center gap-gutter-xs">
              <Button variant="secondary" disabled>
                Export CSV
              </Button>
              {/* Disabled: there is no orders screen to view them all in. */}
              <span
                aria-disabled="true"
                className="inline-flex min-h-11 cursor-not-allowed items-center gap-gutter-xs font-label text-label-sm text-nutmeg/70 uppercase"
              >
                View all
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* Wide table scrolls inside its own container so the page never does. */}
          <div className="mt-gutter-md overflow-x-auto">
            <table className="w-full min-w-160 border-collapse text-left">
              <caption className="sr-only">
                Recent dispatches — sample data, not real orders
              </caption>
              <thead>
                <tr className="border-b border-rule/70">
                  {[
                    "Order",
                    "Customer",
                    "Selection",
                    "Value",
                    "Payment",
                    "Fulfilment",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="py-2 pr-4 font-label text-label-sm text-nutmeg uppercase"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ADMIN_DISPATCHES.map((row) => (
                  <tr key={row.id} className="border-b border-rule/40 last:border-b-0">
                    <th
                      scope="row"
                      className="py-3 pr-4 font-label text-label-sm font-normal text-terracotta"
                    >
                      #{row.id}
                    </th>
                    <td className="py-3 pr-4">
                      <span className="block text-body-sm text-cacao">
                        {row.customer}
                      </span>
                      <span className="block text-body-sm text-nutmeg">{row.area}</span>
                    </td>
                    <td className="py-3 pr-4 text-body-sm text-on-surface-variant">
                      {row.items}
                    </td>
                    <td className="py-3 pr-4 font-label text-label-sm text-cacao">
                      {formatKobo(row.value)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={cn(
                          "rounded-sm px-2 py-1 font-label text-label-sm",
                          row.payment === "Paid"
                            ? "bg-secondary-container text-on-secondary-fixed"
                            : "bg-error-container text-on-error-container",
                        )}
                      >
                        {row.payment}
                      </span>
                    </td>
                    <td className="py-3 font-label text-label-sm text-on-surface-variant">
                      {row.fulfilment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col gap-gutter-sm">
          <section className="rounded border border-rule/70 bg-surface p-gutter-md">
            <p className="font-label text-label-caps text-terracotta uppercase">
              Kitchen &amp; pantry
            </p>
            <h2 className="mt-1 text-headline-sm text-cacao">Stock &amp; ingredients</h2>

            <ul className="mt-gutter-md space-y-3">
              {ADMIN_STOCK.map((item) => (
                <li
                  key={item.name}
                  className="flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      item.level === "low"
                        ? "bg-error"
                        : item.level === "ordered"
                          ? "bg-tertiary"
                          : "bg-terracotta",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-semibold text-cacao">{item.name}</p>
                    <p className="text-body-sm text-nutmeg">{item.detail}</p>
                  </div>
                  {item.action && (
                    <span className="shrink-0 font-label text-label-sm text-nutmeg/70 uppercase">
                      {item.action}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <Button disabled className="mt-gutter-md w-full">
              Log new raw batch
            </Button>
          </section>

          <section className="rounded border border-rule/70 bg-surface p-gutter-md">
            <div className="flex items-start justify-between gap-gutter-sm">
              <div>
                <p className="font-label text-label-caps text-terracotta uppercase">
                  {ADMIN_FLEET_CARD.eyebrow}
                </p>
                <h2 className="mt-1 text-headline-sm text-cacao">
                  {ADMIN_FLEET_CARD.title}
                </h2>
              </div>
              <ICONS.truck className="mt-1 h-5 w-5 shrink-0 text-terracotta" />
            </div>

            <ul className="mt-gutter-md space-y-3">
              {ADMIN_FLEET.map((zone) => (
                <li key={zone.zone} className="flex items-start gap-gutter-sm">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      zone.status === "active" ? "bg-terracotta" : "bg-rule",
                    )}
                  />
                  <p className="min-w-0 flex-1 text-body-sm text-cacao">{zone.zone}</p>
                  <p className="max-w-24 shrink-0 text-right text-body-sm text-nutmeg">
                    {zone.detail}
                  </p>
                </li>
              ))}
            </ul>

            {/* Disabled: there is no tracking board to open. */}
            <span
              aria-disabled="true"
              className="mt-gutter-md flex min-h-11 cursor-not-allowed items-center gap-gutter-xs border-t border-rule/70 pt-gutter-sm font-label text-label-sm text-terracotta/70"
            >
              <ICONS.board className="h-4 w-4" />
              {ADMIN_FLEET_CARD.trackingBoard}
            </span>
          </section>
        </div>
      </div>
    </>
  );
}
