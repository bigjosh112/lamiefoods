import type { Order } from "@lamiefoods/types";

/**
 * Kobo the customer must pay now (Paystack / bank-transfer copy).
 *
 * New orders always set `total` (= subtotal + delivery fee). Legacy orders
 * without a quoted fee fall back to subtotal so old unpaid links still work.
 */
export function amountOwedKobo(order: Pick<Order, "subtotal" | "total">): number {
  return order.total?.amount ?? order.subtotal.amount;
}
