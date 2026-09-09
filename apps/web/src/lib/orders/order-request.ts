import { z } from "zod";

/**
 * The create-order wire contract, validated on BOTH sides.
 *
 * The client uses it to avoid a pointless round trip; the server uses the very
 * same schema because a browser-side check is a convenience, not a control —
 * anything only the browser enforces can be skipped by not using the browser.
 *
 * Note what is absent: there is no price field anywhere in this payload, and no
 * total. The customer chooses *what* they are buying; the server decides what it
 * costs (see server/orders/pricing.ts). Adding a price here would hand pricing
 * to the client, which is the exact hole api-integration.md warns about.
 *
 * Deliberately does not live under `server/` — the checkout form imports it too.
 * It therefore must stay free of secrets and of any server-only import.
 */

/** Mirrors MAX_QUANTITY in lib/cart/cart-store.ts. Defined rather than imported
 *  so a route handler does not pull zustand into the server bundle. */
const MAX_LINE_QUANTITY = 20;
/** Three products, two packs each: six distinct lines is the real ceiling. A
 *  larger cap still bounds an abusive payload without limiting a real basket. */
const MAX_LINES = 24;

export const orderLineSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  pack: z.string().trim().min(1).max(120),
  quantity: z.int().min(1).max(MAX_LINE_QUANTITY),
});

/** Matches `PaymentMethod` in `@lamiefoods/types`. Duplicated as a literal
 *  union rather than imported so this file (imported by the checkout form)
 *  never has to pull in more of the shared types package than it needs. */
export const paymentMethodSchema = z.enum(["paystack", "whatsapp_transfer"]);

export const createOrderSchema = z.object({
  paymentMethod: paymentMethodSchema,
  customer: z.object({
    fullName: z.string().trim().min(2).max(80),
    email: z.email().max(160),
    // Already normalised to full international form by `toCustomerDetails`.
    phone: z
      .string()
      .trim()
      .regex(/^\+234[789]\d{9}$/, "Expected a +234 Nigerian mobile number"),
    deliveryAddress: z.object({
      addressLine: z.string().trim().min(6).max(160),
      landmark: z.string().trim().min(3).max(160),
      city: z.string().trim().min(2).max(80),
      state: z.string().trim().min(1).max(80),
    }),
  }),
  lines: z.array(orderLineSchema).min(1).max(MAX_LINES),
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;

/**
 * What POST /api/orders returns. The token is the capability to read the
 * order. `amountKobo` is the subtotal the server actually priced — returned
 * so the client never computes an amount to charge itself; see
 * `server/orders/pricing.ts` for why that boundary exists.
 */
export interface CreateOrderResponse {
  reference: string;
  token: string;
  amountKobo: number;
}
