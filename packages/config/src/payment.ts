/**
 * Payment facts. As of 2026-09-08 these are ADMIN-EDITABLE — see
 * `server/settings/repository.ts`'s `getSettings()`/`updateSettings()`,
 * backed by the `site_settings` table (`migrations/0005_settings.sql`).
 *
 * The constants below are now only the FALLBACK used when no database is
 * configured (`getSettings()` returns these instead of querying) — the same
 * fallback shape every other real-data feature in this app already has.
 * They're kept here, not deleted, because `BankTransferDetails`/
 * `PaymentSettings` are shared types every layer (server repository, admin
 * form, client-facing `payment-actions.tsx`) needs a common, non-server-only
 * home for.
 *
 * `BANK_TRANSFER` stays `null` until the owner supplies real account
 * details via `/admin/settings` — the bank-transfer panel on
 * `/order-success` renders an honest "details to be confirmed" state while
 * it's null, exactly like every other unconfirmed fact in this app
 * (allergens, delivery fee). A wrong account number is not a copy nit — it's
 * money sent to the wrong place.
 *
 * `WHATSAPP_NUMBER`, digit-only international format (`wa.me` requires no
 * `+`/spaces), is set independently and can arrive before `BANK_TRANSFER`
 * does — `payment-actions.tsx`'s `BankTransferPanel` only offers the
 * "send payment proof" flow once BOTH are set, and uses the number for a
 * general contact link in the meantime, so a WhatsApp button never asks a
 * customer to prove a transfer to an account they were never given.
 */
export const WHATSAPP_NUMBER: string | null = "2347059721857";

export interface BankTransferDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export const BANK_TRANSFER: BankTransferDetails | null = null;

/** The shape `getSettings()` returns and `/admin/settings`'s form edits. */
export interface PaymentSettings {
  whatsappNumber: string | null;
  bankTransfer: BankTransferDetails | null;
}
