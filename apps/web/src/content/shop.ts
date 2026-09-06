import { DELIVERY } from "@lamiefoods/config";
import { PRODUCTS } from "./products";

/**
 * Copy for the shop page. Products themselves come from `products.ts`.
 *
 * UNVERIFIED items here, per GAP-004: the batch number and fry date in the
 * header, and the assurance claims about butter and frying method.
 */
export const SHOP = {
  eyebrow: "Signature Confectionery",
  title: "Shop Chinchin",
  body: "Choose your favourite flavour. Freshly kettle-fried in small batches using churned butter and fragrant spices.",
  /** UNVERIFIED — the mock invented both of these. */
  meta: [
    { icon: "seal" as const, label: "Batch No. 842" },
    { icon: "timer" as const, label: "Kettle Fry Date: Today" },
  ],
};

/**
 * Category filters. Only Chinchin has stock; the other two are announced but
 * not orderable, so they are shown as disabled with their real status rather
 * than as tabs that filter to an empty grid.
 */
export const SHOP_FILTERS = [
  { id: "all", label: "All", count: PRODUCTS.length, status: null },
  { id: "chinchin", label: "Chinchin", count: PRODUCTS.length, status: null },
  { id: "gift-sets", label: "Gift Sets", count: 0, status: "Coming soon" },
  {
    id: "packaged-foods",
    label: "Packaged Foods",
    count: 0,
    status: "In development",
  },
] as const;

export type ShopFilterId = (typeof SHOP_FILTERS)[number]["id"];

export const ATELIER_LAB = {
  eyebrow: "The Lamie Atelier Lab",
  title: "More snacks and pantry provisions currently in development.",
  body: "We are formulating spiced plantain crisps, slow-roasted cashew spreads, and celebration gift boxes. Be the first to taste pilot batches.",
  form: {
    label: "Email address",
    placeholder: "Enter your email",
    cta: "Notify me",
  },
};

export const ASSURANCES = [
  {
    icon: "award" as const,
    /** UNVERIFIED — ingredient claim. */
    title: "100% Churned Farm Butter",
    body: "Zero margarine or industrial preservatives. Pure natural dairy for that signature tender flakiness.",
  },
  {
    icon: "timer" as const,
    /** UNVERIFIED — process claim. */
    title: "Kettle Fried in Small Batches",
    body: "Artisanally watched over gentle fire to ensure uniform acoustic crunch without excess oil absorption.",
  },
  {
    icon: "truck" as const,
    /** Delivery window is the CONFIRMED 1–5 days. */
    title: `${DELIVERY.minDays}–${DELIVERY.maxDays} Days Nationwide Delivery`,
    body: "Sealed in aroma-lock pouches and tamper-proof culinary jars, shipped directly from our kitchen.",
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
      { label: "Gift Jars & Bundles", href: null },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Brand Story", href: "/#manifesto" },
      { label: "Artisanal Process", href: null },
      { label: "Ingredient Sourcing", href: null },
      { label: "Press & Stockists", href: null },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track Order", href: null },
      { label: "Delivery Schedule", href: null },
      { label: "Bulk & Events", href: null },
      { label: "Contact Atelier", href: null },
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
