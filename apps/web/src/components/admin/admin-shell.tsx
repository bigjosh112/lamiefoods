import Image from "next/image";
import Link from "next/link";
import { ADMIN_ROUTES, BRAND, ROUTES } from "@lamiefoods/config";
import { ICONS } from "@/components/ui/icons";
import { SignOutButton } from "./sign-out-button";
import { AdminNav } from "./admin-nav";
import { AdminMobileNav } from "./admin-mobile-nav";

/**
 * Admin chrome: sidebar plus top bar.
 *
 * ── Why the sidebar is sticky rather than the whole shell being pinned ──
 *
 * This used to be `lg:h-dvh lg:overflow-hidden` on the grid, with the content
 * column scrolling inside itself. That kept the nav in view, but it also forced
 * the content column to exactly one viewport height, so any short page — most
 * obviously Settings — rendered its content at the top and a large empty band
 * beneath it, with no way to size to its own content.
 *
 * The grid now uses `lg:items-start`, so each column takes its natural height,
 * and the sidebar gets `lg:sticky lg:top-0 lg:h-dvh` instead. The nav still
 * stays put while you scroll a long dispatch table, short pages no longer leave
 * a void, and the page scrolls normally — which is also what makes the mobile
 * drawer straightforward.
 *
 * ── Mobile ──
 *
 * Below `lg` the sidebar is not in the document at all; `AdminMobileNav` puts
 * it behind a hamburger. The top bar keeps only what fits: the toggle, the
 * status pill and the bell. The store link and the signed-in/sign-out controls
 * move into the drawer rather than being dropped.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-container-low lg:grid lg:grid-cols-[16rem_1fr] lg:items-start">
      <aside className="hidden border-rule/70 bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r">
        <div className="shrink-0 border-b border-rule/70 p-gutter-sm">
          <Link href={ADMIN_ROUTES.dashboard} className="flex items-center gap-gutter-xs">
            <Image
              src="/Lamie Foods - Logo.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="font-display text-headline-sm leading-none text-cacao">
              {BRAND.displayName}
            </span>
          </Link>
        </div>

        {/* Only the nav scrolls if it outgrows the column, so the operator card
            below stays reachable. */}
        <nav
          aria-label="Admin sections"
          className="min-h-0 flex-1 overflow-y-auto p-gutter-xs"
        >
          <AdminNav />
        </nav>

        <OperatorCard className="shrink-0 p-gutter-xs" />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-gutter-sm border-b border-rule/70 bg-surface px-gutter-sm py-2 lg:px-gutter-md lg:py-3">
          <div className="flex min-w-0 items-center gap-gutter-xs">
            <AdminMobileNav />
            <p className="inline-flex shrink-0 items-center gap-gutter-xs rounded-full border border-rule/70 bg-surface-container px-3 py-1 font-label text-label-sm text-cacao">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-terracotta"
              />
              Admin portal
            </p>
          </div>

          <div className="flex items-center gap-gutter-xs lg:gap-gutter-sm">
            {/* Moves into the drawer below `lg` — see AdminMobileNav. */}
            <Link
              href={ROUTES.home}
              className="hidden min-h-11 items-center gap-gutter-xs rounded-md border border-rule/70 bg-surface-container-low px-gutter-sm text-body-sm text-on-surface-variant transition-colors hover:text-terracotta lg:inline-flex"
            >
              <ICONS.box className="h-4 w-4" />
              View live store
            </Link>

            {/* Disabled: there is no notification feed behind this. */}
            <span
              aria-disabled="true"
              title="No notifications yet"
              className="relative inline-flex h-11 w-11 shrink-0 cursor-not-allowed items-center justify-center text-cacao"
            >
              <ICONS.bell className="h-5 w-5" />
              <span
                aria-hidden="true"
                className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-terracotta"
              />
            </span>

            <span className="hidden items-center gap-gutter-xs lg:flex">
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-linen"
              >
                <ICONS.people className="h-4 w-4" />
              </span>
              {/* No stored admin profile exists beyond one shared credential
                  (Q21 — no team accounts), so "Signed in" is all that's true
                  to show — never a fabricated name. */}
              <span className="text-body-sm text-cacao">Signed in</span>
            </span>

            <SignOutButton className="hidden min-h-11 items-center gap-gutter-xs rounded-md border border-rule/70 bg-surface-container-low px-gutter-sm text-body-sm text-on-surface-variant transition-colors hover:text-error lg:inline-flex" />
          </div>
        </header>

        <main id="main" className="min-w-0 p-gutter-sm lg:p-gutter-md">
          {children}
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
      <div className="flex items-center gap-gutter-sm rounded-md border border-rule/70 bg-surface-container-low p-gutter-sm">
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
