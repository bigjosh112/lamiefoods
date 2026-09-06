import Image from "next/image";
import Link from "next/link";
import { ADMIN_ROUTES, BRAND, ROUTES } from "@lamiefoods/config";
import { ICONS } from "@/components/ui/icons";
import { ADMIN_NAV } from "@/content/admin-dashboard";

/**
 * Admin chrome: sidebar plus top bar.
 *
 * Every nav item except Dashboard points at a route that does not exist yet, so
 * they render as disabled items rather than links to a 404. They become links
 * as each screen is built.
 *
 * The sidebar collapses to a horizontal scroller below `lg` — an operator on a
 * phone still needs to reach the sections, and a hidden drawer is more chrome
 * than this earns today.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-container-low lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-rule/70 bg-surface lg:min-h-dvh lg:border-r lg:border-b-0">
        <div className="border-b border-rule/70 p-gutter-sm">
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
                Admin
              </span>
            </span>
          </Link>
        </div>

        <nav aria-label="Admin sections" className="p-gutter-xs">
          <ul className="flex gap-gutter-xs overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible">
            {ADMIN_NAV.map((item, index) => {
              const Icon = ICONS[item.icon];
              // Only the dashboard exists; the rest would 404.
              const available = index === 0;

              return (
                <li key={item.label} className="shrink-0 lg:shrink">
                  {available ? (
                    <Link
                      href={item.href}
                      aria-current="page"
                      className="flex min-h-11 items-center gap-gutter-xs rounded bg-primary-container px-gutter-sm font-label text-label-md text-linen"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      title="Not built yet"
                      className="flex min-h-11 cursor-not-allowed items-center gap-gutter-xs rounded px-gutter-sm font-label text-label-md text-nutmeg/70"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-gutter-sm border-b border-rule/70 bg-surface px-gutter-md py-3">
          <p className="inline-flex items-center gap-gutter-xs rounded-full border border-rule/70 bg-surface-container px-3 py-1 font-label text-label-sm text-cacao">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-terracotta" />
            Admin portal
          </p>

          <div className="flex items-center gap-gutter-sm">
            <Link
              href={ROUTES.home}
              className="inline-flex min-h-11 items-center gap-gutter-xs text-body-sm text-on-surface-variant transition-colors hover:text-terracotta"
            >
              <ICONS.truck className="h-4 w-4" />
              View live store
            </Link>
            <span className="border-l border-rule/70 pl-3 font-label text-label-sm text-nutmeg">
              Not signed in
            </span>
          </div>
        </header>

        <main id="main" className="min-w-0 flex-1 p-gutter-md">
          {children}
        </main>
      </div>
    </div>
  );
}
