import Link from "next/link";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import type { Product, ProductPack } from "@lamiefoods/types";
import { RevenueChart, type RevenueChartSeries } from "@/components/admin/revenue-chart";
import { Button, ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, ICONS } from "@/components/ui/icons";
import { ADMIN_RANGES } from "@/content/admin-dashboard";
import type { DashboardDateWindow } from "@/lib/admin/dashboard-range";
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
 * `paymentStatus` is a lower-case column value, so an unpaid row used to render
 * a literal "unpaid" beside a capitalised "Paid" — inconsistent in the same
 * column. Mapped rather than CSS-capitalised so the label stays readable in the
 * markup and a new status has to be named deliberately.
 */
const PAYMENT_LABEL: Record<string, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  pending: "Pending",
  refunded: "Refunded",
  failed: "Failed",
};

/**
 * Operations dashboard.
 *
 * Numbers are server-fetched and passed as props. Date range (`dateWindow`)
 * scopes settled revenue, order count, and the flavour revenue chart via
 * `?range=` on this page. Best sellers, customers, flavours, and inventory
 * stay all-time / operational.
 */
export function AdminDashboard({
  needsDispatch,
  recentOrders,
  stats,
  activeFlavourCount,
  revenueSeries,
  bestSellers,
  lowStockPacks,
  dateWindow,
}: {
  needsDispatch: AdminOrderSummary[];
  recentOrders: AdminOrderSummary[];
  stats: DashboardStats;
  activeFlavourCount: number;
  revenueSeries: RevenueChartSeries;
  bestSellers: BestSeller[];
  lowStockPacks: { product: Product; pack: ProductPack }[];
  dateWindow: DashboardDateWindow;
}) {
  const periodNote = dateWindow.label;
  const statTiles = [
    {
      label: "Settled revenue",
      value: formatKobo(stats.settledRevenue.amount),
      note: `Paid product revenue · ${periodNote}`,
    },
    {
      label: "Orders",
      value: stats.orderCount.toLocaleString("en-NG"),
      note: `Orders placed · ${periodNote}`,
    },
    {
      label: "Customers",
      value: stats.customerCount.toLocaleString("en-NG"),
      note: "Distinct customer emails (all time)",
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
            <h2 className="text-headline-sm text-cacao">
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
          <h1 className="text-headline-lg text-cacao">Dashboard overview.</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Orders, payments, and inventory at a glance.
          </p>
        </div>

        <div className="flex w-full flex-col items-stretch gap-gutter-xs sm:w-auto sm:items-end">
          <div
            role="group"
            aria-label="Date range"
            className="flex max-w-full flex-wrap rounded-md border border-rule/70 bg-surface"
          >
            {ADMIN_RANGES.map((range, index) => {
              const RangeIcon = range.icon ? ICONS[range.icon] : null;
              const active = dateWindow.range === range.id;
              const href =
                range.id === "custom"
                  ? `${ADMIN_ROUTES.dashboard}?range=custom&from=${encodeURIComponent(dateWindow.from)}&to=${encodeURIComponent(dateWindow.to)}`
                  : `${ADMIN_ROUTES.dashboard}?range=${range.id}`;
              return (
                <Link
                  key={range.id}
                  href={href}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex min-h-11 min-w-0 items-center gap-gutter-xs px-gutter-sm font-label text-label-sm transition-colors",
                    index > 0 && "border-l border-rule/70",
                    active
                      ? "bg-primary-container text-linen"
                      : "text-nutmeg hover:bg-surface-container hover:text-cacao",
                  )}
                >
                  {range.label}
                  {RangeIcon && <RangeIcon className="h-4 w-4" />}
                </Link>
              );
            })}
          </div>

          {dateWindow.range === "custom" ? (
            <form
              method="get"
              action={ADMIN_ROUTES.dashboard}
              className="flex flex-wrap items-end gap-gutter-xs rounded-md border border-rule/70 bg-surface p-gutter-xs"
            >
              <input type="hidden" name="range" value="custom" />
              <label className="grid gap-1 text-body-sm text-nutmeg">
                From
                <input
                  type="date"
                  name="from"
                  required
                  defaultValue={dateWindow.from}
                  className="min-h-11 rounded border border-rule bg-[#f8f3ec] px-2 text-body-md text-cacao"
                />
              </label>
              <label className="grid gap-1 text-body-sm text-nutmeg">
                To
                <input
                  type="date"
                  name="to"
                  required
                  defaultValue={dateWindow.to}
                  className="min-h-11 rounded border border-rule bg-[#f8f3ec] px-2 text-body-md text-cacao"
                />
              </label>
              <Button type="submit" variant="secondary" className="normal-case">
                Apply
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      <ul className="grid gap-gutter-sm sm:grid-cols-2 xl:grid-cols-4">
        {statTiles.map((stat) => (
          <li
            key={stat.label}
            className="rounded border border-rule/70 bg-surface p-gutter-md"
          >
            <p className="font-label text-label-sm text-nutmeg">{stat.label}</p>
            <p className="mt-gutter-xs font-display text-headline-lg text-cacao">
              {stat.value}
            </p>
            <p className="mt-1 text-body-sm text-nutmeg">{stat.note}</p>
          </li>
        ))}
      </ul>

      <div className="mt-gutter-sm grid gap-gutter-sm xl:grid-cols-3">
        <section className="rounded border border-rule/70 bg-surface p-gutter-md xl:col-span-2">
          <p className="font-label text-label-sm text-terracotta">Revenue</p>
          <h2 className="mt-1 text-headline-sm text-cacao">
            Flavour revenue ({dateWindow.label.toLowerCase()})
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
          <h2 className="text-headline-sm text-cacao">Best selling (all time)</h2>

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
              <h2 className="text-headline-sm text-cacao">Recent orders</h2>
            </div>
            <div className="flex flex-wrap items-center gap-gutter-xs">
              <ButtonAnchor href="/api/admin/orders/export" variant="secondary" download>
                Export CSV
              </ButtonAnchor>
              <Link
                href={ADMIN_ROUTES.orders}
                className="inline-flex min-h-11 items-center gap-gutter-xs font-label text-label-sm text-terracotta transition-colors hover:text-cacao"
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
            <>
              {/*
                Stacked cards below `md`. A six-column table in 375px truncated
                every cell — "Coco Velvet Chi…" — and a horizontal scroller
                inside a card is easy to miss and awkward to use one-handed.
                Each order gets its own block with every field spelled out.
              */}
              <ul className="mt-gutter-sm space-y-2 md:hidden">
                {recentOrders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-md border border-rule/70 bg-surface-container-low p-gutter-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-gutter-xs">
                      <Link
                        href={ADMIN_ROUTES.order(order.reference)}
                        className="font-label text-label-md text-terracotta hover:underline"
                      >
                        #{order.reference}
                      </Link>
                      <span className="font-numeral text-label-md text-cacao">
                        {formatKobo(order.subtotal.amount)}
                      </span>
                    </div>

                    <p className="mt-1 text-body-sm text-cacao">
                      {order.customerName}
                      <span className="text-nutmeg"> · {order.city}</span>
                    </p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {order.itemSummary || "—"}
                    </p>

                    <div className="mt-gutter-xs flex flex-wrap items-center gap-gutter-xs">
                      <span
                        className={cn(
                          "rounded-sm px-2 py-1 font-label text-label-sm",
                          order.paymentStatus === "paid"
                            ? "bg-secondary-container text-on-secondary-fixed"
                            : "bg-error-container text-on-error-container",
                        )}
                      >
                        {PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus}
                      </span>
                      <span className="font-label text-label-sm text-on-surface-variant">
                        {order.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* From `md`, the table earns its place — and still scrolls
                  inside its own container so the page never does. */}
              <div className="mt-gutter-md hidden overflow-x-auto md:block">
                <table className="w-full min-w-160 border-collapse text-left">
                  <thead>
                    <tr className="border-b border-rule/70">
                      {["Order", "Customer", "Item", "Value", "Payment", "Status"].map(
                        (heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="py-2 pr-4 font-label text-label-sm text-nutmeg"
                          >
                            {heading}
                          </th>
                        ),
                      )}
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
                        <td className="py-3 pr-4 font-numeral text-label-sm text-cacao">
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
                            {PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus}
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
            </>
          )}
        </section>

        <section className="rounded border border-rule/70 bg-surface p-gutter-md">
          <h2 className="text-headline-sm text-cacao">Stock &amp; ingredients</h2>

          {lowStockPacks.length === 0 ? (
            <p className="mt-gutter-md text-body-sm text-on-surface-variant">
              Every packaging size is above its restock threshold.
            </p>
          ) : (
            <ul className="mt-gutter-md space-y-3">
              {lowStockPacks.map(({ product, pack }) => (
                <li
                  key={pack.id}
                  className="flex flex-wrap items-start gap-gutter-sm rounded-md border border-rule/70 bg-surface-container-low p-gutter-sm"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      pack.stockQuantity <= 0 ? "bg-error" : "bg-terracotta",
                    )}
                  />
                  <div className="min-w-40 flex-1">
                    <p className="text-body-sm font-semibold text-cacao">
                      {product.name} · {pack.name}
                    </p>
                    <p className="text-body-sm text-nutmeg">
                      {pack.sku ? `${pack.sku} · ` : ""}
                      {pack.stockQuantity} in stock
                      {pack.restockThreshold !== null &&
                        ` — threshold ${pack.restockThreshold}`}
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
            className="mt-gutter-md flex min-h-11 items-center gap-gutter-xs border-t border-rule/70 pt-gutter-sm font-label text-label-sm text-terracotta transition-colors hover:text-cacao"
          >
            <ICONS.timer className="h-4 w-4" />
            Full inventory
          </Link>
        </section>
      </div>
    </>
  );
}
