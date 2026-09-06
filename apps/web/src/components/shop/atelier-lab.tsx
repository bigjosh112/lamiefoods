import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import { Eyebrow, Section } from "@/components/ui/section";
import { ASSURANCES, ATELIER_LAB } from "@/content/shop";

/**
 * "What's next" panel with a notify-me sign-up.
 *
 * The form is not functional and says so. There is no endpoint to receive an
 * address, and a form that silently drops a submission — or worse, fakes a
 * success message — would be lying to the visitor. Markup, labelling and
 * validation are real, so wiring it later means adding a handler and removing
 * `disabled`.
 */
export function AtelierLab() {
  return (
    <Section className="pb-0">
      <Reveal>
        <div className="grid gap-gutter-lg rounded border border-rule/70 bg-surface-container-low p-inset-card sm:p-gutter-xl lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow withRule>{ATELIER_LAB.eyebrow}</Eyebrow>
            <h2 className="mt-gutter-sm text-headline-md text-cacao">
              {ATELIER_LAB.title}
            </h2>
            <p className="mt-gutter-sm max-w-prose text-body-md text-on-surface-variant">
              {ATELIER_LAB.body}
            </p>
          </div>

          <form className="flex flex-col gap-gutter-xs self-center sm:flex-row sm:items-end lg:col-span-5">
            <div className="flex-1">
              <label htmlFor="notify-email" className="sr-only">
                {ATELIER_LAB.form.label}
              </label>
              <input
                id="notify-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder={ATELIER_LAB.form.placeholder}
                aria-describedby="notify-note"
                disabled
                className="min-h-11 w-full rounded border border-rule bg-[#f8f3ec] px-3 text-body-md text-cacao placeholder:text-nutmeg/70 focus:border-terracotta focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <Button disabled aria-describedby="notify-note">
              {ATELIER_LAB.form.cta}
            </Button>
          </form>

          <p id="notify-note" className="text-body-sm text-nutmeg lg:col-span-12">
            Sign-ups open once our ordering system goes live.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/** The three standing promises, on a warmer band beneath the catalogue. */
export function AssuranceBand() {
  return (
    <Section className="mt-section bg-surface-container">
      <ul className="grid gap-gutter-lg sm:grid-cols-3">
        {ASSURANCES.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <li key={item.title} className="flex gap-gutter-sm">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded bg-secondary-container text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-headline-sm text-cacao">{item.title}</h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">{item.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
