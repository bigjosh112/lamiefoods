import { ADMIN_ROUTES } from "@lamiefoods/config";
import type { ImageSlot } from "./image-slot";
import { lowestPrice, PRODUCTS } from "./products";

/**
 * Admin product catalogue.
 *
 * The three live products come from `products.ts` — the same source the
 * storefront uses — so names, imagery and prices cannot disagree between the
 * shop and the admin view. Only the operational fields below (SKU, stock
 * counts, status) are added here.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * UNVERIFIED: every stock number and the two pipeline products. Neither
 * "Spiced Plantain Crisps" nor "Plateau Honey Glazed" has been confirmed — they
 * come from the mock, and the landing page carries them under the same caveat.
 * Prices are the catalogue's placeholders (GAP-004); the mock quoted different
 * figures, and the catalogue wins so the two views stay consistent.
 *
 * SKUs use an `LF-` prefix rather than the mock's `LFE-`: "Enterprise" is not
 * the customer-facing name and there is no reason to bake it into product codes.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface AdminProduct {
  sku: string;
  name: string;
  body: string;
  image: ImageSlot;
  category: string;
  /** Live products only. */
  prices: number[] | null;
  sizes: string | null;
  stock: number | null;
  status: "in-stock" | "low-stock" | "development";
  statusLabel: string;
  /** Pipeline products only. */
  pipeline: { chip: string; detail: string; visibility: string } | null;
}

const LOW_STOCK_THRESHOLD = 25;

/** UNVERIFIED stock counts, keyed by slug. */
const SAMPLE_STOCK: Record<string, number> = {
  "milky-velvet-chinchin": 420,
  "coco-velvet-chinchin": 18,
  "cinnamon-chinchin": 215,
};

const live: AdminProduct[] = PRODUCTS.map((product, index) => {
  const stock = SAMPLE_STOCK[product.slug] ?? 0;
  const low = stock <= LOW_STOCK_THRESHOLD;

  return {
    sku: `LF-CHIN-0${index + 1}`,
    name: product.name,
    body: product.body,
    image: product.image,
    category: "Signature chinchin",
    prices: product.detail.packaging.map((pack) => pack.price),
    sizes: product.detail.packaging.map((pack) => pack.name).join(" & "),
    stock,
    status: low ? "low-stock" : "in-stock",
    statusLabel: low ? "Low stock (active)" : "In stock (active)",
    pipeline: null,
  };
});

/** UNVERIFIED — neither product has been announced or confirmed. */
const pipeline: AdminProduct[] = [
  {
    sku: "LF-PLNT-01",
    name: "Spiced Plantain Crisps",
    body: "Kettle-cooked semi-ripe plantain slivers dusted with dried scotch bonnet pepper.",
    image: { src: null, alt: "Spiced plantain crisps", note: "Product photography" },
    category: "Packaged foods (pipeline)",
    prices: null,
    sizes: null,
    stock: null,
    status: "development",
    statusLabel: "In development (hidden from storefront)",
    pipeline: {
      chip: "Coming soon",
      detail: "Target launch: next kitchen batch",
      visibility: "Unpublished private draft",
    },
  },
  {
    sku: "LF-GLZ-01",
    name: "Honey Glazed Chin-Chin",
    body: "Wild mountain honey harvested and reduced into a high-crunch micro-glaze.",
    image: { src: null, alt: "Honey glazed chin-chin", note: "Product photography" },
    category: "Special reserve (pipeline)",
    prices: null,
    sizes: null,
    stock: null,
    status: "development",
    statusLabel: "In development",
    pipeline: {
      chip: "Reserve prototype",
      detail: "Batch lab: sensory testing & moisture sealing",
      visibility: "Restricted formulation",
    },
  },
];

export const ADMIN_PRODUCTS: AdminProduct[] = [...live, ...pipeline];

const totalUnits = live.reduce((sum, item) => sum + (item.stock ?? 0), 0);
const lowStock = live.filter((item) => item.status === "low-stock");

export const PRODUCTS_PAGE = {
  eyebrow: "Atelier stock master",
  hub: "Lagos roastery batch hub",
  title: "Product Catalogue & SKU Management",
  body: "Manage active chinchin flavours, sizes, pricing, and pipeline products.",
  actions: [
    { label: "Export matrix", icon: "box" as const, primary: false, href: null },
    {
      label: "Add new product",
      icon: "gift" as const,
      primary: true,
      href: `${ADMIN_ROUTES.products}/new`,
    },
  ],
  searchPlaceholder: "Search by product title, SKU or flavour profile",
};

export const PRODUCTS_STATS = [
  {
    label: "Live atelier SKUs",
    value: `${live.length}`,
    note: "Active variants",
    icon: "gift" as const,
    alert: false,
  },
  {
    label: "Total warehouse units",
    value: `${totalUnits}`,
    note: "Pouches and jars",
    icon: "box" as const,
    alert: false,
  },
  {
    label: "R&D formulation lab",
    value: `${pipeline.length}`,
    note: "Prototypes",
    icon: "sparkle" as const,
    alert: false,
  },
  {
    label: "Stock health",
    value: lowStock.length > 0 ? `${lowStock.length} alert` : "Healthy",
    note:
      lowStock.map((item) => item.name.replace(" Chinchin", "")).join(", ") ||
      "All lines stocked",
    icon: "shield" as const,
    alert: lowStock.length > 0,
  },
];

export const PRODUCTS_TABS = [
  { label: "All products", count: ADMIN_PRODUCTS.length, filter: "all" as const },
  { label: "Active storefront", count: live.length, filter: "live" as const },
  { label: "In development", count: pipeline.length, filter: "development" as const },
  { label: "Seasonal reserves", count: 0, filter: "seasonal" as const },
];

export type ProductFilter = (typeof PRODUCTS_TABS)[number]["filter"];

/** Cheapest live price, for the "from" figure on the stats row. */
export const cheapestLive = PRODUCTS.length > 0 ? lowestPrice(PRODUCTS[0]!) : 0;

export const PRODUCTS_FOOTER = {
  title: "Built to grow",
  body: "The catalogue model already supports snacks, packaged foods and pantry items — adding a category needs no layout change.",
  note: "Category-driven",
};
