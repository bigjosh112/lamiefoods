import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import { Eyebrow, Section } from "@/components/ui/section";
import { FINAL_CTA } from "@/content/landing";

/**
 * Closing call to action on the system's inverted cacao surface, mirroring the
 * hero so the page opens and closes on the same dark note.
 */
export function FinalCta() {
  return (
    <Section className="bg-cacao" id="contact">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow className="text-label-sm text-tertiary-fixed-dim normal-case">
          {FINAL_CTA.eyebrow}
        </Eyebrow>

        <h2 className="mt-gutter-sm text-headline-lg text-linen">
          <span className="block">{FINAL_CTA.titleLine1}</span>
          <span className="block text-tertiary-fixed-dim italic">
            {FINAL_CTA.titleLine2}
          </span>
        </h2>

        <p className="mt-gutter-sm text-body-lg text-linen/75">{FINAL_CTA.body}</p>

        <div className="mt-gutter-lg flex flex-col items-stretch gap-gutter-sm sm:flex-row sm:justify-center">
          {/* Casing only — radius, variant and spacing are untouched.
              `text-label-md` rather than the caps step: at the same 11px,
              sentence case at 500 weight reads noticeably weaker than 700-weight
              capitals, which would have quietly shrunk the page's closing CTA.
              Matches the hero's buttons. */}
          <ButtonLink
            href={FINAL_CTA.primaryCta.href}
            className="text-label-md normal-case"
          >
            {FINAL_CTA.primaryCta.label}
          </ButtonLink>
          <ButtonLink
            href={FINAL_CTA.secondaryCta.href}
            variant="inverted"
            className="text-label-md normal-case"
          >
            {FINAL_CTA.secondaryCta.label}
          </ButtonLink>
        </div>

        <ul className="mt-gutter-xl flex flex-wrap justify-center gap-gutter-md border-t border-linen/15 pt-gutter-md">
          {FINAL_CTA.assurances.map((entry) => {
            const Icon = ICONS[entry.icon];
            return (
              <li
                key={entry.label}
                className="flex items-center gap-gutter-xs text-linen/70"
              >
                <Icon className="h-4 w-4 text-tertiary-fixed-dim" />
                <span className="font-label text-label-sm">{entry.label}</span>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </Section>
  );
}
