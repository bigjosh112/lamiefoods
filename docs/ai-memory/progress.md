# Progress log

> Running task log, **newest first**. Written by the `log-progress` skill after every
> completed task. Purpose: a fresh session (any model) reads the top few entries and
> knows exactly where the project stands — what just happened, what's mid-flight, and
> what's next. Keep entries short; depth belongs in the other docs.

<!-- Entry template — copy to the TOP of the log:

## YYYY-MM-DD — <task title>

- **Done:** <what shipped, 1–3 bullets>
- **Files:** <key files touched>
- **Decisions:** <any decision made — if architectural, it ALSO goes in architecture.md>
- **Docs updated:** <which memory docs were updated, or "none needed">
- **Gaps:** <new GAP-IDs opened / closed, or "none">
- **Next / open threads:** <what a fresh session should pick up>
-->

## 2026-09-08 — Three pouch sizes and real prices — GAP-011 closed

- **Done:** Item 9 of the shop brief. `250g Pouch` and `500g Gourmet Jar` are
  replaced by the owner's confirmed range: **100g / 300g / 500g resealable
  pouches at ₦2,000 / ₦3,500 / ₦5,000.**
- **The first price list was wrong and querying it paid off.** It put 100g and
  300g both at ₦2,000 — three times the product for the same money, so nobody
  would ever buy the small one. Flagged rather than "corrected" by guessing, and
  the owner supplied the ladder above. Worth remembering as the pattern: a
  suspicious price is raised, never silently adjusted.
- **Packs are now declared once** as `PACKS` in `products.ts` and shared by all
  three products. Each previously carried its own copy, and Coco Velvet and
  Cinnamon were ₦200 above Milky Velvet on mock-inherited figures. One list for
  the range means the three now cost the same — a real change to note, not a
  side effect.
- **The rename reached much further than the catalogue.** Everything below would
  have been a silent bug:
  - `admin-inventory.ts` keys `SAMPLE_STOCK`/`SAMPLE_BATCH` as
    `<slug>::<pack name>`; unrekeyed, every finished-goods row would have
    vanished from the inventory table with no error.
  - `sample-order.ts` referenced both retired packs, and `sampleItem` returns
    `null` for an unknown pack — the order-success preview would have rendered
    an **empty, zero-total order**.
  - `packLabel()` branched on the word "jar" and is retired; the glass-jar
    consumable and the dashboard's jar stock lines are renamed.
  - The product page's pack picker was `sm:grid-cols-2`, which orphaned the
    third size on its own row; now `sm:grid-cols-3`. The shop tile's selector
    went from a flex row to `grid-cols-3`.
- **Jar language removed everywhere a customer could see it**, beyond the shop
  page the brief named: the landing "Two Mindful Formats" card, a shop
  assurance, the product page's storage note telling buyers to keep chinchin
  "inside our airtight gourmet jar", and an about-page line plus an image alt.
  These were product claims contradicting a confirmed brand fact, so they were
  corrected rather than flagged and left. **Verified zero "jar" occurrences on
  every customer page** except one: the owner's own pillars subheading, "From
  the nutmeg we grind to the jar we seal it in." Left alone — their words.
- **Persisted carts:** saved bags store lines by pack name, so anyone holding a
  "250g Pouch" or "500g Gourmet Jar" line has it dropped by `sanitise()` on the
  next visit. Expected and documented in advance.
- **False alarm worth recording:** the owner reported prices missing. Every page
  was re-rendered and checked — landing ₦2,000, shop ₦2,000, product page all
  three tiers, admin all three, sample order totalling ₦12,000 — all correct. It
  was a stale dev server after `products.ts` was restructured under it. If it
  recurs, restart the dev server before hunting for a bug.
- **Verified:** lint, typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md, gaps.md.
- **Gaps:** **GAP-011 CLOSED.**
- **Next / open threads:** GAP-004's remainder (`MANIFESTO.stats`,
  `FLAVOURS.items[].body`, shop `ASSURANCES` claims); landing badge still
  uppercase while the shop badge is sentence case; the self-linking gifting
  button; Flavours/Horizon adjacency and Horizon's outer panel; `<ul><div>` in
  four components; two "chin-chin" in `about.ts`; the pillars line mentioning a
  jar.

## 2026-09-08 — Shop page: header, cards, and one radius site-wide

- **Done:** Items 1-8 and 10 of the owner's shop brief. **Item 9 (three pouch
  sizes) is NOT done** — it needs prices; see below.
- **Files:** `content/shop.ts`, `content/products.ts`, `app/shop/page.tsx`,
  `components/shop/{product-card,shop-catalogue}.tsx`,
  `components/ui/button.tsx`, plus four admin tab components and two dedupes.
- **One radius, one place.** `Button`/`ButtonLink`'s base went `rounded` →
  `rounded-md` (6px), which covers every button on the site in a single change.
  The four admin filter-tab strips and the shop's size selector are raw
  `<button>`s and were updated to match. **Cards and panels keep `rounded`** —
  they are not buttons, and the brief was about buttons. No pill-shaped buttons
  existed to remove; `rounded-full` is only used on avatars and dots.
  The per-call-site `rounded-md` overrides added earlier for add-to-bag and the
  horizon button are now redundant and were removed.
- **Batch card gone, and with it two more GAP-004 values:** "Batch No. 842" and
  "Kettle Fry Date: Today". Nothing tracked either, and the fry date asserted a
  freshness fact no system could know. `SHOP.meta` deleted rather than
  unrendered.
- **Filter tabs** now read "All (3) / Chinchin (3) / Gift sets (Coming soon) /
  Packaged foods (In development)" — one label and one parenthesis. The status
  used to sit in a separate chip after the label, which read as a second
  control inside the tab.
- **"In atelier shop" removed** — it labelled the page you were already on.
- **Badges:** `badges.shop` is now "New" on all three, matching what
  `badges.landing` became. Note this is shared data, so the same badge now
  appears on `related-products` and `product-suggestions` — consistent, and
  worth knowing it was not only the shop grid.
- **⚠ Casing mismatch to settle:** the shop badge is sentence case as
  instructed, but the **landing** badge still carries `uppercase` and renders
  "NEW". The brief said "styled the same as the landing page", which the two no
  longer are. Not changed unasked — one class either way.
- **Item 9 blocked on prices.** The owner has given the size names — 100g, 300g
  and 500g pouches — which resolves the naming half of GAP-011. But 100g and
  300g have never had a price, and 250g is being retired. Asked; the owner chose
  to supply real prices and they have not arrived yet. **Nothing was invented
  and nothing was renamed**, so the shop still shows 250g Pouch and
  500g Gourmet Jar until the figures land.
- **Verified:** every removed string is absent from `/shop`, all five new
  strings render, the four tabs read exactly as specified with no `uppercase`,
  badges are three "New", and add-to-bag/tabs/size buttons all resolve to
  `rounded-md`. Lint, typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** GAP-004 reduced by two. GAP-011 half-answered (names known, prices
  outstanding).
- **Next / open threads:** the three pouch prices; then GAP-004's remainder, the
  landing/shop badge casing, the self-linking gifting button, the
  Flavours/Horizon adjacency, `<ul><div>` in four components, two "chin-chin" in
  `about.ts`.

## 2026-09-08 — Footer copy and link trim

- **Done:** New brand blurb, sentence-case tagline, and the link columns
  trimmed to what actually exists. Dev-only links, staff sign-in, copyright,
  the Basil Studio credit, socials and layout untouched.
- **Files:** `content/landing.ts`, `content/shop.ts`,
  `components/layout/site-footer.tsx`.
- **Tagline casing done in CSS, deliberately.** `FOOTER.tagline` is
  `BRAND.tagline` — an owner-confirmed brand fact that also feeds the page
  title, OG tags and JSON-LD. Rewriting the string to get sentence case would
  have changed all of those, so the `<p>` takes
  `lowercase first-letter:uppercase` instead and the fact stays intact.
- **Links removed for the right reason, not just tidiness:**
  - "Gift Jars & Bundles" — advertised a format the brand does not sell.
  - "Press & Stockists" — no press coverage and no retail partnerships exist.
  - "Artisanal Process" + "Ingredient Sourcing" merged to "Our process".
  - "Contact Atelier" → "Contact us".
  Every remaining link still has `href: null` and renders as plain text, which
  is the existing rule: a footer of 404s is worse than one honest about what has
  shipped.
- **Last "chin-chin" on the landing page is gone** — the new blurb replaced it.
  Two remain in `about.ts`, a different page.
- **⚠ GAP-011 materially advanced.** Removing the jar link, the owner stated the
  brand sells **pouches only, in three sizes**. That is the second statement to
  that effect, and it resolves the gap's open sub-question: the catalogue's
  **"500g Gourmet Jar" is a wrong name**, not merely an incomplete list, and its
  note "Display pantry glass canister" is wrong with it. GAP-011 now records
  three corrections rather than one — rename the 500g pack, add the third size,
  price it — plus two knock-ons found while writing it up:
    - `admin-inventory.ts` keys `SAMPLE_STOCK`/`SAMPLE_BATCH` as
      `<slug>::<pack name>`, so a rename that misses them silently drops the row
      from the inventory table; its `packLabel()` also branches on the word
      "jar".
    - persisted carts store lines by pack **name**, and `cart-store.ts`'s
      `sanitise()` drops lines whose pack no longer matches — so anyone holding a
      saved "500g Gourmet Jar" loses that line. Fine pre-launch, worth knowing.
- **Verified:** all four columns render exactly as specified (Shop: Milky
  Velvet, Coco Velvet, Cinnamon / Company: Brand Story, Our process / Customer
  Care: Track Order, Delivery Schedule, Bulk & Events, Contact us / Policies
  unchanged), every removed string is gone, and the credit, staff sign-in and
  copyright line are intact. Lint, typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md, gaps.md.
- **Gaps:** GAP-011 expanded.
- **Next / open threads:** GAP-011's three catalogue corrections are now the
  most concrete blocked item; then GAP-004's remainder, the self-linking gifting
  button, the Flavours/Horizon adjacency and Horizon's outer panel, the
  `<ul><div>` pattern in four components, and two "chin-chin" in `about.ts`.

## 2026-09-08 — Final CTA copy and casing

- **Done:** Eyebrow, subheading, both buttons and all three trust-strip items
  moved to sentence case with the owner's copy. Headline, background, divider,
  button radius, variants and spacing untouched.
- **Files:** `content/landing.ts`, `components/landing/final-cta.tsx`.
- **Casing:** eyebrow and trust strip take `text-label-sm` — the same 0.6875rem
  as the caps step, so no size moved. The **buttons** take `text-label-md`
  instead: at 11px, sentence case at 500 weight reads noticeably weaker than
  700-weight capitals, so keeping the size would have quietly shrunk the page's
  closing CTA. Matches the hero's buttons. Radius and variants untouched, as
  asked.
- **Spelling checked (point 6):** the new copy uses "chinchin" one word,
  lowercase — the convention the hero and manifesto set. **Straggler:** the
  FOOTER body still reads "time-honoured chin-chin tradition", as do two lines
  in `about.ts`. Same three noted on 2026-09-07; still out of scope.
