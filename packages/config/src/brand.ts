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
  /*
    Supplied by the owner 2026-09-12 — the first real phone number this
    codebase has held, which is why it lives here with the other confirmed
    facts rather than inline in a component.

    Two forms on purpose: `whatsappNumber` is for display and for the
    accessible name, `whatsappUrl` is the wa.me link. wa.me accepts digits
    only — no `+`, spaces or dashes — so the two must not be derived from one
    another by hand each time they are used.
  */
  whatsappNumber: "+234 814 555 9226",
  whatsappUrl: "https://wa.me/2348145559226",
  /** Supplied by the owner 2026-09-12. `emailUrl` is the mailto: form. */
  email: "lamiefoodss@gmail.com",
  emailUrl: "mailto:lamiefoodss@gmail.com",
} as const;

/** Delivery window quoted by the owner. Fees are still being finalised. */
export const DELIVERY = {
  minDays: 1,
  maxDays: 5,
  pickupAvailable: false,
} as const;
