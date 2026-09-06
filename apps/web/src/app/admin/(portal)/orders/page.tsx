import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Orders & fulfilment",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Orders route.
 *
 * Same gate as the dashboard, and for the same reason: this screen shows
 * customer names, phone numbers, addresses and order values, and there is still
 * no authentication (GAP-009).
 *
 * The check runs BEFORE the dynamic import, so the module is never evaluated
 * when the gate is closed. Gating in the layout is not enough — Next still
 * renders the page and the data comes back inside the RSC flight payload of the
 * 404 response. Verified by fetching this route from a production build.
 *
 * REMOVE ONLY in the same change that adds server-side session checking.
 */
export default async function AdminOrdersPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const { OrdersView } = await import("@/components/admin/orders-view");
  return <OrdersView />;
}
