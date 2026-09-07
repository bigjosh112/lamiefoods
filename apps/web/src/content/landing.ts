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
  eyebrow: "West African Fine Confectionery",
  /** UNVERIFIED — the mock's "Batch Kettle No. 042" is invented. */
  eyebrowMeta: "Batch Kettle No. 042" as Unverified<string>,
  titleLine1: "Crafted for",
  titleLine2: "Good Taste.",
  body: "Elevating Nigeria's quintessential kettle pastry to haute confectionery. Made in small batches with sweet cream dairy butter and whole-milled nutmeg.",
  primaryCta: { label: "Shop Chinchin Collection", href: ROUTES.shop },
  secondaryCta: { label: "Explore Culinary Story", href: ROUTES.about },
  image: {
    src: "/images/chinchin5.jpg.png",
    alt: "A bowl of freshly made Lamie Foods chinchin",
    note: "Hero photography",
  } satisfies ImageSlot,
  /** UNVERIFIED — all three are product claims the owner has not confirmed. */
  stats: [
    { label: "Fat Source", value: "100% Churned Butter" },
    { label: "Sensory Crunch", value: "9.4 / 10 Crisp Snap" },
    { label: "Provenance", value: "Lagos Hand-Rolled" },
  ] as Unverified<{ label: string; value: string }[]>,
};

export const MANIFESTO = {
  eyebrow: "The Lamie Manifesto",
  title: "More than a snack. An ongoing tribute to West African culinary pride.",
  body: [
    `${BRAND.displayName} is building a trusted Nigerian food brand around great taste, uncompromising quality, pristine freshness, and thoughtful presentation — starting with our signature range of freshly made Chinchin.`,
    "For generations, chin-chin has been relegated to celebratory afterthoughts or cellophane parcels sold on congested expressways. We believe this golden, fragrant pastry deserves the dignity of fine viennoiserie: premium butter, stone-ground nutmeg, and unbleached flour baked with patience.",
  ],
  image: {
    src: "/images/chinchin7.png",
    alt: "Lamie Foods chinchin in kraft packaging, held in two hands",
    note: "Packaging photography",
  } satisfies ImageSlot,
  /*
   * The philosophy card is a supplied image, not markup. Its wording lives in
   * the artwork, so `alt` has to carry it — that text is invisible to search
   * engines and to anyone selecting or resizing text. If it should become
   * real text again, the design's line break falls after "respects".
   */
  overlay: {
    src: "/images/card.png",
    alt: "Philosophy — Good food respects the craft.",
    width: 219,
    height: 124,
  },
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

export const MOMENTS = {
  eyebrow: "Mindful Gastronomy",
  title: "Made for every kind of moment.",
  body: "Whether solitary reflection or communal feasting, Lamie settles with quiet elegance.",
  features: [
    {
      eyebrow: "Morning & Twilight",
      title: "Quiet tea & coffee companionship",
      body: "A companion to fresh poured pour-over coffee or slow-steeped ginger infusion. The buttery notes dissolve effortlessly into hot drinks without softening prematurely.",
      image: {
        src: "/images/workspace1.png",
        alt: "A bowl of chinchin beside a cup of coffee on a table",
        note: "Lifestyle photography",
      } satisfies ImageSlot,
    },
    {
      eyebrow: "Focus Hours",
      title: "Desk-side creative cadence",
      body: "Clean finger-feel with zero oily residue on keyboards and pens. The acoustic snap offers an engaging sensory pause between deep work sessions.",
      image: {
        src: null,
        alt: "A jar of chinchin on a desk beside a laptop",
        note: "Lifestyle photography",
      } satisfies ImageSlot,
    },
  ],
  small: [
    {
      icon: "plane" as const,
      title: "On the Go",
      body: "Resealable airtight wax lining keeps your snack fresh through road trips and international flights.",
    },
    {
      icon: "people" as const,
      title: "Shared Hospitality",
      body: "A welcoming gesture of high-grade West African host generosity poured into earthen serving bowls.",
    },
    {
      icon: "gift" as const,
      title: "Luxury Gifting",
      body: "Curated keepsake boxes with customized hand-lettered cards for weddings, clients, and celebrations.",
    },
  ],
};

export const HORIZON = {
  eyebrow: "Pantry Horizon",
  title: "Chinchin is just the beginning.",
  body: "We are patiently building toward an expansive collection of snacks, roasted nut butters, and culinary provisions rooted in West African culinary excellence. Here is what is slowly simmering in the testing kitchen:",
  /** UNVERIFIED — none of these upcoming products has been confirmed. */
  items: [
    {
      status: "In Testing",
      title: "Spiced Plantain Crisps",
      body: "Kettle-cooked green plantains with roasted scotch bonnet and sea crystals.",
      meta: "Drop 02",
    },
    {
      status: "Lab Blend",
      title: "Artisanal Cashew Nut Spread",
      body: "Sun-dried cashews stone-ground with wild honey and warm spices.",
      meta: "Drop 03",
    },
    {
      status: "Reserve",
      title: "Honey Glazed Seasonal Tins",
      body: "Limited holiday release baked with raw plateau honeycombs.",
      meta: "Limited release",
    },
  ] as Unverified<{ status: string; title: string; body: string; meta: string }[]>,
  form: {
    label: "Email address",
    placeholder: "Enter your email address",
    cta: "Request tasting access",
  },
};

export const FINAL_CTA = {
  eyebrow: "Order Fresh Daily",
  titleLine1: "Good Taste",
  titleLine2: "Starts Here.",
  body: "Experience Nigeria's finest artisanal Chinchin delivered directly from our ovens to your door.",
  primaryCta: { label: "Shop Chinchin Now", href: ROUTES.shop },
  secondaryCta: { label: "Event Gifting Concierge", href: "#contact" },
  /** Delivery window is the CONFIRMED 1–5 days, not the mock's 1–3. */
  assurances: [
    { icon: "shield" as const, label: "Paystack Secured" },
    {
      icon: "truck" as const,
      label: `${DELIVERY.minDays}–${DELIVERY.maxDays} Days Delivery`,
    },
    { icon: "seal" as const, label: "Freshness Guaranteed" },
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
