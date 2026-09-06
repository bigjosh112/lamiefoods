import Link from "next/link";

/**
 * Shortcuts to pages that have no route into them yet.
 *
 * `/order-success` is only ever reached by redirect after payment, so while
 * checkout cannot submit there is no way to click through to it. This puts a
 * link in the footer during development so the page stays reviewable.
 *
 * The `NODE_ENV` check is a compile-time constant in Next, so the whole
 * component is dead code in a production build and cannot ship by accident —
 * it is not a runtime flag someone could flip.
 *
 * Delete this once checkout redirects for real.
 */
const PREVIEW_LINKS = [
  { label: "Order confirmation (sample)", href: "/order-success?preview=1" },
  { label: "Order confirmation (empty state)", href: "/order-success" },
];

export function DevPreviewLinks() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="mt-gutter-md border-t border-dashed border-rule/70 pt-gutter-sm">
      <p className="font-label text-label-sm text-nutmeg uppercase">
        Dev only · not shipped to production
      </p>
      <ul className="mt-gutter-xs flex flex-wrap gap-gutter-sm">
        {PREVIEW_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-9 items-center text-body-sm text-terracotta underline underline-offset-4 transition-colors hover:text-saffron"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
