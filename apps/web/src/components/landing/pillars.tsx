import { Reveal } from "@/components/motion/reveal";
import { Eyebrow, Section } from "@/components/ui/section";
import { ICONS } from "@/components/ui/icons";
import { PILLARS } from "@/content/landing";

export function Pillars() {
  return (
    <Section>
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow>{PILLARS.eyebrow}</Eyebrow>
        <h2 className="mt-gutter-sm text-headline-lg text-cacao">{PILLARS.title}</h2>
        <p className="mt-gutter-sm text-body-md text-on-surface-variant">
          {PILLARS.body}
        </p>
      </Reveal>

      <ul className="mt-gutter-xl grid gap-gutter-md md:grid-cols-3">
        {PILLARS.items.map((pillar, index) => {
          const Icon = ICONS[pillar.icon];
          return (
            <Reveal key={pillar.index} delay={index * 0.1} className="h-full">
              <li className="flex h-full flex-col rounded border border-rule/70 bg-surface-container-low p-inset-card transition-shadow duration-300 hover:shadow-earth">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded bg-primary-container text-linen">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-gutter-md font-label text-label-caps text-tertiary uppercase">
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
    </Section>
  );
}