- **⚠ The secondary button links to the section it lives in.** Its href is
  `#contact`, and this section *is* `id="contact"` — so "Gifting & events"
  scrolls to itself and does nothing. Renaming it did not change that. This is
  the same anchor the 2026-09-08 correction identified. There is no gifting page
  to point it at, so the href was left alone rather than guessed at, with a
  comment at the data and the owner told. It is the last dead control on the
  landing page.
- **Verified:** all nine new strings render inside `id="contact"`, all seven old
  ones are gone from the whole page, the eyebrow/buttons/trust strip carry no
  `uppercase`, and `bg-cacao` plus `border-t border-linen/15` are unchanged.
  Lint, typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.
- **Next / open threads:** the self-linking gifting button; the tinted-on-tinted
  Flavours/Horizon adjacency and Horizon's outer panel; the `<ul><div>` pattern
  in four components; the three "chin-chin" stragglers; GAP-011 and GAP-004's
  remainder.

## 2026-09-08 — Horizon section: copy, list dividers, and an HTML-validity fix

- **Done:** Rewrote the "Chinchin is just the beginning" section's eyebrow,
  subheading and all three product descriptions, turned the three cards into a
  divided list, and restyled the sign-up button.
- **Files:** `content/landing.ts`, `components/landing/horizon.tsx`.
- **Rows de-carded:** background, border, radius and padding gone, replaced by a
  `border-t border-rule/70` hairline on each row — one above the first and one
  between each pair, no side borders, no radius. The rule sits on the `<li>` so
  it draws immediately while only the content rises.
- **"Drop 02" / "Drop 03" / "Limited release" removed** along with the `meta`
  field. Worth noting beyond the styling: those labels implied a release order
  and schedule nobody has set. The three products remain UNVERIFIED — none is
  announced, dated or priced — but the page now says only that they are in the
  works, which is the honest framing for something that does not exist.
- **Fixed invalid HTML while rewriting the list.** `Reveal` renders a `<div>`,
  and it was wrapping each `<li>`, producing `<ul><div><li>` — a div is not
  permitted as a direct child of `ul`. `Reveal` is now nested inside the row.
  **The same pattern remains in four other components**, untouched because this
  request was copy and card removal: `landing/flavours.tsx`,
  `landing/pillars.tsx`, `about/about-sections.tsx`,
  `product/related-products.tsx`. Worth one cleanup pass.
- **Button:** `rounded-md` (6px) plus sentence case, matching the flavour cards'
  add-to-bag. Still `disabled` — there is no endpoint to receive an address, and
  the form has always been honest about that.
- **⚠ The outer panel was left in place.** The brief said to remove card styling
  from "the three product rows" and to preserve the section's overall structure,
  so the `rounded border bg-surface-container` wrapper around the whole block
  stays. That means the rows sit on that panel rather than literally on the page
  background. It is also currently the only thing giving this section a visible
  edge against Flavours, which shares its `bg-surface-container-low` since the
  Moments section was removed. Flagged to the owner — removing it is one line,
  but it interacts with that adjacency.
- **Verified:** all nine new strings render, all nine removed strings are gone,
  each row carries `border-t border-rule/70 py-gutter-sm` with no fill or radius,
  the button resolves with `rounded-md text-label-md normal-case` and no
  `uppercase`, and the horizon list no longer produces `<ul><div>`. Lint,
  typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.
- **Next / open threads:** the tinted-on-tinted adjacency and the outer panel
  above; the `<ul><div>` pattern in four components; GAP-011 and GAP-004's
  remainder.

## 2026-09-08 — Removed the "Made for every kind of moment" section

- **Done:** Deleted the Moments section entirely — component, content block and
  its render in the page. 114 lines removed, nothing added.
- **Files:** deleted `components/landing/moments.tsx`; removed `MOMENTS` from
  `content/landing.ts` and `<Moments />` plus its import from `app/page.tsx`.
- **Spacing needed no fix.** Every section wraps in `<Section>`, which owns its
  own `py-section`, so Flavours now meets Horizon with exactly the same gap as
  any other adjacent pair. No empty space was left behind.
- **⚠ But the two now share a background.** `Flavours` and `Horizon` are both
  `bg-surface-container-low`, and Moments — which had no background — was the
  cream band separating them. They will render as one continuous double-height
  tinted block with no visible boundary. The section rhythm on this page was
  cream / tinted / cream / cream / tinted / **cream** / tinted / cacao; that
  middle cream band is now gone.
  **Not fixed, deliberately:** the brief said "do not modify any other section".
  The fix is one word — drop `bg-surface-container-low` from either `Horizon` or
  `Flavours` — and it is the owner's call which.
- **Orphans, left in place:** `public/images/workspace1.png` is now referenced
  nowhere (only Moments used it), and `ICONS.plane` has no remaining consumer.
  Neither costs anything — unreferenced public files are not fetched, and the
  icon map is a library that tree-shakes — and removing them would have been
  scope creep on a removal-only request. `card.png` is in the same state from
  the manifesto change.
- **Verified:** all ten of the section's strings are gone from the rendered
  page, the section list is now hero → manifesto → pillars → crunch → flavours →
  horizon → final CTA, and no other section changed. Lint, typecheck, build and
  `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.
- **Next / open threads:** the tinted-on-tinted adjacency above; plus GAP-011
  (third pack size) and GAP-004's remaining values.

## 2026-09-08 — Hero rebuilt: no background image, two columns, bigger headline

- **Done:** Replaced the full-bleed photographic hero with a two-column spread
  on the page background: copy left, contained product photograph right,
  stacking image-above-copy on phones.
- **Files:** `components/landing/hero.tsx` (rewritten), `content/landing.ts`,
  `styles/globals.css`.
- **Removed:** the background photograph and its cacao scrim, the
  "West African Fine Confectionery • Batch Kettle No. 042" badge, and the three
  stat cards. Section now sits on the cream ground like the rest of the page.
- **Three UNVERIFIED claims went with them**, which the owner asked for as
  redundancy rather than as a content fix, but the effect is the same: the
  invented batch number "042", the invented sensory score "9.4 / 10 Crisp Snap"
  (the same figure the deleted crunch profile card carried), and the unconfirmed
  "100% Churned Butter" / "Lagos Hand-Rolled". Deleted from `landing.ts`, not
  left dormant. **`HERO.stats` and `HERO.eyebrow*` no longer exist.**
- **New `--text-display-xl` token** — clamp(2.625rem → 4.5rem), one step above
  `display-hero`, which is untouched and still drives the about page's `h1`.
  Added rather than resizing the existing step, so the about page did not move.
- **Contrast re-checked, as GAP-003 asks whenever the palette moves** — and
  moving the hero off cacao moves it. Terracotta `#a84c2c` on cream `#fff8f1`
  computes to **5.34:1**, passing AA for normal text. Cacao and
  on-surface-variant on cream are far higher.
- **The photograph is deliberately not animated.** With the scrim gone it is the
  likeliest LCP element, and fading it in would delay the paint LCP measures.
  Only the copy rises; the CSS-animation approach is unchanged.
- **Buttons:** `secondary` rather than `inverted` — the outlined cacao variant
  is the one drawn for light grounds — plus the usual sentence-case override.

### CORRECTION — two earlier claims in this log were wrong

While verifying the hero I found `<Section id="contact">` in `final-cta.tsx`.
That contradicts two things I wrote on 2026-09-07:

1. **"The site has no in-page anchors at all."** It has one. The grep behind
   that used `--include=*.tsx`, so it missed `href: "#contact"` in
   `content/landing.ts`; the id scan covered `components/layout` and `app/` but
   not `components/landing/`.
2. **"Contact's href pointed at an element that exists nowhere."** It pointed at
   the closing CTA section. Removing it from the navbar was still what the owner
   asked for — only my reason was wrong.

Both entries above are annotated, and the comment in `globals.css` is corrected.
**The scroll fix itself stands**: root-level `scroll-behavior: smooth` genuinely
breaks Next's scroll reset. The cost is that the surviving anchor — the horizon
section's "Event Gifting Concierge" — now jumps instead of gliding, with
`scroll-padding-block-start` still clearing the sticky header. That is the right
trade. If the glide is wanted back, scope it to that link's onClick; do not
restore the root-level property.

**Lesson:** when grepping to prove an absence, do not scope by file extension —
content lives in `.ts` here, not just `.tsx`.

