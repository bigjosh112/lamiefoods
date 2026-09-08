import type { ImageSlot } from "./image-slot";
import { PRODUCTS } from "./products";

/**
 * Inventory & kettles.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE STOCK FIGURES ARE INVENTED. Nothing counts anything: there is no
 * inventory service, no kettle sensor and no link to orders, so every quantity,
 * threshold and batch reference below is sample data for layout review.
 *
 * What is NOT invented is the shape: product names, pack sizes, pack notes and
 * imagery all come from `products.ts`, the same catalogue the storefront reads.
 * A pack size cannot exist here that a customer cannot buy.
 *
 * This module is the single source of per-pack stock. `admin-products.ts`
 * derives its per-product totals from it, so the products page and this page
 * can never disagree about how much of something there is.
 *
 * Deliberately not shipped from the mock:
 *   - "Auto-sync with Paystack orders active" — orders are not connected to
 *     stock, and a badge claiming a sync that does not exist is the same false
 *     capability as the already-rejected "CONNECTED", "LIVE" and "ENFORCED".
 *   - "Real-time kitchen inventory tracking" — nothing is real-time.
 *   - "100% SKU fulfilment rate" — nothing measures fulfilment.
 *   - Kettle telemetry: "Vessel 03 · Lead Amina · Temp 185°C". A temperature
 *     reads as a live sensor value. There is no sensor, and naming an operator
 *     alongside it makes an invented reading look accountable.
 *   - "2 kitchen nodes" — invented infrastructure.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface InventoryLine {
  id: string;
  sku: string;
  /** Catalogue slug, or null for consumables that are not products. */
  slug: string | null;
  name: string;
  /** Pack size, straight from the catalogue. */
  variant: string;
  note: string;
  image: ImageSlot;
  category: "Finished stock" | "Packaging materials";
  /** How it is packed, for the operator scanning the column. */
  pack: string;
  available: number;
  threshold: number;
  unit: string;
  lastBatch: string | null;
  lastBatchWhen: string | null;
}

/**
 * INVENTED per-pack quantities, keyed `<slug>::<pack name>`.
 *
 * Keyed off the catalogue rather than listed as free text, so a pack size that
 * is renamed or removed upstream stops matching here instead of silently
 * reporting stock for something that no longer exists.
 */
const SAMPLE_STOCK: Record<string, { available: number; threshold: number }> = {
  "milky-velvet-chinchin::100g Pouch": { available: 180, threshold: 40 },
  "milky-velvet-chinchin::300g Pouch": { available: 280, threshold: 50 },
  "milky-velvet-chinchin::500g Pouch": { available: 140, threshold: 30 },
  "coco-velvet-chinchin::100g Pouch": { available: 95, threshold: 40 },
  "coco-velvet-chinchin::300g Pouch": { available: 115, threshold: 40 },
  "coco-velvet-chinchin::500g Pouch": { available: 18, threshold: 25 },
  "cinnamon-chinchin::100g Pouch": { available: 60, threshold: 30 },
  "cinnamon-chinchin::300g Pouch": { available: 100, threshold: 30 },
  "cinnamon-chinchin::500g Pouch": { available: 22, threshold: 25 },
};

/** INVENTED batch references, keyed the same way. */
const SAMPLE_BATCH: Record<string, { batch: string; when: string }> = {
  "milky-velvet-chinchin::100g Pouch": { batch: "Batch #043", when: "Today" },
  "milky-velvet-chinchin::300g Pouch": { batch: "Batch #042", when: "Today" },
  "milky-velvet-chinchin::500g Pouch": { batch: "Batch #041", when: "Yesterday" },
  "coco-velvet-chinchin::100g Pouch": { batch: "Batch #040", when: "2 days ago" },
  "coco-velvet-chinchin::300g Pouch": { batch: "Batch #040", when: "2 days ago" },
  "coco-velvet-chinchin::500g Pouch": { batch: "Batch #038", when: "3 days ago" },
  "cinnamon-chinchin::100g Pouch": { batch: "Batch #039", when: "2 days ago" },
  "cinnamon-chinchin::300g Pouch": { batch: "Batch #039", when: "2 days ago" },
  "cinnamon-chinchin::500g Pouch": { batch: "Batch #037", when: "4 days ago" },
};

