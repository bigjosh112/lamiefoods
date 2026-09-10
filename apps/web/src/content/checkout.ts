import { DELIVERY } from "@lamiefoods/config";

/**
 * Copy for the checkout.
 *
 * Departures from the mock, all deliberate:
 *   - "Direct atelier chat" is dropped — no chat channel exists to link to.
 *   - "1-3 business days" corrected to the confirmed 1–5.
 *
 * Paystack (card/bank transfer/USSD) is now genuinely connected — the owner
 * confirmed an account exists this session. Bank transfer via WhatsApp is the
 * fallback. Neither is acted on by THIS form: choosing one just records the
 * intent on the order; actually paying happens on `/order-success`, so a
 * retry or a method switch has one place to work from.
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
    stateLabel: "State / region",
    cityLabel: "City / delivery area",
    cityPlaceholder: "e.g. Lekki",
    notice: {
      title: "Dispatch notice & timeline",
      body: `Delivery typically takes ${DELIVERY.minDays}–${DELIVERY.maxDays} business days nationwide. Freshly sealed and dispatched in protective food-safe packaging directly from our kitchen.`,
    },
  },

  /** Paystack is the primary path ("the main way") — listed first and
   *  selected by default; bank transfer is the fallback for anyone who'd
   *  rather not pay online. */
  paymentMethod: {
    step: "Step 3 of 3",
    title: "How would you like to pay?",
    paystack: {
      label: "Pay online now",
      note: "Card, bank transfer or USSD via Paystack — secure and instant.",
    },
    whatsappTransfer: {
      label: "Bank transfer",
      note: "Transfer directly, then send your receipt on WhatsApp — we confirm it manually.",
    },
  },

  summary: {
    title: "Order Summary",
    subtotalLabel: "Items subtotal",
    dispatchLabel: "Courier dispatch",
    dispatchValue: `To be confirmed · ${DELIVERY.minDays}–${DELIVERY.maxDays} days`,
    totalLabel: "Products due",
    totalNote:
      "Product costs only (discounts already applied). Delivery is quoted separately before dispatch.",
    paymentTitle: "Payment",
    paymentNote:
      "You'll pay for the products on the next page (Paystack or bank transfer). Nothing is charged by this button. Delivery is still unpriced.",
    cta: "Place order",
    badges: ["Guest checkout", "Pay on the next page", "Confirmed by email"],
  },

  /**
   * Delivery pricing genuinely is not set (Q16). Online payment charges the
   * product subtotal only — never invent a delivery total here.
   */
  deliveryCostNotice: {
    title: "Delivery cost notice",
    body: "Delivery fees are calculated per destination and confirmed before dispatch. Paying online now covers your products only — not delivery.",
  },

  /** UNVERIFIED — a replacement promise is a commercial warranty. */
  guarantee: {
    eyebrow: "Authentic Nigerian food provisions guarantee",
    body: "Hand-rolled in small batches with whole spices, fresh butter, and West African pastry precision. If your sealed pouch is anything less than impeccably crunchy, we will make it right.",
  },
};

/**
 * Nigeria's 36 states plus the Federal Capital Territory. Factual reference
 * data, not invented: the mock offered only two made-up "delivery zones", which
 * would have blocked every customer outside Lagos from checking out.
 */
export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;
