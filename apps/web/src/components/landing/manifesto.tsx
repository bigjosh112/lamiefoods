import { Reveal } from "@/components/motion/reveal";
import { ImageSlot } from "@/components/ui/image-slot";
import { Eyebrow, Section } from "@/components/ui/section";
import { MANIFESTO } from "@/content/landing";

/**
 * Asymmetric editorial spread, measured off the approved frame at 1280px:
 * a 5-column visual against a 7-column narrative, separated by the 40px desktop
 * gutter. The image column is 443.33 x 591.09 — exactly 3:4.
 *
 * The "Philosophy — Good food respects the craft" card that used to overlay the
 * photograph was removed at the owner's request, along with all the positioning
 * it needed. The picture now stands alone.
 *
 * The stat row carries no card either: a hairline separates it from the copy
 * above, and spacing separates the three figures from each other — no vertical
 * rules. The eyebrow runs in sentence case with no leading rule, overridden at
 * the call site since `Eyebrow` is shared.
 */
export function Manifesto() {
  return (
    <Section className="bg-surface-container-low" id="manifesto">
      <div className="grid items-center gap-gutter-lg md:grid-cols-12">
        <Reveal className="relative mx-auto w-full max-w-sm md:col-span-5 md:max-w-none">
          <div className="relative aspect-3/4 overflow-hidden rounded border border-rule/70">
            <ImageSlot slot={MANIFESTO.image} sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-7">
          <Eyebrow className="text-label-sm normal-case">{MANIFESTO.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{MANIFESTO.title}</h2>
          {MANIFESTO.body.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="mt-gutter-sm max-w-prose text-body-md text-on-surface-variant"
            >
              {paragraph}
            </p>
          ))}

          <dl className="mt-gutter-lg grid gap-gutter-lg border-t border-rule/70 pt-gutter-md sm:grid-cols-3">
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