const key = (slug: string, pack: string) => `${slug}::${pack}`;

/**
 * Every finished pack is a pouch since the owner confirmed the range on
 * 2026-09-08, so this no longer branches on the pack name. Kept as a named
 * constant so a future format has one place to change.
 */
const PACK_FORMAT = "Resealable pouch";

/**
 * Finished stock, one line per buyable pack size.
 *
 * SKUs extend the product codes already used on the products page (`LF-CHIN-01`
 * and friends) with the pack weight, rather than the mock's `LFE-` prefix —
 * "Enterprise" is not the customer-facing name and has no business in a product
 * code.
 */
const finished: InventoryLine[] = PRODUCTS.flatMap((product, index) =>
  product.detail.packaging.flatMap((pack) => {
    const stock = SAMPLE_STOCK[key(product.slug, pack.name)];
    if (!stock) return [];

    const batch = SAMPLE_BATCH[key(product.slug, pack.name)];
    const weight = pack.name.split(" ")[0] ?? pack.name;

    return [
      {
        id: `${product.slug}-${weight}`.toLowerCase(),
        sku: `LF-CHIN-0${index + 1}-${weight.replace("g", "")}`,
        slug: product.slug,
        name: product.name,
        variant: pack.name,
        note: pack.note,
        image: product.image,
        category: "Finished stock" as const,
        pack: PACK_FORMAT,
        available: stock.available,
        threshold: stock.threshold,
        unit: "units",
        lastBatch: batch?.batch ?? null,
        lastBatchWhen: batch?.when ?? null,
      },
    ];
  }),
);

/** INVENTED packaging stock. Not products — these are consumables. */
const materials: InventoryLine[] = [
  {
    id: "kraft-pouches",
    sku: "LF-MAT-PCH-01",
    slug: null,
    name: "Food-grade resealable kraft pouches",
    variant: "High barrier, foil backed",
    note: "Aroma-lock liner",
    image: { src: null, alt: "Kraft pouches", note: "Packaging shot" },
    category: "Packaging materials",
    pack: "Roll / pack",
    available: 1450,
    threshold: 200,
    unit: "pouches",
    lastBatch: null,
    lastBatchWhen: "Restocked a week ago",
  },
  {
    /*
      Was "Embossed glass keeper jars & seals" until 2026-09-08. The owner
      confirmed the range is pouches only, so a glass-jar consumable was
      reporting stock for a format the brand does not use.
    */
    id: "pouch-labels",
    sku: "LF-MAT-LBL-01",
    slug: null,
    name: "Printed pouch labels & tamper seals",
    variant: "Front and back, per pouch",
    note: "Applied after cooling",
    image: { src: null, alt: "Pouch labels", note: "Packaging shot" },
    category: "Packaging materials",
    pack: "Sheets",
    available: 320,
    threshold: 100,
    unit: "sets",
    lastBatch: null,
    lastBatchWhen: "Restocked two weeks ago",
  },
];

export const INVENTORY_LINES: InventoryLine[] = [...finished, ...materials];

export function stockStatus(line: { available: number; threshold: number }): StockStatus {
  if (line.available === 0) return "out-of-stock";
  return line.available <= line.threshold ? "low-stock" : "in-stock";
}

export const STATUS_LABEL: Record<StockStatus, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "out-of-stock": "Out of stock",
};

/**
 * Per-pack stock for one product, summed.
 *
 * `admin-products.ts` calls this so the products page reports the same totals
 * this page shows line by line.
 */
export function stockForProduct(slug: string) {
  const lines = finished.filter((line) => line.slug === slug);
  return {
    total: lines.reduce((sum, line) => sum + line.available, 0),
    /** Low if ANY pack size is at or below its own threshold. */
    low: lines.some((line) => stockStatus(line) !== "in-stock"),
    packs: lines.length,
  };
}

/* ── Page copy and aggregates, all derived from the lines above ──────────── */

