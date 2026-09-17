import { BRAND, DELIVERY, ROUTES } from "@lamiefoods/config";
import type { ImageSlot } from "./image-slot";

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
 *
 * "Website by Basil Studio" DOES ship, as plain text (see `FOOTER.credit`
 * below) — the owner confirmed the credit is welcome.
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
  /*
    Reworded 2026-09-14. The previous sentence named "small batches", "real
    butter" and "whole-milled nutmeg" — the last ingredient-and-method claims
    on the landing page. The shop page, footer, bag and About page all dropped
    their equivalents over 2026-09-13/14, so the hero had been the one place
    still stating them.
  */
  body: "Deliciously made, thoughtfully crafted. Every bite is made with carefully selected ingredients and a whole lot of love.",
  primaryCta: { label: "Shop chinchin", href: ROUTES.shop },
  secondaryCta: { label: "Our story", href: ROUTES.about },
  /*
    REAL brand photography as of 2026-09-16 — the owner's own shoot, replacing
    the `newchinchin2.jpeg` stand-in. This slot is no longer part of GAP-006.

    Note the pouches are legible here, and they print "Rich in Fiber", "For
    healthy Heart" and "Rich in Vitamins". Those are the same regulated health
    claims flagged against the About page's packaging shot: putting them on the
    page as pixels states them just as surely as copy would, and no text-level
    check can catch it. Net weight reads 100g, which does match the confirmed
    range.
  */
  image: {
    src: "/images/shoot4.jpeg",
    alt: "Lamie Foods chin chin range — Cinnamon Velvet, Milky Velvet, Coco Velvet.",
    note: "Hero photography",
  } satisfies ImageSlot,
};

