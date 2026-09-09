import { BRAND } from "@lamiefoods/config";
import type { OrderStatus } from "@lamiefoods/types";

/**
 * Copy for the order confirmation.
 *
 * Several things the mock promised are absent, because making them would be
 * false: a payment authorisation token, "SMS & WhatsApp alerts synced", photo
 * updates from the kitchen, a downloadable PDF receipt, and "10% off your next
 * batch" for tagging Instagram — a discount the owner has never offered.
 *
 * UNVERIFIED: the freshness/heat-seal claim.
 */
export const ORDER_SUCCESS = {
  eyebrow: "Order confirmed",
  title: "Thank you for your order.",
  body: "Your order has been received and our kitchen is getting your freshly kettle-fried batch ready with care.",

  statusLabel: "Kitchen status",
  statusValue: "Batch in progress",

  /**
   * Header for a REAL, just-placed order (`?token=`). Deliberately more modest
   * than the preview copy above: payment is not connected, so nothing has been
   * charged and the kitchen has not necessarily started — saying otherwise
   * would be exactly the kind of claim this app does not make.
   */
  real: {
    eyebrow: "Order received",
    title: "Thank you — we have your order.",
    body: "We've recorded your order and sent a confirmation to your email. We'll be in touch to confirm delivery and arrange payment.",
    statusLabel: "Status",
  },

  referenceLabel: "Order reference",
  itemsLabel: "Reserved delicacies",
  totalLabel: "Total",
  deliveryPending: "Confirmed at dispatch",

  dispatchLabel: "Dispatched to",
  etaLabel: "Estimated delivery",

  /** UNVERIFIED — a process claim about sealing times. */
  guarantee: {
    title: "The freshness guarantee",
    body: "Each pouch and jar is heat-sealed shortly after frying to lock in aromatic crunch and buttery crumb.",
  },

  tracking: {
    title: "Order confirmation sent",
    body: "A confirmation has been sent to your email address. We will be in touch when your batch is fried, sealed and on its way.",
    helpTitle: "Need help with this order?",
  },

  continueCta: "Continue shopping",
  receiptCta: "Download receipt (PDF)",
  receiptNote: "Receipts become available once payment is connected.",

  community: {
    title: "Share your Lamie moment.",
    body: `Tag ${BRAND.instagramHandle} on Instagram — we love seeing where our batches end up.`,
  },

  suggestions: {
    eyebrow: "Craft pairings",
    title: "Enhance Your Next Selection",
    link: "View full atelier catalogue",
    cta: "Add to next",
  },

  /**
   * Shown above the sample order. Deliberately loud and not dismissible: a page
   * that says "Paid" and shows a total is the worst thing on this site to
   * mistake for real.
   */
  preview: {
    title: "Preview — sample order",
    body: "This is placeholder data so the layout can be reviewed. No order exists and nothing has been paid. Real orders now save — see /order-success?token=… — but payment is still not connected.",
  },

  /** What a visitor sees when the link has no token, or the token matches nothing. */
  none: {
    title: "No order to show",
    body: "We could not find an order for this link. Check the link from your confirmation email, or start a new order from the shop.",
    cta: "Back to the shop",
  },

  /** What shows if ordering itself is not configured (no DATABASE_URL yet). */
  notConfigured: {
    title: "Ordering is not connected yet",
    body: "This order link cannot be looked up right now. Nothing has been charged. Please contact us directly if you need help with an order.",
    cta: "Back to the shop",
  },
};

/** Status copy for a REAL order, derived from its actual `OrderStatus`. */
export const ORDER_STATUS_COPY: Record<OrderStatus, string> = {
  pending: "Received — awaiting confirmation",
  paid: "Payment confirmed",
  processing: "Batch in progress",
  shipped: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
