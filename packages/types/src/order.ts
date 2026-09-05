import type { IsoDateString, Money } from "./common";
import type { CustomerDetails } from "./customer";

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

/** A line item frozen at purchase time, so later product edits cannot rewrite history. */
export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
}

export interface Order {
  id: string;
  /** Human-readable reference shown to the customer. */
  reference: string;
  items: OrderItem[];
  customer: CustomerDetails;
  subtotal: Money;
  deliveryFee: Money;
  total: Money;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}
