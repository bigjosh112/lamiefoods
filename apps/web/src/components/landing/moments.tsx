import { Reveal } from "@/components/motion/reveal";
import { ICONS } from "@/components/ui/icons";
import { Eyebrow, Section } from "@/components/ui/section";
import { ImageSlot } from "@/components/ui/image-slot";
import { MOMENTS } from "@/content/landing";

export function Moments() {
  return (
    <Section>
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow>{MOMENTS.eyebrow}</Eyebrow>
        <h2 className="mt-gutter-sm text-headline-lg text-cacao">{MOMENTS.title}</h2>
        <p className="mt-gutter-sm text-body-md text-on-surface-variant">
          {MOMENTS.body}
        </p>
      </Reveal>

      {/* The design offsets these two cards vertically on wide screens. The
          offset is decorative, so it only applies once there is room for it. */}
      <ul className="mt-gutter-xl grid gap-gutter-md md:grid-cols-2">
        {MOMENTS.features.map((feature, index) => (
          <Reveal
            key={feature.title}
            delay={index * 0.1}
            className={index === 1 ? "h-full lg:mt-gutter-xl" : "h-full"}
          >
            <li className="flex h-full flex-col rounded border border-rule/70 bg-surface-container-low p-inset-card">
              <p className="font-label text-label-caps text-tertiary uppercase">
                {feature.eyebrow}
              </p>
              <h3 className="mt-gutter-xs text-headline-sm text-cacao">
                {feature.title}
              </h3>
              <p className="mt-gutter-xs text-body-md text-on-surface-variant">
                {feature.body}
              </p>
              <div className="relative mt-gutter-md aspect-16/10 overflow-hidden rounded border border-rule/70">
                <ImageSlot slot={feature.image} sizes="(min-width: 1024px) 45vw, 100vw" />
              </div>
            </li>
          </Reveal>
        ))}
      </ul>

      <ul className="mt-gutter-md grid gap-gutter-md sm:grid-cols-3">
        {MOMENTS.small.map((entry, index) => {
          const Icon = ICONS[entry.icon];
          return (
            <Reveal key={entry.title} delay={index * 0.08} className="h-full">
              <li className="flex h-full flex-col rounded border border-rule/70 bg-surface-container-low p-inset-card">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-secondary-container text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-gutter-sm text-headline-sm text-cacao">
                  {entry.title}
                </h3>
                <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
                  {entry.body}
                </p>
              </li>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
