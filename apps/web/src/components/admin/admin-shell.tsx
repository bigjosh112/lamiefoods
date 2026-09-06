import Image from "next/image";
import Link from "next/link";
import { ADMIN_ROUTES, BRAND, ROUTES } from "@lamiefoods/config";
import { ICONS } from "@/components/ui/icons";
import { ADMIN_NAV_SECTIONS, ADMIN_USER } from "@/content/admin-dashboard";

/**
 * Admin chrome: sidebar plus top bar.
 *
 * From `lg` up the shell is pinned — the page itself never scrolls, and the
 * sidebar and top bar stay put while only the content column moves. That is
 * what an operations console wants: the nav and the current context should not
 * disappear while you scroll a long dispatch table.
 *
 * Below `lg` it reverts to normal document flow with the nav as a horizontal
 * scroller. Pinning chrome on a phone eats the viewport.
 *
 * Every nav item except Dashboard points at a route that does not exist yet, so
 * they render disabled rather than as links to a 404.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-low lg:grid lg:h-dvh lg:grid-cols-[16rem_1fr] lg:overflow-hidden">
      <aside className="flex flex-col border-b border-rule/70 bg-surface lg:h-dvh lg:border-r lg:border-b-0">
        <div className="shrink-0 border-b border-rule/70 p-gutter-sm">
          <Link href={ADMIN_ROUTES.dashboard} className="flex items-center gap-gutter-xs">
            <Image
              src="/Lamie Foods - Logo.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span>
              <span className="block font-display text-headline-sm leading-none text-cacao">
                {BRAND.displayName}
              </span>
              <span className="block font-label text-label-sm text-nutmeg uppercase">
                Admin suite
              </span>
            </span>
          </Link>
        </div>

        {/* Only the nav scrolls if it outgrows the column, so the operator card
            below stays reachable. */}
        <nav
          aria-label="Admin sections"
          className="min-h-0 flex-1 p-gutter-xs lg:overflow-y-auto"
        >
          <div className="flex gap-gutter-md lg:block lg:space-y-4">
            {ADMIN_NAV_SECTIONS.map((section) => (
              <div key={section.title} className="shrink-0 lg:shrink">
                <p className="hidden px-gutter-sm font-label text-label-sm text-nutmeg uppercase lg:block">
                  {section.title}
                </p>
                <ul className="mt-1 flex gap-gutter-xs lg:block lg:space-y-1">
                  {section.items.map((item) => {
                    const Icon = ICONS[item.icon];
                    // Only the dashboard exists; everything else would 404.
                    const available = item.href === ADMIN_ROUTES.dashboard;

                    return (
                      <li key={item.label} className="shrink-0 lg:shrink">
                        {available ? (
                          <Link
                            href={item.href}
                            aria-current="page"
                            className="flex min-h-11 items-center gap-gutter-xs rounded bg-primary-container px-gutter-sm font-label text-label-md whitespace-nowrap text-linen"
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {item.label}
                          </Link>
                        ) : (
                          <span
                            aria-disabled="true"
                            title="Not built yet"
                            className="flex min-h-11 cursor-not-allowed items-center gap-gutter-xs rounded px-gutter-sm font-label text-label-md whitespace-nowrap text-nutmeg/70"
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {item.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <OperatorCard className="hidden shrink-0 p-gutter-xs lg:block" />
      </aside>

      <div className="flex min-w-0 flex-col lg:h-dvh lg:overflow-hidden">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-gutter-sm border-b border-rule/70 bg-surface px-gutter-md py-3">
          <p className="inline-flex items-center gap-gutter-xs rounded-full border border-rule/70 bg-surface-container px-3 py-1 font-label text-label-sm text-cacao">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-terracotta" />
            Admin portal
          </p>

          <div className="flex items-center gap-gutter-sm">
            <Link
              href={ROUTES.home}
              className="inline-flex min-h-11 items-center gap-gutter-xs rounded border border-rule/70 bg-surface-container-low px-gutter-sm text-body-sm text-on-surface-variant transition-colors hover:text-terracotta"
            >
              <ICONS.box className="h-4 w-4" />
              View live store
            </Link>

            {/* Disabled: there is no notification feed behind this. */}
            <span
              aria-disabled="true"
              title="No notifications yet"
              className="relative inline-flex h-11 w-11 cursor-not-allowed items-center justify-center text-cacao"
            >
              <ICONS.bell className="h-5 w-5" />
              <span
                aria-hidden="true"
                className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-terracotta"
              />
            </span>

            <span className="flex items-center gap-gutter-xs">
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-linen"
              >
                <ICONS.people className="h-4 w-4" />
              </span>
              <span className="hidden sm:block">
                <span className="block text-body-sm leading-tight text-cacao">
                  {ADMIN_USER.name}
                </span>
                <span className="block text-body-sm leading-tight text-nutmeg">
                  {ADMIN_USER.location}
                </span>
              </span>
            </span>
          </div>
        </header>

        {/* The only scrolling region on desktop. */}
        <main id="main" className="min-w-0 flex-1 p-gutter-md lg:overflow-y-auto">
          {children}
          <OperatorCard className="mt-gutter-md lg:hidden" />
        </main>
      </div>
    </div>
  );
}

/**
 * Signed-in operator. Sample only — nobody is signed in, because there is no
 * authentication, so sign-out is disabled: there is no session to end.
 */
function OperatorCard({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
        <span
          aria-hidden="true"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-linen"
        >
          <ICONS.people className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-body-sm leading-tight font-semibold text-cacao">
            {ADMIN_USER.name}
          </span>
          <span className="block text-body-sm leading-tight text-nutmeg">
            {ADMIN_USER.location}
          </span>
        </span>
        <span
          aria-disabled="true"
          title="No session to sign out of"
          className="inline-flex h-9 w-9 shrink-0 cursor-not-allowed items-center justify-center text-nutmeg/70"
        >
          <ICONS.signOut className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
