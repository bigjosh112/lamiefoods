import type { Money } from "./common";

export const DELIVERY_REGIONS = ["lagos", "interstate"] as const;
export type DeliveryRegion = (typeof DELIVERY_REGIONS)[number];

/** An admin-managed delivery zone with a fixed fee in kobo. */
export interface DeliveryArea {
  id: string;
  name: string;
  fee: Money;
  region: DeliveryRegion;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
