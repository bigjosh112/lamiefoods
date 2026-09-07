import { Reveal } from "@/components/motion/reveal";
import { StoryLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { Eyebrow, Section } from "@/components/ui/section";
import { CRUNCH } from "@/content/landing";

/**
 * Measured off the approved frame at 1280px: an even 6/6 split, 540px each,
 * separated by the 40px desktop gutter. The image column is 540 x 540 — square,
 * and the same height as the column. This section pads 128px vertically, one
 * step more than the page default.
 *
 * The "Acoustic Sensory Profile" card that used to overlay the photograph was
 * removed at the owner's request, and its invented scores went with it — see
 * the note where `CRUNCH.image` is defined. The photograph now stands alone.
 *
 * The eyebrow and the story link run in sentence case here, unlike the rest of
 * the site. That is done with a className at each call site rather than in
 * `Eyebrow` and `StoryLink` themselves: both are shared components, and this
 * request covered this section only.
 */
export function Crunch() {
  return (
    <Section className="lg:py-section-xl">
      <div className="grid items-center gap-gutter-lg md:grid-cols-12">
        <Reveal className="relative md:col-span-6">
          <div className="relative aspect-square overflow-hidden rounded border border-rule/70">
            <ImageSlot slot={CRUNCH.image} sizes="(min-width: 1024px) 45vw, 100vw" />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-6">
          {/* Sentence case here only — see the note above the component. */}
          <Eyebrow className="text-label-sm normal-case">{CRUNCH.eyebrow}</Eyebrow>
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

          <StoryLink
            href={CRUNCH.link.href}
            className="mt-gutter-md text-label-sm normal-case"
          >
            {CRUNCH.link.label}
            <ArrowRightIcon className="h-4 w-4" />
          </StoryLink>
        </Reveal>
      </div>
    </Section>
  );
}
