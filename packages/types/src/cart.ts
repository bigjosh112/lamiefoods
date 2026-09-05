import type { Money } from "./common";
import type { ProductSummary } from "./product";

export interface CartItem {
  product: ProductSummary;
  quantity: number;
}

export interface CartTotals {
  subtotal: Money;
  /** Null until the backend supplies a delivery fee for the address. */
  deliveryFee: Money | null;
  /** Null while any component of the total is still unknown. */
  total: Money | null;
}
