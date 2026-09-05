import { Reveal } from "@/components/motion/reveal";
import { Eyebrow, Section } from "@/components/ui/section";
import { ImageSlot } from "@/components/ui/image-slot";
import { MANIFESTO } from "@/content/landing";

/**
 * Asymmetric editorial spread: image on the left, narrative on the right.
 * Stacks to a single column below `lg` so the image never gets squeezed into an
 * unreadable sliver on tablets.
 */
export function Manifesto() {
  return (
    <Section className="bg-surface-container-low">
      <div className="grid items-center gap-gutter-xl lg:grid-cols-2">
        <Reveal className="relative">
          <div className="relative aspect-4/5 overflow-hidden rounded border border-rule/70">
            <ImageSlot slot={MANIFESTO.image} sizes="(min-width: 1024px) 45vw, 100vw" />
          </div>
          <div className="relative -mt-gutter-lg ml-gutter-md max-w-xs rounded bg-primary-container p-gutter-md text-linen">
            <p className="font-label text-label-caps text-tertiary-fixed uppercase">
              {MANIFESTO.overlay.eyebrow}
            </p>
            <p className="mt-1 font-display text-headline-sm">{MANIFESTO.overlay.text}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Eyebrow>{MANIFESTO.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{MANIFESTO.title}</h2>
          {MANIFESTO.body.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="mt-gutter-sm max-w-prose text-body-md text-on-surface-variant"
            >
              {paragraph}
            </p>
          ))}

          <dl className="mt-gutter-lg grid gap-gutter-md border-t border-rule/70 pt-gutter-md sm:grid-cols-3">
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
