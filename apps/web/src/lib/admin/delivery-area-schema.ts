import { z } from "zod";
import { DELIVERY_REGIONS } from "@lamiefoods/types";

export const deliveryAreaWriteSchema = z.object({
  name: z.string().trim().min(2).max(120),
  /** Fee in whole naira — converted to kobo on the server. */
  feeNaira: z.number().int().min(0).max(1_000_000),
  region: z.enum(DELIVERY_REGIONS),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
  active: z.boolean().optional(),
});

export const deliveryAreaPatchSchema = deliveryAreaWriteSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "Provide at least one field to update." },
);

export type DeliveryAreaWrite = z.infer<typeof deliveryAreaWriteSchema>;
export type DeliveryAreaPatch = z.infer<typeof deliveryAreaPatchSchema>;
