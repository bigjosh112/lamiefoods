import { z } from "zod";
import { PRODUCT_CATEGORIES, type Product } from "@lamiefoods/types";

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
/* The origin story has always been capped at 2000 in this schema, but the cap
   was a bare literal with no message, so exceeding it produced zod's raw
   default text on submit and nothing warned you while typing. Named and
   exported so the form can show a counter, exactly as it does for the teaser. */
const MAX_NARRATIVE = 2000;

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
    /**
     * The stable identifier in the product's URL. Auto-suggested from the
     * title (see `product-form.tsx`'s `slugify`-on-type behaviour) but
     * editable, and deliberately NOT re-derived from the title automatically
     * on every keystroke once touched — a live product's URL must not shift
     * out from under a bookmark or a customer's mid-session cart just
     * because the title got a copy edit.
     */
    slug: z
      .string()
      .trim()
      .min(3, { message: "The URL slug is too short" })
      .max(80, { message: "The URL slug is too long" })
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
        message: "Lowercase letters, numbers and single hyphens only",
      }),
    category: z.enum(PRODUCT_CATEGORIES, { message: "Choose a category" }),
    teaser: z
      .string()
      .trim()
      .min(10, { message: "Write a short card description" })
      .max(MAX_TEASER, { message: `Keep this under ${MAX_TEASER} characters` }),
    narrative: z
      .string()
      .trim()
      .max(MAX_NARRATIVE, { message: `Keep this under ${MAX_NARRATIVE} characters` })
      .optional()
      .or(z.literal("")),

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
          stock: z
            .string()
            .trim()
            .min(1, { message: "Enter stock on hand" })
            .refine((value) => /^\d+$/.test(value.replace(/[,\s]/g, "")), {
              message: "Stock is a whole number",
            }),
          restockThreshold: z
            .string()
            .trim()
            .min(1, { message: "Enter a restock threshold" })
            .refine((value) => /^\d+$/.test(value.replace(/[,\s]/g, "")), {
              message: "Threshold is a whole number",
            }),
        }),
      )
      .min(1, { message: "Add at least one packaging tier" }),

    storefrontActive: z.boolean(),
    featureOnHomepage: z.boolean(),
    seasonalEdition: z.boolean(),

    /**
     * `null` means no promotion — never `0`. A stored `0` would read as an
     * authorised discount nobody actually offered; see the shared
     * `Product.discountPercent` type comment for the same reasoning applied
     * to `Order.deliveryFee`.
     */
    discountPercent: z
      .number()
      .int()
      .min(1, { message: "A discount must be at least 1%" })
      .max(99, { message: "A discount can't be 100% or more" })
      .nullable(),

    /** Populated by `components/admin/image-upload.tsx` after a real Vercel
     *  Blob upload completes — never user-typed URLs. Max five photos per
     *  product (hero + gallery); the admin UI and this schema share that cap. */
    images: z
      .array(
        z.object({
          url: z.string().min(1),
          alt: z.string(),
          role: z.enum(["hero", "gallery"]),
        }),
      )
      .max(5, { message: "A product can have at most 5 images" })
      .default([]),
  })
  .refine((values) => values.allergens.length > 0 || values.allergensConfirmed, {
    message: "Tick the allergens that apply, or confirm the product contains none",
    path: ["allergens"],
  });

export type ProductFormValues = z.input<typeof productSchema>;

export const TEASER_LIMIT = MAX_TEASER;
export const NARRATIVE_LIMIT = MAX_NARRATIVE;
export const MAX_PRODUCT_IMAGES = 5;

/** Naira string ("3,600") to kobo integer (360000). Strips the same
 *  separators `priceField`'s regex already tolerates. */
function nairaStringToKobo(value: string): number {
  return Number(value.replace(/[,\s]/g, "")) * 100;
}

/** e.g. "Roasted Nutmeg & Wild Honey" → "roasted-nutmeg-wild-honey". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validated form values → the server's `ProductInput` shape
 * (`server/products/repository.ts`). The one place naira strings become
 * kobo integers and empty-string optionals become `null` — every caller
 * (create, edit) goes through this so the conversion happens exactly once.
 */
export function toProductInput(values: z.infer<typeof productSchema>) {
  return {
    slug: values.slug,
    name: values.title,
    category: values.category,
    teaser: values.teaser,
    narrative: values.narrative || null,
    pairings: values.pairings || null,
    crunchScore: values.crunch,
    ingredients: values.ingredients,
    allergens: values.allergens,
    allergensConfirmed: values.allergensConfirmed,
    shelfLife: values.shelfLife,
    storageNote: values.storage,
    storefrontActive: values.storefrontActive,
    featureOnHomepage: values.featureOnHomepage,
    seasonalEdition: values.seasonalEdition,
    discountPercent: values.discountPercent,
    packs: values.tiers.map((tier) => ({
      name: tier.name,
      priceKobo: nairaStringToKobo(tier.price),
      sku: tier.sku || null,
      stockQuantity: Number(tier.stock.replace(/[,\s]/g, "")),
      restockThreshold: Number(tier.restockThreshold.replace(/[,\s]/g, "")),
    })),
    images: values.images.map((image, index) => ({
      url: image.url,
      // Blank alt falls back to the product name so customer thumbnails stay
      // accessible even when the operator skips the optional alt field.
      alt: image.alt.trim() || values.title,
      role: index === 0 ? ("hero" as const) : ("gallery" as const),
    })),
  };
}

/** The reverse conversion, for pre-filling the edit form from a real `Product`. */
export function fromProduct(product: Product): ProductFormValues {
  return {
    title: product.name,
    slug: product.slug,
    category: product.category,
    teaser: product.teaser,
    narrative: product.narrative ?? "",
    pairings: product.pairings ?? "",
    crunch: product.crunchScore,
    ingredients: product.ingredients,
    allergens: product.allergens,
    allergensConfirmed: product.allergensConfirmed,
    shelfLife: product.shelfLife ?? "",
    storage: product.storageNote ?? "",
    tiers: product.packs.map((pack) => ({
      name: pack.name,
      price: String(pack.price.amount / 100),
      sku: pack.sku ?? "",
      stock: String(pack.stockQuantity),
      restockThreshold:
        pack.restockThreshold !== null ? String(pack.restockThreshold) : "",
    })),
    storefrontActive: product.storefrontActive,
    featureOnHomepage: product.featureOnHomepage,
    seasonalEdition: product.seasonalEdition,
    discountPercent: product.discountPercent,
    images: (() => {
      const mapped = product.images.map((image) => ({
        url: image.url,
        alt: image.alt,
        role: image.role,
      }));
      // Normalise so index 0 is always the hero for the upload UI / save path.
      const heroIndex = mapped.findIndex((image) => image.role === "hero");
      if (heroIndex <= 0) return mapped;
      const hero = mapped[heroIndex];
      if (!hero) return mapped;
      return [hero, ...mapped.filter((_, index) => index !== heroIndex)];
    })(),
  };
}
