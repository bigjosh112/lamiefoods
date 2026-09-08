import { DELIVERY, ROUTES } from "@lamiefoods/config";

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
 *
 * `count` used to be `PRODUCTS.length` from the static catalogue; products
 * now live in Postgres, so it's built from the real published count instead
 * (`buildShopFilters`, called by `/shop`'s Server Component with what
 * `listPublishedProducts()` actually returned).
 */
export function buildShopFilters(publishedCount: number) {
  return [
    { id: "all", label: "All", count: publishedCount, status: null },
    { id: "chinchin", label: "Chinchin", count: publishedCount, status: null },
    { id: "gift-sets", label: "Gift Sets", count: 0, status: "Coming soon" },
    {
      id: "packaged-foods",
      label: "Packaged Foods",
      count: 0,
      status: "In development",
    },
  ] as const;
}

export type ShopFilterId = ReturnType<typeof buildShopFilters>[number]["id"];

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
 * The Shop column links to the real shop page rather than listing individual
 * product names: those now live in Postgres and can change (new flavours,
 * discontinued ones) without a code deploy, and `SiteFooter` renders on
 * every page — hardcoding names here would drift from the catalogue exactly
 * the way the old static-content version eventually would have.
 */
export const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Shop Chinchin", href: ROUTES.shop },
      { label: "Gift Jars & Bundles", href: null },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Brand Story", href: ROUTES.about },
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

/**
 * Promotional bar above the header on the product page.
 *
 * REMOVED: a free-delivery offer with an invented ₦15,000 threshold. The owner
 * has never quoted a delivery fee, let alone a waiver (see Q16 in the brand
 * questionnaire — delivery pricing is still being worked out), and publishing
 * an offer customers could hold the business to is worse than a wrong tasting
 * note.
 */
export const ANNOUNCEMENT = {
  items: ["Freshly made in small batches"],
};

/**
 * The three promises beside the buy button.
 *
 * Delivery window is a CONFIRMED fact. The freshness claim is UNVERIFIED mock
 * copy. Paystack is deliberately NOT claimed here: there is no Paystack account
 * yet (owner confirmed), so "secure Paystack checkout" would be false — see
 * checkout, where payment is honestly disabled instead.
 */
export const PRODUCT_ASSURANCES = [
  {
    icon: "truck" as const,
    label: `Fast nationwide delivery (${DELIVERY.minDays}–${DELIVERY.maxDays} business days)`,
  },
  {
    icon: "mail" as const,
    label: "Order confirmation sent straight to your email",
  },
  {
    icon: "seal" as const,
    label: "Freshness guaranteed in airtight double-sealed pouches",
  },
];
