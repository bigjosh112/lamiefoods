import type { DeliveryArea } from "@lamiefoods/types";
import { apiFetch } from "./client";

export async function listAdminDeliveryAreas(): Promise<DeliveryArea[]> {
  const { areas } = await apiFetch<{ areas: DeliveryArea[] }>(
    "/api/admin/delivery-areas",
  );
  return areas;
}

export async function createAdminDeliveryArea(input: unknown): Promise<DeliveryArea> {
  const { area } = await apiFetch<{ area: DeliveryArea }>(
    "/api/admin/delivery-areas",
    { method: "POST", body: input },
  );
  return area;
}

export async function updateAdminDeliveryArea(
  id: string,
  input: unknown,
): Promise<DeliveryArea> {
  const { area } = await apiFetch<{ area: DeliveryArea }>(
    `/api/admin/delivery-areas/${encodeURIComponent(id)}`,
    { method: "PATCH", body: input },
  );
  return area;
}

export async function deleteAdminDeliveryArea(id: string): Promise<void> {
  await apiFetch<{ ok: true }>(
    `/api/admin/delivery-areas/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
