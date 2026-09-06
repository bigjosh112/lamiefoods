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
  { label: "Contact", href: "#contact" },
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
  eyebrow: "Uncompromised Standard",
  title: "The Three Pillars of Lamie Craft",
  body: "From the stone mortar where we grate whole nutmeg pods to the seal on our keepsake jars.",
  /** UNVERIFIED — process descriptions from the mock. */
  items: [
    {
      icon: "award" as const,
      index: "Pillar 01",
      title: "Obsessive Quality",
      body: "Made with meticulous attention to the details that matter. Heritage wheat flour, slow-churned sweet cream butter, whole farm eggs, and fresh stone-grated spices.",
    },
    {
      icon: "timer" as const,
      index: "Pillar 02",
      title: "Small-Batch Freshness",
      body: "Freshly prepared in temperature-calibrated small kettles. We never mass-produce inventory; each pouch is dispatched within hours of reaching optimal cooling balance.",
    },
    {
      icon: "sparkle" as const,
      index: "Pillar 03",
      title: "Thoughtful Craft",
      body: "Beautifully packaged in moisture-barrier wax pouches and embossed keepsake jars designed for discerning personal study desks and warm banquet gift tables alike.",
    },
  ],
};

export const CRUNCH = {
  eyebrow: "The Anatomy of Craving",
  titleLine1: "Then comes",
  titleLine2: "the crunch.",
  body: "A genuine Lamie chin-chin does not shatter into coarse dry crumbs, nor does it yield to heavy oiliness. The first contact delivers a sharp acoustic snap, quickly giving way to a velvety, sweet-butter crumble infused with warm nutmeg perfume.",
  image: {
    src: "/images/chinchin8.png",
    alt: "A piece of chinchin breaking to show its layered interior",
    note: "Macro texture photography",
  } satisfies ImageSlot,
  /** UNVERIFIED — the mock's invented sensory scores. */
  profile: {
    title: "Acoustic Sensory Profile",
    metrics: [
      { label: "Flake & Crunch Resistance", score: 9.4 },
      { label: "Sweetness Balance (Savory–Sweet)", score: 4.2 },
      { label: "Butterfat Palate Melt", score: 8.8 },
    ],
  } as Unverified<{
    title: string;
    metrics: { label: string; score: number }[];
  }>,
  /** UNVERIFIED — process claims. */
  points: [
    {
      title: "Stone-Milled Whole Nutmeg",
      body: "Ground in small batches right before folding to lock in fleeting volatile aromatic oils.",
    },
    {
      title: "Double-Rested Dough Blankets",
      body: "A cold resting cycle relaxes gluten strands, yielding micro-layered flakiness.",
    },
  ],
  link: { label: "Experience the crunch in 3 flavours", href: ROUTES.shop },
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
