"use client";

import { ROUTES } from "@lamiefoods/config";
import { Reveal } from "@/components/motion/reveal";
import { Button, ButtonLink, StoryLink } from "@/components/ui/button";
import { ArrowRightIcon, BagIcon } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { Eyebrow, Section } from "@/components/ui/section";
import { lowestPrice, PRODUCTS, type Product } from "@/content/products";
import { formatKobo } from "@/lib/money";
import { addLine } from "@/lib/cart/use-cart";

/**
 * The rest of the range, drawn from the shared catalogue — so the imagery here
 * is the same as on the landing page and the shop by construction.
 *
 * The tile links to the product page and "Add to bag" adds the default pack to
 * the browser-side bag.
 */
export function RelatedProducts({ current }: { current: Product }) {
  const others = PRODUCTS.filter((product) => product.slug !== current.slug);

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

      <ul className="mt-gutter-lg grid gap-gutter-md lg:grid-cols-2">
        {others.map((product, index) => (
          <Reveal key={product.slug} delay={index * 0.08} className="h-full">
            <li className="flex h-full overflow-hidden rounded border border-rule/70 bg-surface-container-low">
              <div className="relative w-2/5 shrink-0 bg-surface-container">
                <ImageSlot slot={product.image} sizes="(min-width: 1024px) 20vw, 40vw" />
                <span className="absolute top-2 left-2 rounded-sm bg-cacao/85 px-2 py-1 font-label text-label-sm text-linen uppercase backdrop-blur-sm">
                  {product.badges.shop}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-inset-card">
                <p className="font-label text-label-sm text-tertiary uppercase">
                  {product.kicker}
                </p>
                <h3 className="mt-1 text-headline-sm text-cacao">
                  <ButtonLink
                    href={ROUTES.product(product.slug)}
                    variant="secondary"
                    className="min-h-0 border-0 px-0 font-display text-headline-sm tracking-normal normal-case hover:bg-transparent hover:underline"
                  >
                    {product.name}
                  </ButtonLink>
                </h3>
                <p className="mt-gutter-xs flex-1 text-body-sm text-on-surface-variant">
                  {product.body}
                </p>

                <div className="mt-gutter-md flex flex-wrap items-center gap-gutter-sm">
                  <span className="font-label text-label-md text-terracotta">
                    {formatKobo(lowestPrice(product))}
                  </span>
                  <Button
                    onClick={() => {
                      const pack = product.detail.packaging[0];
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
        ))}
      </ul>
    </Section>
  );
}
