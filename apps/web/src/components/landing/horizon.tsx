import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/ui/section";
import { HORIZON } from "@/content/landing";

/**
 * What is coming after chinchin, plus a tasting-access sign-up.
 *
 * The form is intentionally NOT functional. There is no backend endpoint to
 * receive an address yet, and a form that silently discards a submission — or
 * worse, shows a fake success message — would be lying to the visitor. The
 * markup, labelling and validation are all real, so wiring it later is only a
 * matter of adding the submit handler and removing `disabled`.
 */
export function Horizon() {
  return (
    <Section className="bg-surface-container-low">
      <div className="rounded border border-rule/70 bg-surface-container p-inset-card sm:p-gutter-xl">
        <Reveal className="max-w-2xl">
          <Eyebrow>{HORIZON.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{HORIZON.title}</h2>
          <p className="mt-gutter-sm text-body-md text-on-surface-variant">
            {HORIZON.body}
          </p>
        </Reveal>

        <ul className="mt-gutter-lg space-y-3">
          {HORIZON.items.map((entry, index) => (
            <Reveal key={entry.title} delay={index * 0.08}>
              <li className="flex flex-wrap items-center gap-gutter-sm rounded border border-rule/70 bg-surface-container-lowest p-gutter-sm">
                <span className="w-24 shrink-0 rounded-sm bg-secondary-container px-2 py-1 text-center font-label text-label-sm text-primary uppercase">
                  {entry.status}
                </span>
                <div className="min-w-48 flex-1">
                  <h3 className="text-body-md font-semibold text-cacao">{entry.title}</h3>
                  <p className="text-body-sm text-on-surface-variant">{entry.body}</p>
                </div>
                <span className="shrink-0 font-label text-label-sm text-nutmeg">
                  {entry.meta}
                </span>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.1}>
          <form className="mt-gutter-lg flex flex-col gap-gutter-sm sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="tasting-email"
                className="block font-label text-label-caps text-nutmeg uppercase"
              >
                {HORIZON.form.label}
              </label>
              <input
                id="tasting-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder={HORIZON.form.placeholder}
                aria-describedby="tasting-note"
                disabled
                className="mt-1 min-h-11 w-full rounded border border-rule bg-[#f8f3ec] px-3 text-body-md text-cacao placeholder:text-nutmeg/70 focus:border-terracotta focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <Button disabled aria-describedby="tasting-note">
              {HORIZON.form.cta}
            </Button>
          </form>
          <p id="tasting-note" className="mt-gutter-xs text-body-sm text-nutmeg">
            Sign-ups open once our ordering system goes live.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
