import { BRAND } from "@lamiefoods/config";

/**
 * Setup placeholder, now rendering through the approved design system's tokens.
 * The real homepage replaces this — it exists so the app has a route that
 * proves the type scale, palette and both typefaces actually resolve.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-margin py-3xl">
      <p className="text-label-md text-on-surface-variant uppercase">Scaffold</p>
      <h1 className="mt-md text-display-lg text-primary">{BRAND.name}</h1>
      <p className="mt-md text-body-lg text-on-surface-variant">{BRAND.tagline}</p>
      <p className="mt-xl max-w-prose text-body-md text-on-surface-variant">
        Monorepo, frontend foundation and design system are in place. The site itself is
        built once the page designs are supplied.
      </p>
    </main>
  );
}
