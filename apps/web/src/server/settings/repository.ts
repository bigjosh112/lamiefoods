import "server-only";

import type { BankTransferDetails, PaymentSettings } from "@lamiefoods/config";
import { BANK_TRANSFER, WHATSAPP_NUMBER } from "@lamiefoods/config";
import { db } from "@/server/db/client";
import { isDatabaseConfigured } from "@/config/server-env";

/**
 * Owner-editable site settings — as of 2026-09-08, the WhatsApp contact
 * number and bank-transfer account details, both previously hardcoded in
 * `packages/config/src/payment.ts` and only changeable by an engineer
 * editing code. This is the first genuinely admin-writable setting in the
 * app; see `docs/ai-memory/architecture.md`'s 2026-09-08 decision log.
 *
 * `PaymentSettings` (the return shape) lives in `@lamiefoods/config`, not
 * here — this module is `server-only`, and the shape needs to reach client
 * code (`payment-actions.tsx`, the admin settings form) too.
 */
export type Settings = PaymentSettings;

interface SettingsRow {
  whatsapp_number: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
}

function rowToSettings(row: SettingsRow): Settings {
  const bankTransfer: BankTransferDetails | null =
    row.bank_name && row.bank_account_number && row.bank_account_name
      ? {
          bankName: row.bank_name,
          accountNumber: row.bank_account_number,
          accountName: row.bank_account_name,
        }
      : null;

  return {
    whatsappNumber: row.whatsapp_number,
    bankTransfer,
  };
}

/**
 * Reads the one settings row. Falls back to the static defaults in
 * `packages/config/src/payment.ts` when no database is configured — the
 * same fallback shape every other real-data feature in this app already has
 * (dashboard, customers, inventory all render without a database).
 */
export async function getSettings(): Promise<Settings> {
  if (!isDatabaseConfigured()) {
    return { whatsappNumber: WHATSAPP_NUMBER, bankTransfer: BANK_TRANSFER };
  }

  const sql = db();
  const rows = (await sql`
    select whatsapp_number, bank_name, bank_account_number, bank_account_name
    from site_settings
    where id = true
  `) as unknown as SettingsRow[];

  const row = rows[0];
  if (!row) return { whatsappNumber: null, bankTransfer: null };

  return rowToSettings(row);
}

export interface SettingsInput {
  whatsappNumber: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
}

/** Full replace of the one settings row — there's only ever one, so no id
 *  or transaction is needed. */
export async function updateSettings(input: SettingsInput): Promise<Settings> {
  const sql = db();
  const [row] = (await sql`
    update site_settings set
      whatsapp_number = ${input.whatsappNumber},
      bank_name = ${input.bankName},
      bank_account_number = ${input.bankAccountNumber},
      bank_account_name = ${input.bankAccountName},
      updated_at = now()
    where id = true
    returning whatsapp_number, bank_name, bank_account_number, bank_account_name
  `) as unknown as SettingsRow[];

  if (!row) throw new Error("site_settings row is missing — was migration 0005 applied?");

  return rowToSettings(row);
}
