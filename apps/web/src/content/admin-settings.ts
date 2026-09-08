import { BRAND, DELIVERY, ROUTES } from "@lamiefoods/config";
import type { Product } from "@lamiefoods/types";
import { env } from "@/config/env";
import { isDatabaseConfigured, isEmailConfigured } from "@/config/server-env";

/**
 * Settings.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * UNLIKE EVERY OTHER ADMIN SCREEN, THIS ONE SHOWS REAL DATA.
 *
 * Nothing here is sample. Every value is read from what actually serves the
 * site — `packages/config` for the brand and delivery facts, `products.ts` for
 * the catalogue, and the validated environment in `config/env.ts`. That is the
 * entire point of the screen: a settings page whose values were invented would
 * be worse than useless, because it would tell the owner the site is configured
 * in ways it is not.
 *
 * The consequence is that almost everything is read-only. There is no backend
 * and no CMS, so these values change by editing code, not by typing in a form.
 * Each panel says which file it comes from rather than showing a disabled input
 * with no explanation.
 *
 * NEVER render a secret here. The environment panel reports only whether an
 * optional variable is *present*, never its value, and the only value printed
 * in full is the site URL — which is public by definition and already appears
 * in every canonical link. The backend is now Route Handlers in this same app
 * (superseding the earlier `apps/backend` plan — see architecture.md), so
 * DATABASE_URL and RESEND_API_KEY do live here, but strictly on the server
 * side via `config/server-env.ts`, which is guarded with `server-only` and
 * never imported by a Client Component. A Paystack *secret* key would follow
 * the same rule if a server-side Paystack integration is ever added; only the
 * `pk_` public key belongs in `NEXT_PUBLIC_*`.
 *
 * Deliberately not built, because all of it would be invented:
 *   - A delivery-fee table. Fees are not finalised (see GAP-007); a settings
 *     screen showing a fee is a settings screen someone will quote from.
 *   - A tax/VAT configuration. Nobody has stated one.
 *   - Paystack's own SETTLEMENT account (where Paystack pays the business
 *     out to) — a genuinely different thing from the customer-facing
 *     bank-transfer account below, and real operational detail nobody has
 *     provided.
 *   - A roles-and-permissions matrix. There are no multi-user roles (Q21) —
 *     one shared credential for one owner, real since `server/admin/session.ts`.
 *   - Notification channel toggles. Nothing can send (GAP-010).
 *
 * The ONE exception, as of 2026-09-08: the WhatsApp number and
 * customer-facing bank-transfer account in the "Delivery & payment" panel
 * ARE admin-editable (`server/settings/repository.ts`, backed by the
 * `site_settings` table) — the first real form on this page. Everything
 * else stays exactly as read-only as described above; this is a change to
 * one panel, not a reversal of the page's whole design.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface SettingRow {
  label: string;
  value: string;
  note?: string;
}

export type ReadinessState = "ready" | "blocked" | "unknown";

export const SETTINGS_PAGE = {
  eyebrow: "Configuration",
  title: "Settings",
  body: "What the site is currently configured with, read from the code and environment that serve it.",
};

/* ── Brand ───────────────────────────────────────────────────────────────── */

export const SETTINGS_BRAND = {
  title: "Brand",
  body: "Owner-confirmed facts. Everything else about the brand is treated as unknown rather than guessed.",
  file: "packages/config/src/brand.ts",
  rows: [
    {
      label: "Customer-facing name",
      value: BRAND.name,
      note: "The only name customers see — longer trading variants are never rendered",
    },
    {
      label: "Name in prose",
      value: BRAND.displayName,
      note: "All-caps would read as shouting mid-sentence",
    },
    { label: "Tagline", value: BRAND.tagline },
    { label: "Instagram", value: BRAND.instagramHandle, note: BRAND.instagramUrl },
  ] satisfies SettingRow[],
};

/* ── Storefront ──────────────────────────────────────────────────────────── */

