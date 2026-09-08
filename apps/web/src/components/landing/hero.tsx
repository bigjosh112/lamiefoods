import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { Section } from "@/components/ui/section";
import { HERO } from "@/content/landing";

/**
 * Hero — a two-column spread on the page background, and deliberately a Server
 * Component.
 *
 * It used to be a full-bleed photograph under a cacao scrim with the copy
 * centred over it. That is gone: the section now sits on the same cream ground
 * as the rest of the page, with the copy left-aligned against a contained
 * product photograph.
 *
 * The entrance is a CSS animation (`animate-rise`), not Framer Motion. The hero
 * holds the LCP element, and a JS-driven entrance means shipping the headline at
 * `opacity: 0` and hoping hydration arrives: if it does not, the most important
 * text on the site is invisible. CSS runs regardless, needs no client bundle,
 * and the global reduced-motion block collapses it to ~0ms for anyone who asks.
 *
 * The photograph is deliberately NOT animated. With the scrim gone it is the
 * likeliest LCP element, and fading it in would delay the paint that metric
 * measures. Only the copy rises.
 *
 * Colour note: terracotta on the cream ground measures 5.34:1, so the italic
 * accent line passes AA. GAP-003 asks for that check whenever the palette moves,
 * and moving the hero off cacao moves it.
 */
const STAGGER_MS = 90;
const BASE_DELAY_MS = 120;

/** Delay for the nth element in the entrance sequence. */
const riseDelay = (index: number) => ({
  animationDelay: `${BASE_DELAY_MS + index * STAGGER_MS}ms`,
});

export function Hero() {
  return (
    <Section containerClassName="grid items-center gap-gutter-lg md:grid-cols-12">
      <div className="md:col-span-6">
        <h1
          style={riseDelay(0)}
          className="animate-rise text-display-xl text-balance text-cacao"
        >
          <span className="block">{HERO.titleLine1}</span>
          <span className="block text-terracotta italic">{HERO.titleLine2}</span>
        </h1>

        <p
          style={riseDelay(1)}
          className="mt-gutter-md max-w-prose animate-rise text-body-lg text-on-surface-variant"
        >
          {HERO.body}
        </p>

        {/* Sentence case, so both override the shared button's tracked-out
            caps. `secondary` rather than `inverted`: the outlined cacao variant
            is the one drawn for light grounds. */}
        <div
          style={riseDelay(2)}
          className="mt-gutter-lg flex animate-rise flex-col items-stretch gap-gutter-sm sm:flex-row sm:items-center"
        >
          <ButtonLink href={HERO.primaryCta.href} className="text-label-md normal-case">
            {HERO.primaryCta.label}
            <ArrowRightIcon className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink
            href={HERO.secondaryCta.href}
            variant="secondary"
            className="text-label-md normal-case"
          >
            {HERO.secondaryCta.label}
          </ButtonLink>
        </div>
      </div>

      {/* Above the copy on phones, right-hand column from 768px. Contained and
          cropped to 4:3 rather than bled off the edge — this is placeholder
          photography, so it should not be load-bearing for the layout. */}
      <div className="order-first md:order-none md:col-span-6">
        <div className="relative aspect-4/3 overflow-hidden rounded-lg border border-rule/70 bg-surface-container">
          <ImageSlot slot={HERO.image} sizes="(min-width: 768px) 50vw, 100vw" priority />
        </div>
      </div>
    </Section>
  );
}
