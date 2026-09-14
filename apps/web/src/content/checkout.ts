import { DELIVERY } from "@lamiefoods/config";

/**
 * Copy for the checkout.
 *
 * Departures from the mock, all deliberate:
 *   - "Direct atelier chat" is dropped — no chat channel exists to link to.
 *   - "1-3 business days" corrected to the confirmed 1–5.
 *
 * Paystack (card / Paystack bank transfer / USSD) is the only way to pay
 * a new order. Choosing a method is not this form's job: payment happens
 * on `/order-success`. Manual bank transfer via WhatsApp was removed from
 * checkout on 2026-09-14.
 *
 * UNVERIFIED (GAP-004 / GAP-007): per-item batch numbers, the small-batch
 * quality guarantee, and the replacement promise, which is a commercial warranty
 * the owner has never made.
 */
export const CHECKOUT = {
  eyebrow: "Express Guest Checkout",
  eyebrowNote: "No account required",
  title: "Artisanal Provisions Checkout",
  /** Factual: HTTPS/TLS is provided by the host. No certification claimed. */
  trust: [
    { icon: "seal" as const, label: "Small-batch quality" },
    { icon: "shield" as const, label: "Encrypted connection" },
  ],

  contact: {
    step: "Step 1 of 3",
    title: "Contact & Dispatch Notifications",
    emailLabel: "Email address (order confirmation & tracking)",
    emailPlaceholder: "recipient@example.com",
    emailHelp:
      "Order confirmation goes here immediately. Payment and dispatch updates follow as they happen.",
    phoneLabel: "Phone number (WhatsApp active)",
    phonePlaceholder: "801 234 5678",
    phoneHelp: "The courier uses this number to reach you on the day of delivery.",
  },

  delivery: {
    step: "Step 2 of 3",
    title: "Delivery Destination",
    nameLabel: "Recipient full name",
    namePlaceholder: "e.g. Olamide Adeleke",
    addressLabel: "Street address / house or apartment number",
    addressPlaceholder: "e.g. Flat 4B, Admiralty Way, Lekki Phase 1",
    landmarkLabel: "Nearest landmark / area directions",
    landmarkPlaceholder: "e.g. Opposite Ebeano Supermarket",
    landmarkHelp: "Helps the rider hand off without a delayed dispatch call.",
    areaLabel: "Delivery area",
    areaPlaceholder: "Select where we should deliver",
    areaHelp: "Fee is fixed per area and added to your total at checkout.",
    notice: {
      title: "Dispatch notice & timeline",
      body: `Delivery typically takes ${DELIVERY.minDays}–${DELIVERY.maxDays} business days. Freshly sealed and dispatched in protective food-safe packaging directly from our kitchen.`,
    },
  },

  /** Paystack is the only path for new orders. This step is a notice, not a
   *  choice — payment itself happens on `/order-success`. */
  paymentMethod: {
    step: "Step 3 of 3",
    title: "Payment",
    paystack: {
      label: "Pay online now",
      note: "Card, bank transfer or USSD via Paystack — on the next page after you place the order.",
    },
  },

  summary: {
    title: "Order Summary",
    subtotalLabel: "Items subtotal",
    deliveryLabel: "Delivery",
    deliveryPending: "Select an area",
    dispatchLabel: "Courier dispatch",
    dispatchValue: `${DELIVERY.minDays}–${DELIVERY.maxDays} days`,
    totalLabel: "Total due",
    totalNote:
      "Products (discounts applied) plus the delivery fee for your selected area.",
    paymentTitle: "Payment",
    paymentNote:
      "You'll pay this total on the next page with Paystack. Nothing is charged by this button.",
    cta: "Place order",
    badges: ["Guest checkout", "Pay on the next page", "Confirmed by email"],
  },

  /**
   * Delivery fees come from admin-managed areas selected at checkout.
   */
  deliveryCostNotice: {
    title: "Delivery cost",
    body: "Pick your delivery area above — that fee is added to your total and paid with your products.",
  },

  /** UNVERIFIED — a replacement promise is a commercial warranty. */
  guarantee: {
    eyebrow: "Authentic Nigerian food provisions guarantee",
    body: "Hand-rolled in small batches with whole spices, fresh butter, and West African pastry precision. If your sealed pouch is anything less than impeccably crunchy, we will make it right.",
  },
};
