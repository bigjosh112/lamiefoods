import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { HERO } from "@/content/landing";

/**
 * Hero — the page's strongest motion moment, and deliberately a Server
 * Component.
 *
 * The entrance is a CSS animation (`animate-rise`), not Framer Motion. The hero
 * holds the LCP element, and a JS-driven entrance means shipping the headline at
 * `opacity: 0` and hoping hydration arrives: if it does not, the most important
 * text on the site is invisible. CSS runs regardless, needs no client bundle,
 * and the global reduced-motion block collapses it to ~0ms for anyone who asks.
 *
 * Stagger is `animation-delay` per element, so the sequence lands on one rhythm.
 * Only opacity and transform animate — both composite, so nothing reflows while
 * the background image is still decoding.
 */
const STAGGER_MS = 90;
const BASE_DELAY_MS = 120;

/** Delay for the nth element in the entrance sequence. */
const riseDelay = (index: number) => ({
  animationDelay: `${BASE_DELAY_MS + index * STAGGER_MS}ms`,
});

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-cacao">
      {/* Photography sits behind a scrim; without it the linen headline would
          fail contrast the moment a real image lands. */}
      <div className="absolute inset-0 -z-10">
        <ImageSlot slot={HERO.image} sizes="100vw" priority />
        <div
          className="absolute inset-0 bg-gradient-to-b from-cacao/95 via-cacao/80 to-cacao/95"
          aria-hidden="true"
        />
      </div>

      <div className="mx-auto flex w-full max-w-(--container-page) flex-col items-center px-margin py-section text-center">
        <p
          style={riseDelay(0)}
          className="inline-flex animate-rise items-center gap-gutter-xs rounded-sm border border-linen/25 px-gutter-sm py-2 font-label text-label-caps text-tertiary-fixed uppercase"
        >
          <span>{HERO.eyebrow}</span>
          <span aria-hidden="true" className="text-linen/40">
            •
          </span>
          <span className="text-linen/70">{HERO.eyebrowMeta}</span>
        </p>

        <h1
          style={riseDelay(1)}
          className="mt-gutter-md max-w-4xl animate-rise text-display-hero text-linen"
        >
          <span className="block uppercase">{HERO.titleLine1}</span>
          <span className="block text-tertiary-fixed-dim italic">{HERO.titleLine2}</span>
        </h1>

        <p
          style={riseDelay(2)}
          className="mt-gutter-md max-w-xl animate-rise text-body-lg text-linen/80"
        >
          {HERO.body}
        </p>

        <div
          style={riseDelay(3)}
          className="mt-gutter-lg flex animate-rise flex-col items-stretch gap-gutter-sm sm:flex-row sm:items-center"
        >
          <ButtonLink href={HERO.primaryCta.href}>
            {HERO.primaryCta.label}
            <ArrowRightIcon className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href={HERO.secondaryCta.href} variant="inverted">
            {HERO.secondaryCta.label}
          </ButtonLink>
        </div>

        <ul
          style={riseDelay(4)}
          className="mt-gutter-xl grid w-full max-w-3xl animate-rise grid-cols-1 gap-gutter-sm sm:grid-cols-3"
        >
          {HERO.stats.map((stat) => (
            <li
              key={stat.label}
              className="flex items-center gap-gutter-sm rounded border border-linen/15 bg-linen/5 px-gutter-sm py-3 text-left backdrop-blur-sm"
            >
              <span
                aria-hidden="true"
                className="h-8 w-8 shrink-0 rounded-full bg-terracotta/90"
              />
              <span>
                <span className="block font-label text-label-sm text-linen/60 uppercase">
                  {stat.label}
                </span>
                <span className="block font-label text-label-md text-linen">
                  {stat.value}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
