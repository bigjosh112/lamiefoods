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

import type { ImageSlot } from "./image-slot";

export interface Product {
  /** Display order, shown as a kicker on the landing cards. */
  index: string;
  name: string;
  slug: string;
  /** Short flavour descriptor, e.g. "Dairy Reserve". */
  kicker: string;
  /** UNVERIFIED — placeholder pricing from the mock. */
  price: string;
  body: string;
  image: ImageSlot;
  /** Badge over the image. The two pages label the same product differently. */
  badges: { landing: string; shop: string };
  /** UNVERIFIED — the mock's sensory scoring. */
  crunch: { label: string; score: number };
  /** UNVERIFIED — tasting notes. */
  notes: [string, string];
  /** UNVERIFIED — pack formats have not been confirmed. */
  sizes: [string, string];
}

/** Highest score on the crunch scale, so the bar and the label agree. */
export const CRUNCH_MAX = 10;

export const PRODUCTS: Product[] = [
  {
    index: "01",
    name: "Milky Velvet Chinchin",
    slug: "milky-velvet-chinchin",
    kicker: "Dairy Reserve",
    price: "From ₦3,500",
    body: "Rich velvety milk indulgence, tender melt-in-the-mouth golden crumb, and gentle undertones of vanilla and stone-grated nutmeg.",
    image: {
      src: null,
      alt: "Milky Velvet Chinchin in a keepsake jar",
      note: "Product photography",
    },
    badges: { landing: "House Classic", shop: "Original Heritage" },
    crunch: { label: "Tender Crisp", score: 8 },
    notes: ["100% Churned Dairy", "Subtle Sweetness"],
    sizes: ["250g Pouch", "500g Jar"],
  },
  {
    index: "02",
    name: "Coco Velvet Chinchin",
    slug: "coco-velvet-chinchin",
    kicker: "Tropical Warmth",
    price: "From ₦3,800",
    body: "Toasted coastal coconut flakes folded into buttery dough for a warm tropical snap with balanced sweetness.",
    image: {
      src: "/images/chinchin10.png",
      alt: "Coco Velvet Chinchin with fresh coconut",
      note: "Product photography",
    },
    badges: { landing: "Coastal Batch", shop: "Tropical Infusion" },
    crunch: { label: "Toasted Snap", score: 8 },
    notes: ["Fresh Coconut", "Rich Nutty Aroma"],
    sizes: ["250g Pouch", "500g Jar"],
  },
  {
    index: "03",
    name: "Cinnamon Chinchin",
    slug: "cinnamon-chinchin",
    kicker: "Hearth Spiced",
    price: "From ₦3,800",
    body: "Freshly milled cinnamon bark and warm whole nutmeg toasted deeply into a crisp, acoustic crunch.",
    image: {
      src: "/images/chinchin11.png",
      alt: "Cinnamon Chinchin on a wooden board",
      note: "Product photography",
    },
    badges: { landing: "Aromatic Hearth", shop: "Spiced Signature" },
    crunch: { label: "Acoustic Crunch", score: 9.5 },
    notes: ["Cinnamon Bark & Nutmeg", "Warming Spiced Finish"],
    sizes: ["250g Pouch", "500g Jar"],
  },
];
