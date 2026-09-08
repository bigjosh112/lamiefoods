/**
 * The product catalogue — one source for every page that shows a product, so
 * the landing page and the shop can never drift apart on names, imagery or
 * pricing. Add a product here and both pages pick it up.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READ BEFORE LAUNCH. Product NAMES are confirmed by the owner. Almost nothing
 * else here is: prices, crunch scores, tasting notes and pack sizes all come
 * from the design mock's sample copy and are marked UNVERIFIED. Ingredient
 * origins the mock invented ("Madagascar vanilla", "Badagry coconut", "Ceylon
 * cinnamon") are deliberately softened rather than reproduced — see GAP-004.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Kobo } from "@lamiefoods/types";

import type { ImageSlot } from "./image-slot";

export interface Product {
  /** Display order, shown as a kicker on the landing cards. */
  index: string;
  name: string;
  slug: string;
  /** Short flavour descriptor, e.g. "Dairy Reserve". */
  kicker: string;
  body: string;
  image: ImageSlot;
  /**
   * Badge over the image.
   *
   * `landing` is a **status**, not a description: every product is "New"
   * because the brand has not launched. "Best seller" is the obvious next value
   * and must NOT be set until real order data supports it — a best-seller badge
   * is a claim about what other customers bought, and inventing one is inventing
   * social proof. It needs the orders API (see `api-integration.md`).
   *
   * `shop` is still descriptive copy and unaffected.
   */
  badges: { landing: string; shop: string };
  /** UNVERIFIED — the mock's sensory scoring. */
  crunch: { label: string; score: number };
  /** UNVERIFIED — tasting notes. */
  notes: [string, string];
  /** Everything the product detail page needs. All UNVERIFIED — see below. */
  detail: ProductDetail;
}

/**
 * Detail-page content.
 *
 * The design mock only ever showed Milky Velvet's detail page; the copy for the
 * other two is adapted to the same structure. ALL of it is UNVERIFIED sample
 * copy — flavour percentages, texture ratings, ingredient lists, shelf life and
 * batch numbers included.
 *
 * `allergens` is deliberately `null` everywhere. The mock printed a confident
 * "Contains: Wheat (Gluten), Milk" that contradicts the landing page's own
 * "whole farm eggs", so the mock's allergen data is demonstrably unreliable.
 * Allergen declarations are a legal and safety matter, not marketing copy —
 * shipping an invented one could genuinely hurt someone. The page renders a
 * "to be confirmed" line until the owner supplies the real statement.
 */
export interface ProductDetail {
  /*
    Removed 2026-09-08 at the owner's request: `heroBadge`, `batchSeries`,
    `atelier`, `tagline` and `description`.

    Two were invented claims and their removal closes more of GAP-004 — the
    hero badges asserted "100% Churned Butter" and the batch series printed
    numbers ("N° 84", "N° 61", "N° 47") that nothing tracks, the same fiction as
    the shop header's "Batch No. 842" and the hero's "Batch Kettle No. 042".

    `description` is gone rather than shortened: the product page and the shop
    grid now both render `product.body`, so the two cannot drift apart.
  */
  /** Extra gallery slots beyond `image`, which is always first. */
  gallery: ImageSlot[];
  /**
   * Pack options and their prices. Price is an integer in KOBO, never naira
   * floats: cart arithmetic on 0.01 units silently drifts, and this is money.
   * UNVERIFIED — the owner has not supplied real pricing.
   */
  packaging: { name: string; note: string; price: Kobo }[];
  proof: { title: string; body: string; cta: string };
  provenance: {
    title: string;
    body: string;
    flavour: { title: string; body: string; bars: { label: string; pct: number }[] };
    acoustic: { title: string; body: string; rating: { label: string; value: string } };
    pairings: { title: string; body: string; items: string[] };
  };
  ingredients: { tag: string; body: string; allergens: string | null };
  storage: { tag: string; body: string; note: string };
}

/** Placeholder gallery slots, so the thumbnail strip matches the design. */
const extraGallery = (name: string): ImageSlot[] => [
  { src: null, alt: `${name} detail view`, note: "Detail shot" },
  { src: null, alt: `${name} packaging`, note: "Packaging shot" },
  { src: null, alt: `${name} texture close-up`, note: "Texture shot" },
];

/**
 * Pack sizes and prices, confirmed by the owner on 2026-09-08.
 *
 * These replace "250g Pouch" and "500g Gourmet Jar": the brand sells pouches
 * only, there is no jar, and the 250g size is retired. Prices are in kobo.
 *
 * Declared once and shared by all three products. Previously each carried its
 * own copy and Coco Velvet and Cinnamon were priced ₦200 above Milky Velvet —
 * a difference inherited from the design mock. The owner supplied one price
 * list for the range, so the three now cost the same.
 *
 * The first list supplied put 100g and 300g both at ₦2,000; queried rather than
 * guessed at, and the owner corrected it to the ladder below.
 *
 * `note` describes the format and nothing else. The old notes carried mock
 * claims ("aroma-lock", "Display pantry glass canister"); per-size copy is the
 * owner's to write.
 */
