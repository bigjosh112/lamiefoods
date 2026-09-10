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
    eyebrow: "The Lagos kitchen craft",
    title: "Born from Cherished Food Traditions",
    body: [
      "In Nigerian culture, chin-chin is far more than a casual confection — it is the joyous auditory backdrop of family reunions, the instinctive warmth of welcome when a guest crosses the threshold, and the comfort of shared laughter across tea and wine tables.",
      `At ${BRAND.displayName}, we refuse the shortcuts that turn heritage recipes into powdery commercial cubes. We respect the slow rhythm of the kitchen: working unbleached wheat flour with whole dairy butter, stirring in rich cream, and grinding whole nutmeg pods fresh for every run.`,
    ],
    image: {
      src: "/images/chinchin11.png",
      alt: "Chinchin in a terracotta bowl with whole spices",
      note: "Kitchen craft",
    } satisfies ImageSlot,
    /** UNVERIFIED — the 175°C figure is invented. */
    overlay: {
      eyebrow: "Acoustic metric",
      title: "The Signature Micro-Crunch",
      body: "Slow-fried in controlled small kettles to achieve a distinctive micro-layered structure that fractures delicately rather than hardening.",
    },
    /** UNVERIFIED — process and sourcing claims. */
    points: [
      {
        icon: "box" as const,
        title: "Small kettle batches",
        body: "Never mass-extruded; hand-cut with artisanal edge geometry.",
      },
      {
        icon: "leaf" as const,
        title: "Fresh ground spices",
        body: "Whole nutmeg and sweet aromatic spices, ground for each run.",
      },
    ],
  },

  tenets: {
    eyebrow: "Uncompromising standards",
    title: "The Three Tenets of Lamie",
    body: "How we ensure each pouch honours the matriarchs who perfected the recipe and delights the contemporary consumer.",
    /**
     * UNVERIFIED — ingredient and process claims. The mock ended each card with
     * a link ("Pure ingredient purity →"); there is nowhere for those to go, so
     * they render as labels rather than links to a 404.
     */
    items: [
      {
        icon: "award" as const,
        index: "Tenet 01",
        title: "Unadulterated Quality",
        body: "Zero industrial shortenings, artificial margarine substitutes, or chemical stabilisers. We bake with golden dairy butter and pure cane sugars that melt clean on the palate.",
        note: "Pure ingredient purity",
      },
      {
        icon: "timer" as const,
        index: "Tenet 02",
        title: "Pinnacle Freshness",
        body: "Produced on a strict batch rotation. Our chin-chin is sealed directly from cooling racks so that each pouch unlocks the unmistakable, heady aroma of fresh baked pastry.",
        note: "Guaranteed crunch life",
        /** The design inverts the middle card onto the dark cacao surface. */
        inverted: true,
      },
      {
        icon: "sparkle" as const,
        index: "Tenet 03",
        title: "Thoughtful Craft",
        body: "Every detail — from the resealable pouch to the seal that keeps it crisp — is meant to carry the same chinchin from a quiet afternoon to a festive table.",
        note: "Luxury keepsake form",
      },
    ],
  },

  horizon: {
    eyebrow: "The horizon ahead",
    title: "Chinchin is Our Starting Chapter",
    body: `${BRAND.displayName} was founded with an ambition far grander than one confectionery treat. We are shaping a modern African pantry house — taking beloved culinary relics and reintroducing them through careful food craft, local sourcing, and elegant presentation.`,
    /** UNVERIFIED — none of these products has been announced. */
    pipeline: "Next in pipeline: spiced plantain medleys & heritage honey glazes",
    images: [
      {
        src: "/images/chinchin5.jpg.png",
        alt: "A bowl of freshly made Lamie Foods chinchin",
        note: "Pantry spread",
      },
      {
        src: null,
        alt: "Lamie Foods chinchin pouches",
        note: "Packaging photography",
      },
    ] satisfies ImageSlot[],
    /** UNVERIFIED — sourcing and supply-chain claims. */
    values: [
      {
        icon: "shield" as const,
        title: "Integrity First",
        body: "Transparency in our supply line. We do not compromise on fat quality, frying temperatures, or oil freshness.",
      },
      {
        icon: "people" as const,
        title: "Local Sourcing",
        body: "Partnering directly with spice mills and growers to procure whole spices at peak potency.",
      },
      {
        icon: "seal" as const,
        title: "Nigerian Pride",
        body: "Proving that West African packaged food belongs in luxury pantries, gift hampers, and gourmet retailers.",
      },
    ],
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
