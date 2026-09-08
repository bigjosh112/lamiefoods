import { Reveal } from "@/components/motion/reveal";
import { LeafIcon, UtensilsIcon } from "@/components/ui/icons";
import { Eyebrow, Section } from "@/components/ui/section";
import type { Product } from "@lamiefoods/types";

/**
 * Ingredients, pairings and storage — the real, admin-editable fields.
 *
 * Supersedes `Provenance` (now deleted), which rendered a "flavour profile"/
 * "acoustic crunch"/"pairings" narrative structure with sensory percentage
 * bars — none of which the admin form ever had fields for. That content was
 * always hardcoded, never editable, and carrying it forward as DB content
 * nobody could actually change would repeat the exact mistake this codebase
 * already refused to make for admin panels. See the 2026-09-07 "real product
 * catalog" decision log in architecture.md.
 *
 * The allergen line falls back to a "to be confirmed" statement whenever
 * `allergensConfirmed` is false — an allergen declaration is a food-safety
 * matter, not marketing copy (GAP-007).
 */
export function ProductDetails({ product }: { product: Product }) {
  const hasStorageInfo = Boolean(product.storageNote || product.shelfLife);

  return (
    <Section className="bg-surface-container-low">
      {product.narrative && (
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>The Story</Eyebrow>
          <p className="mt-gutter-sm text-body-md text-on-surface-variant">
            {product.narrative}
          </p>
        </Reveal>
      )}

      <div className="mt-gutter-xl grid gap-gutter-md md:grid-cols-2 lg:grid-cols-3">
        <Reveal className="h-full">
          <Card icon={<LeafIcon className="h-5 w-5" />} title="Ingredients">
            <p className="text-body-sm text-on-surface-variant">{product.ingredients}</p>
            <p className="mt-gutter-sm text-body-sm text-nutmeg italic">
              {product.allergensConfirmed
                ? product.allergens.length > 0
                  ? `Contains: ${product.allergens.join(", ")}.`
                  : "Contains none of the declared allergens."
                : "Allergen information to be confirmed before publication."}
            </p>
          </Card>
        </Reveal>

        {product.pairings && (
          <Reveal delay={0.08} className="h-full">
            <Card icon={<UtensilsIcon className="h-5 w-5" />} title="Pairings">
              <p className="text-body-sm text-on-surface-variant">{product.pairings}</p>
            </Card>
          </Reveal>
        )}

        {hasStorageInfo && (
          <Reveal delay={0.16} className="h-full">
            <Card
              icon={<LeafIcon className="h-5 w-5" />}
              title="Storage &amp; shelf life"
            >
              <p className="text-body-sm text-on-surface-variant">
                {product.storageNote ?? "Storage guidance to be confirmed."}
              </p>
              {product.shelfLife && (
                <p className="mt-gutter-sm font-label text-label-sm text-terracotta uppercase">
                  Shelf life: {product.shelfLife}
                </p>
              )}
            </Card>
          </Reveal>
        )}
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
