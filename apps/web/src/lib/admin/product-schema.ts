import { z } from "zod";

/**
 * New-product form validation.
 *
 * Client-side rules here are a convenience for whoever is typing; the backend
 * must re-validate everything, because anything enforced only in the browser is
 * trivially bypassed.
 *
 * The allergen register is the notable field. GAP-007 exists because the design
 * mock invented an allergen statement the storefront then displayed as fact —
 * this form is where the real one gets captured. It is therefore NOT optional:
 * publishing a food product with no allergen decision recorded is exactly the
 * failure that gap describes, so at minimum the operator has to confirm they
 * have considered it.
 */
export const ALLERGENS = [
  "Wheat / gluten",
  "Dairy / milk",
  "Eggs",
  "Tree nuts",
  "Peanuts",
  "Soy",
  "Sesame",
] as const;

const MAX_TEASER = 140;

const priceField = z
  .string()
  .trim()
  .min(1, { message: "Enter a price" })
  .refine((value) => /^\d+$/.test(value.replace(/[,\s]/g, "")), {
    message: "Prices are whole naira — digits only",
  });

export const productSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, { message: "Give the product a name" })
      .max(80, { message: "That name is too long" }),
    category: z.string().trim().min(1, { message: "Choose a category" }),
    teaser: z
      .string()
      .trim()
      .min(10, { message: "Write a short card description" })
      .max(MAX_TEASER, { message: `Keep this under ${MAX_TEASER} characters` }),
    narrative: z.string().trim().max(2000).optional().or(z.literal("")),

    pairings: z.string().trim().optional().or(z.literal("")),
    crunch: z.number().min(1).max(10),

    ingredients: z
      .string()
      .trim()
      .min(10, { message: "List the ingredients, heaviest first" }),
    /**
     * Allergens are a legal declaration, not a nice-to-have. Either tick the ones
     * that apply, or explicitly confirm none do — silence is not an answer.
     */
    allergens: z.array(z.string()),
    allergensConfirmed: z.boolean(),

    shelfLife: z.string().trim().min(3, { message: "State the shelf life" }),
    storage: z.string().trim().min(3, { message: "State the storage instruction" }),

    tiers: z
      .array(
        z.object({
          name: z.string().trim().min(2, { message: "Name this pack size" }),
          price: priceField,
          sku: z.string().trim().min(3, { message: "Enter a SKU" }),
        }),
      )
      .min(1, { message: "Add at least one packaging tier" }),

    initialStock: z.string().trim().min(1, { message: "Enter an opening stock figure" }),
    restockThreshold: z.string().trim().min(1, { message: "Enter a restock threshold" }),

    storefrontActive: z.boolean(),
    featureOnHomepage: z.boolean(),
    seasonalEdition: z.boolean(),
  })
  .refine((values) => values.allergens.length > 0 || values.allergensConfirmed, {
    message: "Tick the allergens that apply, or confirm the product contains none",
    path: ["allergens"],
  });

export type ProductFormValues = z.input<typeof productSchema>;

export const TEASER_LIMIT = MAX_TEASER;
