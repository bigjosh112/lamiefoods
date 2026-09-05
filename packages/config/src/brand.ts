/**
 * Brand facts confirmed by the owner. Anything not listed here is unknown —
 * do not invent prices, fees, addresses, phone numbers or claims.
 */
export const BRAND = {
  /** Customer-facing name. Never render "Lamie Foods Enterprise" in the UI. */
  name: "LAMIE FOODS",
  /** Cased for prose, where all-caps would read as shouting. */
  displayName: "Lamie Foods",
  tagline: "Crafted for Good Taste.",
  instagramHandle: "@Lamie_foods",
  instagramUrl: "https://instagram.com/lamie_foods",
} as const;

/** Delivery window quoted by the owner. Fees are still being finalised. */
export const DELIVERY = {
  minDays: 1,
  maxDays: 5,
  pickupAvailable: false,
} as const;
