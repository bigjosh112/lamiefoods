import Image from "next/image";
import Link from "next/link";
import { ADMIN_ROUTES, BRAND, ROUTES } from "@lamiefoods/config";
import { ICONS } from "@/components/ui/icons";
import { SignOutButton } from "./sign-out-button";
import { AdminNav } from "./admin-nav";

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
 * Dashboard, Orders, Products, Customers, Inventory and Settings are all real
 * routes now (`ADMIN_NAV_SECTIONS`' `BUILT_ROUTES` in `admin-nav.tsx`); only
 * routes with no page behind them still render disabled.
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
          <AdminNav />
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
              {/* No stored admin profile exists beyond one shared credential
                  (Q21 — no team accounts), so "Signed in" is all that's true
                  to show — never a fabricated name. */}
              <span className="hidden text-body-sm text-cacao sm:block">Signed in</span>
            </span>

            <SignOutButton className="inline-flex min-h-11 items-center gap-gutter-xs rounded border border-rule/70 bg-surface-container-low px-gutter-sm text-body-sm text-on-surface-variant transition-colors hover:text-error" />
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
 * Signed-in operator. There is one shared credential, not a per-user
 * profile (Q21 — no team accounts), so this shows a real session state
 * rather than a fabricated name — and a real, working sign-out.
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
        <span className="min-w-0 flex-1 text-body-sm leading-tight font-semibold text-cacao">
          Signed in
        </span>
        <SignOutButton
          iconOnly
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-nutmeg transition-colors hover:text-error"
        />
      </div>
    </div>
  );
}
