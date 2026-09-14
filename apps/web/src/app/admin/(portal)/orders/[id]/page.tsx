import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false, nocache: true },
};

// Security-critical: never let this bake as a static build artifact. See
// server/admin/session.ts for why relying on cookies() usage alone is
// too fragile for a gate this important.
export const dynamic = "force-dynamic";

/**
 * One order — real data now.
 *
 * `getAdminSession()` SUPERSEDES the earlier `NODE_ENV` check (GAP-009). This
 * screen carries a customer's name, email, phone, and full delivery address —
 * the check runs before the dynamic import AND before the DB lookup, so
 * nothing is read, let alone rendered, without a valid session.
 *
 * The `[id]` segment holds the order's human REFERENCE (e.g. "LF-7K2QX4"),
 * not its database id — safe here specifically because this lookup only
 * happens after the session gate above; see
 * `server/orders/repository.ts:getOrderByReferenceForAdmin`'s own comment.
 */
export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getAdminSession())) redirect(ADMIN_ROUTES.login);
  if (!isDatabaseConfigured()) notFound();

  const { id } = await params;
  const { getOrderByReferenceForAdmin } = await import("@/server/orders/repository");

  const found = await getOrderByReferenceForAdmin(id);
  if (!found) notFound();

  const { OrderDetailView } = await import("@/components/admin/order-detail-view");
  return <OrderDetailView order={found.order} />;
}
