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

/**
 * One sellable packaging size — its own price, SKU, and stock.
 * e.g. "100g Pouch" at ₦2,000 with SKU `LF-MVC-100`. A flavour is not one
 * inventoriable unit; each size is (see architecture.md, 2026-09-10).
 */
export interface ProductPack {
  id: string;
  name: string;
  price: Money;
  sku: string | null;
  stockQuantity: number;
  restockThreshold: number | null;
}

/** `role` distinguishes the single hero shot from the rest of the gallery. */
export interface ProductImage extends ImageAsset {
  id: string;
  role: "hero" | "gallery";
}

/**
 * A real, database-backed product (superseding the earlier provisional shape
 * — see `architecture.md`'s decision log, 2026-09-07 "real product catalog").
 * Field names mirror what the admin form actually captures
 * (`lib/admin/product-schema.ts`) — this is the one true shape for a product,
 * not a narrower "summary" carved out of a richer marketing-copy structure
 * nobody could edit.
 */
export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  /** ≤140 chars — the shop-grid card copy. */
  teaser: string;
  /** Longer detail-page body copy. */
  narrative: string | null;
  pairings: string | null;
  /** 1–10, the sensory "crunch" scale shown on the shop grid. */
  crunchScore: number;
  ingredients: string;
  allergens: string[];
  /**
   * True once someone has explicitly confirmed the allergen list is complete
   * (even if empty) — distinguishes "no allergens" from "nobody checked yet".
   * See the admin schema's own comment: silence is not an answer.
   */
  allergensConfirmed: boolean;
  shelfLife: string | null;
  storageNote: string | null;
  /** Draft vs published — false means the storefront never shows it. */
  storefrontActive: boolean;
  featureOnHomepage: boolean;
  seasonalEdition: boolean;
  /**
   * 1–99, or `null` for no promotion. `null`, never `0` — a `0` would read as
   * an authorised discount nobody actually offered, the same reasoning
   * `Order.deliveryFee: null` uses for "not yet quoted".
   */
  discountPercent: number | null;
  packs: ProductPack[];
  images: ProductImage[];
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

/** Trimmed shape for grids and listings, where full detail is not needed. */
export type ProductSummary = Pick<
  Product,
  "id" | "slug" | "name" | "category" | "teaser" | "crunchScore" | "discountPercent"
> & {
  packs: ProductPack[];
  heroImage: ProductImage | null;
};
