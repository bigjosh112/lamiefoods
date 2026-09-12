import { DELIVERY } from "@lamiefoods/config";

/**
 * Settings.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * UNLIKE EVERY OTHER ADMIN SCREEN, THIS ONE SHOWS REAL DATA.
 *
 * Nothing here is sample. Every value is read from what actually serves the
 * site — `packages/config` for the delivery facts, and the `site_settings`
 * table for the payment contact. That is the entire point of the screen: a
 * settings page whose values were invented would be worse than useless, because
 * it would tell the owner the site is configured in ways it is not.
 *
 * Trimmed on 2026-09-10 at the owner's request, from five panels to two. The
 * brand, storefront and environment panels and the "Before launch" gap list are
 * gone, and their content was deleted rather than left dormant — this file no
 * longer reads `env`, `products` or `BRAND` at all. Two consequences worth
 * knowing, both recorded on `settings-view.tsx`: the environment readout no
 * longer tells anyone which variables are unset, and the open launch-blocking
 * gaps now live only in `docs/ai-memory/gaps.md`.
 *
 * The consequence is that almost everything is read-only. There is no backend
 * and no CMS, so these values change by editing code, not by typing in a form.
 * Each panel says which file it comes from rather than showing a disabled input
 * with no explanation.
 *
 * NEVER render a secret here. The environment panel that reported which
 * variables were set (presence only, never values) has been removed, so nothing
 * on this page reads the environment at all — but the rule stands for anything
 * added later. The backend is now Route Handlers in this same app
 * (superseding the earlier `apps/backend` plan — see architecture.md), so
 * DATABASE_URL and RESEND_API_KEY do live here, but strictly on the server
 * side via `config/server-env.ts`, which is guarded with `server-only` and
 * never imported by a Client Component. A Paystack *secret* key would follow
 * the same rule if a server-side Paystack integration is ever added; only the
 * `pk_` public key belongs in `NEXT_PUBLIC_*`.
 *
 * Deliberately not built, because all of it would be invented:
 *   - A tax/VAT configuration. Nobody has stated one.
 *   - Paystack's own SETTLEMENT account (where Paystack pays the business
 *     out to) — a genuinely different thing from the customer-facing
 *     bank-transfer account below, and real operational detail nobody has
 *     provided.
 *   - A roles-and-permissions matrix. There are no multi-user roles (Q21) —
 *     one shared credential for one owner, real since `server/admin/session.ts`.
 *   - Notification channel toggles. Nothing can send (GAP-010).
 *
 * Delivery area fees live on `/admin/delivery` (not this page) — seeded and
 * editable there, then charged at checkout with the product total.
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

export const SETTINGS_PAGE = {
  eyebrow: "Configuration",
  title: "Settings",
  body: "What the site is currently configured with, read from the code and environment that serve it.",
};

export const SETTINGS_FULFILMENT = {
  title: "Delivery & payment",
  body: "Delivery facts are confirmed by the owner and read-only. The WhatsApp number and bank-transfer account below are real and editable — the form saves to the database. Until all three bank fields are set, customers who choose bank transfer see “details being confirmed” instead of account numbers (GAP-013).",
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
    { label: "Payment provider", value: "Paystack (primary) · bank transfer (fallback)" },
  ] satisfies SettingRow[],
  /** Things a settings screen would normally show that nobody has supplied. */
  missing: [
    {
      label: "Delivery fees",
      note: "Managed on Admin → Delivery areas (/admin/delivery). Checkout charges the selected area fee with the order total.",
    },
    {
      label: "Customer bank-transfer account",
      note: "Until bank name, account number and account name are all saved below, the bank-transfer checkout path cannot show transfer instructions (GAP-013).",
    },
    {
      label: "Free-delivery threshold",
      note: "No automatic free-delivery threshold. Set an area fee to ₦0 explicitly if an area is free.",
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
