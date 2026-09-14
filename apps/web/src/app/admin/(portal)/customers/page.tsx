import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false, nocache: true },
};

// Security-critical: never let this bake as a static build artifact. See
// server/admin/session.ts for why relying on cookies() usage alone is
// too fragile for a gate this important.
export const dynamic = "force-dynamic";

/**
 * Customer directory route.
 *
 * This is the most sensitive screen in the admin: it is nothing but customer
 * PII. The gate runs before the dynamic import, so the module is never
 * evaluated in production and nothing reaches the flight payload.
 *
 * `getAdminSession()` SUPERSEDES the earlier `NODE_ENV` check (GAP-009) — a
 * verified session is real authentication; a bare 404 never was.
 */
export default async function AdminCustomersPage() {
  if (!(await getAdminSession())) redirect(ADMIN_ROUTES.login);

  const { CustomersView } = await import("@/components/admin/customers-view");

  if (!isDatabaseConfigured()) {
    return <CustomersView customers={[]} />;
  }

  const { listCustomersForAdmin, listOrdersForAdmin } =
    await import("@/server/orders/repository");
  const [summaries, orders] = await Promise.all([
    listCustomersForAdmin(),
    listOrdersForAdmin(),
  ]);

  const customers = summaries.map((summary) => ({
    email: summary.email,
    name: summary.name,
    phone: summary.phone,
    city: summary.city,
    landmark: summary.landmark,
    orderCount: summary.orderCount,
    totalSpendKobo: summary.totalSpend.amount,
    firstOrderAt: summary.firstOrderAt,
    favouriteProductName: summary.favouriteProductName,
    orders: orders.filter((order) => order.customerEmail === summary.email),
  }));

  return <CustomersView customers={customers} />;
}
