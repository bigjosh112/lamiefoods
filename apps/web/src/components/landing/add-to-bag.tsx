"use client";

import { Button } from "@/components/ui/button";
import { BagIcon } from "@/components/ui/icons";
import { useCartActions } from "@/lib/cart/use-cart";

/**
 * Add-to-bag for a landing flavour card.
 *
 * A small client island so `Flavours` itself stays a Server Component — only
 * this control needs the store.
 *
 * The landing card has no size selector, unlike the shop tile, so it adds the
 * pack whose price the card is showing. Passing that pack in from the server
 * keeps the displayed "from" price and the pack that lands in the bag the same
 * thing by construction.
 *
 * `relative z-10` matters: the card's whole surface is a link, laid over the
 * card by a `::after` overlay. Without raising this button above it, every tap
 * on "Add to bag" would navigate to the product page instead of adding.
 *
 * Styling overrides the shared button's uppercase `text-label-caps`, whose
 * 0.12em tracking is drawn for capitals and reads loose in sentence case, and
 * takes `rounded-md` (6px) over the system's default 4px — a clean rectangle
 * rather than an ecommerce pill. It spans the column, so the three buttons line
 * up as one row across the grid.
 */
export function AddToBag({
  slug,
  pack,
  productName,
}: {
  slug: string;
  pack: string;
  productName: string;
}) {
  const { addLine } = useCartActions();

  return (
    <Button
      onClick={() => addLine(slug, pack)}
      className="relative z-10 mt-gutter-sm w-full rounded-md font-label text-label-md normal-case"
      aria-label={`Add ${productName}, ${pack}, to bag`}
    >
      <BagIcon className="h-4 w-4" />
      Add to bag
    </Button>
  );
}
