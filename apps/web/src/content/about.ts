import { BRAND, ROUTES } from "@lamiefoods/config";
import type { ImageSlot } from "./image-slot";

/**
 * Copy for the About page.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * UNVERIFIED throughout, per GAP-004. The mock invents a great deal here:
 * butterfat and preservative percentages, a 48-hour kettle-to-pouch window, a
 * 175°C frying temperature, a batch number, sensory index percentages, and
 * sourcing claims about named regions and cooperatives. All of it reads as
 * fact to a customer and none of it has been confirmed.
 *
 * Two deliberate corrections:
 *   - The mock's body copy says "Lamie Foods Enterprise" twice. The
 *     customer-facing name is "Lamie Foods".
 *   - "Dispatched within 24 hours" contradicts the confirmed 1–5 day window,
 *     so the closing strip does not make a dispatch-time promise.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const ABOUT = {
  hero: {
    eyebrow: "Our heritage & vision",
    titleLine1: "Good Food.",
    titleEmphasis: "Thoughtfully",
    titleLine2: "Made.",
    body: `${BRAND.displayName} is a growing Nigerian food brand, making chinchin the way it deserves to be made — rooted in Lagos, loved everywhere.`,
    /**
     * UNVERIFIED — three product claims stated as fact. Reworded by the owner
     * on 2026-09-10; rewording is not confirming, so the marker stays. A
     * preservative claim in particular is a consumer-protection matter.
     */
    stats: [
      { value: "100%", label: "Pure butterfat" },
      { value: "Zero", label: "Preservatives" },
      { value: "48 hrs", label: "Fresh to pack" },
    ],
    /*
      Lamie Foods' OWN packaging, unlike the third-party mockups still standing
      in on the storefront (GAP-006) — but two things are printed on it that the
      code cannot control, and both are flagged in gaps.md:

        1. HEALTH CLAIMS: "Rich in Fiber", "For healthy Heart", "Rich in
           Vitamins" and a "Certified Quality" mark are legible on the pouch. A
           heart-health claim is a regulated statement, and the owner's brief
           for this project explicitly forbids inventing health claims — putting
           them on the page as pixels is the same statement as putting them in
           copy, and it bypasses every text-level check here.
        2. It reads "Net Weight 200g", which is not a size the brand sells:
           the confirmed range is 100g / 300g / 500g pouches.
    */
    image: {
      src: "/images/cinnamonvelvetsingle.jpeg",
      alt: "A Lamie Foods Cinnamon Velvet chinchin pouch",
      note: "Heritage portrait",
    } satisfies ImageSlot,
    /*
      `badge` ("Lagos atelier craft") and `batch` were removed on 2026-09-10
      along with the overlays that rendered them. The batch reference was an
      invented number nothing tracks — the same fiction already cleared from the
      hero, the shop header and the product gallery.
    */
  },

  heritage: {
    /*
      The owner offered "What's next" or "Where it comes from" and said to pick
      whichever reflects the section's actual topic. "What's next" already names
      the landing page's upcoming-products section, and this one is about where
      the recipe comes from, so reusing it would have pointed two different
      sections at the same phrase.
    */
    eyebrow: "Where it comes from",
    title: "Made the way it should be.",
    /* Owner-written, 2026-09-10. */
    body: [
      "Chin-chin isn't just a snack in Nigerian homes — it's what's on the table at every gathering, wedding, and holiday. Made properly, it's more than crunchy: it's rich, buttery, and full of flavour in every bite.",
      "At Lamie, we don't cut corners. Real butter, whole nutmeg, and slow frying in small batches — every single time.",
    ],
    image: {
      src: "/images/newchinchin7.jpeg",
      alt: "Chinchin piled in a glass dish",
      note: "Kitchen craft",
    } satisfies ImageSlot,
    /*
      `overlay` removed 2026-09-10 with the card that rendered it — an
      "Acoustic metric / The Signature Micro-Crunch" panel whose copy was
      invented for the design mock and which nothing measures.
    */
    /**
     * Process claims. Reworded by the owner on 2026-09-10, which is not the
     * same as confirmed — "slow frying in small batches" and "ground fresh"
     * are still statements about how the food is made.
     */
    points: [
      {
        icon: "box" as const,
        title: "Small-batch frying",
        body: "Never mass-produced — hand-cut and fried in small batches.",
      },
      {
        icon: "leaf" as const,
        title: "Fresh-ground spices",
        body: "Whole nutmeg, ground fresh for every batch.",
      },
    ],
  },

  tenets: {
    eyebrow: "What we stand for",
    title: "How Lamie Foods gets it right.",
    body: "The standards behind every pouch we make.",
    /**
     * Reworded by the owner on 2026-09-10 — which is not the same as confirmed.
     * "Real butter and pure cane sugar", "sealed while it's still warm" and
     * "small batches" are all still claims about how the food is made, so this
     * stays UNVERIFIED (GAP-004).
     *
     * `note` and `inverted` were dropped with this pass. The notes rendered as
     * labels rather than links because the mock's destinations do not exist;
     * `inverted` painted the middle card dark, which the owner removed as an
     * inconsistency between the three.
     *
     * "Pillar", not "Tenet" — the landing page's equivalent section already
     * numbers its cards that way.
     */
    items: [
      {
        icon: "award" as const,
        index: "Pillar 01",
        title: "Real ingredients",
        body: "No shortcuts, no substitutes. Just real butter and pure cane sugar in every batch.",
      },
      {
        icon: "timer" as const,
        index: "Pillar 02",
        title: "Always fresh",
        body: "Made in small batches and sealed while it's still warm, so every pouch tastes freshly made.",
      },
      {
        icon: "sparkle" as const,
        index: "Pillar 03",
        title: "Thoughtful Craft",
        body: "From the pouch to the seal, every detail is built to keep it fresh and crisp, wherever you're enjoying it.",
      },
    ],
  },

  horizon: {
    eyebrow: "What's next",
    title: "This is just the beginning.",
    /* Owner-written, 2026-09-10. */
    body: `We started with chinchin, but that's not where we're stopping. ${BRAND.displayName} is building toward more West African snacks and pantry foods, made with the same care.`,
    /**
     * UNVERIFIED — neither product has been announced, dated or priced. The
     * wording says only that they are in the works, which is the honest framing
     * for something that does not exist yet.
     */
    pipeline: "Next in the works: spiced plantain crisps and honey-glazed treats.",
    images: [
      {
        src: "/images/chinchin5.jpg.png",
        alt: "A bowl of freshly made Lamie Foods chinchin",
        note: "Pantry spread",
      },
      {
        src: "/images/newchinchin8.jpeg",
        alt: "A white bowl of chinchin on a wooden board",
        note: "Pantry spread",
      },
    ] satisfies ImageSlot[],
    /*
      `values` — "Integrity First", "Local Sourcing", "Nigerian Pride" — was
      removed on 2026-09-10. It repeated the pillars section above it, and its
      supply-chain claims (frying temperatures, direct spice-mill partnerships)
      were never confirmed.
    */
  },

  /** UNVERIFIED — the mock's sensory index percentages are invented. */
  sensory: {
    eyebrow: "Sensory profile",
    title: "The Anatomy of Our Signature Bite",
    body: "We calibrate each element — moisture ratio, sugar crystallisation point, and spice warmth — to yield a refined sensory progression.",
    metrics: [
      {
        label: "Crunch density (acoustic index)",
        pct: 92,
        scale: ["Soft doughy", "Micro-flaked crisp", "Rock solid"],
      },
      {
        label: "Butterfat warmth",
        pct: 88,
        scale: ["Faint", "Rich cream churn", "Heavy"],
      },
      {
        label: "Nutmeg & spice radiance",
        pct: 78,
        scale: ["Plain sweet", "Aromatic bloom", "Pungent"],
      },
    ],
  },

  cta: {
    eyebrow: "Experience the craft",
    title: "Taste the Difference.",
    body: "Every batch is freshly kneaded, hand-cut, and slow-crisped in our Lagos workshop. Secure your pouches for your home or next celebration.",
    primary: { label: "Explore the signature collection", href: ROUTES.shop },
    /** Instagram is the only confirmed contact channel. */
    secondary: { label: "Enquire about events", href: BRAND.instagramUrl },
    /**
     * The mock promised "dispatched within 24 hours", which contradicts the
     * confirmed 1–5 day delivery window, so no dispatch time is claimed here.
     */
    strip: "Baked in Lagos · Air-sealed for freshness",
  },
};
