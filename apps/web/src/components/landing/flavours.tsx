import { ROUTES } from "@lamiefoods/config";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink, StoryLink } from "@/components/ui/button";
import { ArrowRightIcon, BoxIcon, EyeIcon } from "@/components/ui/icons";
import { Eyebrow, Section } from "@/components/ui/section";
import { ImageSlot } from "@/components/ui/image-slot";
import { FLAVOURS } from "@/content/landing";
import { lowestPrice } from "@/content/products";
import { formatKobo } from "@/lib/money";

/**
 * The three launch flavours.
 *
 * "Add to bag" is a link to the product page, not a button: no cart exists yet,
 * and a button that silently does nothing is worse than one that takes you
 * somewhere real. It becomes a true add-to-cart action once the API is wired.
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

      <ul className="mt-gutter-lg grid gap-gutter-md sm:grid-cols-2 lg:grid-cols-3">
        {FLAVOURS.items.map((item, index) => (
          <Reveal key={item.slug} delay={index * 0.08} className="h-full">
            <li className="flex h-full flex-col overflow-hidden rounded border border-rule/70 bg-surface-container-lowest transition-shadow duration-300 hover:shadow-earth">
              <div className="relative aspect-4/3 bg-surface-container">
                <ImageSlot
                  slot={item.image}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                />
                <span className="absolute top-3 left-3 rounded-sm bg-primary-container px-2 py-1 font-label text-label-sm text-linen uppercase">
                  {item.badges.landing}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-inset-card">
                <div className="flex items-baseline justify-between gap-gutter-sm">
                  <span className="font-label text-label-sm text-tertiary uppercase">
                    {item.index} · {item.kicker}
                  </span>
                  <span className="shrink-0 font-label text-label-md text-cacao">
                    {formatKobo(lowestPrice(item))}
                  </span>
                </div>

                <h3 className="mt-gutter-xs text-headline-sm text-cacao">{item.name}</h3>
                <p className="mt-gutter-xs flex-1 text-body-sm text-on-surface-variant">
                  {item.body}
                </p>

                <div className="mt-gutter-md flex gap-gutter-xs">
                  <ButtonLink
                    href={ROUTES.product(item.slug)}
                    className="flex-1"
                    aria-label={`View details for ${item.name}`}
                  >
                    View details
                  </ButtonLink>
                  <ButtonLink
                    href={ROUTES.product(item.slug)}
                    variant="secondary"
                    className="w-11 shrink-0 px-0"
                    aria-label={`View details for ${item.name}`}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </ButtonLink>
                </div>
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
