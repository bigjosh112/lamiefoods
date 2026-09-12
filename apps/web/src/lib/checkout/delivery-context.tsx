"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PublicDeliveryArea } from "@/lib/api/delivery-areas";

interface CheckoutDeliveryContextValue {
  areas: PublicDeliveryArea[];
  selectedAreaId: string;
  setSelectedAreaId: (id: string) => void;
  selectedArea: PublicDeliveryArea | null;
}

const CheckoutDeliveryContext = createContext<CheckoutDeliveryContextValue | null>(
  null,
);

export function CheckoutDeliveryProvider({
  areas,
  children,
}: {
  areas: PublicDeliveryArea[];
  children: ReactNode;
}) {
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const selectedArea = useMemo(
    () => areas.find((area) => area.id === selectedAreaId) ?? null,
    [areas, selectedAreaId],
  );

  const value = useMemo(
    () => ({
      areas,
      selectedAreaId,
      setSelectedAreaId,
      selectedArea,
    }),
    [areas, selectedAreaId, selectedArea],
  );

  return (
    <CheckoutDeliveryContext.Provider value={value}>
      {children}
    </CheckoutDeliveryContext.Provider>
  );
}

export function useCheckoutDelivery() {
  const value = useContext(CheckoutDeliveryContext);
  if (!value) {
    throw new Error("useCheckoutDelivery must be used within CheckoutDeliveryProvider");
  }
  return value;
}
