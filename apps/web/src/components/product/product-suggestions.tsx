"use client";

import Link from "next/link";
import { ROUTES } from "@lamiefoods/config";
import type { Product } from "@lamiefoods/types";
import { Button, StoryLink } from "@/components/ui/button";
import { ArrowRightIcon, BagIcon } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { Eyebrow, Section } from "@/components/ui/section";
import { useCart, useCartActions } from "@/lib/cart/use-cart";
import { DiscountBadge, ProductPrice } from "@/components/product/price";

/**
 * "You might also like" row, shared by the cart and the order confirmation —
 * the two places the design asks for it. The only differences are the wording
 * and which products to leave out, so those are props rather than a second copy
 * of the component.
 *
 * `products` arrives as a PROP from the server page (`listPublishedProducts()`),
 * never imported directly — the catalogue moved to Postgres. Both call sites
 * (`app/cart/page.tsx`, `app/order-success/page.tsx`) wrap this in
 * `CatalogProvider` too, since `useCart()` needs it for `lines`.
 */
export function ProductSuggestions({
  products,
  eyebrow,
  title,
  linkLabel,
  ctaLabel = "Add",
  exclude = [],
  excludeInBag = false,
  className,
}: {
  products: Product[];
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
  const suggestions = products.filter((product) => !hidden.has(product.slug));

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
          const pack = product.packs[0];
          const hero =
            product.images.find((image) => image.role === "hero") ?? product.images[0];
          return (
            <li
              key={product.slug}
              className="flex flex-col overflow-hidden rounded border border-rule/70 bg-surface"
            >
              <div className="relative aspect-4/3 bg-surface-container">
                <ImageSlot
                  slot={{
                    src: hero?.url ?? null,
                    alt: hero?.alt ?? product.name,
                    note: "Product photography",
                  }}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                />
                {/* No "New" badge on this rail, so the corner is free. */}
                {product.discountPercent && (
                  <DiscountBadge
                    percent={product.discountPercent}
                    className="absolute top-3 right-3"
                  />
                )}
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
                  {product.teaser}
                </p>

                <div className="mt-gutter-md flex items-center justify-between gap-gutter-sm">
                  {pack && (
                    <ProductPrice
                      priceKobo={pack.price.amount}
                      discountPercent={product.discountPercent}
                      className="text-terracotta"
                    />
                  )}
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
