import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * One order.
 *
 * Same gate as the rest of the portal, and for the sharpest reason yet: this
 * screen carries a customer's name, email, phone, full delivery address, gate
 * instructions and a courier's number. There is still no authentication
 * (GAP-009).
 *
 * The check runs BEFORE the dynamic import, so neither the detail module nor
 * the order data is evaluated when the gate is closed — a `notFound()` in the
 * layout is not enough, because Next still renders the page and the data comes
 * back in the RSC payload of the 404.
 *
 * REMOVE ONLY in the same change that adds server-side session checking.
 */
export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();

  const { id } = await params;
  const { buildOrderDetail, findOrderRow } = await import("@/content/admin-order-detail");

  const row = findOrderRow(id);
  if (!row) notFound();

  const { OrderDetailView } = await import("@/components/admin/order-detail-view");
  return <OrderDetailView detail={buildOrderDetail(row)} />;
}
