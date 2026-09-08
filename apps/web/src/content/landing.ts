import { BRAND, DELIVERY, ROUTES } from "@lamiefoods/config";
import type { ImageSlot } from "./image-slot";
import { PRODUCTS } from "./products";

/**
 * Every word and image slot on the landing page, in one file.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READ BEFORE LAUNCH — not all of this is confirmed.
 *
 * The approved design mock was generated with sample copy, and that copy invents
 * specifics the brand has never stated: prices, sensory scores, ingredient
 * origins, batch numbers and shelf claims. They are reproduced here so the page
 * matches the design and can be reviewed, but every one is marked `UNVERIFIED`
 * and must be confirmed or replaced by the owner before this page goes public.
 *
 * Deliberate departures from the mock, where it contradicted a confirmed fact:
 *   - "1–3 days dispatch" -> the confirmed delivery window is 1–5 days.
 *   - "Lamie Foods Enterprise" -> the customer-facing name is "Lamie Foods".
 *   - "hello@lamiefoods.com" -> no address has been supplied, so no mailto link
 *     is fabricated; the row renders as plain text until a real one is given.
 *   - "Website by Basil Studio" -> a credit to a third party we cannot verify.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Marks a value that came from the design mock and has NOT been confirmed. */
type Unverified<T> = T;

export type { ImageSlot } from "./image-slot";

export const NAV_LINKS = [
  { label: "Home", href: ROUTES.home },
  { label: "Shop", href: ROUTES.shop },
  { label: "About", href: ROUTES.about },
] as const;

export const HERO = {
  /*
    Rebuilt 2026-09-08 as a two-column layout on the page background. Three
    things were removed at the owner's request, and all three were UNVERIFIED
    claims GAP-004 was waiting on:
      - the eyebrow's "Batch Kettle No. 042", an invented batch number;
      - "9.4 / 10 Crisp Snap", an invented sensory score — the same figure the
        crunch section's deleted profile card carried;
      - "100% Churned Butter" and "Lagos Hand-Rolled", unconfirmed product
        claims.
    The owner asked for them gone as redundant, not as a content fix, but the
    effect is the same: three fewer unverified claims on the page. They are
    deleted rather than left dormant.
  */
  titleLine1: "Crafted for",
  titleLine2: "Good taste.",
  body: "Nigeria's favorite fried snack, made properly. Small batches, real butter, and whole-milled nutmeg in every bite.",
  primaryCta: { label: "Shop chinchin", href: ROUTES.shop },
  secondaryCta: { label: "Our story", href: ROUTES.about },
  /** PLACEHOLDER until the brand shoot — see GAP-006. */
  image: {
    src: "/images/newchinchin2.jpeg",
    alt: "A tray of freshly fried chinchin with a small serving bowl",
    note: "Hero photography",
  } satisfies ImageSlot,
};

export const MANIFESTO = {
  eyebrow: "The Lamie manifesto",
  title: "More than a snack. It's West African pride, in every batch.",
  /*
    Owner-written, 2026-09-07. "chinchin" as one word, lowercase, which is the
    page's dominant convention — 39 one-word uses against 7 hyphenated or
    spaced. The stragglers are noted in progress.md.
  */
  body: [
    "We're building a Nigerian food brand on one idea: chinchin should taste this good, every time. That starts with real ingredients, made fresh in small batches — no shortcuts.",
    "For years, chinchin has been treated like an afterthought — sold in cellophane parcels on the roadside. We think it deserves better: real butter, stone-ground nutmeg, and unbleached flour, made with patience.",
  ],
  image: {
    src: "/images/newchinchin1.jpeg",
    alt: "Chinchin piled in a blue ceramic bowl",
    note: "Product photography",
  } satisfies ImageSlot,
  /*
    The "Philosophy — Good food respects the craft" card that sat over the
    photograph was removed at the owner's request. It was supplied artwork
    (`public/images/card.png`), which is now unreferenced but left in place.
  */
  /** UNVERIFIED — ingredient and shelf-life claims, not yet confirmed. */
  stats: [
    { value: "100%", label: "Churned Dairy Butter", note: "Zero synthetic margarine" },
    { value: "48 Hrs", label: "Kettle To Pack", note: "Uncompromising freshness" },
    { value: "Zero", label: "Artificial Preservatives", note: "Pure whole ingredients" },
  ] as Unverified<{ value: string; label: string; note: string }[]>,
};

export const PILLARS = {
  eyebrow: "What goes into every batch",
  title: "The Three Pillars of Lamie Craft",
  body: "From the nutmeg we grind to the jar we seal it in.",
  /**
   * Rewritten by the owner on 2026-09-07, so these are the brand's own
   * statements about its own kitchen rather than the mock's invented process
   * copy. No longer UNVERIFIED — with one exception, below.
   */
  items: [
    {
      icon: "award" as const,
      index: "Pillar 01",
      title: "Obsessive Quality",
      body: "Wheat flour, real butter, farm eggs, fresh-ground spices. Nothing cut, nothing swapped.",
    },
    {
      icon: "timer" as const,
      index: "Pillar 02",
      title: "Small-Batch Freshness",
      body: "Made in small pots, not mass-produced. Every pouch ships within hours of cooling.",
    },
    {
      /*
        AHEAD OF THE CATALOGUE — this copy is correct; `products.ts` is not.

        The owner has confirmed every chin chin will be packaged in THREE sizes.
        The catalogue still lists two per product — "250g Pouch" and
        "500g Gourmet Jar" — so a customer who reads this and clicks through to
        the shop currently finds two options, one of them glass.

        The third size cannot be added here: it needs a name, a format and a
        price, and prices are the one thing this project never invents. Blocked
        on the owner. Tracked in gaps.md.
      */
      icon: "sparkle" as const,
      index: "Pillar 03",
      title: "Thoughtful Craft",
      body: "Packed fresh in pouches, in three sizes, sealed to stay crisp.",
    },
  ],
};

