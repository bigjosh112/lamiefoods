import Link from "next/link";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import type { OrderStatus } from "@lamiefoods/types";
import { cn } from "@lamiefoods/ui";
import { ICONS } from "@/components/ui/icons";
import { ButtonAnchor } from "@/components/ui/button";
import { OrdersTable } from "@/components/admin/orders-table";
import { formatKobo } from "@/lib/money";
import type { AdminOrderSummary } from "@/server/orders/repository";

const TAB_ORDER: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const TAB_LABEL: Record<OrderStatus | "all", string> = {
  all: "All",
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  shipped: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/**
 * Real orders, real filters, real stat cards. Replaces the sample-data screen
 * that used to live at this route — see `docs/ai-memory/architecture.md`'s
 * 2026-09-07 decision log for what was deliberately dropped rather than
 * wired to fake data: a Kitchen & Dispatch Timeline, a Delivery & Geolocation
 * map, and Internal Atelier Notes, none of which have a real data source.
 *
 * Rows arrive as PROPS, never imported directly — the exact rule that closed
 * the client-bundle PII leak documented in GAP-009.
 */
export function OrdersView({
  orders,
  counts,
  totalOrders,
  needsDispatchCount,
  activeStatus,
}: {
  orders: AdminOrderSummary[];
  counts: Record<OrderStatus, number>;
  totalOrders: number;
  needsDispatchCount: number;
  activeStatus: OrderStatus | "all";
}) {
  const totalValue = orders.reduce((sum, order) => sum + order.subtotal.amount, 0);

  return (
    <div className="p-gutter-lg">
      <div className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
        <div>
          <h1 className="text-headline-lg text-cacao">Orders & fulfilment</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Every order that has come through checkout, newest first.
          </p>
        </div>
        <ButtonAnchor
          href="/api/admin/orders/export"
          variant="secondary"
          download
          className="normal-case"
        >
          Export dispatch CSV
        </ButtonAnchor>
      </div>

      <div className="mt-gutter-md grid gap-gutter-sm sm:grid-cols-3">
        <StatCard icon="box" label="Total orders" value={String(totalOrders)} />
        <StatCard
          icon="truck"
          label="Needs dispatch"
          value={String(needsDispatchCount)}
          highlight={needsDispatchCount > 0}
        />
        <StatCard icon="seal" label="Total value" value={formatKobo(totalValue)} />
      </div>

      <div className="mt-gutter-md flex flex-wrap gap-gutter-xs border-b border-rule/70 pb-2">
        {TAB_ORDER.map((status) => {
          const count = status === "all" ? totalOrders : counts[status];
          const active = status === activeStatus;
          const href =
            status === "all"
              ? ADMIN_ROUTES.orders
              : `${ADMIN_ROUTES.orders}?status=${status}`;
          return (
            <Link
              key={status}
              href={href}
              className={cn(
                "rounded-sm px-3 py-1.5 font-label text-label-sm transition-colors",
                active
                  ? "bg-primary-container text-linen"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
              )}
            >
              {TAB_LABEL[status]} ({count})
            </Link>
          );
        })}
      </div>

      <div className="mt-gutter-md">
        <OrdersTable rows={orders} />
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
      className={cn(
        "rounded border p-gutter-sm",
        highlight
          ? "border-terracotta bg-secondary-container/40"
          : "border-rule/70 bg-surface-container-low",
      )}
    >
      <p className="flex items-center gap-gutter-xs font-label text-label-sm text-nutmeg">
        <Icon className="h-4 w-4 text-terracotta" />
        {label}
      </p>
      <p className="mt-1 text-headline-md text-cacao">{value}</p>
    </div>
  );
}
