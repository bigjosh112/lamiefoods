import { Reveal } from "@/components/motion/reveal";
import { LeafIcon, SoundIcon, UtensilsIcon } from "@/components/ui/icons";
import { Eyebrow, Section } from "@/components/ui/section";
import type { Product } from "@/content/products";

/**
 * "The Architecture of ..." — flavour, texture and pairing detail.
 *
 * The allergen line is intentionally a placeholder rather than the mock's
 * confident "Contains: Wheat (Gluten), Milk": that statement contradicts the
 * landing page's own mention of whole farm eggs, so it cannot be trusted, and an
 * allergen declaration is a safety matter rather than marketing copy.
 */
export function Provenance({ product }: { product: Product }) {
  const { provenance, ingredients, storage } = product.detail;

  return (
    <Section className="bg-surface-container-low">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow>Culinary Provenance</Eyebrow>
        <h2 className="mt-gutter-sm text-headline-lg text-cacao">{provenance.title}</h2>
        <p className="mt-gutter-sm text-body-md text-on-surface-variant">
          {provenance.body}
        </p>
      </Reveal>

      <div className="mt-gutter-xl grid gap-gutter-md lg:grid-cols-3">
        <Reveal className="h-full">
          <Card icon={<LeafIcon className="h-5 w-5" />} title={provenance.flavour.title}>
            <p className="text-body-sm text-on-surface-variant">
              {provenance.flavour.body}
            </p>
            <dl className="mt-gutter-md space-y-3">
              {provenance.flavour.bars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex items-baseline justify-between gap-gutter-sm">
                    <dt className="text-body-sm text-on-surface-variant">{bar.label}</dt>
                    <dd className="shrink-0 font-label text-label-sm text-terracotta">
                      {bar.pct}%
                    </dd>
                  </div>
                  {/* Value already stated in the <dd>, so the bar is decorative. */}
                  <div
                    aria-hidden="true"
                    className="mt-1 h-1 w-full overflow-hidden rounded-sm bg-rule/60"
                  >
                    <div
                      className="h-full rounded-sm bg-terracotta"
                      style={{ width: `${bar.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          </Card>
        </Reveal>

        <Reveal delay={0.08} className="h-full">
          <Card
            icon={<SoundIcon className="h-5 w-5" />}
            title={provenance.acoustic.title}
          >
            <p className="text-body-sm text-on-surface-variant">
              {provenance.acoustic.body}
            </p>
            <div className="mt-gutter-md rounded bg-cacao p-gutter-sm">
              <p className="font-label text-label-sm text-linen/60 uppercase">
                {provenance.acoustic.rating.label}
              </p>
              <p className="mt-1 font-label text-label-md text-tertiary-fixed-dim">
                {provenance.acoustic.rating.value}
              </p>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.16} className="h-full">
          <Card
            icon={<UtensilsIcon className="h-5 w-5" />}
            title={provenance.pairings.title}
          >
            <p className="text-body-sm text-on-surface-variant">
              {provenance.pairings.body}
            </p>
            <ul className="mt-gutter-md space-y-2">
              {provenance.pairings.items.map((item) => (
                <li key={item} className="flex items-start gap-gutter-xs">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta"
                  />
                  <span className="text-body-sm text-on-surface-variant">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>

      <div className="mt-gutter-md grid gap-gutter-md lg:grid-cols-2">
        <Reveal className="h-full">
          <Panel title="Artisanal Ingredients" tag={ingredients.tag}>
            <p className="text-body-sm text-on-surface-variant">{ingredients.body}</p>
            <p className="mt-gutter-sm text-body-sm text-nutmeg italic">
              {ingredients.allergens ??
                "Allergen information to be confirmed before publication."}
            </p>
          </Panel>
        </Reveal>

        <Reveal delay={0.08} className="h-full">
          <Panel title="Preservation &amp; Shelf Life" tag={storage.tag}>
            <p className="text-body-sm text-on-surface-variant">{storage.body}</p>
            <p className="mt-gutter-sm font-label text-label-sm text-terracotta uppercase">
              {storage.note}
            </p>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded border border-rule/70 bg-surface p-inset-card">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-secondary-container text-primary">
        {icon}
      </span>
      <h3 className="mt-gutter-md text-headline-sm text-cacao">{title}</h3>
      <div className="mt-gutter-xs flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function Panel({
  title,
  tag,
  children,
}: {
  title: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-full rounded border border-rule/70 bg-surface p-inset-card">
      <div className="flex items-baseline justify-between gap-gutter-sm">
        <h3 className="text-headline-sm text-cacao">{title}</h3>
        <span className="shrink-0 font-label text-label-sm text-nutmeg uppercase">
          {tag}
        </span>
      </div>
      <div className="mt-gutter-sm">{children}</div>
    </div>
  );
}
