import { DELIVERY } from "@lamiefoods/config";

/**
 * Copy for the shopping bag.
 *
 * UNVERIFIED throughout, per GAP-004: the shelf-life and flour claims.
 *
 * Departures from the mock, all because the claim would be false:
 *   - It labelled Paystack as "Paystack Escrow · Secured CBN Gateway". Paystack
 *     is a payment gateway, not an escrow service, and "CBN Gateway" implies a
 *     central-bank endorsement that does not exist.
 *   - The mock quoted "1-3 business days"; the confirmed window is 1–5.
 *   - No "Paystack verified"/"Paystack Secured" badge anywhere: there is no
 *     Paystack account yet (owner confirmed), so nothing is Paystack-secured.
 *   - No free-delivery offer and no gift-packaging offer. Both were invented
 *     thresholds the mock made up (GAP-007/GAP-008) — delivery pricing is
 *     still being worked out, and a bag told it "qualifies" for something is a
 *     commercial promise nobody authorised.
 */
export const CART = {
  eyebrow: "Batch Reservation",
  title: "Your Shopping Bag",
  /* Reworded 2026-09-14. Drops "small-batch", which the shop subheading, the
     shop trust strip and the footer all dropped on 2026-09-13/14 — this was
     the last place still asserting it. */
  body: "Freshly prepared. Carefully sealed. Packed in airtight tins and pouches to preserve freshness and crunch.",

  empty: {
    title: "Your bag is empty",
    body: "Nothing reserved yet. Browse the range and add a batch to get started.",
    cta: "Browse the shop",
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
      icon: "mail" as const,
      title: "Order Confirmed By Email",
      note: "Sent the moment you check out",
    },
  ],

  summary: {
    deliveryNote: `Typical dispatch: ${DELIVERY.minDays}–${DELIVERY.maxDays} business days`,
    /** UNVERIFIED — VAT treatment is a tax question for the owner. */
    totalNote: "Delivery fee is added at checkout",
    badges: ["Guest checkout", "No account needed"],
  },

  recommendations: {
    eyebrow: "Recommended Complements",
    title: "Complete Your Tasting Experience",
    link: "View entire atelier collection",
  },
};
