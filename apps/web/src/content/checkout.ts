import { DELIVERY } from "@lamiefoods/config";

/**
 * Copy for the checkout.
 *
 * Departures from the mock, all deliberate:
 *   - The mock badged Paystack "LIVE". Payments are NOT connected; a live badge
 *     over a gateway that cannot take money is a straightforwardly false claim.
 *   - "Direct atelier chat" is dropped — no chat channel exists to link to.
 *   - "1-3 business days" corrected to the confirmed 1–5.
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
    step: "Step 1 of 2",
    title: "Contact & Dispatch Notifications",
    emailLabel: "Email address (order confirmation & tracking)",
    emailPlaceholder: "recipient@example.com",
    emailHelp:
      "Your receipt and dispatch updates are emailed as soon as the order is placed.",
    phoneLabel: "Phone number (WhatsApp active)",
    phonePlaceholder: "801 234 5678",
    phoneHelp: "The courier uses this number to reach you on the day of delivery.",
  },

  delivery: {
    step: "Step 2 of 2",
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

  summary: {
    title: "Order Summary",
    subtotalLabel: "Items subtotal",
    dispatchLabel: "Courier dispatch",
    dispatchValue: `To be confirmed · ${DELIVERY.minDays}–${DELIVERY.maxDays} days`,
    totalLabel: "Total due",
    totalNote: "Product costs only — delivery is added at dispatch",
    paymentTitle: "Payment options",
    /** These are the methods Paystack supports; not a claim about our account. */
    methods: ["Debit / credit card", "Bank transfer", "USSD"],
    gateway: "Powered by Paystack",
    cta: "Pay now with Paystack",
    badges: ["Encrypted", "Guaranteed fresh", "Instant confirmation"],
  },

  /**
   * The mock's own honest note — delivery pricing genuinely is not set, which
   * matches what the owner has told us.
   */
  deliveryCostNotice: {
    title: "Delivery cost notice",
    body: "Delivery fees are calculated per dispatch destination and confirmed before payment is taken.",
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
