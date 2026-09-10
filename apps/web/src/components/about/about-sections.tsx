import { cn } from "@lamiefoods/ui";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { Eyebrow, Section } from "@/components/ui/section";
import { ABOUT } from "@/content/about";

/**
 * The About page, section by section. All Server Components — the only motion
 * is `Reveal`, which is already a client boundary of its own.
 */

export function AboutHero() {
  const { hero } = ABOUT;

  return (
    <Section className="bg-surface-container-low">
      {/*
        `gap-x` and `gap-y` split deliberately: the horizontal gap comes down to
        40px so the columns read as a pair, while the vertical gap stays at 64px
        because that is the stacked-mobile rhythm and was not in scope.

        7/5 rather than 6/6. At the 1360px container that puts the text column
        at ~777px and the image at ~543px — the image is within 3px of the width
        it had at 6 columns and `w-5/6`, so it is the same size on screen; what
        goes is the ~108px of dead space `ml-auto` left to its left.
      */}
      <div className="grid items-center gap-x-gutter-lg gap-y-gutter-xl md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="font-label text-label-sm text-terracotta">{hero.eyebrow}</p>

          <h1 className="mt-gutter-md text-display-hero text-cacao">
            <span className="block">{hero.titleLine1}</span>
            <span className="block">
              <span className="text-terracotta italic">{hero.titleEmphasis}</span>{" "}
              {hero.titleLine2}
            </span>
          </h1>

          <p className="mt-gutter-md max-w-prose text-body-md text-on-surface-variant">
            {hero.body}
          </p>

          <dl className="mt-gutter-lg flex flex-wrap gap-gutter-lg">
            {hero.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-headline-md text-terracotta">
                    {stat.value}
                  </span>
                  <span className="mt-1 block font-label text-label-sm text-nutmeg">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Reveal delay={0.1} className="relative md:col-span-5">
          <div className="relative aspect-4/5 overflow-hidden rounded border border-rule/70">
            <ImageSlot
              slot={hero.image}
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export function AboutHeritage() {
  const { heritage } = ABOUT;

  return (
    <Section>
      <div className="grid items-center gap-gutter-xl md:grid-cols-12">
        <Reveal className="relative md:col-span-6">
          {/* No overlay card. The one that sat here carried an invented
              "acoustic metric" nothing measures. */}
          <div className="relative aspect-4/3 overflow-hidden rounded border border-rule/70">
            <ImageSlot slot={heritage.image} sizes="(min-width: 1024px) 45vw, 100vw" />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-6">
          <Eyebrow className="text-label-sm normal-case">{heritage.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{heritage.title}</h2>
          {heritage.body.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="mt-gutter-sm max-w-prose text-body-md text-on-surface-variant"
            >
              {paragraph}
            </p>
          ))}

          <ul className="mt-gutter-md grid gap-gutter-sm sm:grid-cols-2">
            {heritage.points.map((point) => {
              const Icon = ICONS[point.icon];
              return (
                <li key={point.title}>
                  <p className="flex items-center gap-gutter-xs font-label text-label-sm text-cacao">
                    <Icon className="h-4 w-4 text-terracotta" />
                    {point.title}
                  </p>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    {point.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}

export function AboutTenets() {
  const { tenets } = ABOUT;

  return (
    <Section className="bg-surface-container-low">
      {/*
        The subheading is a 12-column grid child from `md` so it sits beside the
        headline; below that the single column stacks it directly underneath,
        full width, rather than leaving it half-width beside nothing.
      */}
      <div className="grid gap-gutter-sm md:grid-cols-12 md:gap-gutter-lg">
        <div className="md:col-span-6">
          <Eyebrow className="text-label-sm normal-case">{tenets.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{tenets.title}</h2>
        </div>
        <p className="text-body-md text-on-surface-variant md:col-span-6 md:self-end">
          {tenets.body}
        </p>
      </div>

      {/*
        No card treatment on any of the three: no fill, border, radius, shadow
        or padding, and the icons stand alone in terracotta. The middle card
        used to be painted dark (`inverted`), which is what made the row read as
        two different things.

        `gap-y-gutter-lg` gives the stacked mobile column real separation now
        that no border marks where one card ends and the next begins.
      */}
      <ul className="mt-gutter-xl grid gap-x-gutter-lg gap-y-gutter-lg sm:grid-cols-2 lg:grid-cols-3">
        {tenets.items.map((item, index) => {
          const Icon = ICONS[item.icon];

          return (
            <Reveal key={item.index} delay={index * 0.08} className="h-full">
              <li className="flex h-full flex-col">
                <Icon className="h-6 w-6 text-terracotta" />

                <p className="mt-gutter-sm font-label text-label-sm text-tertiary">
                  {item.index}
                </p>
                <h3 className="mt-1 text-headline-sm text-cacao">{item.title}</h3>
                <p className="mt-gutter-xs flex-1 text-body-sm text-on-surface-variant">
                  {item.body}
                </p>
              </li>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

export function AboutHorizon() {
  const { horizon } = ABOUT;

  return (
    <Section>
      <div className="grid items-center gap-gutter-xl md:grid-cols-12">
        <Reveal className="md:col-span-6">
          <Eyebrow className="text-label-sm normal-case">{horizon.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{horizon.title}</h2>
          <p className="mt-gutter-sm max-w-prose text-body-md text-on-surface-variant">
            {horizon.body}
          </p>
          <p className="mt-gutter-md inline-flex items-center gap-gutter-xs font-label text-label-sm text-cacao">
            <ICONS.sparkle className="h-4 w-4 text-terracotta" />
            {horizon.pipeline}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="grid grid-cols-2 gap-gutter-sm md:col-span-6">
          {horizon.images.map((image, index) => (
            <div
              key={image.note}
              className={cn(
                "relative aspect-3/4 overflow-hidden rounded border border-rule/70",
                // The design offsets the second image downward on wide screens.
                index === 1 && "lg:mt-gutter-lg",
              )}
            >
              <ImageSlot slot={image} sizes="(min-width: 1024px) 22vw, 45vw" />
            </div>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}

export function AboutSensory() {
  const { sensory } = ABOUT;

  return (
    <Section className="bg-surface-container-low">
      <div className="grid items-center gap-gutter-xl md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <Eyebrow>{sensory.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{sensory.title}</h2>
          <p className="mt-gutter-sm text-body-md text-on-surface-variant">
            {sensory.body}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-7">
          <dl className="grid gap-gutter-md rounded border border-rule/70 bg-surface p-inset-card">
            {sensory.metrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex items-baseline justify-between gap-gutter-sm">
                  <dt className="text-body-sm font-semibold text-cacao">
                    {metric.label}
                  </dt>
                  <dd className="shrink-0 font-label text-label-md text-terracotta">
                    {metric.pct}%
                  </dd>
                </div>
                {/* Value is already stated in the <dd>, so the bar is decorative. */}
                <div
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-rule/50"
                >
                  <div
                    className="h-full rounded-sm bg-terracotta"
                    style={{ width: `${metric.pct}%` }}
                  />
                </div>
                <p
                  aria-hidden="true"
                  className="mt-1 flex justify-between gap-2 text-body-sm text-nutmeg"
                >
                  {metric.scale.map((point) => (
                    <span key={point}>{point}</span>
                  ))}
                </p>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}

export function AboutCta() {
  const { cta } = ABOUT;

  return (
    <Section className="bg-cacao">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span
          aria-hidden="true"
          className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded bg-primary-container text-linen"
        >
          <ICONS.gift className="h-5 w-5" />
        </span>
        <Eyebrow className="mt-gutter-sm text-tertiary-fixed-dim">{cta.eyebrow}</Eyebrow>
        <h2 className="mt-gutter-xs text-headline-lg text-linen">{cta.title}</h2>
        <p className="mt-gutter-sm text-body-lg text-linen/75">{cta.body}</p>

        <div className="mt-gutter-lg flex flex-col items-stretch gap-gutter-sm sm:flex-row sm:justify-center">
          <ButtonLink href={cta.primary.href}>{cta.primary.label}</ButtonLink>
          <ButtonLink
            href={cta.secondary.href}
            variant="inverted"
            target="_blank"
            rel="noopener noreferrer"
          >
            {cta.secondary.label}
          </ButtonLink>
        </div>

        <p className="mt-gutter-lg flex items-center justify-center gap-gutter-xs font-label text-label-sm text-linen/60 uppercase">
          <ICONS.seal className="h-4 w-4 text-tertiary-fixed-dim" />
          {cta.strip}
        </p>
      </Reveal>
    </Section>
  );
}
