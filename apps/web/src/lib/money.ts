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
