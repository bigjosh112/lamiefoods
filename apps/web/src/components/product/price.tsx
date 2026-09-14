import type { Kobo } from "@lamiefoods/types";
import { cn } from "@lamiefoods/ui";
import { applyDiscount, formatKobo } from "@/lib/money";

/**
 * Price display and discount badge — the single treatment for a product's
 * price anywhere it is shown.
 *
 * WHY THIS IS ONE COMPONENT AND NOT FIVE COPIES.
 *
 * Five surfaces render a price: the homepage flavour cards, the shop grid, the
 * product page, related products and post-add suggestions. Before this, each
 * decided for itself whether to reveal a discount, and they disagreed — the
 * shop grid struck out the original price, the homepage and the two suggestion
 * rails silently showed only the discounted figure, so a shopper saw a lower
 * number with no indication anything was reduced. Checkout was the only place
 * that said so plainly.
 *
 * `discountPercent` comes from the product row the admin form writes, and
 * `applyDiscount` is the same helper `server/orders/pricing.ts` charges with.
 * One field, one rounding rule, one component — so the percentage on a card
 * cannot drift from the percentage at checkout, and neither can drift from the
 * amount actually billed.
 *
 * The layout deliberately matches `checkout/checkout-summary.tsx`: original
 * struck through, discounted beside it in terracotta. That page was already
 * correct and is the reference.
 */
export function ProductPrice({
  priceKobo,
  discountPercent,
  className,
}: {
  priceKobo: Kobo;
  /** `1`–`99`, or `null` for no promotion — never `0`. See `Product.discountPercent`. */
  discountPercent: number | null;
  /** Sets the colour for the undiscounted case; the discounted figure is always terracotta. */
  className?: string;
}) {
  if (!discountPercent) {
    return (
      <span className={cn("font-numeral text-label-md", className)}>
        {formatKobo(priceKobo)}
      </span>
    );
  }

  return (
    <span className={cn("font-numeral text-label-md", className)}>
      {/* `line-through` alone is not announced by screen readers, so the
          struck price is labelled rather than left to visual inference. */}
      <span className="text-nutmeg line-through">
        <span className="sr-only">Original price </span>
        {formatKobo(priceKobo)}
      </span>{" "}
      <span className="text-terracotta">
        <span className="sr-only">Discounted price </span>
        {formatKobo(applyDiscount(priceKobo, discountPercent))}
      </span>
    </span>
  );
}

/**
 * "20% off", from the same `discountPercent` the price above is computed from.
 *
 * Saffron rather than the terracotta the "New" badge uses: the two sit on the
 * same photograph, in opposite corners, and two identical chips would read as
 * one repeated label. Cacao on saffron measures 5.31:1, past the 4.5:1 floor.
 *
 * Positioning is the caller's: the cards pass `absolute top-3 right-3` to sit
 * opposite "New", and the product page drops it inline beside the price, where
 * there is no photograph to corner it against.
 */
export function DiscountBadge({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-sm bg-saffron px-2 py-1 font-label text-label-sm text-cacao",
        className,
      )}
    >
      {percent}% off
    </span>
  );
}
