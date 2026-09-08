import { ROUTES } from "@lamiefoods/config";
import type { Product } from "@lamiefoods/types";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink, StoryLink } from "@/components/ui/button";
import { ArrowRightIcon, BoxIcon, EyeIcon } from "@/components/ui/icons";
import { Eyebrow, Section } from "@/components/ui/section";
import { ImageSlot } from "@/components/ui/image-slot";
import { FLAVOURS } from "@/content/landing";
import { applyDiscount, formatKobo } from "@/lib/money";

/**
 * The featured flavours row.
 *
 * `products` arrives as a PROP from the homepage's Server Component
 * (`listPublishedProducts()`, filtered to `featureOnHomepage`) — products
 * moved to Postgres, and this component itself stays a Server Component, so
 * there's no client-side fetch involved either way.
 *
 * "Add to bag" is a link to the product page, not a button: this row is a
 * teaser, and adding straight to the bag from here would skip pack selection
 * — `ProductPurchase` on the product page is where that choice belongs.
 */
export function Flavours({ products }: { products: Product[] }) {
  return (
    <Section className="bg-surface-container-low" id="flavours">
      <Reveal className="flex flex-wrap items-end justify-between gap-gutter-md">
        <div>
          <Eyebrow>{FLAVOURS.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{FLAVOURS.title}</h2>
        </div>
        <StoryLink href={FLAVOURS.link.href}>
          {FLAVOURS.link.label}
          <ArrowRightIcon className="h-4 w-4" />
        </StoryLink>
      </Reveal>

      <ul className="mt-gutter-lg grid gap-gutter-md sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => {
          const cheapest = product.packs.reduce(
            (min, pack) => Math.min(min, pack.price.amount),
            Infinity,
          );
          const hero =
            product.images.find((image) => image.role === "hero") ?? product.images[0];

          return (
            <Reveal key={product.slug} delay={index * 0.08} className="h-full">
              <li className="flex h-full flex-col overflow-hidden rounded border border-rule/70 bg-surface-container-lowest transition-shadow duration-300 hover:shadow-earth">
                <div className="relative aspect-4/3 bg-surface-container">
                  <ImageSlot
                    slot={{
                      src: hero?.url ?? null,
                      alt: hero?.alt ?? product.name,
                      note: "Product photography",
                    }}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  />
                </div>

                <div className="flex flex-1 flex-col p-inset-card">
                  <div className="flex items-baseline justify-between gap-gutter-sm">
                    <span className="font-label text-label-sm text-tertiary uppercase">
                      {product.category}
                    </span>
                    <span className="shrink-0 font-label text-label-md text-cacao">
                      {Number.isFinite(cheapest)
                        ? formatKobo(applyDiscount(cheapest, product.discountPercent))
                        : ""}
                    </span>
                  </div>

                  <h3 className="mt-gutter-xs text-headline-sm text-cacao">
                    {product.name}
                  </h3>
                  <p className="mt-gutter-xs flex-1 text-body-sm text-on-surface-variant">
                    {product.teaser}
                  </p>

                  <div className="mt-gutter-md flex gap-gutter-xs">
                    <ButtonLink
                      href={ROUTES.product(product.slug)}
                      className="flex-1"
                      aria-label={`View details for ${product.name}`}
                    >
                      View details
                    </ButtonLink>
                    <ButtonLink
                      href={ROUTES.product(product.slug)}
                      variant="secondary"
                      className="w-11 shrink-0 px-0"
                      aria-label={`View details for ${product.name}`}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </ButtonLink>
                  </div>
                </div>
              </li>
            </Reveal>
          );
        })}
      </ul>

      <Reveal delay={0.1}>
        <div className="mt-gutter-md flex flex-wrap items-center justify-between gap-gutter-md rounded border border-rule/70 bg-surface-container p-inset-card">
          <div className="flex items-start gap-gutter-sm">
            <BoxIcon className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
            <div>
              <p className="text-body-md font-semibold text-cacao">
                {FLAVOURS.formats.title}
              </p>
              <p className="text-body-sm text-on-surface-variant">
                {FLAVOURS.formats.body}
              </p>
            </div>
          </div>
          <ButtonLink href={FLAVOURS.formats.cta.href} variant="secondary">
            {FLAVOURS.formats.cta.label}
          </ButtonLink>
        </div>
      </Reveal>
    </Section>
  );
}
