import type { ProductCategory } from "@lamiefoods/types";

/**
 * Copy and option lists for the create/edit-product screen.
 *
 * Nothing here is customer-facing product data — these are the choices an
 * operator picks from, not claims about a product. The claims themselves get
 * typed in by whoever is publishing, which is the whole point: the storefront
 * must never carry an ingredient or allergen line that nobody entered
 * (see GAP-004 and GAP-007).
 *
 * Categories are broader than chinchin on purpose. The catalogue model already
 * handles snacks and packaged foods, so the form should not be the thing that
 * blocks a new line.
 */
export const NEW_PRODUCT = {
  eyebrow: "Catalogue / New product",
  title: "Create a new product",
  body: "Everything below is captured for a single SKU: how it reads on the storefront, what it is made from, how it is packed and priced, and where it appears.",
  breadcrumb: ["Products", "New product"],
};

export const EDIT_PRODUCT = {
  eyebrow: "Catalogue / Edit product",
  title: "Edit product",
  body: "Changes apply immediately once saved — including to orders already in your checkout for a customer mid-session.",
};

/**
 * Human-readable labels for the real `ProductCategory` enum
 * (`@lamiefoods/types`) — the form's `<select>` shows these; the value
 * submitted is always the real enum member, since that's what's now
 * persisted and validated (`lib/admin/product-schema.ts`).
 */
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  chinchin: "Chinchin",
  snacks: "Snacks",
  "packaged-foods": "Packaged foods",
  pastries: "Pastries",
  other: "Other",
};

/** Anchors for the 1–10 crunch slider used on the product page. */
export const CRUNCH_SCALE = [
  { value: 1, label: "Tender flake" },
  { value: 5, label: "Classic snap" },
  { value: 10, label: "Brittle shatter" },
];