export const CRUNCH = {
  eyebrow: "How it's made",
  titleLine1: "Then comes",
  titleLine2: "the crunch.",
  body: "You'll hear it before you taste it. A sharp golden crunch gives way to a soft, buttery crumb, warmed through with real nutmeg.",
  image: {
    src: "/images/newchinchin.jpeg",
    alt: "A plate piled with golden chin chin cubes",
    note: "Product photography",
  } satisfies ImageSlot,
  /*
    The "Acoustic Sensory Profile" card was removed at the owner's request.
    With it went the mock's invented scores — 9.4/10 flake and crunch
    resistance, 4.2/10 sweetness balance, 8.8/10 butterfat palate melt. Nothing
    measured any of them, and they were among the UNVERIFIED claims GAP-004
    lists. The data is deleted rather than left dormant, so it cannot quietly
    return to the page.
  */
  /**
   * Process claims, rewritten by the owner on 2026-09-07 — so unlike the mock's
   * versions these are the brand's own statements about its own kitchen, not
   * copy invented for a design frame. No longer UNVERIFIED.
   */
  points: [
    {
      title: "Stone-milled nutmeg",
      body: "Ground fresh in small batches so the flavour never fades.",
    },
    {
      title: "Rested dough",
      body: "A slow chill before frying is what gives every piece its flaky layers.",
    },
  ],
  link: { label: "See all 3 flavours", href: ROUTES.shop },
};

export const FLAVOURS = {
  eyebrow: "Curated Release",
  title: "Three Flavours. One Lamie Standard.",
  link: { label: "View full pantry", href: ROUTES.shop },
  /** Straight from the shared catalogue, so the shop can never show a
   *  different name, photograph or price for the same product. */
  items: PRODUCTS,
  /** UNVERIFIED — pack formats have not been confirmed. */
  formats: {
    title: "Available in Two Mindful Formats",
    body: "250g artisanal stand-up wax pouches and 500g embossed airtight keeper jars.",
    cta: { label: "Compare formats", href: ROUTES.shop },
  },
};

export const HORIZON = {
  eyebrow: "What's next",
  title: "Chinchin is just the beginning.",
  body: "We're building out more West African snacks and pantry staples. Here's what's currently in the works:",
  /**
   * Descriptions rewritten by the owner on 2026-09-08. The products themselves
   * are still UNVERIFIED: none has been announced, dated or priced, and the
   * page says only that they are in the works — which is the honest framing for
   * something that does not exist yet. The "Drop 02 / Drop 03" schedule labels
   * were removed, so the page no longer implies a release order nobody set.
   */
  items: [
    {
      status: "In testing",
      title: "Spiced Plantain Crisps",
      body: "Fried green plantains with roasted scotch bonnet and sea salt.",
    },
    {
      status: "In development",
      title: "Cashew Nut Spread",
      body: "Cashews, stone-ground with wild honey and warm spices.",
    },
    {
      status: "Reserve",
      title: "Honey Glazed Seasonal Tins",
      body: "A limited holiday batch, made with raw honey from Plateau State.",
    },
  ] as Unverified<{ status: string; title: string; body: string }[]>,
  form: {
    label: "Email address",
    placeholder: "Enter your email address",
    cta: "Request tasting access",
  },
};

export const FINAL_CTA = {
  eyebrow: "Order fresh daily",
  titleLine1: "Good Taste",
  titleLine2: "Starts Here.",
  /* "chinchin" one word, lowercase — the site-wide convention set by the hero
     and manifesto. */
  body: "Fresh chinchin, delivered from our kitchen to your door.",
  primaryCta: { label: "Shop chinchin now", href: ROUTES.shop },
  /*
    NOTE: this href is "#contact", and the section rendering this button IS
    `id="contact"`. The link scrolls to itself, so the button does nothing.
    Renaming it did not change that. There is no gifting page to point at yet;
    left as-is rather than guessed at, and raised with the owner.
  */
  secondaryCta: { label: "Gifting & events", href: "#contact" },
  /** Delivery window is the CONFIRMED 1–5 days, not the mock's 1–3. */
  assurances: [
    { icon: "shield" as const, label: "Paystack secured" },
    {
      icon: "truck" as const,
      label: `${DELIVERY.minDays}–${DELIVERY.maxDays} days delivery`,
    },
    { icon: "seal" as const, label: "Freshness guaranteed" },
  ],
};

export const FOOTER = {
  tagline: BRAND.tagline,
  /** Build credit, confirmed by the owner. Plain text — no URL supplied. */
  credit: "Website by Basil Studio",
  body: "An artisanal West African pastry house dedicated to elevating the time-honoured chin-chin tradition. Prepared in conscientious small batches with golden butter, aromatic spices, and warm hospitality.",
  /**
   * Only Instagram is confirmed. The mock invented an email address and a
   * WhatsApp line — those render as plain text, never as a live link, until
   * the owner supplies real ones.
   */
  contact: [
    {
      icon: "instagram" as const,
      label: BRAND.instagramHandle,
      href: BRAND.instagramUrl,
    },
    { icon: "chat" as const, label: "WhatsApp concierge — coming soon", href: null },
    { icon: "mail" as const, label: "Email — coming soon", href: null },
  ],
};
