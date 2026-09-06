"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import { ICONS } from "@/components/ui/icons";
import { ADMIN_NAV_SECTIONS } from "@/content/admin-dashboard";

/**
 * Sidebar navigation.
 *
 * A client component purely so the active item comes from the current route
 * rather than being passed down or hardcoded. That is what keeps every admin
 * screen consistent: add a page, add its route to `BUILT_ROUTES`, and the nav
 * highlights and enables it everywhere without touching each page.
 *
 * Routes that do not exist yet render disabled rather than as links to a 404.
 */
const BUILT_ROUTES: string[] = [
  ADMIN_ROUTES.dashboard,
  ADMIN_ROUTES.orders,
  ADMIN_ROUTES.products,
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-gutter-md lg:block lg:space-y-4">
      {ADMIN_NAV_SECTIONS.map((section) => (
        <div key={section.title} className="shrink-0 lg:shrink">
          <p className="hidden px-gutter-sm font-label text-label-sm text-nutmeg uppercase lg:block">
            {section.title}
          </p>
          <ul className="mt-1 flex gap-gutter-xs lg:block lg:space-y-1">
            {section.items.map((item) => {
              const Icon = ICONS[item.icon];
              const built = BUILT_ROUTES.includes(item.href);
              const active = pathname === item.href;

              const shared =
                "flex min-h-11 items-center gap-gutter-xs rounded px-gutter-sm font-label text-label-md whitespace-nowrap";

              return (
                <li key={item.label} className="shrink-0 lg:shrink">
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
