import type { Money } from "./common";

export const DELIVERY_REGIONS = ["lagos", "interstate"] as const;
export type DeliveryRegion = (typeof DELIVERY_REGIONS)[number];

/**
 * Nigeria's 36 states plus the Federal Capital Territory. Shared so checkout,
 * admin, and validation cannot drift.
 */
export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];

export function isNigerianState(value: string): value is NigerianState {
  return (NIGERIAN_STATES as readonly string[]).includes(value);
}

/**
 * Lagos grouping always stores Lagos. Interstate uses the admin-picked state.
 */
export function resolveDeliveryAreaState(
  region: DeliveryRegion,
  state: string | undefined,
): NigerianState {
  if (region === "lagos") return "Lagos";
  if (state && isNigerianState(state)) return state;
  throw new Error("Interstate delivery areas need a Nigerian state.");
}

/** An admin-managed delivery zone with a fixed fee in kobo. */
export interface DeliveryArea {
  id: string;
  name: string;
  fee: Money;
  region: DeliveryRegion;
  /** Nigerian state this area ships in — snapshotted onto `orders.state`. */
  state: NigerianState;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
