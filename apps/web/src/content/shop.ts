import { DELIVERY, ROUTES } from "@lamiefoods/config";

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
    { id: "gift-sets", label: "Gift sets", count: 0, status: "Coming soon" },
    {
      id: "packaged-foods",
      label: "Packaged foods",
      count: 0,
      status: "In development",
    },
  ] as const;
}

export type ShopFilterId = ReturnType<typeof buildShopFilters>[number]["id"];

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
      /*
        "Gift Jars & Bundles" was removed on 2026-09-08. The owner states the
        brand sells pouches only, in three sizes, so a jar listing advertised a
        format that does not exist. The per-flavour links that used to sit here
        came from the static catalogue and went with it — the shop link covers
        them now that products are database-backed.
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
