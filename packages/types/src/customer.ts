import type { IsoDateString } from "./common";

/** Delivery details collected at checkout. Guest checkout — no account required. */
export interface DeliveryAddress {
  addressLine: string;
  landmark: string;
  city: string;
  state: string;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  /** Nigerian phone number as entered; normalisation is the backend's call. */
  phone: string;
  deliveryAddress: DeliveryAddress;
}

/** A customer record as persisted by the backend. */
export interface Customer extends CustomerDetails {
  id: string;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}
