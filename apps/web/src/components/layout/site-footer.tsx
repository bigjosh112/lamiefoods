import Image from "next/image";
import Link from "next/link";
import { ADMIN_ROUTES, BRAND } from "@lamiefoods/config";
import { DevPreviewLinks } from "@/components/layout/dev-preview-links";
import { ICONS } from "@/components/ui/icons";
import { FOOTER } from "@/content/landing";
import { FOOTER_COLUMNS } from "@/content/shop";

/**
 * Site footer, shared by every page so navigation never differs between them.
 *
 * Links whose destination does not exist yet render as plain text rather than
 * as links to a 404 — see `FOOTER_COLUMNS`, where those carry `href: null`.
 *
 * One deliberate departure from the design mock: the copyright uses "Lamie
 * Foods", not "Lamie Foods Enterprise" (the customer-facing name). The
 * "Website by Basil Studio" credit ships as plain text, not a link — the owner
 * confirmed it but supplied no URL to link to.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rule/70 bg-surface-container-low px-margin py-section">
      <div className="mx-auto w-full max-w-(--container-page)">
        {/*
          Three tiers, not two. Stacking the brand block and all four link
          columns vertically until 1024px made the footer taller than most
          phone screens; from 640px the link columns sit two-up, and from
          768px the whole thing is one 12-column row.
        */}
        <div className="grid gap-gutter-lg sm:grid-cols-2 md:grid-cols-12">
          <div className="sm:col-span-2 md:col-span-4">
            <div className="flex items-center gap-gutter-xs">
              <Image
                src="/Lamie Foods - Logo.svg"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9"
              />
              <span className="font-display text-headline-sm text-cacao">
                {BRAND.displayName}
              </span>
            </div>

            {/*
              Sentence case done in CSS, not by editing the string. `tagline` is
              `BRAND.tagline`, an owner-confirmed brand fact that also feeds the
              page title, OG tags and JSON-LD — rewriting it here would change
              all of those. `::first-letter` needs a block box, which <p> is.
            */}
            <p className="mt-gutter-sm font-label text-label-sm text-terracotta lowercase first-letter:uppercase">
              {FOOTER.tagline}
            </p>
            <p className="mt-gutter-sm max-w-sm text-body-sm text-on-surface-variant">
              {FOOTER.body}
            </p>

            <ul className="mt-gutter-md flex gap-gutter-xs">
              {FOOTER.contact.map((entry) => {
                const Icon = ICONS[entry.icon];
                const className =
                  "border-rule/70 bg-surface text-cacao inline-flex h-10 w-10 items-center justify-center rounded border";

                return (
                  <li key={entry.label}>
                    {entry.href ? (
                      <a
                        href={entry.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={entry.label}
                        className={`${className} transition-colors hover:border-cacao hover:text-terracotta`}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ) : (
                      // No confirmed destination yet, so this is not a link.
                      <span
                        aria-label={entry.label}
                        title={entry.label}
                        className={`${className} text-nutmeg opacity-60`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="md:col-span-2">
              <h2 className="font-label text-label-caps text-cacao uppercase">
                {column.title}
              </h2>
              <ul className="mt-gutter-sm space-y-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="inline-flex min-h-9 items-center text-body-sm text-on-surface-variant transition-colors hover:text-terracotta"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-9 items-center text-body-sm text-nutmeg/70">
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <DevPreviewLinks />

        <div className="mt-gutter-lg flex flex-wrap items-center justify-between gap-gutter-sm border-t border-rule/70 pt-gutter-md">
          <p className="flex flex-wrap items-center gap-gutter-sm text-body-sm text-nutmeg">
            <span>
              © {year} {BRAND.displayName}. All rights reserved.
            </span>
            {/* Staff entrance. Kept out of the header's account icon, which on a
                storefront means "customer account" and will be needed for that. */}
            <Link
              href={ADMIN_ROUTES.login}
              className="transition-colors hover:text-terracotta"
            >
              Staff sign-in
            </Link>
          </p>
          <p className="text-body-sm text-nutmeg">{FOOTER.credit}</p>
        </div>
      </div>
    </footer>
  );
}