- **Verified:** every removed string is gone from the page, all six new strings
  render, the `h1` carries `text-display-xl`, and the only remaining `bg-cacao`
  hits are button hovers and the closing CTA. Lint, typecheck, build and
  `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened. GAP-004 materially reduced — three more claims gone.
- **Next / open threads:** GAP-011 (third pack size) and GAP-004's remainder
  (`PLACEHOLDER_PRICE_FROM`, `MANIFESTO.stats`, `FLAVOURS.items[].body`,
  `HORIZON.items`) are still the owner's to answer.

## 2026-09-08 — Manifesto: new photograph, overlay card gone, copy rewritten

- **Done:** Replaced the manifesto's eyebrow, headline and both paragraphs with
  the owner's copy, swapped the photograph, removed the philosophy card that
  overlaid it, and stripped the card treatment from the stat row.
- **Files:** `content/landing.ts`, `components/landing/manifesto.tsx`.
- **Note on the brief:** the pasted spec said "do not change the image" and keep
  the philosophy badge, but the owner's own trailing instruction — twice —
  asked to swap the image and remove that card entirely. The later, direct
  instruction won.
- **Image:** `chinchin7.png` → `newchinchin1.jpeg`, chinchin in a blue ceramic
  bowl. Clean and unbranded. This also retires the last on-page use of
  `chinchin7.png`, whose packaging read "LAMIE FOODS ENTERPRISE" — half of
  GAP-006's original complaint is now moot on the landing page.
- **Philosophy card removed**, and with it all the positioning it needed: the
  `next/image` block, the `Image` import, the absolute/in-flow breakpoint
  juggling, and the `overlay` data. `public/images/card.png` is now
  unreferenced; left in place rather than deleted.
- **Stat row de-carded:** `rounded bg-surface p-gutter-md` → `border-t
  border-rule/70 pt-gutter-md`, the same hairline the footer's bottom bar uses,
  and `gap-gutter-md` → `gap-gutter-lg` for the generous spacing asked for. No
  vertical rules.
- **Eyebrow:** `withRule` dropped (that was the leading dash) and sentence case
  overridden at the call site, as with crunch and pillars.
- **Spelling:** measured the page before changing anything — 39 one-word
  "chinchin"/"Chinchin" against 7 hyphenated or spaced. One word is the
  convention, which is what the new copy uses. **Stragglers left alone,
  deliberately out of scope:** `landing.ts` HORIZON body ("time-honoured
  chin-chin tradition") and two in `about.ts`.
- **⚠ The stats themselves are still UNVERIFIED.** Only the container was
  removed. "100% Churned Dairy Butter", "48 Hrs Kettle To Pack" and "Zero
  Artificial Preservatives" are the same GAP-004 claims as before — a
  preservative claim is a consumer-protection matter, not copy.
- **Verified:** all four new strings render, all six old strings and both
  removed assets are gone from the page, the `<dl>` carries the hairline and no
  background, radius, padding, shadow or divider, and the eyebrow renders with
  no leading rule. Lint, typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened. GAP-004 unchanged; GAP-006 partially relieved on the
  landing page.
- **Next / open threads:** GAP-011 (third pack size) and the remaining GAP-004
  values are still the owner's to answer.

## 2026-09-07 — Three Pillars: card styling removed, owner-written copy

- **Done:** Stripped the card treatment from the three pillar columns and
  replaced the eyebrow, subheadline and all three bodies with the owner's copy.
  Headline, grid, icon choices and column count untouched.
- **Files:** `content/landing.ts`, `components/landing/pillars.tsx`.
- **Styling:** the `<li>` lost its background, border, radius, padding and hover
  shadow; the icon lost its 44px terracotta chip and now sits bare at 24px in
  terracotta — the colour the chip used to carry. Verified the rendered
  `<ul>` contains no `border`, `rounded`, `shadow-earth`, `p-inset-card`,
  `bg-surface-container-low` or `bg-primary-container` at all.
- **Grid gap `gutter-md` → `gutter-lg`.** Not a rhythm change for its own sake:
  the boxes contributed 24px of `p-inset-card` on each side, so with them gone
  the three blocks of copy would have sat *closer* together than they did inside
  their boxes. The larger gap holds the previous separation. The optional
  hairline was skipped — spacing alone does the work, as in the flavours row.
- **Casing** overridden at the call sites again (`text-label-sm normal-case`),
  not in `Eyebrow`, which is shared and keeps its caps elsewhere. Applies to the
  eyebrow and the "Pillar 01/02/03" labels.
- **⚠ GAP-011 opened — the catalogue is missing a confirmed third pack size.**
  Pillar 03's new copy says "in pouches, in three sizes". `products.ts` lists
  **two** per product, one of them a glass jar. I flagged it as a conflict; the
  owner then confirmed **every chin chin will come in three sizes**, so the copy
  is right and the catalogue is behind. It could not simply be added: a pack
  size needs a name, a format and a **price**, and prices are the one thing this
  project never invents. The comment in `landing.ts` was corrected from
  "either/or" to "the catalogue is what is wrong".
  Note for whoever adds it: `admin-inventory.ts` keys sample stock as
  `<slug>::<pack name>`, so a new pack needs a matching entry there or it
  silently reports zero stock. The derived "6 pack sizes" and "8 stock lines"
  figures update themselves.
  Still unresolved inside that gap: the copy says "pouches" while the 500g
  format is a jar.
- **Bodies are no longer UNVERIFIED** — owner-written, like the crunch points.
- **Verified:** all six new strings render, all five old ones gone, headline
  intact, grid still `md:grid-cols-3`. Lint, typecheck, build and
  `prettier --check` pass.
- **Docs updated:** progress.md, gaps.md.
- **Gaps:** GAP-011 opened.
- **Next / open threads:** third pack size (GAP-011) is now the most concrete
  thing blocked on the owner, alongside GAP-004's remaining values.

## 2026-09-07 — Crunch section copy, owner-written

- **Done:** Replaced the crunch section's eyebrow, body, both feature points and
  the story link with the owner's copy, and set the eyebrow and link in sentence
  case. Headline, layout, grid, image and spacing untouched, as specified.
- **Files:** `content/landing.ts`, `components/landing/crunch.tsx`.
- **Casing scoped to this section.** `Eyebrow` and `StoryLink` are shared —
  30 other elements across the site use their tracked-out caps. Both accept a
  `className` and run it through `cn()`, so the override sits at the two call
  sites rather than in the components; verified the rest of the page still
  renders caps.
- **Kept the type size.** The caps treatment is `text-label-caps`
  (0.6875rem / 0.12em / 700) — the tracking is drawn for capitals and the weight
  is heavy for sentence case, but the *size* was not the problem.
  `text-label-sm` is the same 0.6875rem with 0.03em and 500, so only the caps
  treatment changed. `text-label-md` was the first attempt and would have grown
  both to 13px — a size change a copy-only request did not ask for.
- **The points are no longer UNVERIFIED.** "Stone-milled nutmeg — ground fresh
  in small batches" and "Rested dough — a slow chill before frying" are the
  owner's own statements about their own kitchen, written by them today, not
  copy invented for a design frame. The marker in `landing.ts` was updated to
  say so. This is what GAP-004 asks for, one block at a time.
- **Verified:** all seven new strings render, all five old ones are gone, the
  headline is untouched, and the two overridden elements resolve without
  `uppercase` or `text-label-caps` while the other 30 keep theirs. Lint,
  typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened; GAP-004 unchanged in status — `HERO.stats`,
  `PLACEHOLDER_PRICE_FROM`, `MANIFESTO.stats`, `FLAVOURS.items[].body` and
  `HORIZON.items` still need the same treatment.
- **Next / open threads:** unchanged.

## 2026-09-07 — Crunch section: new photograph, sensory card removed

- **Done:** Swapped the crunch section's image for `newchinchin.jpeg` and
  removed the "Acoustic Sensory Profile" overlay card entirely.
- **Files:** `content/landing.ts`, `components/landing/crunch.tsx`.
- **Image:** `chinchin8.png` → `/images/newchinchin.jpeg`, a plate of chin chin.
  Worth noting against GAP-006: unlike the three packaging stand-ins, this one
  is clean — no third-party branding, no barcode, no nutrition panel, no baked-in
  text — so it carries none of their constraints. Alt text updated to describe
  what the photograph actually shows.
- **Card removed, and the data with it.** `CRUNCH.profile` was deleted from
  `landing.ts`, not just unrendered. It held the mock's invented scores — 9.4/10
  flake and crunch resistance, 4.2/10 sweetness balance, 8.8/10 butterfat palate
  melt — which nothing measured and which GAP-004 lists. Leaving them dormant
  would have invited them back onto the page. `SCORE_MAX` went too.
- **⚠ The same invented score still ships elsewhere.** `HERO.stats` renders
  **"9.4 / 10 Crisp Snap"** in the hero. Removing this card did not remove that,
  and the owner has not asked for it — flagged in GAP-004 so the overlap is on
  record rather than assumed handled.
- **Verified:** `newchinchin.jpeg` renders and `chinchin8.png` is gone from the
  page; none of the card's four strings remain; the section's eyebrow, headings,
  body, both process points and the story link are untouched. Lint, typecheck,
  build and `prettier --check` pass.
- **Docs updated:** progress.md, gaps.md.
- **Gaps:** GAP-004 updated — one `UNVERIFIED` block closed, the hero overlap
  recorded.
- **Next / open threads:** unchanged — shop tiles still boxed with descriptive
  badges; `HERO.stats` and the other UNVERIFIED landing values still need owner
  sign-off.

## 2026-09-07 — Full-width CTA, and the landing badge becomes a status

- **Done:** "Add to bag" spans the column, and the landing image badge is "New"
  on all three products.
- **Files:** `content/products.ts`, `components/landing/add-to-bag.tsx`,
  `docs/ai-memory/api-integration.md`.
- **Button:** `self-start` → `w-full`, at the owner's request after seeing it.
  Keeps `rounded-md` and `normal-case`; the three buttons now line up as one row
  across the grid.
- **Badge:** "House Classic" / "Coastal Batch" / "Aromatic Hearth" → **"New"**
  on all three. `badges.landing` is now documented as a **status**, not
  descriptive copy — every product is "New" because the brand has not launched.
  `badges.shop` is untouched and still descriptive.
- **The important part — "Best seller" is gated on real data.** The owner's plan
  is to mark best sellers "once records are being kept". A best-seller badge is
  a claim about what other customers bought, so setting one without order data
  would be inventing social proof — the same failure class as a fabricated
  review. Recorded as question 8 in `api-integration.md` (sales ranking), and
  the rule is written into the `badges` doc comment in `products.ts` so whoever
  edits the catalogue next sees it before typing "Best seller".
- **Verified:** all three landing badges render "New", none of the old strings
  remain, and the button resolves with `w-full rounded-md … normal-case`. Lint,
  typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md, api-integration.md.
- **Gaps:** none opened.
- **Next / open threads:** the shop tiles still show the descriptive
  `badges.shop` values and keep the boxed card treatment — both left alone since
  the request was scoped to the landing grid. Worth deciding whether shop should
  follow.

## 2026-09-07 — Editorial treatment for the landing product grid

- **Done:** Removed the card treatment from the flavour cards' info block, per
  the owner's spec: editorial luxury catalogue, not ecommerce cards.
- **Files:** `components/landing/flavours.tsx`, `components/landing/add-to-bag.tsx`.
- **Changes:**
  - The `<li>` lost its background, border, radius and hover shadow. The
    photograph took over the `rounded overflow-hidden` it used to inherit from
    the wrapper, so it stays the one visually distinct element; the category
    badge on it is untouched.
  - The info block dropped `p-inset-card` entirely, so the copy starts flush
    with the image's left edge and sits on the page background. No divider was
    added in place of the border.
  - Order is now category → name → description → price → button, all
    left-aligned. Price moved out of the old justified eyebrow row.
  - Eyebrow is the category alone — no `01 ·` prefix.
  - Grid gap went from `gap-gutter-md` to `gap-x-gutter-lg gap-y-gutter-xl`,
    since spacing now does the separating the borders used to.
- **Sentence case in CSS, not in the data:** the category uses
  `lowercase first-letter:uppercase` rather than rewriting `kicker`. It is title
  case in the catalogue and other surfaces render it their own way, so casing
  stays a presentation choice. `::first-letter` needs a block box, hence the
  `block` on the span.
- **Button:** `normal-case` and `text-label-md` over the shared button's
  uppercase `text-label-caps`, whose 0.12em tracking is drawn for capitals and
  reads loose in sentence case. `rounded-md` is the 6px token — inside the
  requested 6–8px and not a magic number. `self-start` replaced `w-full` so it
  sits at its own width under the copy rather than spanning the column.
  **These overrides only land because of this morning's `cn()` fix** — before
  it, `text-label-md` would have been silently dropped as a colour conflict.
- **Verified:** rendered `<li>` is `group relative flex h-full flex-col
  text-left` and the info block `mt-gutter-sm flex flex-1 flex-col` — no
  background, border, radius, shadow, padding or divider on either. The button
  resolves to `… rounded-md font-label text-label-md normal-case` with the
  base `rounded`, `uppercase` and `text-label-caps` correctly merged away. Both
  `.lowercase` and `.first-letter\:uppercase:first-letter` compiled. Lint,
  typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.
- **Next / open threads:** the shop page tiles (`shop/product-card.tsx`) still
  use the boxed treatment — not changed, since the request was scoped to the
  landing grid and said not to redesign beyond it. Worth deciding whether the
  two should match.

## 2026-09-07 — Navbar trim, clickable flavour cards, placeholder pack shots

- **Done:** Navbar cleanup, rebuilt the landing flavour cards, and wired the
  owner's three placeholder pack shots through the shared catalogue.
- **Files:** `content/landing.ts`, `content/products.ts`,
  `components/layout/site-header.tsx`, `components/landing/flavours.tsx`,
  new `components/landing/add-to-bag.tsx`.
- **Navbar:** dropped "Contact" (**CORRECTION 2026-09-08:** this said the
  `#contact` href pointed at nothing. It did not — `final-cta.tsx` renders
  `<Section id="contact">`, so the link scrolled to the closing CTA. Removing it
  was still what the owner asked for; only the stated reason was wrong),
  removed the search icon, and
  shortened the header CTA to "Shop". The hero and closing CTAs still read
  "Shop Chinchin Collection" / "Shop Chinchin Now" — the request was scoped to
  the navbar, so body copy was left alone.
