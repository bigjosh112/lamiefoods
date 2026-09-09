"use client";

import { ROUTES } from "@lamiefoods/config";
import type { Product } from "@lamiefoods/types";
import { Reveal } from "@/components/motion/reveal";
import { Button, ButtonLink, StoryLink } from "@/components/ui/button";
import { ArrowRightIcon, BagIcon } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { Eyebrow, Section } from "@/components/ui/section";
import { applyDiscount, formatKobo } from "@/lib/money";
import { useCartActions } from "@/lib/cart/use-cart";

/**
 * The rest of the range. `products` arrives as a PROP from the server page
 * (`listPublishedProducts()`), never imported directly — the catalogue moved
 * to Postgres.
 *
 * The tile links to the product page and "Add to bag" adds the cheapest pack
 * to the browser-side bag.
 */
export function RelatedProducts({
  current,
  products,
}: {
  current: Product;
  products: Product[];
}) {
  const others = products.filter((product) => product.slug !== current.slug);
  const { addLine } = useCartActions();

  if (others.length === 0) return null;

  return (
    <Section>
      <Reveal className="flex flex-wrap items-end justify-between gap-gutter-md">
        <div>
          <Eyebrow>Companion Confections</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">
            Pairs Well With Our Signature Varieties
          </h2>
        </div>
        <StoryLink href={ROUTES.shop}>
          Explore all flavours
          <ArrowRightIcon className="h-4 w-4" />
        </StoryLink>
      </Reveal>

      {/* `sm:` rather than `lg:` — the storefront gained a tablet tier, and
          waiting until 1024px left these stacked on every tablet. */}
      <ul className="mt-gutter-lg grid gap-gutter-md sm:grid-cols-2">
        {others.map((product, index) => {
          const cheapest = product.packs.reduce(
            (min, pack) => Math.min(min, pack.price.amount),
            Infinity,
          );
          const hero =
            product.images.find((image) => image.role === "hero") ?? product.images[0];

          return (
            <Reveal key={product.slug} delay={index * 0.08} className="h-full">
              <li className="flex h-full overflow-hidden rounded border border-rule/70 bg-surface-container-low">
                <div className="relative w-2/5 shrink-0 bg-surface-container">
                  <ImageSlot
                    slot={{
                      src: hero?.url ?? null,
                      alt: hero?.alt ?? product.name,
                      note: "Product photography",
                    }}
                    sizes="(min-width: 1024px) 20vw, 40vw"
                  />
                </div>

                <div className="flex flex-1 flex-col p-inset-card">
                  <h3 className="text-headline-sm text-cacao">
                    <ButtonLink
                      href={ROUTES.product(product.slug)}
                      variant="secondary"
                      className="min-h-0 border-0 px-0 font-display text-headline-sm tracking-normal normal-case hover:bg-transparent hover:underline"
                    >
                      {product.name}
                    </ButtonLink>
                  </h3>
                  <p className="mt-gutter-xs flex-1 text-body-sm text-on-surface-variant">
                    {product.teaser}
                  </p>

                  <div className="mt-gutter-md flex flex-wrap items-center gap-gutter-sm">
                    <span className="font-label text-label-md text-terracotta">
                      {Number.isFinite(cheapest)
                        ? formatKobo(applyDiscount(cheapest, product.discountPercent))
                        : ""}
                    </span>
                    <Button
                      onClick={() => {
                        const pack = product.packs[0];
                        if (pack) addLine(product.slug, pack.name);
                      }}
                      aria-label={`Add ${product.name} to bag`}
                      variant="secondary"
                    >
                      <BagIcon className="h-4 w-4" />
                      Add to bag
                    </Button>
                  </div>
                </div>
              </li>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
