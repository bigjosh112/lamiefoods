import { BRAND, DELIVERY, ROUTES } from "@lamiefoods/config";
import { env } from "@/config/env";
import { INVENTORY_LINES } from "./admin-inventory";
import { PRODUCTS } from "./products";

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
 * in every canonical link. Paystack secret keys, database URLs and admin
 * credentials belong to `apps/backend` and must never reach this app at all.
 *
 * Deliberately not built, because all of it would be invented:
 *   - A delivery-fee table. Fees are not finalised (see GAP-007); a settings
 *     screen showing a fee is a settings screen someone will quote from.
 *   - A tax/VAT configuration. Nobody has stated one.
 *   - A settlement bank account. Which account the business settles into is
 *     real operational detail nobody has provided.
 *   - A roles-and-permissions matrix. There are no accounts, no roles and no
 *     sessions (GAP-009); a permissions grid implies enforcement that does not
 *     exist anywhere.
 *   - Notification channel toggles. Nothing can send (GAP-010).
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

const packCount = PRODUCTS.reduce(
  (sum, product) => sum + product.detail.packaging.length,
  0,
);

export const SETTINGS_STOREFRONT = {
  title: "Storefront",
  body: "The public site and what it sells.",
  file: "packages/config/src/routes.ts · src/content/products.ts",
  rows: [
    { label: "Site URL", value: env.NEXT_PUBLIC_SITE_URL },
    {
      label: "Products",
      value: `${PRODUCTS.length} products · ${packCount} pack sizes`,
      note: PRODUCTS.map((product) => product.name).join(", "),
    },
    {
      label: "Stock lines",
      value: `${INVENTORY_LINES.length}`,
      note: "Pack sizes plus packaging materials",
    },
    {
      label: "Public routes",
      value: `${Object.values(ROUTES).filter((route) => typeof route === "string").length} static`,
      note: "Product pages are generated per product",
    },
  ] satisfies SettingRow[],
};

/* ── Delivery & payment ──────────────────────────────────────────────────── */

export const SETTINGS_FULFILMENT = {
  title: "Delivery & payment",
  body: "Confirmed by the owner. What is missing is listed as missing rather than filled in with a plausible number.",
  file: "packages/config/src/brand.ts",
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
      label: "Settlement account",
      note: "Which account the business settles into is not something the frontend should hold.",
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
      state: (env.NEXT_PUBLIC_API_URL ? "ready" : "blocked") as ReadinessState,
      note: env.NEXT_PUBLIC_API_URL
        ? "The API client has a base URL"
        : "Every API call raises ApiNotConfiguredError until the backend developer supplies this",
    },
    {
      label: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
      value: env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? "Configured" : "Not set",
      state: (env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
        ? "ready"
        : "blocked") as ReadinessState,
      note: "Public key only — it must start with pk_, and the schema rejects anything else",
    },
  ],
  warning:
    "Paystack secret keys, database URLs and admin credentials belong to apps/backend. Anything prefixed NEXT_PUBLIC_ is compiled into the browser bundle and is readable by anyone who visits the site.",
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
      label: "Allergen statement and the free-delivery offer",
      note: "An allergen declaration is a food-safety matter and is currently withheld rather than invented. The delivery offer is a commercial term customers could hold the business to.",
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
      label: "No API contract exists",
      note: "Orders, payment verification and the catalogue are all unbuilt. The frontend deliberately guesses no request or response shapes.",
      owner: "Backend",
    },
  ],
};
