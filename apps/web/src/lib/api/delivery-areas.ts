import type { DeliveryRegion, NigerianState } from "@lamiefoods/types";
import { apiFetch } from "./client";

export interface PublicDeliveryArea {
  id: string;
  name: string;
  feeKobo: number;
  region: DeliveryRegion;
  state: NigerianState;
}

export async function listDeliveryAreas(): Promise<PublicDeliveryArea[]> {
  const { areas } = await apiFetch<{ areas: PublicDeliveryArea[] }>(
    "/api/delivery-areas",
  );
  return areas;
}
