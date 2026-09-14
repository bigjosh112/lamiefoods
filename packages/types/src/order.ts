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

/**
 * The fulfilment state machine shared by the admin UI and the server.
 * Terminal statuses deliberately have no exits.
 */
export const ORDER_STATUS_TRANSITIONS: Record<
  OrderStatus,
  readonly OrderStatus[]
> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function allowedOrderStatusTransitions(
  status: OrderStatus,
): readonly OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[status];
}

export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

/**
 * How the customer chose to pay. New orders are always `paystack` (inline
 * card/transfer/USSD, verified server-side). `whatsapp_transfer` remains on
 * this union for orders placed before 2026-09-14, when checkout offered a
 * manual bank-transfer fallback; admin can still mark those paid.
 */
export type PaymentMethod = "paystack" | "whatsapp_transfer";

/** A line item frozen at purchase time, so later product edits cannot rewrite history. */
export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  /**
   * The pack option bought, by display name (e.g. "250g Pouch").
   *
   * Not optional: a 250g pouch and a 500g jar are different prices and different
   * physical goods, so a line without a pack is unfulfillable. Stored as the
   * name rather than a reference for the same reason the rest of this type is
   * frozen — renaming a pack later must not rewrite what someone already bought.
   */
  pack: string;
  /**
   * Pack SKU frozen at purchase (e.g. `LF-MVC-100`). Null only for orders
   * placed before SKUs were tracked on line items.
   */
  sku: string | null;
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
  /**
   * Delivery area selected at checkout (snapshot). Null only on legacy orders
   * placed before delivery areas existed.
   */
  deliveryAreaId: string | null;
  /** Area display name frozen at purchase. */
  deliveryAreaName: string | null;
  subtotal: Money;
  /**
   * Null until a delivery cost is quoted. For new checkouts the fee comes from
   * the selected delivery area and is always set. A `0` fee is an authorised
   * free-delivery quote on that area — never invent `0` when no area applies.
   */
  deliveryFee: Money | null;
  /** Null while `deliveryFee` is, since a total without delivery is not the total. */
  total: Money | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}
