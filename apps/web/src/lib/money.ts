import type { Kobo } from "@lamiefoods/types";

/**
 * Money helpers.
 *
 * Everything is an integer number of kobo. Naira never exists as a float in
 * this codebase: `0.1 + 0.2` is the classic reason carts end up a kobo out, and
 * a wrong total on a real order is a customer-facing billing error.
 */
const KOBO_PER_NAIRA = 100;

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  // Prices are whole naira today; showing ".00" on every line adds noise.
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format kobo as naira, e.g. 360000 -> "₦3,600". */
export function formatKobo(amount: Kobo): string {
  return nairaFormatter.format(amount / KOBO_PER_NAIRA);
}

/** Sum kobo amounts. Integer arithmetic throughout. */
export function sumKobo(amounts: Kobo[]): Kobo {
  return amounts.reduce((total, amount) => total + amount, 0);
}

/** Naira to kobo, for thresholds expressed in whole naira. */
export const naira = (amount: number): Kobo => amount * KOBO_PER_NAIRA;

/**
 * Applies a product's promotional discount to one price. The ONE place this
 * math happens — the storefront (display) and `server/orders/pricing.ts`
 * (the actual charge) both call this, so a discounted price can never be
 * computed two different ways and drift.
 *
 * `discountPercent` is `1`–`99` or `null` (no promotion) — see
 * `Product.discountPercent`'s own comment for why `0` is never used to mean
 * "no discount". Rounds down (`Math.floor`) so the discounted price never
 * exceeds what the percentage actually promises.
 */
export function applyDiscount(priceKobo: Kobo, discountPercent: number | null): Kobo {
  if (discountPercent === null) return priceKobo;
  return Math.floor((priceKobo * (100 - discountPercent)) / 100);
}