- **The empty box the owner asked about:** each flavour card carried **two**
  `ButtonLink`s to the same product page with the *same* aria-label — a wide
  "View details" and an icon-only one whose `EyeIcon` rendered as an empty
  outline. Three links per card in the accessibility tree, all to one place.
- **Cards rebuilt:** the anchor now sits on the product name with an
  `after:absolute after:inset-0` overlay, so the whole card is the click target
  and there is exactly one link per card. The card action became a working
  **Add to bag** (`AddToBag`, a small client island so `Flavours` stays a Server
  Component). It needs `relative z-10` to sit above the link overlay, or every
  tap would navigate instead of adding.
- **Added `cheapestPack()`** to the catalogue. The landing card has no size
  selector, so it adds the pack whose price the card is showing — derived from
  the same comparison as `lowestPrice()` rather than assuming the cheapest pack
  is listed first. A card that shows one price and bags another is a card that
  lies. Verified: ₦3,600 shown, 250g Pouch added.
- **Images:** set on `products.ts` `image.src`, the single slot read by the
  landing row, shop grid, product page, cart, checkout summary and admin
  catalogue — which is what makes the three pack shots identical across pages by
  construction. Milky Velvet had no image at all before this (`src: null`),
  which was the inconsistency visible on the landing page.
- **⚠ The three images are other companies' packaging.** The owner supplied them
  knowingly as local stand-ins until the brand shoot and will replace them. They
  carry third-party brand names, an Instagram handle, barcodes, and legible
  nutrition panels and ingredient lists (one lists milk powder). **They must not
  be deployed** — they would put another company's trade dress on the storefront
  and display allergen and nutritional information that is not Lamie Foods',
  arriving as pixels so neither the GAP-004 nor GAP-007 text checks catch it.
  Recorded in GAP-006 and in a comment above `PRODUCTS` in `products.ts`.
- **Verified:** navbar has no Contact link and no search control; each card
  renders one product link plus one add-to-bag button whose pack matches the
  displayed price; the same image file appears on landing, shop and product
  pages. Lint, typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md, gaps.md.
- **Gaps:** GAP-006 escalated to "blocks public launch until the brand shoot
  lands".
- **Next / open threads:** the header's account icon is still a dead control.

## 2026-09-07 — Scroll-position bug, tablet tier, and a silent class-merge bug

- **Done:** Fixed pages opening part-way down, gave the storefront a real
  tablet tier, and fixed a design-system bug that was deleting font sizes.
- **Files:** `styles/globals.css`, `packages/ui/src/cn.ts`,
  `app/shop/[slug]/page.tsx`, `components/layout/site-footer.tsx`,
  `components/order/order-confirmation.tsx`, `components/about/about-sections.tsx`,
  `components/landing/{crunch,manifesto,moments}.tsx`,
  `components/shop/atelier-lab.tsx`,
  `components/product/{provenance,related-products}.tsx`.

### 1. Pages opened at the footer

- **Cause:** `scroll-behavior: smooth` on `<html>`. Next's App Router resets
  scroll on navigation by scrolling the document element; with smooth behaviour
  that reset is animated and gets interrupted by the incoming page's layout, so
  a route opened from halfway down one page stayed halfway down the next.
- **Fix:** removed it. `scroll-padding-block-start` stays so the sticky header
  is cleared.
  **CORRECTION (2026-09-08):** this entry originally said the site had "no
  in-page anchors at all". That was wrong — the grep behind it used
  `--include=*.tsx` and missed `href: "#contact"` in `content/landing.ts`, and
  the id scan skipped `components/landing/`, where `final-cta.tsx` renders
  `<Section id="contact">`. One anchor is live: the horizon section's "Event
  Gifting Concierge". It now jumps instantly rather than gliding, which is the
  right trade against every route opening part-way down the page. Do not restore
  the root-level property to fix it — scope it to that link's onClick.

### 2. No tablet tier anywhere

- **Cause:** the storefront jumped straight from one column to `lg:` (1024px).
  Across every customer-facing component the `md:` count was **1**. Every tablet
  in portrait — and most in landscape — got the phone layout: full-width
  product photography with the price and pack picker pushed off screen.
- **Fix:** added the 768px tier to the product page, footer, order
  confirmation, about page, and the crunch/manifesto/moments/atelier-lab/
  provenance/related-products sections. Typography and spacing were already
  fluid `clamp()` with mobile floors, so only layout needed the work.
- **Footer** got a third tier (`sm:grid-cols-2 md:grid-cols-12`): the brand
  block plus four link columns stacked vertically until 1024px, making the
  footer taller than most phone screens.
- **Order tracker** was `grid-cols-4` unprefixed — roughly 68px per stage on a
  phone, not enough for "Out for delivery" at any legible size. Now
  `grid-cols-2 sm:grid-cols-4`.
- **Product page:** the proof card moved out of the gallery column into its own
  grid child. Auto placement returns it under the gallery from 768px up, but the
  phone column now reads gallery → price and pack picker → proof, so the buy
  controls are no longer buried under a card nobody scrolled for.

### 3. `cn()` was silently deleting font sizes

- **Cause:** `cn` used bare `twMerge`. tailwind-merge only knows Tailwind's stock
  sizes, so every custom step (`text-headline-sm`, `text-label-caps`, …) was
  classified as a **text colour**. In any `cn()` call that also set a colour, one
  overwrote the other. The order tracker rendered
  `font-label uppercase text-cacao` with its size stripped entirely.
- **Fix:** `extendTailwindMerge` registering the ten `--text-*` steps as the
  `font-size` group. **Keep that list in step with `globals.css`.**
- **Scope:** 35 class combinations across the site were affected. Verified fixed
  in the rendered output.

- **Verified:** all seven storefront routes return 200; the compiled CSS carries
  no `scroll-behavior: smooth`; the new `md:` classes are present in the markup
  and the breakpoint rules in the CSS; size and colour now both survive `cn()`.
  Lint, typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.
- **Next / open threads:** the admin screens were not re-checked for tablet
  width — they are desktop tooling and their wide tables already scroll inside
  `overflow-x-auto`. The header's search and account icons are still dead
  controls (asked about, never answered).

## 2026-09-06 — Settings (/admin/settings), dev-gated — designed, no mock

- **Done:** Designed and built the settings screen from the admin's own
  patterns; there was no mock for this one. Five tabbed panels (Brand,
  Storefront, Delivery & payment, Environment, Team & access) plus a "Before
  launch" readiness list.
- **Files:** new `app/admin/(portal)/settings/page.tsx`,
  `components/admin/{settings-view,settings-tabs}.tsx`,
  `content/admin-settings.ts`; updated `packages/config/src/routes.ts`,
  `content/admin-dashboard.ts`, `components/admin/admin-nav.tsx`,
  `packages/eslint-config/{base,next}.js`, `.gitignore`.
- **The central decision:** a settings screen is *entirely* writes, so with no
  backend every editor would be disabled and the page would be dead. It is
  instead built as a **truthful read-out of what actually configures the site**
  — the first admin screen whose data is real, not sample. Brand facts come from
  `packages/config`, the catalogue from `products.ts`, stock lines from
  `admin-inventory.ts`, and the environment from the validated `config/env.ts`.
  A settings page showing invented values would be worse than no page: it would
  tell the owner the site is configured in ways it is not.
- **Other decisions:**
  - Each panel names the **file its values live in**, so "why can't I edit
    this?" is answered on screen rather than by a disabled input with no
    explanation.
  - The environment panel reports **presence, never values**. The only value
    printed in full is the site URL, which is public by definition and already
    in every canonical link. It also carries the rule that anything prefixed
    `NEXT_PUBLIC_` is readable by every visitor.
  - **"Before launch"** surfaces the open gaps (GAP-004, 007, 009, 010 and the
    missing API contract) with who can answer each. `gaps.md` stays the record of
    account — this list must be kept in step with it — but the owner is the only
    person who can resolve most of them and will never read a file in a repo.
  - **Not built, all of it invention:** a delivery-fee table (fees are not
    finalised, and a fee on a settings screen is a fee someone will quote), a
    tax/VAT rate, a settlement bank account, a roles-and-permissions matrix
    (there are no accounts, and a permissions grid implies enforcement that
    exists nowhere), and notification toggles (nothing can send). Each absence
    is listed on the page as "not configured" rather than hidden.
  - `SettingsTabs` is the smallest possible client component — it owns the
    active tab and nothing else; panels are server-rendered and passed in as
    `content`, so no settings value reaches a client bundle.
  - Added `ADMIN_ROUTES.settings`; the nav had it hardcoded.
- **Tooling fix:** ESLint ignored `.next-verify` by exact name, so the
  `.next-devcheck` dir used for an isolated dev server got linted — 7,024
  problems from bundled dependencies. Both eslint configs and `.gitignore` now
  use `.next-*`, covering any `NEXT_DIST_DIR`.
