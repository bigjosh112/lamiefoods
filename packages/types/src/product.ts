import type { ImageAsset, IsoDateString, Money } from "./common";

/**
 * Product categories. Chinchin is the launch category, not the whole catalogue —
 * nothing in the app should branch on a specific category value.
 */
export const PRODUCT_CATEGORIES = [
  "chinchin",
  "snacks",
  "packaged-foods",
  "pastries",
  "other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type ProductAvailability = "in-stock" | "out-of-stock" | "coming-soon";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: Money;
  images: ImageAsset[];
  category: ProductCategory;
  /** Pack size as presented to the customer, e.g. "250g". */
  size: string | null;
  ingredients: string[];
  flavour: string | null;
  storageInformation: string | null;
  shelfLife: string | null;
  stockQuantity: number;
  availability: ProductAvailability;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

/** Trimmed shape for grids and listings, where full detail is not needed. */
export type ProductSummary = Pick<
  Product,
  "id" | "name" | "slug" | "price" | "category" | "availability"
> & {
  image: ImageAsset | null;
};
