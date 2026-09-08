import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { OrderStatus } from "@lamiefoods/types";
import { ORDER_STATUSES } from "@lamiefoods/types";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";

export const metadata: Metadata = {
  title: "Orders & fulfilment",
  robots: { index: false, follow: false, nocache: true },
};

// Security-critical: never let this bake as a static build artifact. See
// server/admin/session.ts for why relying on cookies() usage alone is
// too fragile for a gate this important.
export const dynamic = "force-dynamic";

/**
 * Orders route — real data now.
 *
 * `getAdminSession()` SUPERSEDES the earlier `NODE_ENV` check (GAP-009). The
 * check still runs BEFORE the dynamic import and before any query: this
 * screen shows customer names, phone numbers, addresses and order values, and
 * a `notFound()` after the data was already read would be too late — see the
 * RSC-payload leak this exact pattern was written to prevent.
 */
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!(await getAdminSession())) notFound();

  const { status: statusParam } = await searchParams;
  const activeStatus: OrderStatus | "all" =
    statusParam && (ORDER_STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as OrderStatus)
      : "all";

  const { OrdersView } = await import("@/components/admin/orders-view");

  if (!isDatabaseConfigured()) {
    return (
      <OrdersView
        orders={[]}
        counts={EMPTY_COUNTS}
        totalOrders={0}
        needsDispatchCount={0}
        activeStatus={activeStatus}
      />
    );
  }

  const { listOrdersForAdmin, countOrdersByStatus, listOrdersNeedingDispatch } =
    await import("@/server/orders/repository");

  const [orders, counts, needsDispatch] = await Promise.all([
    listOrdersForAdmin(activeStatus === "all" ? undefined : { status: activeStatus }),
    countOrdersByStatus(),
    listOrdersNeedingDispatch(),
  ]);

  const totalOrders = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <OrdersView
      orders={orders}
      counts={counts}
      totalOrders={totalOrders}
      needsDispatchCount={needsDispatch.length}
      activeStatus={activeStatus}
    />
  );
}

const EMPTY_COUNTS: Record<OrderStatus, number> = {
  pending: 0,
  paid: 0,
  processing: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
};