- **Verified:** dev renders 200 with all five panels mounted and four hidden;
  nav highlights `/admin/settings`; no "Enterprise" string anywhere. Production
  build prerenders a 404 with zero settings strings in the HTML or RSC payload
  (the only match was the site-wide tagline in the meta description, present on
  every page), and nothing in `/static`. Lint, typecheck, build and
  `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.
- **Next / open threads:** every admin screen in `ADMIN_ROUTES` is now built.
  Still blocked on the owner: GAP-004, GAP-007, GAP-009, GAP-010 and the API
  contract. Nothing pushed since `f224261`.

## 2026-09-06 — Inventory & kettles (/admin/inventory), dev-gated

- **Done:** Built the stock screen: four derived stat cards, three highlight
  cards, filter tabs and an eight-line stock table covering every buyable pack
  size plus packaging materials.
- **Files:** new `app/admin/(portal)/inventory/page.tsx`,
  `components/admin/{inventory-view,inventory-table}.tsx`,
  `content/admin-inventory.ts`; updated `content/admin-products.ts`,
  `components/admin/admin-nav.tsx`.
- **Decisions:**
  - **This module is now the single source of stock.** Rows are generated from
    `products.ts` × each product's `detail.packaging`, so a pack size cannot
    appear here that a customer cannot buy, and the imagery is the catalogue's.
    `admin-products.ts` had its own per-product `SAMPLE_STOCK` table; it now
    calls `stockForProduct()` instead, so the two screens cannot report
    different numbers. Products went from 420/18/215 to 420/133/122 (675 total)
    as a result — the per-pack figures are what the screens now share.
  - **Low stock is now per pack size**, not per product: a product is flagged if
    *any* pack is at or below its own threshold. That is what an operator needs
    — a shelf of 250g pouches does not fix 500g jars running out. Two products
    are flagged now (Coco Velvet 500g at 18, Cinnamon 500g at 22).
  - **Quick adjustment is disabled.** It writes authoritative business data;
    moving the number on screen without saving it would leave the operator
    believing the count was corrected. The reason is stated under the table.
  - **Refused from the mock:** "Auto-sync with Paystack orders active" (orders
    are not connected to stock — same false-capability badge as the rejected
    "CONNECTED", "LIVE" and "ENFORCED"), "real-time kitchen inventory tracking"
    (nothing is real-time), "100% SKU fulfilment rate" (nothing measures it),
    "2 kitchen nodes" (invented infrastructure), and the kettle telemetry
    "Vessel 03 · Lead Amina · Temp 185°C" — a temperature reads as a live sensor
    value, and naming an operator beside an invented reading makes it look
    accountable. Also corrected "Cinnamon Spice Chinchin" to the catalogue's
    "Cinnamon Chinchin" and the `LFE-` SKU prefix to `LF-`.
- **Verified:** dev renders 200 with every section; both screens agree (products
  shows 675 total, 420/133/122, "2 alert"). Production build prerenders the
  route as a 404 with zero stock strings in the HTML or RSC payload, and no SKU
  or batch reference anywhere in `/static`. Lint, typecheck, build and
  `prettier --check` pass. Build and dev checks ran under `NEXT_DIST_DIR` on a
  spare port.
- **Docs updated:** progress.md.
- **Gaps:** none opened.
- **Next / open threads:** last admin screen is settings. Still blocked on the
  owner: GAP-004 (prices), GAP-007 (allergens, delivery offer), GAP-009 (auth),
  GAP-010 (messaging consent), and the API contract. Nothing pushed since
  `f224261`.

## 2026-09-06 — Customer directory (/admin/customers), dev-gated

- **Done:** Built the customer directory: stat cards, segment tabs, a patron
  table and a dossier panel (contact, delivery landmark, order history), plus
  regional spread, flavour affinity and outreach cards.
- **Files:** new `app/admin/(portal)/customers/page.tsx`,
  `components/admin/{customers-view,customers-directory}.tsx`,
  `content/admin-customers.ts`; updated `content/admin-order-detail.ts`,
  `content/admin-dashboard.ts`, `components/admin/admin-nav.tsx`.
- **Decisions:**
  - **Patrons are derived from `ORDERS_ROWS`.** The same fictional people appear
    on the orders ledger, so a patron's name, phone, area and landmark cannot
    say one thing on one screen and something else on another. Ledger orders in
    the dossier link to the real order detail page.
  - **Every aggregate is computed from the visible rows** — patron count, repeat
    rate, average lifetime spend, busiest hub, regional spread, flavour shares.
    Nothing on the page can contradict anything else, and the same maths runs
    unchanged against real customers.
  - **Refused from the mock:** "312 registered patrons", a "68% repeat purchase
    rate" against a "42% industry benchmark", and "100% verified KYC". Nothing
    measures any of it, there is no KYC process to be 100% of, and all of it
    would have disagreed with the six patrons on screen. Also dropped the
    1·2·3·…·52 pager (there is no second page) and a "Heritage Trio" /
    "Cinnamon Spice" donut — the chart is built from the shared catalogue, so it
    can only ever show products that exist.
  - Export CSV, add-a-patron, search, WhatsApp, create-an-order and the batch
    broadcast are all disabled. Export and broadcast would move PII.
  - **Order detail now reads the patron from this module.** Its "Lifetime spend
    ₦54,200 · 3 orders" was hardcoded and identical for every order; it is now
    the patron's real derived figure. Its "WhatsApp: Active & verified · opted
    in for order updates" became "Not recorded" — nothing captures messaging
    consent, and inventing a permission is how a business ends up messaging
    people who never agreed.
  - Sidebar group "Enterprise ledger" → "Operations". "Enterprise" is not part
    of the customer-facing brand and was showing on every admin screen.
- **Verified:** dev renders 200 with all sections; the production build
  prerenders the route as a 404 with **zero PII** in the HTML or RSC payload,
  and `grep -rl` finds no patron name, phone or address anywhere in `/static`
  (patrons are passed as props, never imported by the client component). Nav
  highlights `/admin/customers`. Lint, typecheck, build and `prettier --check`
  pass. Build and dev checks both ran under `NEXT_DIST_DIR` on a spare port.
- **Docs updated:** progress.md, gaps.md.
- **Gaps:** GAP-010 opened (no record of messaging/marketing consent).
- **Next / open threads:** remaining admin screens — inventory, settings. Still
  blocked on the owner: GAP-004 (prices), GAP-007 (allergens, delivery offer),
  GAP-009 (auth), and the API contract. Nothing pushed since `f224261`.

## 2026-09-06 — Create-product form (/admin/products/new), dev-gated

- **Done:** Built the create-product screen: three numbered sections (identity,
  sensory profile, formulation) plus photography, packaging tiers, stock and
  visibility panels. react-hook-form + zod + `useFieldArray` for the tiers, so
  validation, tasting-note chips, the crunch slider, adding/removing pack sizes
  and every toggle genuinely work.
- **Files:** new `app/admin/(portal)/products/new/page.tsx`,
  `components/admin/{new-product-view,product-form}.tsx`,
  `content/admin-new-product.ts`, `lib/admin/product-schema.ts`; updated
  `content/admin-products.ts`, `components/admin/{products-view,admin-nav}.tsx`.
- **Decisions:**
  - **Allergens are not optional.** The schema refuses to validate unless the
    operator ticks the allergens that apply *or* explicitly confirms none do.
    Publishing a food product with no allergen decision recorded is the exact
    failure GAP-007 describes.
  - Submit validates and then says plainly that nothing was saved — there is no
    catalogue service. Consistent with every other admin write control.
  - **Refused from the mock:** a "Paystack realtime settlement — CONNECTED"
    badge (Paystack is connected to nothing) and an "Atelier authenticity seal —
    generating SHA-256 verifiable batch stamp" (nothing generates one). Same
    category as the already-rejected "ENFORCED" and "LIVE" badges. Verified
    absent from the rendered page.
  - Rich-text toolbar is rendered disabled over a working plain textarea rather
    than adding an editor dependency.
  - `useWatch` instead of `watch()` — the React Compiler bails out on the
    function `watch()` returns (lint warning, now clean).
- **Consistency fix:** `AdminNav` matched routes with `===`, so nested pages
  (`/admin/products/new`, `/admin/orders/<id>`) highlighted nothing. It now takes
  the **longest** matching href — a plain prefix match would have lit up the
  dashboard (`/admin`) on every admin page. Verified: exactly one active item on
  `/admin`, `/admin/products`, `/admin/products/new`, `/admin/orders`,
  `/admin/orders/LF-84291`.
- **Verified:** dev renders 200 with all sections present; production build
  prerenders the route as a 404 with **zero** form strings in the HTML or RSC
  payload (the gate runs before the dynamic import). Lint, typecheck, build and
  `prettier --check` all pass. Build ran under `NEXT_DIST_DIR` so no dev server
  was disturbed.
- **Docs updated:** progress.md, gaps.md.
- **Gaps:** none opened; GAP-007 annotated (this form is where the real allergen
  declaration gets captured).
- **Next / open threads:** remaining admin screens — customers, inventory,
  settings. Still blocked on the owner: GAP-004 (prices), GAP-007 (allergens and
  the invented free-delivery line), GAP-009 (auth), and the API contract.
  Nothing has been pushed since `f224261` by the owner's standing instruction;
  `main` is 10 commits ahead of `origin/main` after this one.

## 2026-09-06 — Admin products & SKUs (/admin/products), dev-gated

- **Done:** Built the catalogue screen — header actions, four stat cards with a
  low-stock alert, filter tabs, product rows for the three live flavours and the
  two pipeline products, and the scalability footer.
- **Files:** new `app/admin/(portal)/products/page.tsx`,
  `components/admin/{products-view,products-list}.tsx`,
  `content/admin-products.ts`; updated `components/admin/admin-nav.tsx`.
- **Consistency:** the three live products are derived from `content/products.ts`
  — the same source the storefront uses — so names, images and prices cannot
  disagree between shop and admin. Only operational fields (SKU, stock, status)
  are added here. Verified: all three names appear on both `/shop` and
  `/admin/products`, and the admin prices are the catalogue's two tiers of the
  same figures the shop shows as "from".
  The mock quoted different prices (₦3,800/₦5,800 etc.); the catalogue wins.
- **Nav:** adding `ADMIN_ROUTES.products` to `BUILT_ROUTES` was the only change
  needed to enable and highlight it — the one-edit design holds. Three routes
  are now links; the rest stay disabled.
- **Decisions:**
  - SKUs use an `LF-` prefix, not the mock's `LFE-`. "Enterprise" is not the
    customer-facing name and does not belong baked into product codes.
  - Filter tabs are real client state (filtering a loaded list needs no
    backend); search, add, export, edit, mark-sold-out and configure-launch are
    disabled.
  - Low-stock status is derived from a threshold rather than hardcoded, so the
    alert card and the row badge cannot disagree.
  - Products are passed to the client list as props, keeping catalogue
    internals out of the bundle — same rule as the orders table.
- **UNVERIFIED:** all stock counts, and both pipeline products ("Spiced
  Plantain Crisps", "Honey Glazed Chin-Chin") — the landing page carries them
  under the same caveat.
- **Verify:** lint, typecheck, build, format pass. Production: every admin route
  404s, zero internal data in payload or bundle. Dev: renders with the low-stock
  alert on Coco Velvet and working tab filtering.
- **Next / open threads:** customers, inventory and settings remain — same
  pattern, same auth blocker (GAP-009).

## 2026-09-06 — Admin order detail (/admin/orders/[id]), dev-gated

- **Done:** Built the order dossier — header with status and actions, curated
  line items, totals with payment references, patron dossier, kitchen and
  dispatch timeline with courier handover, delivery/geolocation panel, and
  internal notes. Order IDs in the orders table now link through to it.
- **Files:** new `app/admin/(portal)/orders/[id]/page.tsx`,
  `components/admin/order-detail-view.tsx`, `content/admin-order-detail.ts`;
  updated `components/admin/orders-table.tsx`.
- **Security:** this is the most sensitive screen in the app — one customer's
  name, email, phone, full delivery address, gate instructions and a courier's
  number. Same page-level gate before the dynamic import, and detail is built
  from the sample rows so any of the five opens while an unknown id 404s.
  Verified in production: all admin routes 404, zero PII in the payload
  (checked name, email, phone, address, payment refs, courier) and zero in the
  client bundle. The one "Admiralty" hit in `/static` is the public checkout
  form's address placeholder, not admin data.
- **Two changes from the mock, both about not committing realistic secrets:**
  - It printed a transaction id shaped like a LIVE Paystack reference
    (`pstk_live_…`). Sample now uses an obviously fake `pstk_sample_` prefix —
    a live-looking reference in a repo invites someone to treat it as one.
  - It named a specific bank as the settlement ledger. Which bank the business
    settles into is real operational detail nobody has told us, so no bank is
    named.
  Phones stay in the 0800 000 series and emails use example.com.
- **Decisions:** every control that would change or send something is disabled
  — status select, kitchen slip, PDF invoice, message client, call courier,
  save note. The note renders read-only rather than as a textarea that cannot
  save. No map: labelled placeholder, since there is no mapping provider.
- **Verify:** lint, typecheck, build, format pass. Dev: all five sample orders
  open, `NOT-REAL` 404s.
- **Next / open threads:** products, customers, inventory and settings remain,
  all on the same pattern and all blocked on real auth (GAP-009).

## 2026-09-06 — Admin orders screen (/admin/orders), dev-gated

- **Done:** Built the orders screen — header with actions, four stats, filter
  and status tabs, selectable orders table with batch-action bar, pagination,
  delivery clusters and fulfilment reserves.
- **Files:** new `app/admin/(portal)/orders/page.tsx`,
  `components/admin/{orders-view,orders-table,admin-nav}.tsx`,
  `content/admin-orders.ts`; updated `components/admin/admin-shell.tsx`,
  `content/admin-dashboard.ts`.
- **Consistency, made structural.** The owner asked for shared chrome to stay
  identical. Sidebar, top bar and operator card already came from `AdminShell`
  in the portal layout; the missing piece was the active nav item, which was
  hardcoded to Dashboard. Extracted `AdminNav` as a client component deriving
  the active item from `usePathname`, with a `BUILT_ROUTES` list so adding a
  screen enables and highlights it everywhere in one edit. Verified: all seven
  chrome strings appear identically on both pages, and exactly one nav link
  carries `aria-current="page"` per route.
- **A SECOND data leak found and closed.** `OrdersTable` is a client component
  and imported the sample rows directly — and a client component's imports are
  bundled into client JS, so names, phone numbers and addresses shipped in a
  downloadable `/static` chunk, entirely past the server-side gate. Fixed by
  passing rows as props and keeping data server-side. Verified: zero PII in
  `/static` afterwards. This is a *different* mechanism from the RSC-payload
  leak found on the dashboard; both are now recorded in GAP-009.
- **Decisions:**
  - Row selection is live client state (it makes the batch bar reviewable);
    every action, filter, search and pagination control is disabled.
  - Phone numbers use the 0800 000 series so they cannot dial a real person —
    the mock used plausible live numbers, which should not sit in a repo.
  - No "Live GPS feed" badge and no map: there is no mapping provider and no
    feed, so the map is a labelled placeholder and the cluster counts carry the
    information the card actually has.
  - Sidebar label matched to the design ("Orders & Paystack").
- **Verify:** lint, typecheck, build, format pass. Production: `/admin/orders`
  404s with zero PII in the payload or the bundle. Development: renders with
  five rows and working selection.
- **Next / open threads:** remaining admin screens (products, customers,
  inventory, settings) follow the same pattern. All blocked on real auth.

## 2026-09-06 — Admin operations dashboard (/admin), dev-gated

- **Done:** Built the dashboard from the frames — sidebar and top bar, four
  stat cards, a dependency-free SVG revenue chart, best-sellers, stock and
  ingredients, recent dispatches table, and rider fleet.
- **Files:** new `app/admin/(portal)/{layout,page}.tsx`,
  `components/admin/{admin-shell,admin-dashboard,revenue-chart}.tsx`,
  `content/admin-dashboard.ts`.
- **Security — the important part.** This page shows revenue, order values,
  customer names and delivery addresses, and there is still no auth (GAP-009).
  The route is therefore compiled out of production: the page calls
  `notFound()` before dynamically importing the dashboard.
  **A leak was found and closed during verification.** Gating in the layout
  gave a correct 404, but Next still rendered the page and the whole dashboard
  tree came back in the **RSC flight payload of that 404** — 39KB, readable
  with `curl`. Moving the gate into the page ahead of the import fixed it:
  response now 10KB with zero data strings, and zero admin data in `/static`.
  Lesson recorded in GAP-009: a status code proves nothing about a payload.
- **Decisions:**
  - No charting library — three polylines do not justify a dependency. The
    chart is inline SVG, `aria-hidden`, with the same numbers in a visually
    hidden `<table>` so it is not invisible to screen readers.
  - Controls that would act on real data (date range, CSV export, reorder, log
    batch) are disabled, not wired to nothing. On an operations screen a button
    that silently does nothing is worse than one plainly not ready.
  - Sidebar items other than Dashboard render as disabled — those routes do not
    exist and would 404.
  - All data is fictional and the page carries an unmissable banner saying so.
- **Verify:** lint, typecheck, build, format pass. Production: `/admin` 404s,
  zero sample data in response or client bundle, other routes unaffected.
  Development: renders fully — banner, four dispatch rows, stock, fleet, chart
  and its data table.
- **Next / open threads:** the remaining admin screens are blocked on real auth.
  Do not remove the gate except in the same change that adds server-side
  session checking.

## 2026-09-06 — Admin sign-in screen (/admin/login)

- **Done:** Built the admin sign-in page and a bare admin layout. Form uses
  react-hook-form + zod, matching checkout. **No authentication** — see below.
- **Files:** new `app/admin/layout.tsx`, `app/admin/login/page.tsx`,
  `components/admin/admin-login-form.tsx`, `content/admin.ts`,
  `lib/admin/login-schema.ts`.
- **The boundary:** there is no auth backend, so nothing can protect an admin
  page. The form validates and then says plainly that sign-in is not connected;
  it creates no session and sends nothing anywhere. Only `/admin/login` exists —
  `/admin` and `/admin/orders` correctly 404, and must keep 404-ing until the
  backend can reject an unauthenticated request server-side. Logged as GAP-009.
- **Fabricated security telemetry deliberately not shipped:** the mock's "Node
  terminal LKI-HQ-04", "Active Operational Handshake", "ENFORCED" badge and
  "256-Bit Encrypted · Restricted Network" panel. None of it is true, and a
  badge asserting protection that does not exist trains an operator to read
  reassurance off the screen instead of the system. Verified: all six strings
  absent from the built page.
- **Credential handling:** password lives in form state only — never logged,
  stored or persisted. `autoComplete="username"` / `"current-password"` so
  password managers work (blocking them pushes staff toward weaker passwords).
  No password-complexity rule on *sign-in*: it stops nothing and locks out
  older valid passwords; complexity belongs where a password is set.
- **Two layers of search exclusion:** `noindex, nofollow, nocache` on the admin
  layout plus the existing `Disallow: /admin` in robots.txt — robots.txt is a
  request to crawlers, not an access control.
- **Verify:** lint, typecheck, build, format pass. `/admin/login` 200,
  `/admin` and `/admin/orders` 404, noindex meta present, zero fabricated
  telemetry, `type="password"`, autocomplete correct, no "Enterprise" in the
  title.
- **Next / open threads:** admin dashboards are blocked on real auth (GAP-009).
  The API contract remains the blocker for everything else.

## 2026-09-06 — About / heritage page (/about)

- **Done:** Built `/about` from the frames — hero with stat trio and overlapping
  batch cards, heritage spread with acoustic-metric overlay, three tenets (middle
  card inverted onto cacao), horizon section with offset imagery and values,
  sensory profile bars, and the closing dark CTA.
- **Files:** new `app/about/page.tsx`, `components/about/about-sections.tsx`,
  `content/about.ts`; updated `content/landing.ts`, `content/shop.ts`,
  `components/ui/icons.tsx` (registered `box`/`leaf`/`sound`/`utensils` in the
  lookup), `app/sitemap.ts`.
- **Unblocked:** `/about` finally exists, so the nav, the hero's "Explore
  culinary story" CTA and the footer's "Brand Story" now point at the real route
  instead of the `/#manifesto` anchor they were faking. `/about` added to the
  sitemap. Verified: zero `#manifesto` links remain on home or shop.
