import type { PaymentSettings } from "@lamiefoods/config";
import { apiFetch } from "./client";

/** PATCH /api/admin/settings — save the WhatsApp number / bank-transfer details. */
export async function updateSettings(input: unknown): Promise<PaymentSettings> {
  const { settings } = await apiFetch<{ settings: PaymentSettings }>(
    "/api/admin/settings",
    { method: "PATCH", body: input },
  );
  return settings;
}
