import Link from "next/link";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import type { Product } from "@lamiefoods/types";
import { RevenueChart, type RevenueChartSeries } from "@/components/admin/revenue-chart";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, ICONS } from "@/components/ui/icons";
import { ADMIN_RANGES } from "@/content/admin-dashboard";
import { formatKobo } from "@/lib/money";
import type {
  AdminOrderSummary,
  BestSeller,
  DashboardStats,
} from "@/server/orders/repository";

/** Only the non-terminal statuses `listOrdersNeedingDispatch` can return —
 *  `pending` included because the manual "mark as paid" action can leave an
 *  order paid but still `pending` if the owner hasn't touched its status yet. */
const DISPATCH_STATUS_LABEL: Partial<Record<AdminOrderSummary["status"], string>> = {
  pending: "Paid, awaiting prep",
  paid: "Paid, awaiting prep",
  processing: "In the kitchen",
};

/**
 * Operations dashboard.
 *
 * As of 2026-09-08 every number on this page is real — fetched by the page
 * from `server/orders/repository.ts` and `server/products/repository.ts` and
 * passed in as props, the same rule that closed the client-bundle PII leak
 * in GAP-009 (never import sensitive data directly into a client component).
 * With no real orders yet, that means every figure below legitimately reads
 * as zero or empty — that IS the correct state, not a placeholder for one.
 *
 * Two things the previous, sample-data version of this page showed have no
 * real data source anywhere in the schema and were removed rather than kept
 * fake: a rider/delivery-fleet tracking card, and packaging-materials stock
 * (kraft pouches, glass jars) — `products` only tracks finished-goods stock.
 *
 * Controls that would act on real data (date range, CSV export, reorder, log a
 * batch) are disabled rather than wired to nothing: on an operations screen, a
 * button that silently does nothing is worse than one that is plainly not ready.
 */
