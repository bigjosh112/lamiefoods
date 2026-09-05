import { BRAND } from "@lamiefoods/config";

/**
 * Setup placeholder. The real homepage is built from the approved Stitch
 * design — this exists only so the app has a route to render and verify.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-(--spacing-gutter) py-(--spacing-fluid-lg)">
      <p className="text-fluid-sm tracking-[0.2em] text-ink-muted uppercase">Scaffold</p>
      <h1 className="mt-(--spacing-fluid-sm) text-fluid-4xl leading-[1.05] font-semibold">
        {BRAND.name}
      </h1>
      <p className="mt-(--spacing-fluid-sm) text-fluid-lg text-ink-muted">
        {BRAND.tagline}
      </p>
      <p className="mt-(--spacing-fluid-md) max-w-prose text-fluid-base text-ink-muted">
        Monorepo and frontend foundation are in place. The site itself is built once the
        approved designs and brand assets are supplied.
      </p>
    </main>
  );
}
