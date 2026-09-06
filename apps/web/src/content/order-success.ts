import { BRAND } from "@lamiefoods/config";

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
  receiptNote: "Receipts become available once ordering is live.",

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
    body: "This is placeholder data so the layout can be reviewed. No order exists, nothing has been paid, and checkout does not yet submit. Real orders appear here once the ordering API and Paystack are connected.",
  },

  /** What a visitor sees when there is no order to show, which is every real visit. */
  none: {
    title: "No order to show",
    body: "We could not find an order for this link. If you have just tried to check out, note that ordering is not live yet — nothing has been charged.",
    cta: "Back to the shop",
  },
};