- **Decisions:**
  - Body copy says **"Lamie Foods"**, not the mock's "Lamie Foods Enterprise"
    (twice). Verified absent from the built page.
  - Images reuse the catalogue where they genuinely fit — `chinchin7` for the
    hero portrait, `chinchin11` for the heritage bowl (it matches the frame's
    spice styling), `chinchin5` for the pantry spread. The gift-jar shot has no
    asset and renders the labelled placeholder.
  - The tenet cards ended in links in the mock; there is nowhere for them to go,
    so they render as labels rather than dead links.
  - "Enquire about events" points at Instagram — the only confirmed contact
    channel.
  - The mock's closing strip promised "dispatched within 24 hours", which
    contradicts the confirmed 1–5 day window, so no dispatch time is claimed.
- **Verify:** lint, typecheck, build, format pass; `/about` is static; one `h1`
  with 9 `h2` and 4 `h3`; six sections; every internal link resolves 200.
- **Gaps:** GAP-004 grows substantially — this page states butterfat and
  preservative percentages, a 48-hour kettle-to-pouch window, a 175°C frying
  temperature (removed from the rendered copy), a batch number, three sensory
  index percentages, and sourcing claims about named regions.
- **Next / open threads:** every route in the original architecture now exists
  except `/admin/*`. The API contract remains the blocker for real ordering.

## 2026-09-06 — Order confirmation (/order-success)

- **Done:** Built the confirmation page from the frames — reference, line items,
  totals, dispatch details, status progress, tracking panel and pairings row.
  Extracted `ProductSuggestions` so the cart and this page share one component.
- **Files:** new `app/order-success/page.tsx`,
  `components/order/order-confirmation.tsx`,
  `components/product/product-suggestions.tsx`, `content/order-success.ts`,
  `lib/orders/sample-order.ts`; updated `app/cart/page.tsx`; deleted
  `components/cart/cart-recommendations.tsx` (superseded).
- **The central decision:** there is no real order to show — checkout does not
  submit, no ordering API exists, Paystack is not integrated. A page reading
  "Paid via Paystack · Total ₦16,100" is the single most damaging thing to fake
  on this site, because a customer would reasonably believe it. So:
  - A normal visit to `/order-success` shows **"No order to show"**, and says
    plainly that ordering is not live and nothing has been charged.
  - `?preview=1` renders a sample behind a **loud, non-dismissible banner** so
    the layout stays reviewable.
  - Verified: a default visit leaks no total and no "Paid via Paystack".
- **Ready for real data:** `OrderConfirmation` takes an `Order` from
  `@lamiefoods/types` as a prop and does not fetch. When the endpoint lands,
  read the reference from the query, fetch, pass it in — no reshaping. Sample
  prices come from the catalogue, so the sample cannot contradict the shop.
  Status progress is derived from `order.status`, never hardcoded.
- **Not shipped, because the claim would be false:** the payment authorisation
  token, "SMS & WhatsApp alerts synced" and kitchen photo updates (no
  notification system), the PDF receipt (nothing generates one — the control is
  disabled with a note), and "10% off your next batch" for tagging Instagram (a
  discount the owner has never offered).
