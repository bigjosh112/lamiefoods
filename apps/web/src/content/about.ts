import { BRAND, ROUTES } from "@lamiefoods/config";
import type { ImageSlot } from "./image-slot";

/**
 * Copy for the About page.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * UNVERIFIED throughout, per GAP-004. The mock invents a great deal here:
 * butterfat and preservative percentages, a 48-hour kettle-to-pouch window, a
 * 175°C frying temperature, a batch number, and sourcing claims about named
 * regions and cooperatives. All of it reads as fact to a customer and none of
 * it has been confirmed.
 *
 * The mock's sensory-index percentages are gone with the section that showed
 * them — the owner removed "The anatomy of our signature bite" on 2026-09-10,
 * taking three more invented figures off the page.
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
    body: `${BRAND.displayName} is a growing Nigerian food brand, making chinchin the way it deserves to be made. Rooted in Lagos, loved everywhere.`,
    /*
      Owner-supplied, 2026-09-14. Replaces the three-figure stat row — "100% /
      Pure butterfat", "Zero / Preservatives", "48 hrs / Fresh to pack" — whose
      numbers were never measured. Two of those three figures are gone
      entirely; nothing here quantifies anything.

      "Zero preservatives" survives as a phrase and is STILL UNVERIFIED. A
      preservative claim is a consumer-protection matter, not marketing copy:
      dropping the numeral does not confirm it. It needs the owner's explicit
      confirmation before launch, or it should go the way the other two did.
    */
    features: [
      "Quality Ingredients",
      "Zero Preservatives",
      "Freshly Prepared",
      "Sealed for Freshness",
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
    title: "Made with intention. Crafted for good taste.",
    /*
      Owner-supplied, 2026-09-14, replacing the 2026-09-10 copy.

      The previous version named ingredients and a method — "real butter, whole
      nutmeg, and slow frying in small batches" — which the shop page, the
      footer and the bag all stopped claiming over 2026-09-13/14. This section
      was the last place on the site still asserting them, so the site now
      describes its standards consistently rather than contradicting itself
      page to page.

      Spelling note: this copy says "Chin-chin", hyphenated, where the rest of
      the site writes "chinchin" as one word. Kept exactly as supplied.
    */
    body: [
      "Chin-chin is a timeless Nigerian favourite, a familiar taste woven into celebrations, gatherings, and everyday moments.",
      "At Lamie, we're reimagining this beloved classic with a focus on quality, flavour, and consistency. Every batch is thoughtfully prepared using carefully selected ingredients and a considered blend of flavours, creating the perfect balance of crunch and indulgence.",
      "From the first bite to the last, every piece is made to be enjoyed.",
    ],
    /*
      REAL brand photography as of 2026-09-16, replacing the `newchinchin7.jpeg`
      stand-in.

      Same caveat as the hero shot on this page: both Coco Velvet pouches are
      legible and print "Rich in Fiber", "For healthy Heart" and "Rich in
      Vitamins". Those are regulated health claims, stated as surely in pixels
      as in copy, and no text-level check can catch them — see the GAP-006 note
      on `hero.image` above. The net weights read 300g and 100g, both of which
      ARE in the confirmed range.
    */
    image: {
      src: "/images/shoot3.jpeg",
      alt: "Two Coco Velvet chinchin pouches with a coconut and scattered chinchin on a wooden table",
      note: "Kitchen craft",
    } satisfies ImageSlot,
    /*
      `overlay` removed 2026-09-10 with the card that rendered it — an
      "Acoustic metric / The Signature Micro-Crunch" panel whose copy was
      invented for the design mock and which nothing measures.
    */
    /*
      Owner-supplied, 2026-09-14. Icons unchanged. The UNVERIFIED marker that
      sat here is gone with the claims that earned it: "small-batch frying",
      "hand-cut", "whole nutmeg ground fresh for every batch" were all
      statements about how the food is made that nobody had confirmed. Neither
      tile states a method or an ingredient now.
    */
    points: [
      {
        icon: "box" as const,
        title: "Quality Ingredients",
        body: "Carefully selected ingredients for great taste and texture.",
      },
      {
        icon: "leaf" as const,
        title: "Made with Care",
        body: "Thoughtfully prepared and packed to deliver a satisfying crunch in every bite.",
      },
    ],
  },

  tenets: {
    eyebrow: "What we stand for",
    title: "How Lamie Foods gets it right.",
    body: "The standards behind every pouch we make.",
    /*
      Owner-supplied, 2026-09-14. Icons unchanged.

      The `index` field is gone with the "Pillar 01/02/03" labels the owner
      removed, and the UNVERIFIED marker goes with the claims that earned it:
      "real butter and pure cane sugar", "made in small batches", "sealed while
      it's still warm". None of the three tiles states an ingredient or a
      method now — they describe intent, which needs no confirming.

      `note` and `inverted` were dropped earlier: the notes rendered as labels
      rather than links because the mock's destinations do not exist, and
      `inverted` painted the middle card dark, which read as an inconsistency
      between the three.
    */
    items: [
      {
        icon: "award" as const,
        title: "Taste, First.",
        body: "We believe great chin-chin should be instantly memorable — crisp, flavourful, and satisfying from the very first bite.",
      },
      {
        icon: "timer" as const,
        title: "Crafted with Intention.",
        body: "Every ingredient, flavour, and texture is carefully considered to create chin-chin that feels familiar.",
      },
      {
        icon: "sparkle" as const,
        title: "Made to Be Shared.",
        body: "From everyday cravings to celebrations, we make chin-chin for the moments that bring people together and the ones worth savouring.",
      },
    ],
  },

  /*
    `horizon` ("This is just the beginning.") was removed on 2026-09-15 at the
    owner's request, with its pipeline tag and both images. Deleted rather than
    left dormant. Its pipeline line named two unannounced, undated, unpriced
    products, so this also takes an UNVERIFIED claim off the About page. The
    landing page's own "Chinchin is just the beginning" section is separate
    content in `landing.ts` and is unaffected.
  */

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
