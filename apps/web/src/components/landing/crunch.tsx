import { Reveal } from "@/components/motion/reveal";
import { StoryLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { Eyebrow, Section } from "@/components/ui/section";
import { CRUNCH } from "@/content/landing";

const SCORE_MAX = 10;

/**
 * Measured off the approved frame at 1280px: an even 6/6 split, 540px each,
 * separated by the 40px desktop gutter. The image column is 540 x 540 — square,
 * and the same height as the column — so the sensory card overlays the image
 * rather than sitting under it. This section pads 128px vertically, one step
 * more than the page default.
 *
 * As in the manifesto, the card only goes absolute from `lg`; three metric rows
 * pinned over a phone-width photo would bury the picture entirely.
 */
export function Crunch() {
  return (
    <Section className="lg:py-section-xl">
      <div className="grid items-center gap-gutter-lg lg:grid-cols-12">
        <Reveal className="relative lg:col-span-6">
          <div className="relative aspect-square overflow-hidden rounded border border-rule/70">
            <ImageSlot slot={CRUNCH.image} sizes="(min-width: 1024px) 45vw, 100vw" />
          </div>

          <div className="relative mx-gutter-md -mt-gutter-lg rounded border border-rule/70 bg-surface-container-lowest p-gutter-md shadow-earth lg:absolute lg:right-gutter-md lg:bottom-gutter-md lg:left-gutter-md lg:mx-0 lg:mt-0">
            <p className="font-label text-label-caps text-cacao uppercase">
              {CRUNCH.profile.title}
            </p>
            <dl className="mt-gutter-sm space-y-3">
              {CRUNCH.profile.metrics.map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-baseline justify-between gap-gutter-sm">
                    <dt className="text-body-sm text-on-surface-variant">
                      {metric.label}
                    </dt>
                    <dd className="shrink-0 font-label text-label-sm text-terracotta">
                      {metric.score} / {SCORE_MAX}
                    </dd>
                  </div>
                  {/* Presentational bar: the value is already stated in the
                      <dd> above, so it is hidden rather than duplicated. */}
                  <div
                    aria-hidden="true"
                    className="mt-1 h-1 w-full overflow-hidden rounded-sm bg-rule/60"
                  >
                    <div
                      className="h-full rounded-sm bg-terracotta"
                      style={{ width: `${(metric.score / SCORE_MAX) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-6">
          <Eyebrow>{CRUNCH.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">
            <span className="block">{CRUNCH.titleLine1}</span>
            <span className="block text-terracotta italic">{CRUNCH.titleLine2}</span>
          </h2>
          <p className="mt-gutter-sm max-w-prose text-body-md text-on-surface-variant">
            {CRUNCH.body}
          </p>

          <ul className="mt-gutter-md space-y-4">
            {CRUNCH.points.map((point) => (
              <li key={point.title} className="flex gap-gutter-sm">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary"
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span>
                  <span className="block text-body-md font-semibold text-cacao">
                    {point.title}
                  </span>
                  <span className="block text-body-sm text-on-surface-variant">
                    {point.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <StoryLink href={CRUNCH.link.href} className="mt-gutter-md">
            {CRUNCH.link.label}
            <ArrowRightIcon className="h-4 w-4" />
          </StoryLink>
        </Reveal>
      </div>
    </Section>
  );
}