- **Verify:** lint, typecheck, build, format pass. Both states render, one `h1`,
  robots disallows the route, receipt control disabled, and the sample's totals
  (₦7,200 + ₦5,800 = ₦13,000) match the catalogue and the cart page.
  **Not verified by me:** interactive behaviour needs a browser (GAP-001).
- **Next / open threads:** the customer funnel is now complete end-to-end as far
  as it can go without a backend. The blocker for everything further is the API
  contract — see the PENDING section in `api-integration.md`. GAP-004 and
  GAP-007 still block a public launch.

## 2026-09-06 — Guest checkout (/checkout) on RHF + zod + zustand

- **Done:** Built `/checkout` from the frames — two numbered steps (contact,
  delivery), order summary from the live cart, delivery-cost notice, and the
  provisions guarantee panel. Migrated the cart store to **zustand** and the form
  to **react-hook-form + zod**, at the owner's request.
- **Files:** new `app/checkout/page.tsx`,
  `components/checkout/{checkout-form,checkout-summary}.tsx`,
  `content/checkout.ts`, `lib/checkout/schema.ts`, `lib/cart/cart-hydration.tsx`;
  rewrote `lib/cart/{cart-store,use-cart}.ts`; updated `app/layout.tsx`,
  `components/cart/cart-view.tsx` and every add-to-bag call site.
- **Dependencies added** (audited first, `npm audit` clean): `react-hook-form`
  7.87.0 (zero deps), `@hookform/resolvers` 5.9.1, `zustand` 5.0.15.
- **Decisions:**
  - **Validation is real; submission is not.** No API contract exists for placing
    an order and Paystack is not integrated, so a valid submit says exactly that
    — no fake redirect, no fake success. Inventing the flow would mean guessing
    request shapes AND implying money had moved.
  - The schema is pinned to `CustomerDetails` from `@lamiefoods/types` via
    `satisfies`, so the form cannot drift from the shape the backend implements.
  - **zustand `persist` uses `skipHydration`**, with `CartHydration` rehydrating
    after mount. Without it zustand reads localStorage during the first client
    render while the server rendered an empty bag — the same hydration-mismatch
    class as the earlier `no-js` bug.
  - Untrusted localStorage is still sanitised against the catalogue in `merge`.
  - **Nigeria's 36 states + FCT** replace the mock's two invented "delivery
    zones", which would have blocked every customer outside Lagos.
  - **"LIVE" badge on Paystack not shipped** — payments are not connected;
    badging a dead gateway live is a false claim.
  - "Direct atelier chat" dropped (no chat exists); "1-3 days" corrected to the
    confirmed 1–5.
- **Recorded, not invented:** added a PENDING section to `api-integration.md`
  with the seven questions checkout needs answered — including **who owns
  pricing** (client-held prices are tamperable; the server must price the order).
- **Verify:** lint, typecheck, build, format pass; `npm audit` 0 vulnerabilities.
  `/checkout` renders, is `noIndex` and disallowed in robots. 7 labels bound to 7
  controls, 37 states + placeholder offered, no "LIVE" badge in output.
  **Not verified by me:** interactive validation and the cart round trip need a
  browser — still no test runner (GAP-001).
- **Next / open threads:** the backend contract is now the blocker for anything
  further down the funnel. GAP-004 and GAP-007 still block a public launch.

## 2026-09-06 — Shopping bag (/cart) + a real cart

- **Done:** Built `/cart` from the frames — free-delivery progress, line items
  with quantity steppers and remove, gift-packaging panel, assurances, order
  summary, empty state, and recommendations. Backed it with a genuine cart.
- **Files:** new `lib/cart/{cart-store.ts,use-cart.ts}`, `lib/money.ts`,
  `content/cart.ts`, `components/cart/{cart-view,cart-recommendations}.tsx`,
  `app/cart/page.tsx`; updated `content/products.ts` (kobo pricing),
  `components/product/{product-purchase,related-products}.tsx`,
  `components/shop/{product-card,shop-catalogue}.tsx`,
  `components/landing/flavours.tsx`, `components/layout/site-header.tsx`,
  `app/robots.ts`, `app/shop/[slug]/page.tsx`.
- **Decisions:**
  - **The cart is real, not a stand-in.** A bag is a frontend concern until
    checkout, so it works today: add, update quantity, remove, persist across
    reloads and sync across tabs. Only checkout stays disabled.
  - **`useSyncExternalStore`, not context + effect.** It renders the server
    snapshot (empty) during hydration and swaps in the persisted bag afterwards,
    so a restored cart cannot cause a markup mismatch — the same class of bug as
    the earlier `no-js` hydration error.
  - **Prices are integer KOBO**, using `Kobo` from `@lamiefoods/types` rather
    than a local type. Naira never exists as a float: cart arithmetic on 0.01
    units drifts, and a wrong total is a billing error.
  - Only `{slug, pack, quantity}` is persisted; names, prices and images are
    looked up from the catalogue on read, so a price change can never be served
    from a stale copy in someone's browser. `sanitise()` drops anything that no
    longer matches the catalogue.
  - `price: string` and the duplicated `sizes[]` are gone — `detail.packaging`
    is the single source of pack options and prices.
  - The mock's "toggle demo view: empty state" is a design-tool affordance; the
    empty state is now a genuine state instead.
  - Recommendations use the real catalogue. The mock advertised three products
    the brand does not sell.
  - **"Paystack Escrow · Secured CBN Gateway" not shipped** — Paystack is a
    gateway, not escrow, and "CBN Gateway" implies a central-bank endorsement
    that does not exist. Reads "Paystack Secured".
- **Unblocked:** every "Add to bag" across the site now works (product page,
  shop cards, related products, recommendations), and the header shows a live
  bag count.
- **Verify:** lint, typecheck, build, format pass. `/cart` renders, `/cart`
  excluded in robots, all routes 200, one `h1`. Cart arithmetic reproduces the
  mock exactly: ₦3,600 × 2 + ₦5,800 = ₦13,000.
  **Not verified by me:** the interactive add → persist → reload round trip
  needs a browser click-through — there is still no test runner (GAP-001).
- **Gaps:** opened **GAP-008** (the mock's ₦4,200 free-delivery figure does not
  reconcile with ₦15,000 − ₦13,000 = ₦2,000). GAP-001 updated: money code now
  exists and is untested.
- **Next / open threads:** checkout — customer details form, Paystack, order
  confirmation. That needs the backend contract first (GAP-004/007 still block a
  public launch).

## 2026-09-06 — Product detail pages (/shop/[slug])

- **Done:** Built the product detail page from the frames: announcement bar,
  breadcrumb, gallery with thumbnail strip, purchase panel (packaging, quantity,
  actions), assurances, the "Architecture of..." provenance section, ingredients
  and shelf-life panels, and related products. Static for all three slugs via
  `generateStaticParams`; unknown slugs `notFound()`.
- **Files:** new `app/shop/[slug]/page.tsx`,
  `components/product/{product-gallery,product-purchase,provenance,related-products}.tsx`,
  `components/layout/announcement-bar.tsx`; extended `content/products.ts` with
  `ProductDetail`; updated `content/shop.ts`, `components/shop/product-card.tsx`,
  `components/landing/flavours.tsx`, `components/ui/icons.tsx`, `app/sitemap.ts`.
- **Decisions:**
  - Detail content lives on the shared catalogue, so imagery stays identical
    across landing / shop / product pages by construction. Verified: chinchin10
    (Coco) and chinchin11 (Cinnamon) resolve to the same file on all three.
  - The mock only ever showed Milky Velvet's detail page; the other two are
    adapted to the same structure and marked UNVERIFIED with the rest.
  - **Allergen line deliberately NOT shipped** — see GAP-007.
  - Announcement bar is used only on this page, not site-wide: the landing and
    shop frames do not show it, and adding it silently would change approved
    pages.
  - Packaging choice and quantity are live client state; "Add to bag" and
    "Instant checkout" stay disabled (no cart, no checkout).
  - Still no `Product` structured data — price is a placeholder and availability
    unknown, so an Offer would misrepresent the business.
- **Enabled by this work:** "View details" on the shop cards and the landing
  flavour cards are now real links (they were disabled/redirected because
  `/shop/[slug]` did not exist). Product URLs added to the sitemap.
- **Verify:** lint, typecheck, build, format pass. All three pages prerender
  (SSG); `/shop/not-a-product` 404s; one `h1` per page; every internal link on
  the product page resolves 200; the mock's "Contains: Wheat" string is absent.
- **Gaps:** opened **GAP-007** (allergens + the invented free-delivery offer);
  GAP-004 grows with the detail copy.
- **Next / open threads:** the cart and checkout are what remain before ordering
  can work. Milky Velvet still has no photograph, and each product has three
  empty gallery slots.

## 2026-09-06 — Stopped verification builds from breaking the dev server

- **Done:** Made the Next build directory configurable (`NEXT_DIST_DIR`, default
  `.next`) so a verification build can write to `.next-verify` and leave a running
  dev server alone. Documented the rule in CLAUDE.md.
- **Files:** `apps/web/next.config.ts`, `turbo.json` (outputs + `globalEnv`),
  `.gitignore`, `packages/eslint-config/{base,next}.js`, `CLAUDE.md`.
- **The bug:** the site rendered completely unstyled on localhost:3000. Cause was
  **not** the CSS source — I had run `npm run build` several times while the dev
  server was live, and `next build`/`next dev` share `.next`. The dev server kept
  serving, but its stylesheet came back 16KB with an **empty `@layer utilities`**;
  theme vars and `@layer base` survived, which is why headings were still Bodoni
  while every layout utility was missing.
- **Evidence:** same commit, three results — clean `npx @tailwindcss/cli` compile
  42KB *with* utilities, production build 38KB *with* utilities, the running dev
  server 16KB *without*. Source was never at fault.
