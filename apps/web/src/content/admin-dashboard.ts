import { ADMIN_ROUTES } from "@lamiefoods/config";

/**
 * Static page furniture for the admin dashboard — nav, the signed-in-user
 * label, and the (currently decorative) date-range control.
 *
 * As of 2026-09-08 the dashboard's actual numbers (revenue, orders,
 * customers, best sellers, stock) are real, fetched in
 * `app/admin/(portal)/page.tsx` from `server/orders/repository.ts` and
 * `server/products/repository.ts` and passed in as props — see
 * `AdminDashboard`. Nothing sample-data remains on this page.
 */

/**
 * Sidebar sections, matching the design's grouping.
 *
 * The mock titled the first group "Enterprise ledger". "Enterprise" is not part
 * of the customer-facing brand and has been kept out of the site everywhere
 * else, so it does not belong on every admin screen either.
 */
export const ADMIN_NAV_SECTIONS = [
  {
    title: "Operations",
    items: [
      { label: "Dashboard", href: ADMIN_ROUTES.dashboard, icon: "award" as const },
      /*
        "Orders", not "Orders & Paystack": these orders also settle by bank
        transfer, so naming one provider in the nav was inaccurate as well as
        longer than every sibling item.
      */
      { label: "Orders", href: ADMIN_ROUTES.orders, icon: "box" as const },
      /*
        "Products", not "Products & SKUs": the page shows name, slug, category,
        price, stock and status — there is no SKU column, and `product_packs.sku`
        is nullable and unsurfaced. Revisit when each pack size (100g/300g/500g)
        carries a trackable code of its own.
      */
      { label: "Products", href: ADMIN_ROUTES.products, icon: "gift" as const },
      { label: "Customers", href: ADMIN_ROUTES.customers, icon: "people" as const },
      {
        /* "Inventory", matching the page header — "& Kettles" named equipment
           this page does not track; it lists product stock. */
        label: "Inventory",
        href: ADMIN_ROUTES.inventory,
        icon: "timer" as const,
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      { label: "Delivery areas", href: ADMIN_ROUTES.deliveryAreas, icon: "box" as const },
      { label: "Settings", href: ADMIN_ROUTES.settings, icon: "gear" as const },
    ],
  },
];

/**
 * The operator shown in the sidebar and top bar.
 *
 * SAMPLE, like everything else here — nobody is signed in, because there is no
 * authentication. Sign-out is disabled for the same reason: there is no session
 * to end. Replace with the real session user when auth lands.
 */
export const ADMIN_USER = { name: "Operations Lead", location: "Lagos HQ" };

/** Ranges do not filter anything yet — see AdminDashboard's comment. */
export const ADMIN_RANGES = [
  { label: "Today", icon: null },
  { label: "7 days", icon: null },
  { label: "30 days", icon: null },
  { label: "Custom", icon: "calendar" as const },
];
