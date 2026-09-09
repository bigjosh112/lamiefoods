import type { Order, OrderStatus } from "@lamiefoods/types";
import { apiFetch } from "./client";

export type AdminOrderUpdate =
  | { status: OrderStatus; paymentStatus?: never }
  | { status?: never; paymentStatus: "paid" };

/** PATCH /api/admin/orders/:reference — the admin order screens' one write path. */
export async function updateOrderStatus(
  reference: string,
  patch: AdminOrderUpdate,
): Promise<Order> {
  const { order } = await apiFetch<{ order: Order }>(
    `/api/admin/orders/${encodeURIComponent(reference)}`,
    { method: "PATCH", body: patch },
  );
  return order;
}
