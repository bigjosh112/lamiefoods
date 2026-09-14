import { z } from "zod";
import { DELIVERY_REGIONS, NIGERIAN_STATES } from "@lamiefoods/types";

export const deliveryAreaWriteSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    /** Fee in whole naira — converted to kobo on the server. */
    feeNaira: z.number().int().min(0).max(1_000_000),
    region: z.enum(DELIVERY_REGIONS),
    state: z.enum(NIGERIAN_STATES),
    sortOrder: z.number().int().min(0).max(10_000).optional(),
    active: z.boolean().optional(),
  })
  .transform((value) => ({
    ...value,
    state: value.region === "lagos" ? ("Lagos" as const) : value.state,
  }));

export const deliveryAreaPatchSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    feeNaira: z.number().int().min(0).max(1_000_000).optional(),
    region: z.enum(DELIVERY_REGIONS).optional(),
    state: z.enum(NIGERIAN_STATES).optional(),
    sortOrder: z.number().int().min(0).max(10_000).optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  })
  .transform((value) =>
    value.region === "lagos" ? { ...value, state: "Lagos" as const } : value,
  );

export type DeliveryAreaWrite = z.infer<typeof deliveryAreaWriteSchema>;
export type DeliveryAreaPatch = z.infer<typeof deliveryAreaPatchSchema>;
