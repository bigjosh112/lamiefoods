import type { CustomerDetails, PaymentMethod } from "@lamiefoods/types";
import { apiFetch } from "./client";
import type { CreateOrderRequest, CreateOrderResponse } from "@/lib/orders/order-request";

/**
 * One function per endpoint, per `lib/api/README.md`. This is the only place a
 * Client Component reaches for placing or reading an order — everything else
 * (the schema, the pricing, the DB) lives on the server.
 */

export interface OrderLineInput {
  slug: string;
  pack: string;
  quantity: number;
}

/**
 * Places a guest order. No account, no session — this is what Q12/Q13 asked
 * for: customers buy without creating one.
 *
 * Sends only what the customer chose (`slug`, `pack`, `quantity`) — never a
 * price. The server re-prices every line from its own catalogue; see
 * `server/orders/pricing.ts` for why that boundary exists.
 */
export async function createOrder(
  customer: CustomerDetails,
  lines: OrderLineInput[],
  paymentMethod: PaymentMethod,
  deliveryAreaId: string,
): Promise<CreateOrderResponse> {
  const payload: CreateOrderRequest = {
    customer,
    lines,
    paymentMethod,
    deliveryAreaId,
  };
  return apiFetch<CreateOrderResponse>("/api/orders", {
    method: "POST",
    body: payload,
  });
}

/** Body of `POST /api/orders/:token/prepare-payment`'s response. */
export interface PreparePaymentResponse {
  reference: string;
  amountKobo: number;
  email: string;
}

/** Registers a fresh Paystack reference for this order, right before opening
 *  the inline popup. See the route's own comment for why this can't be
 *  skipped in favour of the client just inventing a reference itself. */
export async function preparePayment(token: string): Promise<PreparePaymentResponse> {
  return apiFetch<PreparePaymentResponse>(
    `/api/orders/${encodeURIComponent(token)}/prepare-payment`,
    { method: "POST" },
  );
}

/** Confirms a completed Paystack popup against the order it was prepared for. */
export async function verifyPayment(
  token: string,
  paystackReference: string,
): Promise<void> {
  await apiFetch<{ order: unknown }>(
    `/api/orders/${encodeURIComponent(token)}/verify-payment`,
    { method: "POST", body: { paystackReference } },
  );
}