export function AdminDashboard({
  needsDispatch,
  recentOrders,
  stats,
  activeFlavourCount,
  revenueSeries,
  bestSellers,
  lowStockProducts,
}: {
  needsDispatch: AdminOrderSummary[];
  recentOrders: AdminOrderSummary[];
  stats: DashboardStats;
  activeFlavourCount: number;
  revenueSeries: RevenueChartSeries;
  bestSellers: BestSeller[];
  lowStockProducts: Product[];
}) {
  const statTiles = [
    {
      label: "Settled revenue",
      value: formatKobo(stats.settledRevenue.amount),
      note: "Paystack- or bank-transfer-settled, all time",
    },
    {
      label: "Orders",
      value: stats.orderCount.toLocaleString("en-NG"),
      note: "All orders placed, any status",
    },
    {
      label: "Customers",
      value: stats.customerCount.toLocaleString("en-NG"),
      note: "Distinct customer emails",
    },
    {
      label: "Active flavours",
      value: activeFlavourCount.toLocaleString("en-NG"),
      note: "Published on the storefront",
    },
  ];

  return (
    <>
      <section className="mb-gutter-md rounded border border-terracotta/60 bg-secondary-container/30 p-gutter-md">
        <div className="flex flex-wrap items-center justify-between gap-gutter-sm">
          <div>
            <p className="font-label text-label-caps text-terracotta uppercase">
              Real orders
            </p>
            <h2 className="mt-1 text-headline-sm text-cacao">
              Needs dispatch ({needsDispatch.length})
            </h2>
          </div>
          <ButtonLink href={ADMIN_ROUTES.orders} variant="secondary">
            All orders
            <ArrowRightIcon className="h-4 w-4" />
          </ButtonLink>
        </div>

        {needsDispatch.length === 0 ? (
          <p className="mt-gutter-sm text-body-sm text-on-surface-variant">
            Nothing waiting on dispatch right now.
          </p>
        ) : (
          <ul className="mt-gutter-sm space-y-2">
            {needsDispatch.slice(0, 5).map((order) => (
              <li key={order.id}>
                <Link
                  href={ADMIN_ROUTES.order(order.reference)}
                  className="flex flex-wrap items-center justify-between gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-sm transition-colors hover:border-terracotta"
                >
                  <span>
                    <span className="font-label text-label-md text-terracotta">
                      #{order.reference}
                    </span>{" "}
                    <span className="text-body-sm text-on-surface-variant">
                      {order.customerName} · {order.city}
                    </span>
                  </span>
                  <span className="font-label text-label-sm text-nutmeg uppercase">
                    {DISPATCH_STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

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

        {/* Ranges do not filter anything yet — every figure above is all-time. */}
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
        {statTiles.map((stat) => (
          <li
            key={stat.label}
            className="rounded border border-rule/70 bg-surface p-gutter-md"
          >
            <p className="font-label text-label-sm text-nutmeg uppercase">{stat.label}</p>
            <p className="mt-gutter-xs font-display text-headline-lg text-cacao">
              {stat.value}
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
          <h2 className="mt-1 text-headline-sm text-cacao">
            Flavour revenue (last 7 days)
          </h2>

          <div className="mt-gutter-md">
            {revenueSeries.series.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">
                No published products yet.
              </p>
            ) : (
              <RevenueChart {...revenueSeries} />
            )}
          </div>
        </section>

        <section className="rounded border border-rule/70 bg-surface p-gutter-md">
          <p className="font-label text-label-caps text-terracotta uppercase">
            Atelier volume
          </p>
          <h2 className="mt-1 text-headline-sm text-cacao">Best selling (all time)</h2>

          {bestSellers.length === 0 ? (
            <p className="mt-gutter-md text-body-sm text-on-surface-variant">
              No paid orders yet.
            </p>
          ) : (
            <ul className="mt-gutter-md space-y-4">
              {bestSellers.map((item) => (
                <li key={item.slug}>
                  <div className="flex items-baseline justify-between gap-gutter-sm">
                    <p className="text-body-sm font-semibold text-cacao">
                      {item.productName}
                    </p>
                    <p className="shrink-0 font-label text-label-sm text-terracotta">
                      {item.unitsSold} sold
                    </p>
                  </div>
                  <p className="mt-1 text-body-sm text-nutmeg">
                    {formatKobo(item.revenue.amount)} settled
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-gutter-sm grid gap-gutter-sm xl:grid-cols-3">
        <section className="min-w-0 rounded border border-rule/70 bg-surface p-gutter-md xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-gutter-sm">
            <div>
              <p className="font-label text-label-caps text-terracotta uppercase">
                Culinary dispatch log
              </p>
              <h2 className="mt-1 text-headline-sm text-cacao">Recent orders</h2>
            </div>
            <div className="flex items-center gap-gutter-xs">
              <ButtonAnchor
                href="/api/admin/orders/export"
                variant="secondary"
                download
              >
                Export CSV
              </ButtonAnchor>
              <Link
                href={ADMIN_ROUTES.orders}
                className="inline-flex min-h-11 items-center gap-gutter-xs font-label text-label-sm text-terracotta uppercase transition-colors hover:text-cacao"
              >
                All orders
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <p className="mt-gutter-md text-body-sm text-on-surface-variant">
              No orders yet.
            </p>
          ) : (
            /* Wide table scrolls inside its own container so the page never does. */
            <div className="mt-gutter-md overflow-x-auto">
              <table className="w-full min-w-160 border-collapse text-left">
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
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-rule/40 last:border-b-0"
                    >
                      <th
                        scope="row"
                        className="py-3 pr-4 font-label text-label-sm font-normal text-terracotta"
                      >
                        <Link
                          href={ADMIN_ROUTES.order(order.reference)}
                          className="hover:underline"
                        >
                          #{order.reference}
                        </Link>
                      </th>
                      <td className="py-3 pr-4">
                        <span className="block text-body-sm text-cacao">
                          {order.customerName}
                        </span>
                        <span className="block text-body-sm text-nutmeg">
                          {order.city}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-body-sm text-on-surface-variant">
                        {order.itemSummary || "—"}
                      </td>
                      <td className="py-3 pr-4 font-label text-label-sm text-cacao">
                        {formatKobo(order.subtotal.amount)}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            "rounded-sm px-2 py-1 font-label text-label-sm",
                            order.paymentStatus === "paid"
                              ? "bg-secondary-container text-on-secondary-fixed"
                              : "bg-error-container text-on-error-container",
                          )}
                        >
                          {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 font-label text-label-sm text-on-surface-variant">
                        {order.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded border border-rule/70 bg-surface p-gutter-md">
          <p className="font-label text-label-caps text-terracotta uppercase">
            Kitchen &amp; pantry
          </p>
          <h2 className="mt-1 text-headline-sm text-cacao">Stock &amp; ingredients</h2>

          {lowStockProducts.length === 0 ? (
            <p className="mt-gutter-md text-body-sm text-on-surface-variant">
              Every published product is above its restock threshold.
            </p>
          ) : (
            <ul className="mt-gutter-md space-y-3">
              {lowStockProducts.map((product) => (
                <li
                  key={product.id}
                  className="flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      product.stockQuantity <= 0 ? "bg-error" : "bg-terracotta",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-semibold text-cacao">
                      {product.name}
                    </p>
                    <p className="text-body-sm text-nutmeg">
                      {product.stockQuantity} in stock
                      {product.restockThreshold !== null &&
                        ` — threshold ${product.restockThreshold}`}
                    </p>
                  </div>
                  <ButtonLink
                    href={ADMIN_ROUTES.editProduct(product.slug)}
                    variant="secondary"
                    className="shrink-0"
                  >
                    Edit
                  </ButtonLink>
                </li>
              ))}
            </ul>
          )}

          <Link
            href={ADMIN_ROUTES.inventory}
            className="mt-gutter-md flex min-h-11 items-center gap-gutter-xs border-t border-rule/70 pt-gutter-sm font-label text-label-sm text-terracotta uppercase transition-colors hover:text-cacao"
          >
            <ICONS.timer className="h-4 w-4" />
            Full inventory
          </Link>
        </section>
      </div>
    </>
  );
}
