import { DELIVERY, ROUTES } from "@lamiefoods/config";
import { PRODUCTS } from "./products";

/**
 * Copy for the shop page. Products themselves come from `products.ts`.
 *
 * UNVERIFIED items here, per GAP-004: the batch number and fry date in the
 * header, and the assurance claims about butter and frying method.
 */
export const SHOP = {
  eyebrow: "Signature confectionery",
  title: "Shop Chinchin",
  body: "Choose your flavour. Freshly made in small batches with real butter and warm spices.",
  /*
    `meta` was removed on 2026-09-08 — a "Batch No. 842" and a
    "Kettle Fry Date: Today" the mock invented. Nothing tracked either, and the
    fry date claimed a freshness fact that no system could have known. Two more
    of GAP-004's unverified values gone.
  */
};

/**
 * Category filters. Only Chinchin has stock; the other two are announced but
 * not orderable, so they are shown as disabled with their real status rather
 * than as tabs that filter to an empty grid.
 */
export const SHOP_FILTERS = [
  { id: "all", label: "All", count: PRODUCTS.length, status: null },
  { id: "chinchin", label: "Chinchin", count: PRODUCTS.length, status: null },
  { id: "gift-sets", label: "Gift sets", count: 0, status: "Coming soon" },
  {
    id: "packaged-foods",
    label: "Packaged foods",
    count: 0,
    status: "In development",
  },
] as const;

export type ShopFilterId = (typeof SHOP_FILTERS)[number]["id"];

export const ATELIER_LAB = {
  eyebrow: "What's coming next",
  title: "More snacks are on the way.",
  /*
    Owner-written, 2026-09-08. Still describes unannounced products, but only
    as things being worked on — no dates, no prices, no promises. That framing
    is what keeps it out of GAP-004.
  */
  body: "We're working on spiced plantain crisps, roasted cashew spread, and gift boxes for celebrations. Be the first to know when they launch.",
  form: {
    label: "Email address",
    placeholder: "Enter your email",
    cta: "Notify me",
  },
};

export const ASSURANCES = [
  {
    icon: "award" as const,
    /** UNVERIFIED — still an ingredient claim, reworded but not confirmed. */
    title: "100% churned butter",
    body: "No margarine, no preservatives — just real dairy butter for a tender, flaky bite.",
  },
  {
    icon: "timer" as const,
    /** Owner-written process copy, 2026-09-08. */
    title: "Fried fresh in small batches",
    body: "Cooked in small batches over gentle heat, for a crisp bite that's never greasy.",
  },
  {
    icon: "truck" as const,
    /** Delivery window is the CONFIRMED 1–5 days. */
    title: `${DELIVERY.minDays}–${DELIVERY.maxDays} days nationwide delivery`,
    body: "Sealed in resealable pouches and shipped straight from our kitchen.",
  },
];

/**
 * Footer navigation.
 *
 * `href: null` means the destination does not exist yet — those render as plain
 * text instead of links, because a footer full of 404s is worse than one that
 * is honest about what has shipped. Fill in the href as each page lands.
 *
 * The Shop column lists the real catalogue rather than the mock's invented
 * product names, so it can never advertise something the brand does not sell.
 */
export const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      ...PRODUCTS.map((product) => ({
        label: product.name.replace(" Chinchin", ""),
        href: null,
      })),
      /*
        "Gift Jars & Bundles" was removed on 2026-09-08. The owner states the
        brand sells pouches only, in three sizes — so a jar listing advertised a
        format that does not exist. The catalogue was corrected on the same day
        (100g / 300g / 500g pouches), closing GAP-011.
      */
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Brand Story", href: ROUTES.about },
      /* "Artisanal Process" and "Ingredient Sourcing" merged into one. */
      { label: "Our process", href: null },
      /* "Press & Stockists" removed — no press coverage and no retail
         partnerships exist, so the column advertised neither. Re-add when there
         is something real to link to. */
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track Order", href: null },
      { label: "Delivery Schedule", href: null },
      { label: "Bulk & Events", href: null },
      { label: "Contact us", href: null },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Freshness Guarantee", href: null },
      { label: "Shipping Policy", href: null },
      { label: "Privacy Policy", href: null },
      { label: "Terms of Service", href: null },
    ],
  },
] satisfies { title: string; links: { label: string; href: string | null }[] }[];

/**
 * Promotional bar above the header on the product page.
 *
 * UNVERIFIED and commercially binding: the mock invented a free-delivery
 * threshold. The owner has never quoted a delivery fee, let alone a waiver, and
 * publishing an offer customers could hold you to is worse than publishing a
 * wrong tasting note. Confirm or remove before this page is public.
 */
export const ANNOUNCEMENT = {
  items: ["Free Lagos delivery on orders over ₦15,000", "Freshly made in small batches"],
};

/**
 * The three promises beside the buy button.
 *
 * Delivery window and Paystack are CONFIRMED facts. The freshness claim is
 * UNVERIFIED mock copy.
 */
export const PRODUCT_ASSURANCES = [
  {
    icon: "truck" as const,
    label: `Fast nationwide delivery (${DELIVERY.minDays}–${DELIVERY.maxDays} business days)`,
  },
  {
    icon: "shield" as const,
    label: "Secure Paystack checkout with Nigerian debit card, USSD or bank transfer",
  },
  {
    icon: "seal" as const,
    label: "Freshness guaranteed in airtight double-sealed pouches",
  },
];
