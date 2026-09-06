"use client";

import Link from "next/link";
import { ROUTES } from "@lamiefoods/config";
import { Button, StoryLink } from "@/components/ui/button";
import { ArrowRightIcon, BagIcon } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { Eyebrow, Section } from "@/components/ui/section";
import { lowestPrice, PRODUCTS } from "@/content/products";
import { formatKobo } from "@/lib/money";
import { useCart, useCartActions } from "@/lib/cart/use-cart";

/**
 * "You might also like" row, shared by the cart and the order confirmation —
 * the two places the design asks for it. The only differences are the wording
 * and which products to leave out, so those are props rather than a second copy
 * of the component.
 *
 * Products come from the real catalogue. Both mocks filled this row with items
 * the brand does not sell ("Nutmeg Reserve Crunch", "Heritage Trio Collection"),
 * and advertising something unbuyable is worse than showing fewer cards.
 */
export function ProductSuggestions({
  eyebrow,
  title,
  linkLabel,
  ctaLabel = "Add",
  exclude = [],
  excludeInBag = false,
  className,
}: {
  eyebrow: string;
  title: string;
  linkLabel: string;
  ctaLabel?: string;
  /** Slugs to omit. */
  exclude?: string[];
  /** Also hide anything already in the bag — used on the cart page. */
  excludeInBag?: boolean;
  className?: string;
}) {
  const { addLine } = useCartActions();
  const { lines } = useCart();
  const hidden = new Set([
    ...exclude,
    ...(excludeInBag ? lines.map((line) => line.slug) : []),
  ]);
  const suggestions = PRODUCTS.filter((product) => !hidden.has(product.slug));

  if (suggestions.length === 0) return null;

  return (
    <Section className={className}>
      <div className="flex flex-wrap items-end justify-between gap-gutter-md">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{title}</h2>
        </div>
        <StoryLink href={ROUTES.shop}>
          {linkLabel}
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
                <h3 className="text-headline-sm text-cacao">
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
                      aria-label={`${ctaLabel}: ${product.name}, ${pack.name}`}
                    >
                      <BagIcon className="h-4 w-4" />
                      {ctaLabel}
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
