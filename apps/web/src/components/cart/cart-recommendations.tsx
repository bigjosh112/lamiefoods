"use client";

import Link from "next/link";
import { ROUTES } from "@lamiefoods/config";
import { Button, StoryLink } from "@/components/ui/button";
import { ArrowRightIcon, BagIcon } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { Eyebrow, Section } from "@/components/ui/section";
import { CART } from "@/content/cart";
import { lowestPrice, PRODUCTS } from "@/content/products";
import { formatKobo } from "@/lib/money";
import { addLine, useCart } from "@/lib/cart/use-cart";

/**
 * Suggested additions, drawn from the real catalogue.
 *
 * The mock filled this row with three products the brand does not sell
 * ("Nutmeg Reserve Batch", "Wild Honey Glazed Batch", "Twin Heritage Gift Jar").
 * Advertising items that cannot be bought is worse than showing fewer, so this
 * shows the real range, minus whatever is already in the bag.
 */
export function CartRecommendations() {
  const { lines } = useCart();
  const inBag = new Set(lines.map((line) => line.slug));
  const suggestions = PRODUCTS.filter((product) => !inBag.has(product.slug));

  if (suggestions.length === 0) return null;

  return (
    <Section className="bg-surface-container-low">
      <div className="flex flex-wrap items-end justify-between gap-gutter-md">
        <div>
          <Eyebrow>{CART.recommendations.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">
            {CART.recommendations.title}
          </h2>
        </div>
        <StoryLink href={ROUTES.shop}>
          {CART.recommendations.link}
          <ArrowRightIcon className="h-4 w-4" />
        </StoryLink>
      </div>

      <ul className="mt-gutter-lg grid gap-gutter-md sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((product) => {
          const pack = product.detail.packaging[0];
          return (
            <li
              key={product.slug}
              className="flex flex-col overflow-hidden rounded border border-rule/70 bg-surface"
            >
              <div className="relative aspect-4/3 bg-surface-container">
                <ImageSlot
                  slot={product.image}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                />
                <span className="absolute top-3 left-3 rounded-sm bg-cacao/85 px-2 py-1 font-label text-label-sm text-linen uppercase backdrop-blur-sm">
                  {product.badges.shop}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-inset-card">
                <p className="font-label text-label-sm text-tertiary uppercase">
                  {product.kicker}
                </p>
                <h3 className="mt-1 text-headline-sm text-cacao">
                  <Link
                    href={ROUTES.product(product.slug)}
                    className="transition-colors hover:text-terracotta"
                  >
                    {product.name}
                  </Link>
                </h3>
                <p className="mt-gutter-xs flex-1 text-body-sm text-on-surface-variant">
                  {product.body}
                </p>

                <div className="mt-gutter-md flex items-center justify-between gap-gutter-sm">
                  <span className="font-label text-label-md text-terracotta">
                    {formatKobo(lowestPrice(product))}
                  </span>
                  {pack && (
                    <Button
                      variant="secondary"
                      onClick={() => addLine(product.slug, pack.name)}
                      aria-label={`Add ${product.name}, ${pack.name}, to bag`}
                    >
                      <BagIcon className="h-4 w-4" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
