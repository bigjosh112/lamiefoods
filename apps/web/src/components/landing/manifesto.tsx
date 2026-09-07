import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { ImageSlot } from "@/components/ui/image-slot";
import { Eyebrow, Section } from "@/components/ui/section";
import { MANIFESTO } from "@/content/landing";

/**
 * Asymmetric editorial spread, measured off the approved frame at 1280px:
 * a 5-column visual against a 7-column narrative, separated by the 40px desktop
 * gutter. The image column is 443.33 x 591.09 — exactly 3:4 — and that height
 * matches the column, which means the philosophy card sits *inside* the image
 * rather than below it.
 *
 * The overlay only goes absolute from `lg`. Below that it stays in flow,
 * overlapping the image's bottom edge: a card pinned over a narrow phone-width
 * photo would cover most of the picture.
 */
export function Manifesto() {
  return (
    <Section className="bg-surface-container-low" id="manifesto">
      <div className="grid items-center gap-gutter-lg md:grid-cols-12">
        <Reveal className="relative mx-auto w-full max-w-sm md:col-span-5 md:max-w-none">
          <div className="relative aspect-3/4 overflow-hidden rounded border border-rule/70">
            <ImageSlot slot={MANIFESTO.image} sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>

          {/* The supplied card artwork, placed as-is rather than rebuilt in
              markup — its rounded corners are transparent, so it sits cleanly
              over the photo. Anchored bottom-right and overhanging the image's
              right edge into the column gutter. Stays in flow below lg,
              right-aligned, so it never buries a phone-width photo. */}
          <Image
            src={MANIFESTO.overlay.src}
            alt={MANIFESTO.overlay.alt}
            width={MANIFESTO.overlay.width}
            height={MANIFESTO.overlay.height}
            className="relative -mt-gutter-lg mr-gutter-md ml-auto block h-auto w-[13.6875rem] max-w-full lg:absolute lg:-right-gutter-xs lg:bottom-gutter-sm lg:mt-0 lg:mr-0"
          />
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-7">
          <Eyebrow withRule>{MANIFESTO.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{MANIFESTO.title}</h2>
          {MANIFESTO.body.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="mt-gutter-sm max-w-prose text-body-md text-on-surface-variant"
            >
              {paragraph}
            </p>
          ))}

          <dl className="mt-gutter-lg grid gap-gutter-md rounded bg-surface p-gutter-md sm:grid-cols-3">
            {MANIFESTO.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-headline-md text-terracotta">
                    {stat.value}
                  </span>
                  <span className="mt-1 block font-label text-label-sm text-cacao uppercase">
                    {stat.label}
                  </span>
                  <span className="block text-body-sm text-nutmeg">{stat.note}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}
