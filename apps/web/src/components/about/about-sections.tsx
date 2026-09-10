import { cn } from "@lamiefoods/ui";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, ICONS, SoundIcon } from "@/components/ui/icons";
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
      <div className="grid items-center gap-gutter-xl md:grid-cols-12">
        <div className="md:col-span-6">
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

        <Reveal delay={0.1} className="relative md:col-span-6">
          {/*
            `md:w-5/6` — about 17% narrower than the column, right-aligned with
            `md:ml-auto`. The slot is `aspect-4/5` against a 2486×1728 landscape
            source, so `object-cover` crops the sides hard and stretches what is
            left across the full column; rendering into a smaller box means
            fewer output pixels for the same source crop, which is what sharpens
            the pouch lettering.

            Only from `md`: below that the column is full width and stacked, so
            a narrower right-aligned image would just sit oddly off-centre.
          */}
          <div className="relative aspect-4/5 overflow-hidden rounded border border-rule/70 md:ml-auto md:w-5/6">
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
          <div className="relative aspect-4/3 overflow-hidden rounded border border-rule/70">
            <ImageSlot slot={heritage.image} sizes="(min-width: 1024px) 45vw, 100vw" />
          </div>
          <div className="relative mx-gutter-md -mt-gutter-lg rounded border border-rule/70 bg-surface p-gutter-md shadow-earth">
            <p className="flex items-center gap-gutter-xs font-label text-label-sm text-terracotta uppercase">
              <SoundIcon className="h-4 w-4" />
              {heritage.overlay.eyebrow}
            </p>
            <h3 className="mt-1 text-headline-sm text-cacao">{heritage.overlay.title}</h3>
            <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
              {heritage.overlay.body}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-6">
          <Eyebrow withRule>{heritage.eyebrow}</Eyebrow>
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
                <li
                  key={point.title}
                  className="rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
                >
                  <p className="flex items-center gap-gutter-xs font-label text-label-sm text-cacao uppercase">
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
      <div className="grid gap-gutter-lg md:grid-cols-12">
        <div className="md:col-span-6">
          <Eyebrow>{tenets.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{tenets.title}</h2>
        </div>
        <p className="self-end text-body-md text-on-surface-variant md:col-span-6">
          {tenets.body}
        </p>
      </div>

      <ul className="mt-gutter-xl grid gap-gutter-md sm:grid-cols-2 lg:grid-cols-3">
        {tenets.items.map((item, index) => {
          const Icon = ICONS[item.icon];
          const inverted = "inverted" in item && item.inverted;

          return (
            <Reveal key={item.index} delay={index * 0.08} className="h-full">
              <li
                className={cn(
                  "flex h-full flex-col rounded border p-inset-card",
                  inverted
                    ? "border-cacao bg-cacao text-linen"
                    : "border-rule/70 bg-surface",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded",
                    inverted
                      ? "bg-primary-container text-linen"
                      : "bg-secondary-container text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <p
                  className={cn(
                    "mt-gutter-md font-label text-label-caps uppercase",
                    inverted ? "text-tertiary-fixed-dim" : "text-tertiary",
                  )}
                >
                  {item.index}
                </p>
                <h3
                  className={cn(
                    "mt-1 text-headline-sm",
                    inverted ? "text-linen" : "text-cacao",
                  )}
                >
                  {item.title}
                </h3>
                <p
                  className={cn(
                    "mt-gutter-xs flex-1 text-body-sm",
                    inverted ? "text-linen/75" : "text-on-surface-variant",
                  )}
                >
                  {item.body}
                </p>

                {/* The mock styled these as links, but there is nowhere for
                    them to go, so they are labels rather than dead links. */}
                <p
                  className={cn(
                    "mt-gutter-md flex items-center gap-gutter-xs font-label text-label-sm uppercase",
                    inverted ? "text-tertiary-fixed-dim" : "text-terracotta",
                  )}
                >
                  {item.note}
                  <ArrowRightIcon className="h-4 w-4" />
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
          <Eyebrow>{horizon.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{horizon.title}</h2>
          <p className="mt-gutter-sm max-w-prose text-body-md text-on-surface-variant">
            {horizon.body}
          </p>
          <p className="mt-gutter-md inline-flex items-center gap-gutter-xs rounded border border-rule/70 bg-surface-container px-3 py-2 font-label text-label-sm text-cacao">
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

      <ul className="mt-gutter-xl grid gap-gutter-md sm:grid-cols-3">
        {horizon.values.map((value, index) => {
          const Icon = ICONS[value.icon];
          return (
            <Reveal key={value.title} delay={index * 0.08} className="h-full">
              <li className="h-full rounded border border-rule/70 bg-surface-container-low p-inset-card">
                <p className="flex items-center gap-gutter-sm text-headline-sm text-cacao">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary-container text-linen">
                    <Icon className="h-4 w-4" />
                  </span>
                  {value.title}
                </p>
                <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
                  {value.body}
                </p>
              </li>
            </Reveal>
          );
        })}
      </ul>
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