export const MANIFESTO = {
  eyebrow: "The Lamie manifesto",
  title: "Rooted in Tradition. Crafted for Today.",
  /*
    Owner-written, 2026-09-12, replacing the 2026-09-07 copy.

    The brand name comes from `BRAND.displayName`, matching about.ts, rather
    than a literal — the mock's "Lamie Foods Enterprise" must never reach a
    customer-facing page, and one constant is easier to keep honest than a
    string repeated across files.

    This rewrite drops the previous ingredient specifics — real butter,
    stone-ground nutmeg, unbleached flour — and every "chinchin" mention with
    them. It now speaks to Nigerian favourites generally, which also suits a
    catalogue the owner has said will widen beyond chinchin. The three stats
    below still assert the old specifics; see the note on them.
  */
  body: [
    `${BRAND.displayName} was built on a love for good food and a desire to give familiar Nigerian favourites the quality and attention they deserve.`,
    "We carefully select our ingredients and take pride in every stage of preparation, creating snacks that are consistently delicious, beautifully made, and made to be enjoyed.",
    "Because traditional favourites deserve exceptional standards.",
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
  /*
    Client-supplied, 2026-09-12. This REPLACES the three stats the mock
    invented — "100% Churned Dairy Butter", "48 Hrs Kettle To Pack" and "Zero
    Artificial Preservatives" — which were the last UNVERIFIED claims in this
    section and are now gone from the site rather than left dormant.

    That matters beyond tidiness: a butterfat composition, a production window
    and a preservative-free declaration are all claims a customer, a competitor
    or a regulator can hold the brand to, and none had been confirmed. Nothing
    below asserts a measurable fact about the food.

    Subheadings are stored in sentence case and uppercased by CSS, matching
    every other caps label on the site — the casing is a typographic choice,
    so it belongs in the stylesheet, not baked into the copy.
  */
  features: [
    {
      title: "Quality",
      subheading: "Selected ingredients",
      description: "Chosen with taste and quality in mind.",
    },
    {
      title: "Care",
      subheading: "Thoughtful preparation",
      description: "Made with attention to every detail.",
    },
    {
      title: "Taste",
      subheading: "Consistently delicious",
      description: "A satisfying crunch in every bite.",
    },
  ],
};

export const PILLARS = {
  eyebrow: "What goes into every batch",
  title: `The Three Pillars of ${BRAND.displayName}`,
  body: "Quality. Consistency. Craftsmanship.",
  /*
    Client-supplied, 2026-09-12, replacing the owner's 2026-09-07 copy.

    Every concrete claim this section used to make is gone with it: the named
    ingredients ("wheat flour, real butter, farm eggs"), "made in small pots,
    not mass-produced", "ships within hours of cooling", and the pouch count
    and sizes. None of those were UNVERIFIED — the owner wrote them — but the
    replacement deliberately describes standards rather than specifics, which
    means this copy no longer has to be re-checked whenever the kitchen, the
    pack range or the fulfilment timing changes.
  */
  intro:
    "We are committed to creating food products that meet a high standard of quality, from the ingredients we select to the way each product is prepared and packaged.",
  items: [
    {
      icon: "award" as const,
      index: "Pillar 01",
      title: "Quality Ingredients",
      body: "We carefully select our ingredients to create products with great taste, texture, and quality.",
    },
    {
      icon: "timer" as const,
      index: "Pillar 02",
      title: "Consistent Quality",
      body: `Every product is prepared with attention to detail, ensuring the quality and experience you expect from ${BRAND.displayName}.`,
    },
    {
      icon: "sparkle" as const,
      index: "Pillar 03",
      title: "Thoughtful Craftsmanship",
      body: "From preparation to packaging, every detail is handled with care to deliver products that are made to be enjoyed.",
    },
  ],
  closing: "Quality you can trust. Taste you'll remember.",
};

export const CRUNCH = {
  eyebrow: "How it's made",
  titleLine1: "Then comes",
  titleLine2: "the crunch.",
  body: "You'll hear it before you taste it. A sharp golden crunch gives way to a soft, buttery crumb, warmed through with real nutmeg.",
  /*
    REAL brand photography as of 2026-09-16, replacing the `newchinchin.jpeg`
    stand-in.

    The composition matters to the markup: the bowl sits hard right (roughly
    x 54%-97%) with the left of the frame empty. This slot is a SQUARE box and
    the photo is 1.499 landscape, so `object-cover` drops a third of the width.
    A default centre crop would cut the right side off the bowl, which is why
    `crunch.tsx` pins the crop to the right edge. Re-check that if this image
    is ever swapped for a differently-composed one.
  */
  image: {
    src: "/images/shoot2.jpeg",
    alt: "Chinchin piled in a carved coconut bowl on a wooden table",
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
  title: "Our Featured Flavours",
  link: { label: "View full pantry", href: ROUTES.shop },
  /* Confirmed by the owner on 2026-09-08 — three pouch sizes, no jars. */
  formats: {
    title: "Available in three sizes",
    body: "100g, 300g and 500g resealable pouches.",
    cta: { label: "Compare sizes", href: ROUTES.shop },
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
   *
   * The `status` field ("In testing", "In development", "Reserve") went the
   * same way on 2026-09-15, removed by the owner. Those labels were progress
   * claims too — each told a customer how far along a product was, and none
   * was tracked anywhere.
   */
  items: [
    {
      title: "Spiced Plantain Crisps",
      body: "Fried green plantains with roasted scotch bonnet and sea salt.",
    },
    {
      title: "Cashew Nut Spread",
      body: "Cashews, stone-ground with wild honey and warm spices.",
    },
    {
      title: "Honey Glazed Seasonal Tins",
      body: "A limited holiday batch, made with raw honey from Plateau State.",
    },
  ] as Unverified<{ title: string; body: string }[]>,
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

/**
 * A footer contact channel.
 *
 * `href` is explicitly nullable even though all three channels are live today.
 * Widening it keeps the site-wide rule enforceable — a destination that does
 * not exist yet renders as plain text, never as a link to a 404 — so a future
 * channel can be added before its URL is known without the footer's fallback
 * branch becoming unreachable code that TypeScript then rejects.
 */
type ContactEntry = {
  icon: "instagramBrand" | "whatsapp" | "gmail";
  label: string;
  href: string | null;
};

export const FOOTER = {
  tagline: BRAND.tagline,
  /** Build credit, confirmed by the owner. Now a link — the studio's Instagram
   *  was supplied on 2026-09-12. */
  credit: {
    label: "Website by Basil Studio",
    href: "https://www.instagram.com/basilstudio.ng",
  },
  /*
    Owner-written, reworded 2026-09-14. Keeps "chinchin" as one word, the site
    convention.

    This was the last place on the site still claiming "real butter" and
    "small batches" — the shop subheading and the shop trust strip both
    dropped those specifics on 2026-09-13, so the footer had been contradicting
    them on every page since. Nothing here asserts a measurable fact now.
  */
  body: "Nigerian made chinchin, carefully prepared with quality ingredients and a signature blend of warm spices.",
  /*
    Instagram and WhatsApp are both live as of 2026-09-12 — the owner supplied
    the WhatsApp number, so it links out instead of reading "coming soon".

    Email went live on 2026-09-12 too, when the owner supplied the address. It
    is a `mailto:`, so the footer does not give it `target="_blank"` — that
    would open a blank tab alongside the mail client.

    These three use the brand marks, not the line-icon set — see `icons.tsx`
    for why they ignore inherited text colour.
  */
  contact: [
    {
      icon: "instagramBrand",
      label: BRAND.instagramHandle,
      href: BRAND.instagramUrl,
    },
    {
      icon: "whatsapp",
      label: `WhatsApp ${BRAND.whatsappNumber}`,
      href: BRAND.whatsappUrl,
    },
    { icon: "gmail", label: `Email ${BRAND.email}`, href: BRAND.emailUrl },
  ] as ContactEntry[],
};
