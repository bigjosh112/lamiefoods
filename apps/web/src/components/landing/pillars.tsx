import { Reveal } from "@/components/motion/reveal";
import { Eyebrow, Section } from "@/components/ui/section";
import { ICONS } from "@/components/ui/icons";
import { PILLARS } from "@/content/landing";

/**
 * The three pillars.
 *
 * No card treatment: no background, border, radius or shadow on the columns,
 * and no chip behind the icons — each sits bare in terracotta, the colour its
 * container used to carry. The columns are separated by the grid gap alone,
 * which steps up from `gutter-md` to `gutter-lg` to make up for the
 * `p-inset-card` the boxes used to contribute; without that the three blocks
 * of copy would sit closer together than they did inside their boxes.
 *
 * The eyebrow and the pillar labels run in sentence case, overridden at the
 * call site — `Eyebrow` is shared and keeps its tracked-out caps elsewhere.
 */
export function Pillars() {
  return (
    <Section>
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow className="text-label-sm normal-case">{PILLARS.eyebrow}</Eyebrow>
        <h2 className="mt-gutter-sm text-headline-lg text-cacao">{PILLARS.title}</h2>
        <p className="mt-gutter-sm text-body-md text-on-surface-variant">
          {PILLARS.body}
        </p>
        <p className="mt-gutter-sm text-body-md text-on-surface-variant">
          {PILLARS.intro}
        </p>
      </Reveal>

      <ul className="mt-gutter-xl grid gap-gutter-lg md:grid-cols-3">
        {PILLARS.items.map((pillar, index) => {
          const Icon = ICONS[pillar.icon];
          return (
            <Reveal key={pillar.index} delay={index * 0.1} className="h-full">
              <li className="flex h-full flex-col">
                <Icon className="h-6 w-6 text-terracotta" />
                <p className="mt-gutter-md font-label text-label-sm text-tertiary normal-case">
                  {pillar.index}
                </p>
                <h3 className="mt-1 text-headline-sm text-cacao">{pillar.title}</h3>
                <p className="mt-gutter-xs text-body-md text-on-surface-variant">
                  {pillar.body}
                </p>
              </li>
            </Reveal>
          );
        })}
      </ul>

      {/* Closing line. `mt-gutter-xl` mirrors the grid's own top spacing, so it
          sits as far below the columns as they sit below the intro. */}
      <Reveal delay={0.3}>
        <p className="mt-gutter-xl text-center text-body-lg text-cacao">
          {PILLARS.closing}
        </p>
      </Reveal>
    </Section>
  );
}
