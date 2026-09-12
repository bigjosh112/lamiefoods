"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import { ICONS } from "@/components/ui/icons";
import { ADMIN_NAV_SECTIONS } from "@/content/admin-dashboard";

/**
 * Sidebar navigation, and the same list inside the mobile drawer.
 *
 * Always a vertical list. It used to collapse into a horizontal scroller below
 * `lg`, which is what put six items, their icons and their labels into a strip
 * narrower than any of them — they wrapped over each other. `AdminMobileNav`
 * gives it a full-width column instead, so there is one layout to reason about.
 *
 * A client component purely so the active item comes from the current route
 * rather than being passed down or hardcoded. That is what keeps every admin
 * screen consistent: add a page, add its route to `BUILT_ROUTES`, and the nav
 * highlights and enables it everywhere without touching each page.
 *
 * Routes that do not exist yet render disabled rather than as links to a 404.
 */

const ALL_HREFS = ADMIN_NAV_SECTIONS.flatMap((section) =>
  section.items.map((item) => item.href),
);

/**
 * Which nav item the current route belongs to.
 *
 * Nested routes highlight their section, so `/admin/products/new` and
 * `/admin/orders/LF-1042` do not leave the sidebar looking as though nothing is
 * selected. Two details matter: the `/` boundary, or "/admin/orders" would also
 * match "/admin/orders-archive"; and taking the *longest* match, or the
 * dashboard at "/admin" — a prefix of every other admin route — would light up
 * on every page.
 */
function activeHref(pathname: string): string | undefined {
  return ALL_HREFS.filter(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  ).sort((a, b) => b.length - a.length)[0];
}
const BUILT_ROUTES: string[] = [
  ADMIN_ROUTES.dashboard,
  ADMIN_ROUTES.orders,
  ADMIN_ROUTES.products,
  ADMIN_ROUTES.customers,
  ADMIN_ROUTES.inventory,
  ADMIN_ROUTES.deliveryAreas,
  ADMIN_ROUTES.settings,
];

export function AdminNav() {
  const pathname = usePathname();
  const current = activeHref(pathname);

  return (
    <div className="space-y-4">
      {ADMIN_NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="px-gutter-sm font-label text-label-sm text-nutmeg uppercase">
            {section.title}
          </p>
          <ul className="mt-1 space-y-1">
            {section.items.map((item) => {
              const Icon = ICONS[item.icon];
              const built = BUILT_ROUTES.includes(item.href);
              const active = item.href === current;

              const shared =
                "flex min-h-11 items-center gap-gutter-xs rounded-md px-gutter-sm font-label text-label-md";

              return (
                <li key={item.label}>
                  {built ? (
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        shared,
                        "transition-colors",
                        active
                          ? "bg-primary-container text-linen"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-terracotta",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      title="Not built yet"
                      className={cn(shared, "cursor-not-allowed text-nutmeg/70")}
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
  );
}
