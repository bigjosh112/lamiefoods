import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false, nocache: true },
};

// Security-critical: never let this bake as a static build artifact. See
// server/admin/session.ts for why relying on cookies() usage alone is
// too fragile for a gate this important.
export const dynamic = "force-dynamic";

/** The last `n` calendar days, oldest first, as "YYYY-MM-DD" (UTC) — matches
 *  the format `getRevenueTrend`'s `to_char(..., 'YYYY-MM-DD')` returns. */
function lastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

const weekdayLabel = (isoDay: string) =>
  new Date(`${isoDay}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });

/**
 * Operations dashboard route.
 *
 * The gate lives HERE, before anything else, and the dashboard is behind a
 * dynamic import — both deliberately.
 *
 * An earlier version gated in the layout instead. That returned a correct 404,
 * but Next still rendered the page component, and the dashboard tree — names,
 * addresses, revenue — came back inside the RSC flight payload of the 404
 * response. A 404 that ships the data anyway is not a gate.
 *
 * Returning before the `import()` means the module is never evaluated, so no
 * data is read and nothing reaches the payload. Verified by fetching /admin
 * from a production build and grepping the response.
 *
 * `getAdminSession()` SUPERSEDES the earlier `NODE_ENV` check (GAP-009) — see
 * docs/ai-memory/architecture.md's 2026-09-07 decision log.
 */
export default async function AdminDashboardPage() {
  if (!(await getAdminSession())) notFound();

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
      />
    );
  }

  const {
    listOrdersNeedingDispatch,
    listOrdersForAdmin,
    getDashboardStats,
    getRevenueTrend,
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
    getDashboardStats(),
    listPublishedProducts(),
    getRevenueTrend(7),
    getBestSellers(3),
    listProductsForAdmin(),
  ]);

  const days = lastNDays(7);
  const revenueSeries = {
    days: days.map(weekdayLabel),
    // One line per published product, defaulting to 0 on days with no paid
    // sales — a currently-empty order history is an honest flat line, not a
    // gap to hide. Whole naira, not thousands: at this catalogue's price
    // points, scaling down would round small real days to 0.
    series: publishedProducts.map((product) => ({
      name: product.name,
      values: days.map((day) => {
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
    />
  );
}
