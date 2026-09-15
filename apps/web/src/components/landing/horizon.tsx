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
          <Eyebrow className="text-label-sm normal-case">{HORIZON.eyebrow}</Eyebrow>
          <h2 className="mt-gutter-sm text-headline-lg text-cacao">{HORIZON.title}</h2>
          <p className="mt-gutter-sm text-body-md text-on-surface-variant">
            {HORIZON.body}
          </p>
        </Reveal>

        {/*
          A list, not a stack of cards: one hairline above the first row and one
          between each pair, no side borders and no radius. The rule sits on the
          <li> so it draws immediately, while only the content inside rises.

          `Reveal` renders a <div>, so it used to wrap each <li> — putting a div
          directly inside a <ul>, which is invalid. It is nested inside the row
          now instead. `flavours.tsx` still has the original pattern.
        */}
        <ul className="mt-gutter-lg">
          {HORIZON.items.map((entry, index) => (
            <li key={entry.title} className="border-t border-rule/70 py-gutter-sm">
              {/* The status chip that sat left of the name ("In testing", "In
                  development", "Reserve") was removed on 2026-09-15. Its row was
                  a flex container with the text in a `flex-1` column beside the
                  chip; with nothing left to share the row, that wrapper went
                  too, so the name starts flush at the rule's left edge. */}
              <Reveal delay={index * 0.08}>
                <h3 className="text-body-md font-semibold text-cacao">{entry.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{entry.body}</p>
              </Reveal>
            </li>
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
            {/* Sentence case and the 6px radius the page's other primary
                buttons now use. Still disabled — see the note above. */}
            <Button
              disabled
              aria-describedby="tasting-note"
              className="text-label-md normal-case"
            >
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