/**
 * Takes every product (any status — admin's own view of the catalogue, not
 * just published ones) so this panel matches what `/admin/products` shows.
 * As of 2026-09-08 this reads the real Postgres-backed catalogue via
 * `server/products/repository.ts`, passed down from `page.tsx` — the old
 * static `content/products.ts`/`content/admin-inventory.ts` this used to
 * read are both gone.
 */
export function settingsStorefront(products: Product[]) {
  const packCount = products.reduce((sum, product) => sum + product.packs.length, 0);

  return {
    title: "Storefront",
    body: "The public site and what it sells.",
    file: "packages/config/src/routes.ts · server/products/repository.ts",
    rows: [
      { label: "Site URL", value: env.NEXT_PUBLIC_SITE_URL },
      {
        label: "Products",
        value: `${products.length} products · ${packCount} pack sizes`,
        note: products.map((product) => product.name).join(", ") || "None yet",
      },
      {
        label: "Products with stock tracking",
        value: `${products.length}`,
        note: "Stock is tracked per product, not per pack size",
      },
      {
        label: "Public routes",
        value: `${Object.values(ROUTES).filter((route) => typeof route === "string").length} static`,
        note: "Product pages are generated per product",
      },
    ] satisfies SettingRow[],
  };
}

/* ── Delivery & payment ──────────────────────────────────────────────────── */

export const SETTINGS_FULFILMENT = {
  title: "Delivery & payment",
  body: "Delivery facts are confirmed by the owner and read-only. The WhatsApp number and bank-transfer account below are real and editable — the form saves to the database.",
  file: "packages/config/src/brand.ts · server/settings/repository.ts",
  rows: [
    {
      label: "Delivery window",
      value: `${DELIVERY.minDays}–${DELIVERY.maxDays} days`,
    },
    {
      label: "Pickup",
      value: DELIVERY.pickupAvailable ? "Available" : "Not available",
    },
    { label: "Payment provider", value: "Paystack" },
  ] satisfies SettingRow[],
  /** Things a settings screen would normally show that nobody has supplied. */
  missing: [
    {
      label: "Delivery fees",
      note: "Not finalised. No fee is shown anywhere on the site, and none is invented here.",
    },
    {
      label: "Free-delivery threshold",
      note: "The design mock quoted one. It has never been confirmed and blocks launch (GAP-007).",
    },
    {
      label: "Paystack settlement account",
      note: "Where Paystack pays the business out to — a different thing from the customer-facing bank-transfer account below, and not something the frontend should hold.",
    },
    {
      label: "Tax / VAT",
      note: "No rate has been stated, so none is applied.",
    },
  ],
};

/* ── Environment & integrations ──────────────────────────────────────────── */

/**
 * Presence, never values.
 *
 * The site URL is the one exception and is printed in full: it is public by
 * definition, already appears in every canonical link, and is the thing most
 * worth checking at a glance.
 */
