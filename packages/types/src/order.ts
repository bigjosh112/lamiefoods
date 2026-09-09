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
 * How the customer chose to pay, picked at checkout. `paystack` is the
 * primary path (an inline card/transfer/USSD popup, verified server-side).
 * `whatsapp_transfer` is the fallback: the customer transfers to a bank
 * account shown on `/order-success` and sends proof over WhatsApp; the owner
 * confirms receipt manually from the admin.
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
  /**
   * Null until a delivery cost is quoted. The owner has not set delivery pricing
   * yet, and a `0` fee is not "unknown" — it is a quote of free delivery that
   * nobody authorised. Null means "not yet quoted"; the UI must say so rather
   * than render a zero.
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
