import { z } from "zod";
import type { PaymentSettings } from "@lamiefoods/config";

/**
 * Settings form validation — the WhatsApp contact number and bank-transfer
 * account details, both previously hardcoded in
 * `packages/config/src/payment.ts`.
 *
 * Client-side rules here are a convenience for whoever is typing; the
 * backend must re-validate everything, because anything enforced only in
 * the browser is trivially bypassed.
 *
 * The bank fields are all-or-nothing, matching the rule
 * `components/order/payment-actions.tsx` already enforces on the display
 * side: the "send payment proof" flow only makes sense once a customer has
 * a real account to transfer to, so a half-filled bank block (e.g. a bank
 * name with no account number) must never be saveable.
 */
export const settingsSchema = z
  .object({
    /** Digit-only, no `+`/spaces — the exact format `wa.me` requires, per
     *  `packages/config/src/payment.ts`'s own comment. Empty string means
     *  "not set", matching every other optional field in this app. */
    whatsappNumber: z
      .string()
      .trim()
      .regex(/^\d{7,15}$/, { message: "Digits only, with country code, no + or spaces" })
      .optional()
      .or(z.literal("")),
    bankName: z.string().trim().max(120).optional().or(z.literal("")),
    bankAccountNumber: z.string().trim().max(40).optional().or(z.literal("")),
    bankAccountName: z.string().trim().max(120).optional().or(z.literal("")),
  })
  .refine(
    (values) => {
      const bankFields = [
        values.bankName,
        values.bankAccountNumber,
        values.bankAccountName,
      ];
      const filled = bankFields.filter(Boolean).length;
      return filled === 0 || filled === bankFields.length;
    },
    {
      message: "Fill in all three bank fields, or leave all three blank",
      path: ["bankName"],
    },
  );

export type SettingsFormValues = z.input<typeof settingsSchema>;

/** Validated form values → the server's `SettingsInput` shape. Empty
 *  strings become `null` — the one place this conversion happens. */
export function toSettingsInput(values: z.infer<typeof settingsSchema>) {
  return {
    whatsappNumber: values.whatsappNumber || null,
    bankName: values.bankName || null,
    bankAccountNumber: values.bankAccountNumber || null,
    bankAccountName: values.bankAccountName || null,
  };
}

/** The reverse conversion, for pre-filling the form from real `PaymentSettings`. */
export function fromSettings(settings: PaymentSettings): SettingsFormValues {
  return {
    whatsappNumber: settings.whatsappNumber ?? "",
    bankName: settings.bankTransfer?.bankName ?? "",
    bankAccountNumber: settings.bankTransfer?.accountNumber ?? "",
    bankAccountName: settings.bankTransfer?.accountName ?? "",
  };
}
