import Link from "next/link";
import { ROUTES } from "@lamiefoods/config";
import { AddToBag } from "@/components/landing/add-to-bag";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink, StoryLink } from "@/components/ui/button";
import { ArrowRightIcon, BoxIcon } from "@/components/ui/icons";
import { Eyebrow, Section } from "@/components/ui/section";
import { ImageSlot } from "@/components/ui/image-slot";
import { FLAVOURS } from "@/content/landing";
import { cheapestPack, lowestPrice } from "@/content/products";
import { formatKobo } from "@/lib/money";

/**
 * The three launch flavours.
 *
 * The whole card is a link to the product page — the anchor sits on the product
 * name and its ::after overlay covers the card — so there is one link per card
 * in the accessibility tree, rather than the three that used to be there, one of
 * which rendered as an empty box.
 *
 * "Add to bag" is a real action against the browser-side bag, and it adds the
 * pack whose price the card is showing.
 */
export function Flavours() {
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

      <ul className="mt-gutter-lg grid gap-x-gutter-lg gap-y-gutter-xl sm:grid-cols-2 lg:grid-cols-3">
        {FLAVOURS.items.map((item, index) => (
          <Reveal key={item.slug} delay={index * 0.08} className="h-full">
            <li className="group relative flex h-full flex-col text-left">
              {/*
                The photograph keeps the rounding and clipping the card wrapper
                used to provide, so it stays the one visually distinct element.
                The category badge on it is unchanged.
              */}
              <div className="relative aspect-4/3 overflow-hidden rounded bg-surface-container">
                <ImageSlot
                  slot={item.image}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                />
                <span className="absolute top-3 left-3 rounded-sm bg-primary-container px-2 py-1 font-label text-label-sm text-linen uppercase">
                  {item.badges.landing}
                </span>
              </div>

              {/*
                No padding, no background, no border: the copy sits on the page
                and starts flush with the image's left edge. Separation between
                products comes from the grid gap and the type hierarchy.
              */}
              <div className="mt-gutter-sm flex flex-1 flex-col">
                {/*
                  Sentence case done in CSS rather than by rewriting the string:
                  `kicker` is title case in the catalogue and other surfaces
                  render it their own way, so the casing stays a presentation
                  choice here. `::first-letter` needs a block box to apply.
                */}
                <span className="block font-label text-label-sm text-tertiary lowercase first-letter:uppercase">
                  {item.kicker}
                </span>

                {/*
                  The whole card is the link. The anchor sits on the product
                  name — so the accessible name is the product, and the link
                  list reads sensibly — and its ::after overlay covers the card,
                  which is what makes tapping anywhere work. One link per card
                  in the accessibility tree, not three.
                */}
                <h3 className="mt-gutter-xs text-headline-sm text-cacao">
                  <Link
                    href={ROUTES.product(item.slug)}
                    className="group-hover:text-terracotta after:absolute after:inset-0 after:content-['']"
                  >
                    {item.name}
                  </Link>
                </h3>

                {/* Grows so the price and button share a baseline across the row. */}
                <p className="mt-gutter-xs flex-1 text-body-sm text-on-surface-variant">
                  {item.body}
                </p>

                <p className="mt-gutter-sm font-label text-label-md text-cacao">
                  {formatKobo(lowestPrice(item))}
                </p>

                <AddToBag
                  slug={item.slug}
                  pack={cheapestPack(item).name}
                  productName={item.name}
                />
              </div>
            </li>
          </Reveal>
        ))}
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
