import { DELIVERY } from "@lamiefoods/config";

/**
 * Copy for the shopping bag.
 *
 * UNVERIFIED throughout, per GAP-004 and GAP-007: the free-delivery threshold,
 * the gift-packaging threshold, the shelf-life and flour claims.
 *
 * Two deliberate departures from the mock:
 *   - It labelled Paystack as "Paystack Escrow · Secured CBN Gateway". Paystack
 *     is a payment gateway, not an escrow service, and "CBN Gateway" implies a
 *     central-bank endorsement that does not exist. Stating either would be a
 *     false financial claim, so this reads "Paystack Secured" instead.
 *   - The mock quoted "1-3 business days"; the confirmed window is 1–5.
 */
export const CART = {
  eyebrow: "Batch Reservation",
  title: "Your Shopping Bag",
  body: "Freshly prepared batches reserved in your bag. Sealed in small-batch air-tight tins and pouches.",

  empty: {
    title: "Your bag is empty",
    body: "Nothing reserved yet. Browse the range and add a batch to get started.",
    cta: "Browse the shop",
  },

  /** UNVERIFIED — the mock invented this threshold and the offer itself. */
  giftPackaging: {
    title: "Complimentary Lagos Gift Packaging",
    body: "Orders above ₦10,000 include hand-stamped wax kraft wrapping and a botanical tie ribbon.",
    badge: "Included",
  },

  /** UNVERIFIED — process and ingredient claims. */
  assurances: [
    {
      icon: "award" as const,
      title: "Stone Ground Flour",
      note: "Zero synthetic binders",
    },
    {
      icon: "timer" as const,
      title: "Baked & Fried Daily",
      note: "Small batches",
    },
    {
      icon: "shield" as const,
      title: "Paystack Secured",
      note: "Encrypted payment gateway",
    },
  ],

  summary: {
    deliveryNote: `Typical dispatch: ${DELIVERY.minDays}–${DELIVERY.maxDays} business days`,
    /** UNVERIFIED — VAT treatment is a tax question for the owner. */
    totalNote: "Excludes delivery",
    /** UNVERIFIED — see GAP-007. */
    freeDeliveryNote:
      "Free Lagos delivery unlocks automatically when your bag reaches ₦15,000.",
    badges: ["Paystack verified", "Guest checkout"],
  },

  recommendations: {
    eyebrow: "Recommended Complements",
    title: "Complete Your Tasting Experience",
    link: "View entire atelier collection",
  },
};
