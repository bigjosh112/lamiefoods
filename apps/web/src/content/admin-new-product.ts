/**
 * Copy and option lists for the create-product screen.
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
  breadcrumb: ["Products & SKUs", "New product"],
};

export const PRODUCT_CATEGORIES = [
  "Signature chinchin",
  "Snacks",
  "Packaged foods",
  "Pastries",
  "Seasonal reserve",
  "Other",
];

/** Anchors for the 1–10 crunch slider used on the product page. */
export const CRUNCH_SCALE = [
  { value: 1, label: "Tender flake" },
  { value: 5, label: "Classic snap" },
  { value: 10, label: "Brittle shatter" },
];

/** Placeholder image roles — uploads need storage, which does not exist yet. */
export const PHOTO_SLOTS = ["Pack", "Texture", "Serve"];