const PACKS = [
  { name: "100g Pouch", note: "Resealable pouch", price: 200000 },
  { name: "300g Pouch", note: "Resealable pouch", price: 350000 },
  { name: "500g Pouch", note: "Resealable pouch", price: 500000 },
];

/** Highest score on the crunch scale, so the bar and the label agree. */
export const CRUNCH_MAX = 10;

/*
  PLACEHOLDER PACK SHOTS — replace at the brand shoot.

  The three `image.src` values below are stand-in photographs of OTHER brands'
  chin chin packaging, supplied for local layout review. They carry third-party
  names, an Instagram handle, barcodes and — on two of them — legible nutrition
  panels and ingredient lists, including milk powder.

  They must not reach production. Shipping them would put another company's
  trade dress on the storefront and would display nutritional and allergen
  information that is not Lamie Foods' own, which is exactly what GAP-004 and
  GAP-007 exist to prevent. Tracked as GAP-006.
*/
export const PRODUCTS: Product[] = [
  {
    index: "01",
    name: "Milky Velvet Chinchin",
    slug: "milky-velvet-chinchin",
    kicker: "Dairy Reserve",
    body: "Soft, buttery crumb with real vanilla and stone-ground nutmeg.",
    image: {
      src: "/images/packagedchinchin.jpeg",
      alt: "Milky Velvet Chinchin in its pack",
      note: "Product photography",
    },
    badges: { landing: "New", shop: "New" },
    crunch: { label: "Tender Crisp", score: 8 },
    notes: ["100% Churned Dairy", "Subtle Sweetness"],
    detail: {
      gallery: extraGallery("Milky Velvet Chinchin"),
      packaging: PACKS,
      proof: {
        title: "Pure Dairy Commitment",
        body: "Churned sweet-cream butter replaces conventional margarine for an authentic melting texture.",
        cta: "Small-batch proof",
      },
      provenance: {
        title: "The Architecture of Velvet Crunch",
        body: "Every batch undergoes continuous temperature-tuned kneading and rapid golden seal frying to achieve our signature mouthfeel.",
        flavour: {
          title: "Flavour Profile",
          body: "Notes of sweet condensed milk, toasted churned butter, subtle sea salt crystals, and aromatic warm nutmeg.",
          bars: [
            { label: "Sweetness Harmony", pct: 65 },
            { label: "Aromatic Nutmeg", pct: 40 },
          ],
        },
        acoustic: {
          title: "Acoustic Crunch",
          body: "Micro-layered flakiness designed for effortless snacking with zero greasy residue on your fingers or palate.",
          rating: { label: "Texture Rating", value: "High Flake · Instant Dissolve" },
        },
        pairings: {
          title: "Curated Pairings",
          body: "Elevates your tea hour or quiet reflective moments with heritage beverages.",
          items: [
            "Afternoon cardamom spiced chai",
            "Chilled spiced hibiscus (Zobo) infusion",
            "Vintage roast espresso or shared cocktails",
          ],
        },
      },
      ingredients: {
        tag: "Clean Label",
        body: "Premium unbleached wheat flour, churned sweet cream butter, whole cow milk, unrefined cane sugar, fine sea salt crystals, freshly hand-ground nutmeg, and high-smoke refined vegetable oil for flash frying.",
        allergens: null,
      },
      storage: {
        tag: "Batch Dated",
        body: "Store in a cool, dry pantry away from direct sunlight. Reseal the pouch tightly after every pour — the aromatics are the first thing to go once air gets in.",
        note: "100% recyclable outer packaging",
      },
    },
  },
  {
    index: "02",
    name: "Coco Velvet Chinchin",
    slug: "coco-velvet-chinchin",
    kicker: "Tropical Warmth",
    body: "Toasted coconut folded into buttery dough, for a light tropical crunch.",
    image: {
      src: "/images/packagedchinchin1.jpeg",
      alt: "Coco Velvet Chinchin in its pack",
      note: "Product photography",
    },
    badges: { landing: "New", shop: "New" },
    crunch: { label: "Toasted Snap", score: 8 },
    notes: ["Fresh Coconut", "Rich Nutty Aroma"],
    detail: {
      gallery: extraGallery("Coco Velvet Chinchin"),
      packaging: PACKS,
      proof: {
        title: "Coconut, Folded Not Dusted",
        body: "Flakes are folded into the dough before frying, so the flavour carries through the crumb instead of coating it.",
        cta: "Small-batch proof",
      },
      provenance: {
        title: "The Architecture of Coastal Crunch",
        body: "Coconut is toasted separately and rested before folding, so its oils set into the dough rather than steaming it soft.",
        flavour: {
          title: "Flavour Profile",
          body: "Toasted coconut, warm butter, unrefined cane sugar, and a clean finish with very little residual sweetness.",
          bars: [
            { label: "Sweetness Harmony", pct: 55 },
            { label: "Toasted Coconut", pct: 70 },
          ],
        },
        acoustic: {
          title: "Acoustic Crunch",
          body: "A denser, shorter snap than the dairy range, with coconut fibre giving the crumb its structure.",
          rating: { label: "Texture Rating", value: "Short Snap · Dry Finish" },
        },
        pairings: {
          title: "Curated Pairings",
          body: "Sits well with bright, cold drinks that cut through the butter.",
          items: [
            "Chilled hibiscus (Zobo) infusion",
            "Iced black coffee",
            "Fresh ginger and lime",
          ],
        },
      },
      ingredients: {
        tag: "Clean Label",
        body: "Premium unbleached wheat flour, churned sweet cream butter, toasted coconut flakes, whole cow milk, unrefined cane sugar, fine sea salt, and high-smoke refined vegetable oil for flash frying.",
        allergens: null,
      },
      storage: {
        tag: "Batch Dated",
        body: "Store in a cool, dry pantry away from direct sunlight. Coconut carries oil, so reseal promptly to keep the snap.",
        note: "100% recyclable outer packaging",
      },
    },
  },
  {
    index: "03",
    name: "Cinnamon Chinchin",
    slug: "cinnamon-chinchin",
    kicker: "Hearth Spiced",
    body: "Fresh cinnamon and whole nutmeg, toasted deep for a warm, spiced crunch.",
    image: {
      src: "/images/packagedchinchin3.jpeg",
      alt: "Cinnamon Chinchin in its pack",
      note: "Product photography",
    },
    badges: { landing: "New", shop: "New" },
    crunch: { label: "Acoustic Crunch", score: 9.5 },
    notes: ["Cinnamon Bark & Nutmeg", "Warming Spiced Finish"],
    detail: {
      gallery: extraGallery("Cinnamon Chinchin"),
      packaging: PACKS,
      proof: {
        title: "Milled To Order",
        body: "Bark and nutmeg are ground in the same session they are used, because volatile aromatic oils fade within hours of milling.",
        cta: "Small-batch proof",
      },
      provenance: {
        title: "The Architecture of Spiced Crunch",
        body: "Spice is bloomed in the fry rather than dusted on afterwards, which is why the aroma survives the pouch.",
        flavour: {
          title: "Flavour Profile",
          body: "Warm cinnamon bark, whole nutmeg, brown butter, and a lingering spiced finish that outlasts the crunch.",
          bars: [
            { label: "Sweetness Harmony", pct: 45 },
            { label: "Aromatic Spice", pct: 85 },
          ],
        },
        acoustic: {
          title: "Acoustic Crunch",
          body: "The crispest of the range — a sharp, brittle fragment that dissolves cleanly and carries the spice forward.",
          rating: { label: "Texture Rating", value: "Sharp Fragment · Long Finish" },
        },
        pairings: {
          title: "Curated Pairings",
          body: "Made for hot, dark drinks and cooler evenings.",
          items: [
            "Cardamom spiced chai",
            "Vintage roast espresso",
            "Warm milk with honey",
          ],
        },
      },
      ingredients: {
        tag: "Clean Label",
        body: "Premium unbleached wheat flour, churned sweet cream butter, freshly milled cinnamon bark, whole grated nutmeg, whole cow milk, unrefined cane sugar, fine sea salt, and high-smoke refined vegetable oil for flash frying.",
        allergens: null,
      },
      storage: {
        tag: "Batch Dated",
        body: "Store in a cool, dry pantry away from direct sunlight. Reseal tightly after every pour — the aromatics are the first thing to go once air gets in.",
        note: "100% recyclable outer packaging",
      },
    },
  },
];

/** Cheapest pack for a product — what the "from" price on a card refers to. */
export function lowestPrice(product: Product): Kobo {
  return Math.min(...product.detail.packaging.map((pack) => pack.price));
}

/**
 * The pack a card's "from" price belongs to.
 *
 * A card that shows one price and adds a differently priced pack to the bag is
 * a card that lies, so the two are derived from the same comparison rather than
 * assuming the cheapest option is listed first.
 */
export function cheapestPack(product: Product) {
  return product.detail.packaging.reduce((cheapest, pack) =>
    pack.price < cheapest.price ? pack : cheapest,
  );
}

/** Look up one pack option by its display name. */
export function findPack(product: Product, name: string) {
  return product.detail.packaging.find((pack) => pack.name === name);
}

/** Find a product by slug, or undefined. */
export function findProduct(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}
