import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";
import {
  chartDayLabel,
  resolveDashboardDateWindow,
} from "@/lib/admin/dashboard-range";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * Operations dashboard route.
 *
 * Date range comes from `?range=` (today | 7d | 30d | custom&from&to) and
 * scopes the revenue chart plus period revenue/order tiles.
 */
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  if (!(await getAdminSession())) notFound();

  const params = await searchParams;
  const window = resolveDashboardDateWindow(params);

  const { AdminDashboard } = await import("@/components/admin/admin-dashboard");

  if (!isDatabaseConfigured()) {
    return (
      <AdminDashboard
        needsDispatch={[]}
        recentOrders={[]}
        stats={{
          settledRevenue: { amount: 0, currency: "NGN" },
          orderCount: 0,
          customerCount: 0,
        }}
        activeFlavourCount={0}
        revenueSeries={{ days: [], series: [], unit: "₦" }}
        bestSellers={[]}
        lowStockPacks={[]}
        dateWindow={window}
      />
    );
  }

  const {
    listOrdersNeedingDispatch,
    listOrdersForAdmin,
    getDashboardStats,
    getRevenueTrendBetween,
    getBestSellers,
  } = await import("@/server/orders/repository");
  const { listPublishedProducts, listProductsForAdmin } =
    await import("@/server/products/repository");

  const [
    needsDispatch,
    recentOrders,
    stats,
    publishedProducts,
    trend,
    bestSellers,
    allProducts,
  ] = await Promise.all([
    listOrdersNeedingDispatch(),
    listOrdersForAdmin(),
    getDashboardStats({ from: window.from, to: window.to }),
    listPublishedProducts(),
    getRevenueTrendBetween(window.from, window.to),
    getBestSellers(3),
    listProductsForAdmin(),
  ]);

  const dayCount = window.days.length;
  const revenueSeries = {
    days: window.days.map((day) => chartDayLabel(day, dayCount)),
    series: publishedProducts.map((product) => ({
      name: product.name,
      values: window.days.map((day) => {
        const point = trend.find((t) => t.day === day && t.slug === product.slug);
        return point ? Math.round(point.revenue.amount / 100) : 0;
      }),
    })),
    unit: "₦",
  };

  const { stockStatus } = await import("@/lib/admin/stock-status");
  const lowStockPacks = allProducts.flatMap((product) =>
    product.packs
      .filter((pack) => stockStatus(pack) !== "in-stock")
      .map((pack) => ({ product, pack })),
  );

  return (
    <AdminDashboard
      needsDispatch={needsDispatch}
      recentOrders={recentOrders.slice(0, 5)}
      stats={stats}
      activeFlavourCount={publishedProducts.length}
      revenueSeries={revenueSeries}
      bestSellers={bestSellers}
      lowStockPacks={lowStockPacks}
      dateWindow={window}
    />
  );
}
