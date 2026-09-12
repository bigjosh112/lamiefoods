import type { DeliveryRegion } from "@lamiefoods/types";
import { apiFetch } from "./client";

export interface PublicDeliveryArea {
  id: string;
  name: string;
  feeKobo: number;
  region: DeliveryRegion;
}

export async function listDeliveryAreas(): Promise<PublicDeliveryArea[]> {
  const { areas } = await apiFetch<{ areas: PublicDeliveryArea[] }>(
    "/api/delivery-areas",
  );
  return areas;
}