const finishedUnits = finished.reduce((sum, line) => sum + line.available, 0);
const materialUnits = materials.reduce((sum, line) => sum + line.available, 0);
const lowLines = INVENTORY_LINES.filter((line) => stockStatus(line) === "low-stock");
const outLines = INVENTORY_LINES.filter((line) => stockStatus(line) === "out-of-stock");

export const INVENTORY_PAGE = {
  eyebrow: "Kitchen stock",
  title: "Inventory & Batch Stock Levels",
  /** The mock said "real-time". Nothing here is. */
  body: "Stock on hand across finished pouches and packaging materials.",
  action: { label: "Log a kettle batch", icon: "timer" as const },
  searchPlaceholder: "Search by SKU or item",
  footer: `${INVENTORY_LINES.length} stock lines`,
};

export const INVENTORY_STATS = [
  {
    label: "Finished stock",
    value: finishedUnits.toLocaleString("en-NG"),
    note: `Across ${finished.length} pack sizes`,
    icon: "box" as const,
    alert: false,
  },
  {
    label: "Low stock",
    value: `${lowLines.length}`,
    note:
      lowLines.length > 0
        ? lowLines.map((line) => `${line.name} ${line.variant}`).join(", ")
        : "Everything above its threshold",
    icon: "shield" as const,
    alert: lowLines.length > 0,
  },
  {
    label: "Out of stock",
    value: `${outLines.length}`,
    note:
      outLines.length > 0
        ? outLines.map((line) => line.name).join(", ")
        : "Every pack size is available",
    icon: "seal" as const,
    alert: outLines.length > 0,
  },
  {
    label: "Packaging in reserve",
    value: materialUnits.toLocaleString("en-NG"),
    note: materials.map((line) => line.name.split(" ").slice(-2).join(" ")).join(" · "),
    icon: "gift" as const,
    alert: false,
  },
];

/**
 * The three cards under the stats.
 *
 * The first uses the catalogue's own product image, so the chinchin shown here
 * is the chinchin shown on the shop. The other two are packaging placeholders —
 * there are no packaging photographs yet (GAP-005).
 */
export const INVENTORY_HIGHLIGHTS = [
  {
    eyebrow: "Latest kettle batch",
    title: PRODUCTS[0]?.name ?? "",
    body: "Batch #042 logged today. Cooling before it is packed.",
    image: PRODUCTS[0]?.image ?? {
      src: null,
      alt: "",
      note: "Product photography",
    },
  },
  {
    eyebrow: "Packaging",
    title: "Kraft pouch reserve",
    body: `${materials[0]?.available.toLocaleString("en-NG")} pouches ready to fill.`,
    image: materials[0]?.image ?? { src: null, alt: "", note: "Packaging shot" },
  },
  {
    eyebrow: "Packaging",
    title: "Keeper jars",
    body: `${materials[1]?.available.toLocaleString("en-NG")} jars washed and sealed.`,
    image: materials[1]?.image ?? { src: null, alt: "", note: "Packaging shot" },
  },
];

export type InventoryFilter =
  "all" | "in-stock" | "low-stock" | "out-of-stock" | "materials";

export const INVENTORY_TABS: {
  label: string;
  filter: InventoryFilter;
  count: number;
}[] = [
  { label: "All stock", filter: "all", count: INVENTORY_LINES.length },
  {
    label: "In stock",
    filter: "in-stock",
    count: INVENTORY_LINES.filter((line) => stockStatus(line) === "in-stock").length,
  },
  { label: "Low stock", filter: "low-stock", count: lowLines.length },
  { label: "Out of stock", filter: "out-of-stock", count: outLines.length },
  { label: "Packaging materials", filter: "materials", count: materials.length },
];

/**
 * Why quick adjustment is disabled.
 *
 * Adjusting stock is a write to authoritative business data. Letting the number
 * move on screen without it being saved anywhere is worse than not offering the
 * control at all — the operator would leave believing the count was corrected.
 */
export const INVENTORY_ADJUST_NOTE =
  "Stock adjustments need an inventory service to write to. Nothing here is saved, so the controls are disabled rather than moving a number that would not stick.";