export const SETTINGS_ENVIRONMENT = {
  title: "Environment & integrations",
  body: "Only the presence of each value is shown. Nothing here prints a secret, and no secret should ever reach this app.",
  file: "apps/web/src/config/env.ts",
  rows: [
    {
      label: "NEXT_PUBLIC_SITE_URL",
      value: env.NEXT_PUBLIC_SITE_URL,
      state: "ready" as ReadinessState,
      note: "Canonical origin for metadata, sitemap and robots",
    },
    {
      label: "NEXT_PUBLIC_API_URL",
      value: env.NEXT_PUBLIC_API_URL ? "Configured" : "Not set",
      state: "ready" as ReadinessState,
      note: env.NEXT_PUBLIC_API_URL
        ? "Requests go to this external base URL instead of the app's own API"
        : "Unset is normal — the API is this app's own Route Handlers at /api",
    },
    {
      label: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
      value: env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? "Configured" : "Not set",
      state: (env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
        ? "ready"
        : "blocked") as ReadinessState,
      note: "Public key only — it must start with pk_, and the schema rejects anything else. Payment stays disabled on checkout regardless, until Paystack is actually wired in.",
    },
    {
      label: "DATABASE_URL",
      value: isDatabaseConfigured() ? "Configured" : "Not set",
      state: (isDatabaseConfigured() ? "ready" : "blocked") as ReadinessState,
      note: isDatabaseConfigured()
        ? "Orders can be written and read. Server-only — never sent to the browser."
        : "Checkout returns an honest 503 and records nothing until this is set.",
    },
    {
      label: "RESEND_API_KEY / ORDER_EMAIL_FROM",
      value: isEmailConfigured() ? "Configured" : "Not set",
      state: (isEmailConfigured() ? "ready" : "blocked") as ReadinessState,
      note: isEmailConfigured()
        ? "Order confirmation and notification emails send."
        : "Orders still save without this — the send is skipped, not the order.",
    },
  ],
  warning:
    "Anything prefixed NEXT_PUBLIC_ is compiled into the browser bundle and is readable by anyone who visits the site. DATABASE_URL and RESEND_API_KEY are server-only (config/server-env.ts, guarded with the server-only package) and must never be re-exported through a file a Client Component imports.",
};

/* ── Team & access ───────────────────────────────────────────────────────── */

export const SETTINGS_ACCESS = {
  title: "Team & access",
  body: "There are no accounts.",
  file: "docs/ai-memory/gaps.md — GAP-009",
  detail:
    "Nobody is signed in, because there is nothing to sign in to. The admin sign-in form validates what you type and then says so plainly; it creates no session. Every admin route is compiled out of production builds and returns 404 — that is a stopgap standing in for authentication, not authentication.",
  rules: [
    "The session belongs in an httpOnly, Secure, SameSite cookie set by the backend.",
    "Authorisation is checked server-side on every request, not once at sign-in.",
    "A client-side guard is not a substitute — anything the browser checks, the browser can be told to skip.",
    "Un-gate the customer directory last. It is nothing but personal data.",
  ],
};

/* ── Before launch ───────────────────────────────────────────────────────── */

/**
 * Launch readiness.
 *
 * Mirrors the open items in `docs/ai-memory/gaps.md`, which stays the record of
 * account — keep this list in step with it. It is here because the owner is the
 * only person who can answer most of them, and a gaps file in a repository is
 * not where they will see it.
 */
export const SETTINGS_READINESS = {
  title: "Before launch",
  body: "Open items that block a public deploy. Most need an answer from the owner rather than code.",
  source: "docs/ai-memory/gaps.md",
  items: [
    {
      id: "GAP-004",
      label: "Product prices and claims are unverified",
      note: "Prices, sensory scores, shelf claims and ingredient origins all came from the design mock. Every one is centralised in one file and marked UNVERIFIED.",
      owner: "Owner",
    },
    {
      id: "GAP-007",
      label: "Allergen statement is unconfirmed",
      note: "An allergen declaration is a food-safety matter and is currently withheld rather than invented, on every product.",
      owner: "Owner",
    },
    {
      id: "GAP-009",
      label: "The admin has no authentication",
      note: "Every admin route is dev-only. None can be opened to the public until the backend can reject an unauthenticated request.",
      owner: "Backend",
    },
    {
      id: "GAP-010",
      label: "No record of who agreed to be contacted",
      note: "Nothing captures messaging consent, so no outreach feature can be built yet.",
      owner: "Backend",
    },
    {
      id: "API",
      label: "Payment is not connected",
      note: "Orders now save and email both sides (once DATABASE_URL and RESEND_API_KEY are set). No money moves anywhere yet — there is no Paystack account (see the environment panel), so checkout deliberately stops short of payment.",
      owner: "Owner",
    },
    {
      id: "PRICING",
      label: "Delivery fee is not set",
      note: 'Every order is recorded with delivery cost as "not yet quoted" rather than a guessed figure. Confirming pricing turns this into a real calculation.',
      owner: "Owner",
    },
  ],
};