- **Follow-on I caused and fixed:** `.next-verify` is generated code, so ESLint
  started linting it (6187 problems from Next's generated types) — added to the
  ignore lists in both shared configs. Turbo also flagged `NEXT_DIST_DIR` as an
  undeclared env var — added to `globalEnv`.
- **Verify:** lint, typecheck, build and format all pass; confirmed the isolated
  build leaves `.next/BUILD_ID` mtime unchanged. The user's dev server, restarted,
  now serves 50KB of CSS with every layout utility present.
- **Next / open threads:** unchanged — GAP-004 (unverified prices/claims) still
  blocks a public deploy; `/shop/[slug]` and the cart are the next build.

## 2026-09-06 — Shop page + shared product catalogue

- **Done:** Built `/shop` from the supplied frames: page header with batch meta,
  category filters, three product tiles (badge, crunch-factor bar, tasting notes,
  size selector, actions), the Atelier Lab notify panel, the assurance band, and
  the fuller four-column footer. Extracted the product catalogue so the landing
  page and the shop read the same data.
- **Files:** new `content/products.ts`, `content/image-slot.ts`, `content/shop.ts`,
  `components/shop/{product-card,shop-catalogue,atelier-lab}.tsx`,
  `app/shop/page.tsx`; updated `content/landing.ts`, `components/landing/flavours
  .tsx`, `components/layout/site-footer.tsx`, `app/sitemap.ts`.
- **Decisions:**
  - **One catalogue, two pages.** `products.ts` is the single source for names,
    imagery, pricing and tasting notes — the owner asked for consistency, and
    sharing the data makes drift impossible rather than merely unlikely. Only the
    per-page badge text differs (`badges.landing` / `badges.shop`).
  - Footer replaced with the newer four-column design and is shared, so both
    pages match.
  - Footer links with no destination render as plain text, not links — a footer
    of 404s is worse than one honest about what has shipped.
  - "Add to bag" and "View details" are disabled with one explanatory note: there
    is no cart and no `/shop/[slug]`.
  - Size selection is real client state (a legitimate UI concern), unlike the
    notify form, which stays disabled because no endpoint exists.
- **Fixed:** the landing page's product buttons pointed at `/shop/[slug]`, which
  **404s** — repointed at `/shop`. `/about` is linked from the nav, footer and
  hero but has no route; those now target the manifesto section (`/#manifesto`),
  which is the brand story today. Audited every internal link on both pages:
  all resolve 200, zero 404s.
- **Verify:** build, lint, typecheck, format pass; `/shop` is static. Confirmed
  both pages reference the identical product images, one `h1` + eight `h2`, four
  filter tabs with the unavailable two disabled, three size radiogroups, and
  `/shop` back in the sitemap.
- **Gaps:** GAP-004 grows — the shop adds unverified batch numbers, crunch
  scores, tasting notes and pack sizes, all centralised in `products.ts`/`shop.ts`.
- **Next / open threads:** `/shop/[slug]` product pages and the cart are the
  obvious next step (they unlock the disabled actions). `/about` still needs a
  real page. Milky Velvet still has no photograph.

## 2026-09-06 — Wired the first supplied photography

- **Done:** Placed all six supplied images into their matching slots after viewing
  each one (filenames were not reliable — `workspace1.png` is a coffee-and-notebook
  scene, so it went to the tea & coffee card, not the desk one). Hero, manifesto,
  crunch, Coco card, Cinnamon card and the coffee feature now use real photography.
- **Files:** `apps/web/src/content/landing.ts` (six `src` values), images in
  `apps/web/public/images/`.
- **Still on placeholders:** Milky Velvet product card, and the desk/laptop
  lifestyle card — no matching asset supplied.
- **Verify:** build, lint, typecheck, format all pass; production server confirms all
  six images render through `next/image` as AVIF and exactly two labelled
  placeholders remain.
- **Gaps:** opened **GAP-005** (every image is below its slot's resolution; four are
  soft even at 1x) and **GAP-006** (`chinchin11` has a badge baked into the pixels
  that collides with the UI badge; `chinchin7` shows packaging reading "LAMIE FOODS
  ENTERPRISE").
- **Next / open threads:** Higher-resolution re-exports, two remaining images, then
  GAP-004 (confirm the mock's invented prices and claims) before any public deploy.

## 2026-09-05 — Landing page + design system v2

- **Done:** Replaced the design system with **"Artisanal West African Confectionery"**
  (supersedes the one configured earlier the same day: new palette, three typefaces
  instead of two, radii down from 16px to 4px, envelope 1360px). Built the full
  landing page — header with working mobile menu, hero, manifesto, three pillars,
  crunch/sensory, three flavours, moments, pantry horizon, final CTA, footer.
- **Files:** `styles/globals.css` (rewritten `@theme` + `lamie-rise` keyframes),
  `app/layout.tsx` (3 fonts, no-js guard), `app/page.tsx`, new
  `content/landing.ts`, `components/landing/*` (8), `components/layout/site-header
  .tsx` + `site-footer.tsx`, `components/ui/{button,section,image-slot,icons}.tsx`,
  `components/motion/reveal.tsx`.
- **Decisions:**
  - **All landing copy lives in one file** (`content/landing.ts`) with a
    READ-BEFORE-LAUNCH banner. The mock's copy invents prices and product claims; each
    is tagged `UNVERIFIED` so replacing them is one edit pass. See GAP-004.
  - **Hero is a Server Component using a CSS keyframe**, not Framer Motion. A
    JS-driven entrance ships the LCP headline at `opacity: 0`; CSS runs even without
    hydration and the reduced-motion block collapses it automatically.
  - Scroll reveals stay Framer (IntersectionObserver, no scroll listener) but the
    document carries a `no-js` class that an inline script strips, so a scripting
    failure cannot leave 25 elements invisible.
  - **Nothing fake ships:** the tasting-access form is `disabled` with an honest note
    (no endpoint exists), "Add to bag" links to the product page rather than being a
    button that does nothing, and unconfirmed contact rows render as text, not links.
  - Departures from the mock where it contradicted a confirmed fact: "1–3 days" ->
    confirmed 1–5 days; "Lamie Foods Enterprise" -> "Lamie Foods"; no fabricated
    email; third-party studio credit dropped.
  - No `Product` structured data yet — publishing placeholder prices as machine-
    readable offers would misrepresent the business.
- **Verify:** lint, typecheck, build, format:check all pass from clean; page is fully
  static. Confirmed in served output: 8 sections, one `h1` + 10 `h2` + 14 `h3`, all
  three `@font-face` families, the `no-js` rule, and the hero `h1` no longer shipping
  hidden. **All 17 colour pairs used on the page pass WCAG AA** (worst 4.80:1).
- **Gaps:** **GAP-003 closed** (the new palette fixes the failing CTA contrast).
  **GAP-004 opened — high, blocks public launch:** unverified prices and product
  claims.
- **Next / open threads:** Owner to (1) supply real photography for `public/images` —
  every slot is a labelled tonal placeholder today, (2) confirm or replace every
  `UNVERIFIED` value in `content/landing.ts`. Then: /shop, product pages, cart.

## 2026-09-05 — Configured the design system (Artisanal Confectionery System)

- **Done:** Replaced the provisional placeholder palette with the approved Stitch
  design system. Full role-token set (`surface`/`on-surface`, `primary`, `secondary`,
  `tertiary`, `error` + containers and fixed variants) transcribed verbatim, plus the
  four named brand swatches, the 13-step type scale, 8px spacing rhythm, radii, warm
  elevation shadows and a `desktop:` breakpoint at 1200px. Wired **Bodoni Moda**
  (display/headline) + **Plus Jakarta Sans** (body/UI) via `next/font/google`.
  Migrated the three placeholder pages off the old token names.
- **Files:** `apps/web/src/styles/globals.css` (rewritten `@theme`),
  `apps/web/src/app/layout.tsx` (fonts, themeColor `#4a1b07`), `page.tsx`,
  `not-found.tsx`, `error.tsx`; `docs/ai-memory/frontend-conventions.md` filled in.
- **Decisions:**
  - Type steps keep the system's px value as each clamp's **max** and gain an
    interpolated mobile floor, satisfying the fluid-design standard without altering
    the design at desktop. `headline-lg` uses the system's own 28px mobile value; its
    0.78 ratio sets the pattern for the other display/headline floors.
  - Line heights stored as **unitless ratios** (spec px ÷ spec size) so they stay
    correct at every size a clamp resolves to.
  - Labels and `title-md` deliberately **not** fluid — UI chrome with letter-spacing
    tuned to an exact size.
  - Added `--color-brand-*` for the four named swatches: only Deep Cocoa exists in the
    role tokens (as `primary-container`), yet the component specs name all four.
  - Elevation transcribed from the system's **prose** — it is absent from the token
    export.
- **Verify:** lint, typecheck, build, format all pass. Confirmed in served CSS: 10
  `@font-face` blocks across both families, clamp type steps, role colours, warm
  shadows compiled to `#4a1b070d`/`#24120b1f`, and the 1200px `desktop:` breakpoint.
- **Gaps:** opened **GAP-003** — the system's spec'd orange CTA (`#E65B00` + white)
  is 3.58:1 and fails AA; needs an owner decision since the fix deviates from the
  approved hex.
- **Next / open threads:** **Landing page** — awaiting the page design. Two conflicts
  in the design system need the owner to settle before component recipes are written
  (canvas colour, and which token is "primary" for buttons) — see the handover notes.

## 2026-09-05 — Fixed GAP-002 (sitemap 404s)

- **Done:** Trimmed `sitemap.ts` to only the home route; `/shop`, `/about`, and product
  URLs re-added via comment as each page ships. No more indexable 404s in the sitemap.
- **Files:** `apps/web/src/app/sitemap.ts`.
- **Verify:** `npm run typecheck --workspace=@lamiefoods/web` passes; `sitemap()` now
  returns only `ROUTES.home`, which renders (200).
- **Gaps:** GAP-002 closed (working tree, uncommitted).
- **Next / open threads:** GAP-001 (test runner) still open. Changes are uncommitted —
  commit when ready.

## 2026-09-05 — Audited gaps

- **Done:** First gap audit (security → tests → edge → tech-debt). Security pass clean:
  `npm audit` 0 vulns, secrets gated behind `NEXT_PUBLIC_*` + zod validation, JSON-LD
  escapes `<`, error boundary logs (not renders) errors, `.env.local` untracked.
- **Files:** read-only across `apps/web` (app routes, seo, api, config, env files),
  `packages/*`, `.gitignore`. Ran `npm audit` and `git ls-files`.
- **Gaps:** opened **GAP-001** (no test runner in any workspace — medium) and
  **GAP-002** (sitemap advertises unbuilt `/shop` + `/about` → indexable 404s — low).
- **Decisions:** Did **not** file `apiFetch` throwing `ApiNotConfiguredError` as a gap —
  it's an intentional, documented first-class state with zero callers today, not a
  weakness.
- **Docs updated:** gaps.md, progress.md.
- **Next / open threads:** Address GAP-002 before any public deploy; stand up a test
  runner (GAP-001) when the first money/cart logic lands. Re-audit once real
  pages/API calls exist — most of the app surface doesn't exist to audit yet.

## 2026-09-05 — Documented architecture

- **Done:** Derived `architecture.md` from the real code (entry points, api gateway,
  env validation, tokens, shared packages, backend stub). Replaced the empty template
  with mental model, system map, data flow, 14 key decisions, 9 gotchas, glossary.
- **Files:** `docs/ai-memory/architecture.md` (read-only exploration of `apps/web`,
  `packages/*`, `apps/backend`, configs).
- **Decisions:** All existing decisions had genuine, code-derivable rationale — none
  invented. Two unknowns resolved with the owner and folded in: pnpm→npm was for
  tooling/host compatibility, and the deploy target is **Vercel** (also filled into
  CLAUDE.md's Deploy line).
- **Docs updated:** architecture.md, progress.md.
- **Gaps:** none opened yet — recommend running audit-gaps next (candidates noticed:
  no test runner in any workspace; `apiFetch` throws `ApiNotConfiguredError` for every
  call until the backend is wired).
- **Next / open threads:** Get answers to the two UNCONFIRMED items and fold them in.
  Then run audit-gaps. Fill frontend-conventions tokens are already largely captured in
  globals.css.

## <YYYY-MM-DD> — Kit installed

- **Done:** AI memory kit installed; CLAUDE.md placeholders filled.
- **Next / open threads:** <existing repo: run document-architecture, then audit-gaps.
  new repo: fill frontend-conventions tokens as the design system forms.>
