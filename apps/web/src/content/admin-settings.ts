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
 *   - Changing `ADMIN_EMAIL` from the UI (env only).
 *
 * Delivery area fees live on `/admin/delivery` (not this page) — seeded and
 * editable there, then charged at checkout with the product total.
 *
 * Editable forms on this page:
 *   - WhatsApp + bank-transfer contact (`server/settings/repository.ts`).
 *   - Change password while signed in (`POST /api/admin/change-password`);
 *     lockout still uses forgot/reset on the login flow.
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
  /*
    MERGE, 2026-09-14. The owner removed this panel's opening paragraph and its
    source-file tag on 2026-09-13 — a repo path means nothing to the person
    running the shop, and the guidance belonged beside the fields it describes,
    not stacked at the top of the page. Both stay removed.

    What DID change on the incoming side is a fact, not presentation: bank
    transfer is no longer offered at checkout (Paystack-only as of
    2026-09-14), which made the previous note wrong — it told the owner
    customers would see "details being confirmed" at a checkout path that no
    longer exists. Reworded to the new reality, still positioned above the
    fields.
  */
  paymentNote:
    "Note: new orders are Paystack-only. The bank fields below apply only to older unpaid bank-transfer orders.",
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
      note: "Managed on Admin → Delivery areas (/admin/delivery). Checkout charges the selected area fee with the order total.",
    },
    {
      label: "Customer bank-transfer account",
      /* Incoming fact kept; the GAP tag stripped, per the owner's 2026-09-13
         pass removing internal tracking references from this screen. */
      note: "No longer offered at checkout (Paystack-only as of 2026-09-14). Fields below still apply to any older unpaid bank-transfer orders.",
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
  /*
    MERGE, 2026-09-14: the incoming side wins outright here.

    This panel used to say "There are no accounts" and "the sign-in form
    creates no session... every admin route is compiled out of production
    builds and returns 404". All of that had been untrue since real
    authentication landed, and it was flagged as needing a backend decision.
    That decision arrived with this branch: a shared owner login plus a
    working change-password flow. The old paragraph is gone, not reworded.

    Only the `file: "ADMIN_EMAIL · admin_auth"` tag is dropped, matching the
    owner's 2026-09-13 removal of source-file tags from this screen.
  */
  title: "Admin access",
  body: "One shared owner login. Teammate invites and roles are not part of this site.",
  emailLabel: "Sign-in email",
  changePasswordTitle: "Change password",
  changePasswordBody:
    "Enter your current password, then choose a new one (at least 10 characters).",
  currentPasswordLabel: "Current password",
  newPasswordLabel: "New password",
  confirmPasswordLabel: "Confirm new password",
  submitLabel: "Update password",
  success: "Password updated.",
  wrongCurrent: "Current password is incorrect.",
  genericError: "Something went wrong — please try again.",
};

/* ── Before launch ───────────────────────────────────────────────────────── */
