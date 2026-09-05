import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@lamiefoods/config";
import { ICONS } from "@/components/ui/icons";
import { FOOTER } from "@/content/landing";

/**
 * Site footer.
 *
 * Two departures from the design mock, both deliberate: the copyright line uses
 * "Lamie Foods" rather than "Lamie Foods Enterprise" (the customer-facing name),
 * and the mock's third-party studio credit is omitted since it cannot be
 * verified. Contact rows without a confirmed destination render as plain text
 * rather than as links that go nowhere.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rule/70 bg-surface-container-low px-margin py-(--spacing-section)">
      <div className="mx-auto w-full max-w-(--container-page)">
        <div className="grid gap-gutter-lg lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
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
            <p className="mt-gutter-sm font-label text-label-caps text-terracotta uppercase">
              {FOOTER.tagline}
            </p>
            <p className="mt-gutter-sm max-w-sm text-body-sm text-on-surface-variant">
              {FOOTER.body}
            </p>
          </div>

          {FOOTER.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-label text-label-caps text-cacao uppercase">
                {column.title}
              </h2>
              <ul className="mt-gutter-sm space-y-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center text-body-sm text-on-surface-variant transition-colors hover:text-terracotta"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="font-label text-label-caps text-cacao uppercase">
              Direct Connection
            </h2>
            <ul className="mt-gutter-sm space-y-1">
              {FOOTER.contact.map((entry) => {
                const Icon = ICONS[entry.icon];
                const content = (
                  <>
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{entry.label}</span>
                  </>
                );

                return (
                  <li key={entry.label}>
                    {entry.href ? (
                      <a
                        href={entry.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-9 items-center gap-gutter-xs text-body-sm text-on-surface-variant transition-colors hover:text-terracotta"
                      >
                        {content}
                      </a>
                    ) : (
                      <span className="inline-flex min-h-9 items-center gap-gutter-xs text-body-sm text-nutmeg">
                        {content}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-gutter-lg border-t border-rule/70 pt-gutter-md">
          <p className="text-body-sm text-nutmeg">
            © {year} {BRAND.displayName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
