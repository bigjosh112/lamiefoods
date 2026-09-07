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
- **Navbar:** dropped "Contact" (its href was `#contact`, an anchor to an
  element that exists nowhere on the site), removed the search icon, and
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
- **Fix:** removed it. The site has **no in-page anchors at all**, so the
  property was buying nothing. `scroll-padding-block-start` stays for the sticky
  header if anchors are added later — scope smooth scrolling to that
  interaction then, not to the root element.

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
