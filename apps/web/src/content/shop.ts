import { BRAND, DELIVERY, ROUTES } from "@lamiefoods/config";

/**
 * Copy for the shop page. Products themselves come from `products.ts`.
 *
 * UNVERIFIED items here, per GAP-004: the batch number and fry date in the
 * header, and the assurance claims about frying method. The header's butter
 * claim went with the 2026-09-13 rewording of `body`.
 */
export const SHOP = {
  eyebrow: "Signature confectionery",
  title: "Shop Chinchin",
  /*
    Reworded by the owner 2026-09-13. This drops two specifics the previous
    sentence asserted — "in small batches" and "real butter" — in favour of
    "premium ingredients". The butter claim was one of the UNVERIFIED items
    named in this file's header, so that note is narrower now.
  */
  body: "Choose your flavour. Freshly made with premium ingredients and warm spices.",
  /*
    Customer pays delivery. Area fees are admin-managed and selected at
    checkout (added to the order total with products).
  */
  deliveryNotice:
    "Delivery is not included in the prices below. At checkout you pick your area and pay that fee with your products.",
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

/*
  Owner-supplied, 2026-09-13. Icons unchanged.

  This rewrite retires the last UNVERIFIED claim on the shop page: "100%
  churned butter / no margarine, no preservatives" asserted a fat composition
  and a preservative-free product that nobody had confirmed (GAP-004). Column
  two's "fried in small batches over gentle heat" went the same way. Nothing
  below states a measurable fact about the food.

  One thing left with it: the CONFIRMED 1–5 day window used to be column
  three's title. It is still on this page — `PRODUCT_ASSURANCES` carries it
  onto every product page — but the shop grid itself no longer quotes a
  timeframe beside the delivery-fee explanation.
*/
export const ASSURANCES = [
  {
    icon: "award" as const,
    title: "Made with quality ingredients",
    body: "Carefully selected ingredients come together to create a deliciously crunchy, flavourful bite.",
  },
  {
    icon: "timer" as const,
    title: "Freshly made for you",
    body: "Prepared with care and packed fresh, so every bite delivers the taste and crunch you love.",
  },
  {
    icon: "truck" as const,
    title: "Nationwide delivery",
    body: "Choose your delivery area at checkout. Delivery fees are calculated and added to your order, with your chinchin securely sealed and shipped from our kitchen.",
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
      /* "Track Order" and "Delivery Schedule" removed 2026-09-12. Neither
         existed: there is no order-tracking page, and no delivery schedule has
         been published. Both were dead text advertising services the brand
         does not yet offer. */
      { label: "Bulk & Events", href: null },
      /* Points at the same WhatsApp line as the footer's social icon — the one
         contact channel the brand actually has. Routed through
         `BRAND.whatsappUrl` so the number is never written twice. */
      { label: "Contact us", href: BRAND.whatsappUrl },
    ],
  },
  {
    title: "Policies",
    links: [
      /* "Shipping Policy" removed 2026-09-12 — delivery pricing is still
         unquoted (orders.delivery_fee_kobo is deliberately NULL), so there is
         no shipping policy to write, let alone link. */
      { label: "Freshness Guarantee", href: null },
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
    label: `Nationwide delivery in ${DELIVERY.minDays}–${DELIVERY.maxDays} business days — pick your area fee at checkout`,
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
