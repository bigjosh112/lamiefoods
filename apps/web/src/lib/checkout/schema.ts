import { z } from "zod";
import type { CustomerDetails } from "@lamiefoods/types";

/**
 * Checkout form validation.
 *
 * The shape is pinned to `CustomerDetails` from `@lamiefoods/types` — the same
 * type the backend will implement against — so the form cannot quietly drift
 * from the agreed domain model. The `satisfies` check at the bottom fails the
 * build if it ever does.
 *
 * Validation here is a UX convenience only. The backend must re-validate
 * everything: anything enforced solely in the browser is trivially bypassed.
 */

/**
 * Nigerian mobile numbers, entered without the +234 prefix the field shows.
 * Ten digits beginning 7, 8 or 9 covers every current operator range. Kept
 * deliberately loose — over-strict phone rules reject real customers, and the
 * backend normalises anyway.
 */
const NIGERIAN_MOBILE = /^[789]\d{9}$/;

export const checkoutSchema = z.object({
  email: z.email({ message: "Enter an email address we can send your receipt to" }),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, "").replace(/^(\+?234|0)/, ""))
    .refine((value) => NIGERIAN_MOBILE.test(value), {
      message: "Enter a Nigerian mobile number, e.g. 801 234 5678",
    }),
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Enter the recipient's full name" })
    .max(80, { message: "That name is too long" }),
  addressLine: z
    .string()
    .trim()
    .min(6, { message: "Enter the street address, including house or flat number" })
    .max(160, { message: "That address is too long" }),
  landmark: z
    .string()
    .trim()
    .min(3, { message: "A nearby landmark helps the rider find you" })
    .max(160, { message: "That landmark is too long" }),
  state: z.string().trim().min(1, { message: "Select a state" }),
  city: z
    .string()
    .trim()
    .min(2, { message: "Enter the city or delivery area" })
    .max(80, { message: "That is too long" }),
});

/** Values as the form holds them, before zod transforms the phone number. */
export type CheckoutInput = z.input<typeof checkoutSchema>;
/** Values after validation and transformation. */
export type CheckoutValues = z.output<typeof checkoutSchema>;

/** Reshape flat form values into the shared domain type. */
export function toCustomerDetails(values: CheckoutValues): CustomerDetails {
  return {
    fullName: values.fullName,
    email: values.email,
    // Stored in full international form; the field only collects the national part.
    phone: `+234${values.phone}`,
    deliveryAddress: {
      addressLine: values.addressLine,
      landmark: values.landmark,
      city: values.city,
      state: values.state,
    },
  } satisfies CustomerDetails;
}
