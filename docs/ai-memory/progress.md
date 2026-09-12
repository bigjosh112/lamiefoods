# Progress log

> Running task log, **newest first**. Written by the `log-progress` skill after every
> completed task. Purpose: a fresh session (any model) reads the top few entries and
> knows exactly where the project stands — what just happened, what's mid-flight, and
> what's next. Keep entries short; depth belongs in the other docs.

## 2026-09-11 — PDP product image auto-slider

- **Done:** `ProductGallery` auto-advances uploaded photos every 4.5s with a
  direction-aware Framer Motion slide (fade-only when reduced motion). Thumb
  click / arrow keys pause ~8s; hover/focus pauses; terracotta progress bar
  under the hero. Single-image / placeholder products skip autoplay.
- **Files:** `components/product/product-gallery.tsx`,
  `docs/ai-memory/progress.md`.
- **Decisions:** Framer `m` + `AnimatePresence` only — no new carousel library.
- **Docs updated:** `progress.md`.
- **Gaps:** none.
- **Next / open threads:** Open a PDP with 2+ photos and confirm slide + thumbs.

## 2026-09-11 — Owner fulfilment emails + progress UI

- **Done:** Customer processing/shipped/delivered (+ paid) bodies now use
  order-ref banner, progress steps, section labels. Added shop mails
  `ownerProcessingEmail` / `ownerShippedEmail` / `ownerDeliveredEmail` and
  wired them beside customer sends on admin PATCH when `ORDER_EMAIL_TO` set.
- **Files:** `server/email/order-emails.ts`,
  `app/api/admin/orders/[reference]/route.ts`,
  `docs/ai-memory/{api-integration,progress}.md`.
- **Decisions:** Owner fulfilment notifications mirror paid-mail pattern.
- **Docs updated:** `api-integration.md`, `progress.md`.
- **Gaps:** Resend domain still required for real delivery.
- **Next / open threads:** Flip a paid order through processing → shipped →
  delivered and check customer + shop inboxes.

## 2026-09-11 — Polished order email HTML

- **Done:** Rebuilt shared email `shell` (cacao header, status pill, footer) plus
  `ctaButton` / `amountCallout` / `customerCard` helpers. Restyled all order
  templates (customer, owner, paid, processing, shipped, delivered) with brand
  hex and table-based CTAs — owner paid mail no longer a bare text dump.
- **Files:** `server/email/order-emails.ts`, `docs/ai-memory/progress.md`.
- **Decisions:** Inline styles only; no logo image (no stable public asset URL).
- **Docs updated:** `progress.md`.
- **Gaps:** Spam/domain still Resend config; localhost links until real site URL.
- **Next / open threads:** Place/pay a test order to preview the new owner +
  customer paid mails.

## 2026-09-11 — Customer email when order moves to processing

- **Done:** Added `orderProcessingEmail` (items, address, order link).
  `updateOrderStatus` returns `justProcessing` on first `paid` → `processing`;
  admin PATCH sends it. Paid / shipped / delivered customer mails unchanged.
- **Files:** `server/email/order-emails.ts`, `server/orders/repository.ts`,
  `app/api/admin/orders/[reference]/route.ts`,
  `docs/ai-memory/{api-integration,progress}.md`.
- **Decisions:** No `processing_at` column — forward-only transition is enough.
- **Docs updated:** `api-integration.md`, `progress.md`.
- **Gaps:** GAP-012 / gmail `ORDER_EMAIL_FROM` still blocks real delivery.
- **Next / open threads:** Verified Resend FROM; test paid → processing →
  shipped → delivered mail sequence.

## 2026-09-11 — Owner payment email + why customer mail 422'd

- **Done:** Added `ownerPaymentConfirmedEmail`; Paystack `confirmPaystackPayment`
  and admin bank `justPaid` now email customer + owner (when `ORDER_EMAIL_TO`
  set). Set `ORDER_EMAIL_TO` to `ADMIN_EMAIL`. `sendMail` logs Resend's
  `message` on reject. Root cause of silent customer mail: Resend **422** with
  `ORDER_EMAIL_FROM` on **gmail.com** (unverified for Resend) — GAP-012 updated.
- **Files:** `server/email/{order-emails,send}.ts`, `server/orders/paystack.ts`,
  `app/api/admin/orders/[reference]/route.ts`, `apps/web/.env`,
  `docs/ai-memory/{api-integration,gaps,progress}.md`.
- **Decisions:** Owner paid mail matches the promise in `ownerEmail` Paystack
  copy; no retry queue this pass.
- **Docs updated:** `api-integration.md`, `gaps.md` (GAP-012), `progress.md`.
- **Gaps:** GAP-012 still open (no resend UI); needs verified Resend FROM domain.
- **Next / open threads:** Change `ORDER_EMAIL_FROM` to a Resend-verified
  sender; restart next so cached `serverEnv` picks up `ORDER_EMAIL_TO`; pay a
  new test order.

## 2026-09-11 — Paystack still unavailable: empty shell env overrode .env

- **Done:** `.env` had a valid `pk_test_…`, but the process environment still
  had `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=` (empty). Next’s `loadEnvConfig` does
  not override existing env, so Turbopack inlined `""` and hid Pay. Cleared
  `.next`, restarted with `env -u NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`; bundles
  now contain `pk_test_…`.
- **Files:** local process only; `docs/ai-memory/progress.md`.
- **Decisions:** When Pay looks “unavailable” despite `.env`, check
  `echo $NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — empty-but-set beats the file.
- **Docs updated:** `progress.md`.
- **Gaps:** none.
- **Next / open threads:** Hard-refresh order-success; confirm **Pay now**.

## 2026-09-11 — Paystack “unavailable” was empty public key

- **Done:** Confirmed `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` was blank while
  `PAYSTACK_SECRET_KEY` was set — that hid Pay on `/order-success`. Owner
  filled `pk_test_…`; restarted `npm run dev` so the public key inlines;
  `pk_test_` now present in `.next` client chunks.
- **Files:** `apps/web/.env` (local only), `docs/ai-memory/progress.md`.
- **Decisions:** No code change — Paystack Pop still needs the public key
  client-side; secret alone is not enough.
- **Docs updated:** `progress.md`.
- **Gaps:** none (bank-transfer copy still GAP-013 if details unset).
- **Next / open threads:** Hard-refresh `/order-success?token=…` and confirm
  **Pay now** appears; open popup smoke-test optional.

## 2026-09-10 — Product created banner + shop delivery note

- **Done:** Creating a product redirects to edit with `?created=1` and a
  success banner. Shop listing plus the PDP truck line now say delivery is
  not in the product price — the customer pays it; no naira amount invented.
- **Files:** `content/{admin-new-product,shop}.ts`,
  `components/admin/{product-form,edit-product-view}.tsx`,
  `app/admin/(portal)/products/[id]/edit/page.tsx`, `app/shop/page.tsx`,
  `docs/ai-memory/progress.md`.
- **Decisions:** Same policy as checkout’s deliveryCostNotice, shown earlier
  in the shop. Cart/checkout copy left as-is.
- **Docs updated:** `progress.md`.
- **Gaps:** none opened/closed.
- **Next / open threads:** Create a product and confirm the banner; check
  `/shop` and a PDP for the delivery line.

## 2026-09-10 — 409 save banner no longer always says “slug taken”

- **Done:** A 409 now shows the API message. Duplicate SKU
  (`product_packs_sku_unique`, e.g. placeholder `LF-MVC-100`) was being
  labelled as a slug clash because the form treated every 409 as a slug.
- **Files:** `components/admin/product-form.tsx`, `docs/ai-memory/progress.md`.
- **Decisions:** Prefer `ApiError.body.error` over a hardcoded 409 string.
- **Docs updated:** `progress.md`.
- **Gaps:** none opened/closed.
- **Next / open threads:** Check `/admin/products` — the chin-chin product
  may already exist from the first successful save. SKUs must be unique
  across all sizes, not only this product.

## 2026-09-10 — Product save 400 was a body-shape mismatch

- **Done:** Create/edit now POST/PATCH the form schema (`title`, `tiers`,
  naira `price`), matching what the route already `safeParse`s.
  `toProductInput` stays server-only. A 400 banner shows the API `error`
  string instead of a generic retry. Photography `ImageSlot`s now pass
  `sizes` so `next/image` fill stops warning.
- **Files:** `components/admin/{product-form,image-upload}.tsx`,
  `docs/ai-memory/progress.md`.
- **Decisions:** Convert form → repository input once, on the server.
- **Docs updated:** `progress.md`. Catalog already recorded the form-shaped
  body.
- **Gaps:** none opened/closed.
- **Next / open threads:** Save the chin-chin product again — expect
  `POST /api/admin/products` 201 and the edit URL. Fill allergens /
  ingredients / shelf life / storage / a pack if the form still blocks.

## 2026-09-10 — Photography thumbs: click to hero, X to delete

- **Done:** Removed the MAKE HERO / REMOVE bar that covered gallery
  thumbs. Clicking a thumb promotes it to the large hero; a corner ×
  (same control as the hero) deletes that photo without promoting.
  Alt fields under thumbs are unchanged.
- **Files:** `components/admin/image-upload.tsx`, `docs/ai-memory/progress.md`.
- **Decisions:** × is a sibling of the thumb button (not nested) so the
  markup stays valid; `stopPropagation` on delete.
- **Docs updated:** `progress.md`.
- **Gaps:** none opened/closed.
- **Next / open threads:** Refresh `/admin/products/new` — thumbs should
  show the picture plus × only; click swaps hero; × removes that slot.

## 2026-09-10 — Vercel Blob store is private (uploads cannot finish)

- **Done:** Dropped the empty `onUploadCompleted` callback (that warning
  is gone; it was not the hang). Live `put()` with the existing
  `BLOB_READ_WRITE_TOKEN` failed for `access: "public"` (`Cannot use
  public access on a private store`) and succeeded for `access: "private"`
  in 624ms; unauthenticated `POST /api/admin/uploads` stayed `401`.
  `BLOB_STORE_ID` and `VERCEL_BLOB_CALLBACK_URL` are not required.
- **Files:** `app/api/admin/uploads/route.ts`,
  `docs/ai-memory/{api-integration,progress}.md`.
- **Decisions:** Keep client uploads `access: "public"` — shop photos must
  be fetchable by `next/image`. Do not switch the app to private blobs.
- **Docs updated:** `api-integration.md` (uploads quirk), `progress.md`.
- **Gaps:** none opened/closed.
- **Next / open threads:** Owner must set the Blob store to **Public** in
  the Vercel dashboard (Storage → this store → access). Then retry one
  small JPEG on `/admin/products/new`.

## 2026-09-10 — Product photo upload percent loader

- **Done:** Photography upload shows a determinate 0–100% bar (byte-weighted
  for a multi-file pick, plus “n of m”). First-batch overlay is the hero
  square only: solid cacao scrim, no “Hero image” label, no Add tile
  “Uploading…” underneath, and the duplicate inner “n of 5 photos” count
  is gone (the Photography panel header still shows it). Adding to an
  existing hero overlays Add only. Typecheck/lint clean on the component;
  live 0→100 click-through was not available in this session.
- **Files:** `components/admin/image-upload.tsx`, `docs/ai-memory/progress.md`.
- **Decisions:** Stay sequential (Blob `upload()` is per-file); overall
  percent is `finishedBytes + current.loaded` over `sum(file.size)`. Hide
  Add for the whole first batch rather than leave a second busy control.
- **Docs updated:** `progress.md`.
- **Gaps:** none opened/closed.
- **Next / open threads:** Smoke on `/admin/products/new`: pick 5 on an
  empty product — one cacao hero with percent, nothing below it; after
  they land, Add returns. Adding more overlays Add only.

## 2026-09-10 — Product multi-image gallery (max 5)

- **Done:** Enforced max 5 product images in Zod + admin upload UI (“N of 5”,
  Add disabled when full); Make hero reorders to index 0; per-image alt fields
  (blank → product title on save); PDP thumb strip lays out up to five
  (`grid-cols-3` → `sm:grid-cols-5`). Shop cards still use hero only.
- **Files:** `lib/admin/product-schema.ts`, `components/admin/{image-upload,
  product-form}.tsx`, `components/product/product-gallery.tsx`,
  `docs/ai-memory/{api-integration,progress}.md`.
- **Decisions:** Stay on Vercel Blob (no Cloudinary); keep the three seeded
  chin-chin products published; array index 0 = hero = `sort_order` 0.
- **Docs updated:** `api-integration.md` (POST/PATCH products max 5 images),
  `progress.md`. Architecture already records Blob over Cloudinary.
- **Gaps:** none opened/closed.
- **Next / open threads:** Manual smoke: admin edit → upload 5 → save → PDP;
  confirm 6th blocked and Make hero updates shop card.

## 2026-09-10 — Per-size stock, price, and SKUs

- **Done:** Moved inventory onto `product_packs` (stock + restock threshold);
  seeded nine launch SKUs (`LF-MVC/CVC/CIN-100/300/500`); freeze SKU on
  `order_items`; payment decrement matches slug + pack name; admin inventory
  is one row per size; shop/PDP sold-out is per selected size.
- **Files:** `migrations/0007_pack_stock_and_order_sku.sql`,
  `packages/types/src/{product,order}.ts`, `server/products/repository.ts`,
  `server/orders/{pricing,repository}.ts`, admin product form/inventory,
  shop/PDP purchase UI, memory docs.
- **Decisions:** Reverses 2026-09-08 product-level stock — launch needs
  independent 100g/300g/500g counts. Cart identity stays slug + pack name;
  SKU is frozen on the order for ops. Placeholder stock 100 / threshold 20
  per launch pack until the owner edits real counts.
- **Docs updated:** `architecture.md`, `api-integration.md`, `gaps.md`
  (GAP-009 inventory wording), `progress.md`.
- **Gaps:** none opened/closed (create-time stock reject still future work).
- **Next / open threads:** Apply migration 0007 on staging/production (local
  already applied; also reshapes any leftover mock packs to 100/300/500);
  owner sets real opening stock per SKU before launch.

## 2026-09-10 — Admin bulk unpublish + permanent delete

- **Done:** Multi-select on `/admin/products` with Unpublish and confirmed
  permanent Delete; `DELETE /api/admin/products/:slug` and
  `POST /api/admin/products/bulk`; repository helpers cascade packs/images.
- **Files:** `server/products/repository.ts`,
  `app/api/admin/products/{[slug],bulk}/route.ts`,
  `lib/api/admin-products.ts`, `components/admin/products-list.tsx`,
  `docs/ai-memory/{api-integration,progress}.md`.
- **Decisions:** Soft hide via `storefront_active = false`; hard delete does
  not touch frozen order lines or Blob orphans.
- **Docs updated:** `api-integration.md`, `progress.md`.
- **Gaps:** none (Blob orphan cleanup still future).
- **Next / open threads:** none for this feature.

## 2026-09-10 — Checkout shows real order-create errors (409)

- **Done:** Checkout no longer masks API failures as a generic “could not
  save” banner; prefers `body.error`, with a clear 409 hint to clear the bag
  when cart lines are unpublished/unavailable. Confirmed Paystack never ran —
  `POST /api/orders` was returning 409. Republished milky/coco/cinnamon locally.
- **Files:** `components/checkout/checkout-form.tsx`, `progress.md`.
- **Decisions:** Keep “nothing charged” reassurance on every checkout error.
- **Docs updated:** `progress.md`.
- **Gaps:** none.
- **Next / open threads:** Place Order again with a bag of published products
  to open Paystack on `/order-success`.

## 2026-09-10 — Stale cart lines no longer block checkout

- **Done:** Place Order submits only catalogue-resolved lines; bag count /
  empty state follow resolvable items when a catalogue is present; deleted
  unpublished localStorage lines are pruned with a dismissible notice. Shop
  wrapped in `CatalogProvider` so the header badge can prune on browse.
- **Files:** `lib/cart/{cart-store,use-cart}.ts`,
  `components/{checkout/checkout-form,cart/cart-view,cart/cart-unavailable-notice}.tsx`,
  `app/shop/page.tsx`, `progress.md`.
- **Decisions:** Not a stock failure — 409 was stale deleted-product bag
  lines. Stock still unchecked at order create.
- **Docs updated:** `progress.md`.
- **Gaps:** none.
- **Next / open threads:** Refresh checkout / open shop to prune the old 7
  badge; add “chinchin laye modd” and Place Order → Paystack.

<!-- Entry template — copy to the TOP of the log:

## YYYY-MM-DD — <task title>

- **Done:** <what shipped, 1–3 bullets>
- **Files:** <key files touched>
- **Decisions:** <any decision made — if architectural, it ALSO goes in architecture.md>
- **Docs updated:** <which memory docs were updated, or "none needed">
- **Gaps:** <new GAP-IDs opened / closed, or "none">
- **Next / open threads:** <what a fresh session should pick up>
-->

## 2026-09-10 — Customer ordering path audit (Paystack + discounts + copy)

- **Done:** Corrected stale order-success/checkout copy that still claimed
  payment was unconnected; showed list vs discounted prices on cart and
  checkout; hardened Paystack popup wait/error messaging; aligned
  payment-confirmed email with “products paid, delivery still separate”;
  reinforced GAP-013 on `/admin/settings` when bank fields are unset.
- **Files:** `content/{order-success,checkout,admin-settings}.ts`,
  `lib/cart/cart-store.ts`, `components/{cart/cart-view,checkout/checkout-summary,
  order/payment-actions,order/order-confirmation,admin/settings-view}.tsx`,
  `app/order-success/page.tsx`, `server/email/order-emails.ts`.
- **Decisions:** No invented delivery fees or bank numbers; Paystack still
  charges subtotal only. Customer timeline stages are Placed → Paid →
  Dispatched → Delivered (kitchen stage remains admin-side).
- **Docs updated:** `api-integration.md` (stock answer), `gaps.md`
  (GAP-013/014), `progress.md`.
- **Gaps:** GAP-013/014 still open (owner bank details; webhook registration).
- **Next / open threads:** Owner enters bank details; register Paystack
  webhook on production domain; optional create-time stock check later.

## 2026-09-12 — Client copy pass: manifesto, pillars, footer

- **Done:** Replaced client-supplied copy across three landing sections and
  rewired the footer's contact channels. 8 files.
- **Files:** `content/landing.ts`, `content/shop.ts`, `components/landing/manifesto.tsx`,
  `components/landing/pillars.tsx`, `components/layout/site-footer.tsx`,
  `components/ui/icons.tsx`, `packages/config/src/brand.ts`.
- **The manifesto's three stats are gone** — "100% Churned Dairy Butter",
  "48 Hrs Kettle To Pack", "Zero Artificial Preservatives". They were the
  section's last UNVERIFIED claims (GAP-004) and asserted a butterfat
  composition, a production window and a preservative-free declaration that
  nobody had confirmed. Replaced by a Quality / Care / Taste feature block that
  states no measurable fact. The element changed `<dl>` to `<ul>`: the
  description list existed only because a figure and its label were a
  term/definition pair (hence the `sr-only` `<dt>`), and the new content has no
  such pairing. Matches `pillars.tsx`.
- **The pillars lost their operational claims too** — named ingredients, "made
  in small pots, not mass-produced", "ships within hours of cooling", and the
  pouch sizes. Those were owner-written, not invented, but the replacement
  describes standards instead of specifics, so it no longer needs re-checking
  when the kitchen, pack range or fulfilment timing changes.
- **First real phone number and email in the codebase.** Both went into
  `BRAND` (packages/config), whose own header says not to invent phone numbers
  — they are confirmed now, so that is where they belong rather than inline in
  a component. Two forms each: a display form for the accessible name and a
  `wa.me` / `mailto:` form for the href, because wa.me takes digits only and
  deriving one from the other by hand would eventually drift.
- **Footer link handling needed real work, not just data.** The columns render
  with Next's `<Link>`, which adds no `target`/`rel`; "Contact us" is the first
  external URL in them, so external detection was added. `mailto:` is treated
  as external but deliberately does NOT get `target="_blank"` — that strands a
  blank tab once the mail client opens.
- **Typecheck caught a genuine regression:** with all three contacts linked,
  the "no destination yet" fallback branch became unreachable and `entry`
  narrowed to `never`. That branch enforces the site-wide rule that a link with
  nowhere to go renders as plain text rather than pointing at a 404, so it was
  kept and the array given an explicit `ContactEntry` type with
  `href: string | null`.
- **Three brand marks added to `icons.tsx`** (Instagram gradient, WhatsApp
  green, Gmail). They set `fill` and deliberately do not spread `iconProps`, so
  they ignore inherited text colour — three now-inert classes were removed from
  the footer chips as a result. NOTE: the Gmail glyph is hand-authored, not
  Google's official asset, and Google's brand guidelines discourage using the
  Gmail logo to represent email generically.
- **Docs updated:** progress.md.
- **Gaps:** GAP-004 reduced again; not closed.
- **Verified:** typecheck 5/5, prettier clean, changed files lint clean,
  production build 2/2, and every copy change confirmed against the rendered
  HTML rather than the source.
- **`npm run lint` fails on pre-existing errors** in
  `components/product/product-gallery.tsx` (ref written during render;
  `Date.now()` called during render), from commit `632344f`. Untouched here and
  unrelated. Turbo had been serving a cached lint result, which is why they had
  not surfaced.
- **Next / open threads:** The database catalogue has changed under us — see
  the note in the next entry's thread. `.gitignore`'s stray `/docs` line is
  still uncommitted.

## 2026-09-10 — Site-wide typography: Fraunces + General Sans

- **Done:** Replaced the three-typeface system (Bodoni Moda / Epilogue / Space
  Grotesk) with two — Fraunces for display, General Sans for everything read or
  operated — across storefront and admin, driven entirely from two tokens.
- **Files:** `app/layout.tsx` (font loading), `styles/globals.css` (tokens +
  weights), `src/fonts/` (two vendored woff2 + README), `packages/ui/src/cn.ts`,
  29 component sites for prices/figures, `frontend-conventions.md`.
- **General Sans is not on Google Fonts.** `fonts.googleapis.com` returns
  `400 Bad Request` for it — it is an Indian Type Foundry face distributed via
  Fontshare. Its two variable cuts (roman + italic, `wght` 200–700) are vendored
  into `src/fonts/` and loaded with `next/font/local`. The alternative,
  Fontshare's hosted stylesheet, would have added a render-blocking third-party
  request to every page and leaked visitor IPs. Licence and re-fetch steps are
  in `src/fonts/README.md`. Fraunces IS on Google Fonts and uses
  `next/font/google`, which self-hosts at build — so no font request leaves for
  a third party either way.
- **Font payload went DOWN, which matters given the mobile-first brief:** 497KB
  across three families to 391KB across two (-21%), measured by fetching the
  actual woff2 files. That is despite adding a real italic cut for both
  families — six headline accent lines and one body paragraph use italic, and
  synthesising a slant on a serif looks broken.
- **`--font-numeral` is a new ROLE token, not a third family.** It resolves to
  `--font-display`. The old `--font-label` bundled labels, nav, buttons AND
  prices under one typeface; the new spec splits them, so prices and stat
  figures needed a name of their own. `--font-sans` and `--font-label` are now
  aliases of `--font-body`, which is why 197 existing `font-label` usages did
  not have to be rewritten.
- **Prices inside prose deliberately stay in body type.** "Transfer ₦5,000,
  then…", "₦2,000 × 3", and the "Pay ₦5,000 now" button label are sentences and
  a control, not standing figures. Two Delivery cells
  (`order-confirmation.tsx:138`, `order-detail-view.tsx:99`) also stay on
  `font-label`: they render a fee OR the words "To be confirmed", and uppercase
  serif prose reads as a mistake.
- **Found and fixed a latent bug on the way:** `text-display-xl` was never
  registered in `cn.ts`'s `FONT_SIZES`, so tailwind-merge classified it as a
  colour — any `cn()` call combining it with a `text-*` colour would have
  silently dropped the hero's size. This is the exact failure that file's
  comment documents; the token list had drifted out of step with `globals.css`.
- **Left alone deliberately:** `server/email/order-emails.ts` hardcodes
  `font-family:Helvetica,Arial,sans-serif`. Email clients do not load webfonts
  reliably, so a system stack is correct there — it is not a leftover.
- **Docs updated:** `frontend-conventions.md` (typography section rewritten:
  two families, three role aliases, weights by role), progress.md.
- **Gaps:** none opened or closed.
- **Verified:** typecheck and lint 5/5, prettier clean, production build 2/2 via
  `NEXT_DIST_DIR=.next-verify`. Spot-checked against the BUILT css + prerendered
  HTML, not just source — hero h1, product name, product price, body paragraph,
  nav/button, eyebrow and admin table header each resolve to the right family
  and weight. No hardcoded font-family remains in any component.
- **Next / open threads:** 15 commits unpushed, still awaiting the owner's
  go-ahead. `.gitignore`'s stray `/docs` line is still uncommitted and still
  blocks `git add` on new doc files.

## 2026-09-10 — About page: "The anatomy of our signature bite" removed

- **Done:** Removed the sensory-profile section from the About page entirely —
  eyebrow, headline, body copy and the three-metric scorecard. No spacing left
  behind: `AboutTenets` now flows into `AboutHorizon` on the standard section
  rhythm, since the gap comes from `<Section>` padding, not from the removed
  markup.
- **Files:** `app/about/page.tsx` (import + render), `components/about/about-sections.tsx`
  (deleted `AboutSensory`), `content/about.ts` (deleted the `sensory` block).
- **This retires three more invented figures (GAP-004).** Crunch density 92%,
  butterfat warmth 88% and nutmeg & spice radiance 78% were the mock's numbers —
  nobody measured anything, and percentage bars read as laboratory fact to a
  customer. They follow the already-removed "9.4/10 crisp snap" stat and the
  crunch section's Acoustic Sensory Profile card. GAP-004 is not closed: the
  butterfat and preservative percentages, the 48-hour kettle-to-pouch window,
  the 175°C frying temperature, the batch number and the regional sourcing
  claims are all still on the page.
- **Deleted, not hidden.** The content block went with the component rather than
  being left dormant for someone to re-render later. I also corrected
  `about.ts`'s module doc comment, which still listed "sensory index
  percentages" among the live unverified claims.
- **Docs updated:** progress.md.
- **Gaps:** none opened; GAP-004 reduced, still open.
- **Verified:** `npm run typecheck`, `npm run lint` (5/5 successful),
  `prettier --check` on the three files, and a production build via
  `NEXT_DIST_DIR=.next-verify npm run build` (2/2 successful) — `/about` still
  prerenders static.
- **Next / open threads:** Unpushed commits are stacking up (14 now) — nothing
  goes to the remote without the owner's say-so. `.gitignore` has an uncommitted
  `/docs` line that nobody on this side added; left unstaged and flagged.

## 2026-09-10 — About horizon section: copy, image, cards removed

- **Done:** Rewrote the copy, filled the empty image slot, stripped the chip off
  the pipeline tag, and removed the three value cards. 21 insertions, 49
  deletions. Column split untouched.
- **Files:** `content/about.ts`, `components/about/about-sections.tsx`.
- **Removing the three cards removed unverified supply-chain claims** as well as
  the repetition the owner noted: "transparency in our supply line", specific
  frying temperatures, and direct partnerships with spice mills — none
  confirmed, all now gone with the `values` array rather than left dormant.
- **The second image slot was a live placeholder.** It rendered the labelled
  "Packaging photography" block because `src` was `null`; `newchinchin8.jpeg`
  fills it. I corrected the slot's `note` and `alt` too — the photo is chinchin
  in a white bowl, not packaging, and `note` describes what belongs in the slot,
  so leaving "Packaging photography" would have mislabelled the next
  placeholder anyone sees there.
- **Aspect note:** the source is 500×500 in an `aspect-3/4` slot, so
  `object-cover` crops top and bottom. Fine for a bowl shot centred in frame;
  worth knowing if it ever looks tight.
- **The pipeline products stay UNVERIFIED** — plantain crisps and honey-glazed
  treats are still unannounced, undated and unpriced. The new wording says only
  that they are "in the works", which is the honest framing, and the marker
  says so.
- **Eyebrow is "What's next"**, which now also names the landing page's
  upcoming-products section. That is fine here — both sections genuinely are
  about what is coming — and is why the heritage section above took "Where it
  comes from" instead of reusing it a third time.
- **Verified:** all four new strings render, all ten old ones gone, the
  placeholder block no longer appears, and the pipeline tag renders as plain
  text with its icon. Typecheck, lint, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.

## 2026-09-10 — About tenets → pillars: renamed, de-carded, mobile pass

- **Done:** Renamed the section, rewrote all its copy, removed the card
  treatment from all three cards, and stacked it properly on mobile. 47
  insertions, 75 deletions.
- **Files:** `content/about.ts`, `components/about/about-sections.tsx`.
- **The inconsistency was `inverted` on the middle item.** One content flag
  painted card 2 dark (`bg-cacao text-linen`) while the other two sat light —
  a mock detail, not a state. Removing the flag was the fix; then all three took
  the site-wide borderless treatment: no fill, border, radius, shadow or
  padding, and the icons stand alone in terracotta. The rendered `<li>` is now
  just `flex h-full flex-col`.
- **"Tenet" → "Pillar" across all three**, matching the landing page's
  equivalent section, which already numbers its cards that way.
- **Three dead links removed** — "Pure ingredient purity →", "Guaranteed crunch
  life →", "Luxury keepsake form →". They already rendered as labels rather than
  links because the mock's destinations do not exist; now they are gone
  entirely, along with the `note` field and the `ArrowRightIcon` import.
- **Mobile:** header grid stacks below `md` so the subheading sits full-width
  under the headline instead of half-width beside nothing; the card grid is
  single-column below `sm` with `gap-y-gutter-lg` (40px), since no border marks
  where one card ends now.
- **Type scaling confirmed from the tokens, not measured in a browser.** Every
  size in this section is fluid `clamp()` with a mobile floor —
  `headline-lg` 28→40px, `headline-sm` 18→20px, `body-md` 13→15px, `body-sm`
  12→13px — so it scales down without dropping below a readable floor.
- **The claims are still claims.** "Real butter and pure cane sugar", "sealed
  while it's still warm" and "small batches" were reworded by the owner, not
  confirmed; the `UNVERIFIED` marker stays and now says so.
- **Verified:** all nine new strings render, all ten old ones gone including
  `bg-cacao text-linen`. Typecheck, lint, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.

## 2026-09-10 — About heritage section: image, copy, de-carded tiles

- **Done:** Swapped the image, removed the overlay card, rewrote the copy, and
  stripped the card treatment from both feature tiles. Column layout and spacing
  untouched, and nothing outside the section changed.
- **Files:** `content/about.ts`, `components/about/about-sections.tsx`.
- **Eyebrow: chose "Where it comes from" over "What's next".** The owner offered
  both and said to pick whichever reflects the section's actual topic.
  "What's next" already names the landing page's upcoming-products section, so
  reusing it would have pointed two different sections at the same phrase while
  this one is about where the recipe comes from.
- **Took the optional tile simplification** — "Whole nutmeg, ground fresh for
  every batch." over the longer original. The owner offered it, and it matches
  the plainer voice the rest of the rewrite establishes.
- **Removing the overlay cleared another invented figure.** The "Acoustic
  metric / The Signature Micro-Crunch" card described a micro-layered structure
  nothing measures; its `overlay` content was deleted, not left dormant, and
  `SoundIcon` went with it.
- **The process claims are still claims.** "Slow frying in small batches" and
  "ground fresh" were reworded by the owner, which is not the same as confirmed;
  the `UNVERIFIED` marker was kept and reworded to say exactly that.
- **`chinchin11.png` is now referenced nowhere** — it was this section's image
  and, before the database move, Cinnamon Chinchin's product photo. Left in
  `public/images` rather than deleted, like `card.png` and `workspace1.png`
  before it; unreferenced public files are never fetched.
- **Verified:** all eight new strings render, all seven old ones are gone, the
  tiles render as bare `<li>` with no fill or border, and the new image loads.
  Typecheck, lint, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.

## 2026-09-10 — About hero: closed the gap between the columns

- **Done:** Hero columns now read as a pair — horizontal gap 64px → 40px, split
  6/6 → 7/5, and the image no longer sits inset from the gap.
- **Files:** `components/about/about-sections.tsx` (hero only).
- **The main cause was the previous pass's own change.** `md:ml-auto md:w-5/6`
  shrank the image and pinned it right, which left ~108px of dead space on its
  left *on top of* the 64px grid gap — about 172px of apparent separation. The
  brief's third point described exactly that. Both classes are gone.
- **The image is the same size on screen.** At the 1360px container, 5 of 12
  columns with a 40px gap is ~543px; it was ~540px at 6 columns × 5/6. Within
  3px, so "do not change the image size" holds while the inset disappears.
- **`gap-x` and `gap-y` split deliberately.** Only the horizontal gap dropped to
  40px; the vertical stayed at 64px, since that is the stacked-mobile rhythm and
  the brief ruled vertical spacing out of scope. A plain `gap-gutter-lg` would
  have changed both.
- **Scoped to the hero.** Three other sections in the same file use an identical
  `grid items-center gap-gutter-xl md:grid-cols-12` string; the edit was
  anchored between `AboutHero` and `AboutHeritage` so a blind
  search-and-replace could not touch them. Verified all three still carry the
  original grid.
- **Verified:** the rendered hero is `grid items-center gap-x-gutter-lg
  gap-y-gutter-xl md:grid-cols-12` with `md:col-span-7` / `md:col-span-5`, the
  image container is back to plain `relative aspect-4/5 …`, and no `md:ml-auto`
  or `md:w-5/6` remains anywhere on the page. Typecheck, lint, build and
  `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.

## 2026-09-10 — About hero image sized down

- **Done:** Shrunk the About hero photograph by ~17% and right-aligned it.
  One class change: `md:ml-auto md:w-5/6` on the image container.
- **Files:** `components/about/about-sections.tsx`.
- **`w-5/6` rather than an arbitrary percentage** — a standard Tailwind
  fraction lands at 16.7% narrower, inside the requested 15–20% band without a
  magic number. `aspect-4/5` keeps the ratio, `ml-auto` keeps it right-aligned.
- **Scoped to `md` and up.** Below that the column is full width and stacked, so
  a narrower right-aligned image would sit oddly off-centre rather than looking
  deliberate.
- **On the blurriness:** the source is 2486×1728, so it is not short of pixels.
  The softness comes from `aspect-4/5` (portrait) against a 1.44 landscape
  source — `object-cover` crops the sides hard and stretches what remains across
  the full column. Rendering into a smaller box means fewer output pixels for
  the same crop, which is why sizing down sharpens it. If it is still soft, the
  aspect mismatch is the lever, not the size.
- **Filename note:** the owner referred to "newchinchin7" and then corrected
  themselves. `newchinchin7.jpeg` exists in `public/images` but is referenced
  nowhere — it is a bowl of chinchin with no packaging text, so it could not
  have been the image described. The About hero is and stays
  `cinnamonvelvetsingle.jpeg`.
- **Verified:** the container renders
  `relative aspect-4/5 … md:ml-auto md:w-5/6`, the image is unchanged, and the
  previous pass's pill, badge and stat changes are all still in place.
  Typecheck, lint, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.

## 2026-09-10 — About hero: copy, pill, badges, image swap

- **Done:** The owner's About-hero pass — pill stripped, copy replaced, stats
  reworded, both on-image badges removed, hero photograph swapped. Scoped to the
  hero; nothing below it touched.
- **Files:** `content/about.ts`, `components/about/about-sections.tsx`.
- **Removing the badges cleared another invented batch number** —
  "LF-0842 · Fresh fry". Same fiction already removed from the landing hero
  ("Batch Kettle No. 042"), the shop header ("Batch No. 842") and the product
  gallery ("N° 84"). `badge` and `batch` were deleted from the content, not left
  dormant.
- **The stat rewording is not a verification.** "100% pure butterfat", "Zero
  preservatives" and "48 hrs fresh to pack" are still three claims about the
  food, and the `UNVERIFIED` marker was kept and reworded to say so explicitly.

### ⚠ The new image carries claims the code cannot control

`cinnamonvelvetsingle.jpeg` is **genuine Lamie Foods artwork**, so none of the
third-party trade-dress concerns that apply to the storefront stand-ins apply
here. But two things are printed on the pouch and now legible on the About page:

1. **Health claims** — "Rich in Fiber", "For healthy Heart", "Rich in Vitamins",
   plus a "Certified Quality" mark. The owner's original brief for this project
   explicitly forbids inventing health claims, and a heart-health claim is
   regulated. It makes no difference that these arrive as pixels: the page
   states them either way, and pixels bypass every text-level check here. If the
   physical packaging carries them, they need substantiating — a packaging
   decision, not a code one.
2. **"Net Weight 200g"** — not a size the brand sells. The confirmed range is
   100g / 300g / 500g (GAP-015). A visitor reading About and clicking through to
   the shop finds no 200g pack.

Both recorded in GAP-006 and in a comment beside the image in `about.ts`.
Applied as asked rather than worked around: the owner chose the image and it is
their own product.

- **Verified:** typecheck, lint, build and `prettier --check` pass; the diff is
  32 insertions and 36 deletions across two files, all within the hero.
- **Docs updated:** progress.md, gaps.md.
- **Gaps:** GAP-006 extended.

## 2026-09-10 — Settings restructured to one page

- **Done:** Five tabs → one page with two stacked sections. Brand, Storefront,
  Environment and "Before launch" removed; Delivery & payment and Team & access
  merged. 141 insertions, 526 deletions.
- **Files:** `components/admin/settings-view.tsx`, `content/admin-settings.ts`,
  `app/admin/(portal)/settings/page.tsx`; deleted
  `components/admin/settings-tabs.tsx`.
- **The tab strip went too.** The brief said to drop the tab navigation since
  only one page remains — correct: a tab control over two sections costs a click
  to reveal half a short page.
- **Deleted rather than left dormant**, matching how this codebase has handled
  every other removal. `SETTINGS_BRAND`, `SETTINGS_ENVIRONMENT`,
  `SETTINGS_READINESS`, `settingsStorefront`, `ReadinessState` and the whole
  `SettingsTabs` component were orphaned by the change — all six confirmed
  unreferenced before removal. `admin-settings.ts` no longer imports `env`,
  `Product`, `BRAND`, `ROUTES` or `server-env` at all.
- **The route got simpler as a side effect.** `listProductsForAdmin()` existed
  only for the storefront panel, so the page's `isDatabaseConfigured()` branch
  and its product query are gone — `getSettings()` already falls back to the
  `packages/config` constants without a database.
- **⚠ Two things no longer surface anywhere the owner will see them.** Recorded
  in `settings-view.tsx`'s doc comment so a future session does not have to
  rediscover them:
    - The **environment panel** reported which variables were set (presence
      only, never values). `DATABASE_URL` and the admin credentials being unset
      is precisely what makes the storefront render empty and `/admin` 404 —
      the exact symptoms reported on 2026-09-09. That is now diagnosed from
      `.env.local` rather than from the screen.
    - **"Before launch"** listed the open launch blockers (GAP-004 unverified
      prices and claims, GAP-007 the unconfirmed allergen statement). **Both are
      still open.** They now live only in `docs/ai-memory/gaps.md` — which the
      owner is unlikely to read, which was the reason that section existed.
- **Preserved as asked:** the "values are real" banner, the page header, the
  Save changes button, the "Not configured" block under Delivery & payment, and
  the file-reference tags on each section.
- **Verified:** typecheck, lint, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened; GAP-004 and GAP-007 unchanged in status, only less
  visible.

## 2026-09-10 — Inventory page: renamed, and casing cleanup

- **Done:** The owner's copy-only pass on `/admin/inventory`. 9 insertions, 11
  deletions across three files, all text.
- **Files:** `content/admin-dashboard.ts`,
  `components/admin/{inventory-view,inventory-table}.tsx`.
- **Only the sidebar needed the rename.** The page header already read
  "Inventory" — "& Kettles" survived only in the nav, where it named equipment
  this page does not track. Unlike the products rename, there were no
  breadcrumbs or metadata titles carrying the old name; checked rather than
  assumed.
- **The category fix used the existing label map, not string capitalisation.**
  The cell rendered `product.category`, the raw enum member, so it read
  "chinchin". It now renders `CATEGORY_LABELS[product.category]` — the same map
  the admin form's `<select>` shows, so the table and the form cannot disagree
  about what a category is called, and adding a category means one edit rather
  than remembering to capitalise in a second place.
- **Item 4 needed no change** — the filter tabs were already sentence case
  ("All products", "In stock", "Low stock", "Out of stock") *and* already free
  of `uppercase`. Confirmed, as the brief asked.
- **Fourth page running where the casing was CSS rather than copy.** Stat labels
  and table headers were already sentence case in the data.
- **Verified:** no `uppercase` remains on either inventory component; "Kettles"
  survives only inside the explanatory comment; typecheck and lint pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.

## 2026-09-10 — Customers page: copy simplification

- **Done:** The owner's copy-only pass on `/admin/customers` — eyebrow removed,
  three renames, caps cleared. 8 insertions, 17 deletions, all text.
- **Files:** `components/admin/{customers-view,customers-directory}.tsx`.
- **Renames:** "Busiest hub" → "Top location", "Delivery locale" → "Delivery
  area", "Customer dossier" → "Customer details" (in both the empty state and
  the populated panel — the empty state is easy to miss, since it only shows
  before a row is selected).
- **Third consecutive page where the casing was CSS, not copy.** Stat labels,
  table headers and the section eyebrows were all already sentence case in the
  data; `uppercase` classes were capitalising them. Same fix, same benefit: no
  strings rewritten, nothing to drift.
- **Item 3 needed no change** — the filter tabs were already sentence case *and*
  already free of `uppercase`, cleared by the site-wide button-radius pass on
  2026-09-08. Confirmed rather than assumed.
- **⚠ Left capitalised, because the brief did not name them:** five sub-headings
  *inside* the dossier panel — "Spend", "Orders", "Contact", "Delivery
  landmark", "Order history". They now sit under a sentence-case
  "Customer details" title, so the panel is internally inconsistent. One class
  removal each if the owner wants them to match.
- **Verified:** typecheck and lint pass; the diff touches only text and casing.
- **Docs updated:** progress.md.
- **Gaps:** none opened.

## 2026-09-10 — Products page: renamed, and casing cleanup

- **Done:** The owner's copy-only pass on `/admin/products` — "Products & SKUs"
  → "Products", and the caps cleared.
- **Files:** `content/admin-dashboard.ts`, `content/admin-new-product.ts`,
  `app/admin/(portal)/products/page.tsx`,
  `components/admin/{products-view,products-list,edit-product-view}.tsx`.
- **Same finding as the orders page: the casing was CSS, not copy.** Every stat
  label, table header and status badge was already sentence case in the data;
  `uppercase` classes were capitalising them at render. Removing the class was
  the whole fix, so no strings were rewritten and none can drift.
- **Renamed in five places, not the two named.** The brief named the sidebar and
  the page header. Three others referred to the same page and would have
  contradicted it: the browser tab title, the edit-product breadcrumb
  ("← Products & SKUs" landing on a page titled "Products"), and the
  new-product breadcrumb. The owner's reasoning — no SKU column exists — applies
  to all of them equally.
- **The reasoning is recorded next to the label**, since it is conditional: the
  name should be revisited once each pack size carries a trackable code.
  `product_packs.sku` already exists in the schema but is nullable and never
  surfaced, so the condition is checkable rather than a vague "someday".
- **Verified:** no `uppercase` remains in either products component; no
  "Products & SKUs" remains outside that explanatory comment; typecheck and lint
  pass; the diff is 15 lines across six files, all text.
- **Docs updated:** progress.md.
- **Gaps:** none opened.

## 2026-09-10 — Orders page: sidebar naming and copy casing

- **Done:** The owner's copy-only pass on `/admin/orders`. No layout, filter,
  table or styling change — the diff is `uppercase` removals plus two strings.
- **Files:** `content/admin-dashboard.ts`, `components/admin/orders-view.tsx`,
  `components/admin/orders-table.tsx`.
- **Sidebar "Orders & Paystack" → "Orders".** The owner's reasoning holds and is
  worth keeping: these orders also settle by bank transfer, so naming one
  provider in the nav was inaccurate, not just long. The page header stays
  "Orders & fulfilment".
- **Most of the casing was CSS, not copy.** The stat labels, tab labels, table
  headers and payment badges were already sentence case in the data —
  `uppercase` classes were capitalising them at render. Removing the class was
  the whole fix, so no strings had to be rewritten and nothing can drift.
- **One genuine label change:** the third stat card was
  `Showing (${TAB_LABEL[activeStatus]})` and is now "Total value".
- **⚠ Worth watching:** that card's value is `formatKobo(totalValue)` for the
  **current filter**, not all time. The old label carried the filter name, so
  "Showing (Pending)" was self-explanatory; "Total value" on the Pending tab
  reads as an all-time figure while showing a filtered one. The owner asked for
  the label explicitly and it is a money figure, so it is flagged rather than
  quietly re-worded — appending the filter name only when one is active would
  fix it without losing the requested wording.
- **Verified:** no `uppercase` remains in either orders component; typecheck and
  lint pass; the diff touches only text and casing.
- **Docs updated:** progress.md.
- **Gaps:** none opened.

## 2026-09-10 — Admin: copy pass, layout fix, and a real mobile build

- **Done:** All three parts of the owner's admin brief — copy and casing, the
  empty-space bug, and a proper responsive pass.
- **Files:** new `components/admin/admin-mobile-nav.tsx`; rewrote
  `admin-shell.tsx`; updated `admin-nav.tsx` and `admin-dashboard.tsx`.

### The empty-space bug was the pinned layout, not a stretch bug

The owner guessed a flex/grid stretch mismatch. It was closer to the opposite:
the shell was `lg:h-dvh lg:overflow-hidden` on the grid with the content column
scrolling **inside itself**. That is a deliberate console pattern — the nav
never scrolls away — but it forces the content column to exactly one viewport
height, so any short page (Settings most visibly) drew its content at the top
and a tinted void beneath, with no way to size to itself.

Fixed by moving the pinning from the shell to the sidebar: the grid takes
`lg:items-start`, so each column takes its natural height, and the aside is
`lg:sticky lg:top-0 lg:h-dvh` instead. The nav still stays put while scrolling a
long dispatch table, short pages no longer leave a void, and the page scrolls
normally — which is also what makes the mobile drawer straightforward. **Applies
to every admin page**, since they all render through `AdminShell`.

### Mobile

- **Sidebar → off-canvas drawer** below `lg` (`AdminMobileNav`). It behaves like
  a dialog: Escape, outside tap, close-on-navigate, background scroll lock, and
  focus returned to the toggle. Everything crowded out of the top bar moved
  *into* it rather than being dropped — the store link and the
  signed-in/sign-out controls sit under the nav, so nothing is unreachable on a
  phone.
- **`AdminNav` is now always vertical.** It used to collapse into a horizontal
  scroller below `lg`, which is exactly what put six items and their icons into
  a strip narrower than any of them. One layout to reason about now.
- **Top bar** keeps only what fits on mobile: hamburger, status pill, bell.
- **Recent orders → stacked cards below `md`.** A six-column table at 375px
  truncated every cell ("Coco Velvet Chi…"); a scroller inside a card is easy to
  miss one-handed. The table returns from `md`, still inside its own
  `overflow-x-auto`.
- **Wrapping fixes:** the date-range group (three fixed chips that pushed the
  row past the viewport), the Export CSV / All orders pair, and the low-stock
  Edit row.
- **Stat cards already stacked** below `sm` — no change needed.

### Copy

Removed the "Admin suite" subtitle and five tracked-out eyebrows; headline is
"Dashboard overview."; table headings are sentence case with Selection → Item
and Fulfilment → Status. Payment badges get a `PAYMENT_LABEL` map — the column
value is lower-case, so an unpaid row rendered a literal "unpaid" next to a
capitalised "Paid" in the same column.

- **Verified:** typecheck, lint, build and `prettier --check` pass; `/admin`
  still 404s without a session, so the gate survived the shell rewrite; every
  wide admin table sits inside its own `overflow-x-auto`, so no page-level
  horizontal scroll. **Not verified by pixel measurement** — the admin needs a
  session cookie to render, so 375/414px were reasoned about from the markup,
  not measured in a browser. Worth an eyeball once signed in.
- **Docs updated:** progress.md.
- **Gaps:** none opened.

## 2026-09-08 — Product detail page: badges, cards and copy

- **Done:** The owner's full product-page pass, applied to **all three
  products** — everything is driven by shared components and per-product data,
  so there is no per-product markup to keep in step.
- **Files:** `content/products.ts`, `app/shop/[slug]/page.tsx`,
  `components/product/{product-gallery,product-purchase}.tsx`.
- **Five per-product `detail` fields deleted, not just unrendered:**
  `heroBadge`, `batchSeries`, `atelier`, `tagline`, `description`. Removing the
  first two closes more of GAP-004 — the hero badges asserted
  **"100% Churned Butter"**, and the batch series printed **"N° 84" / "N° 61" /
  "N° 47"**, numbers nothing tracks, the same fiction as the shop header's
  "Batch No. 842" and the hero's "Batch Kettle No. 042", both already removed.
  Left in the type they would have been one JSX line from returning.
- **`description` is gone rather than shortened.** The product page and the shop
  grid now both render `product.body`, so the two pages cannot describe the same
  product differently. The page `<meta description>` follows the same field —
  shorter than an SEO-ideal 150 chars, but true and consistent, and search
  engines rewrite these anyway.
- **De-carded:** the price block and the trust list both lost their fill, border
  and padding. The price label is "Price", the brand wordmark is `Lamie Foods`
  in normal casing rather than tracked-out capitals.
- **Size selector:** label is "Select size"; the pack name that floated to the
  right of it is gone — the options below already show the selection. Unselected
  options lost their fill for a hairline, selected keeps its state, and the
  radius moved to `rounded-md` so the picker matches the shop grid's.
- **Delivery wording already matched.** `PRODUCT_ASSURANCES` interpolates
  `DELIVERY.minDays`–`maxDays`, so it was already rendering
  "Fast nationwide delivery (1–5 business days)" with a true en-dash. Confirmed
  rather than changed.
- **Verified on all three product pages:** no leftover badge, atelier, tagline,
  batch-series or old-description strings; "Price" and "Select size" present;
  each page shows its own shop-grid sentence; price block and trust list carry
  no border or fill; both actions and the size options render at `rounded-md`
  with no `uppercase`. The two remaining "Crafted for Good Taste" hits are the
  footer tagline and the JSON-LD slogan — both correct. Lint, typecheck, build
  and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** GAP-004 further reduced — two more invented claims gone.
- **Next / open threads:** unchanged, minus the ones closed here.

## 2026-09-08 — Whole shop tile is clickable

- **Done:** Clicking anywhere on a shop product tile opens its product page, not
  just the "View details" button.
- **Files:** `components/shop/product-card.tsx`.
- **Stretched the existing link rather than adding one.** "View details" already
  points at the product page and already carries an accessible name, so it takes
  an `after:absolute after:inset-0` overlay covering the tile. That keeps
  **exactly one link per product** in the accessibility tree — verified. Adding a
  second link on the product name would have duplicated the destination, which
  is the same problem the landing row had before it was fixed (three links per
  card, one of them an empty box).
- **Note the deliberate difference from the landing row**, which puts its link
  on the product *name*: that card has no "View details" control to reuse, so
  the heading is the only sensible anchor. Here reusing the CTA avoids a
  duplicate. Same behaviour, different anchor, for a reason.
- **The controls had to be raised.** The size selector and "Add to bag" come
  before the overlay in DOM order, so without `relative z-10` every tap on a
  size or on add-to-bag would have navigated to the product page instead of
  doing its job. Both are raised; verified two raised groups per card.
- **Verified:** three cards, one product link each, overlay present on all
  three, and `group-hover:text-terracotta` gives the tile a hover cue like the
  landing row. Lint, typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.
- **Next / open threads:** unchanged.

## 2026-09-08 — Shop's last two sections: atelier callout and trust strip

- **Done:** De-carded the "what's coming next" callout, rewrote its copy, and
  put the trust strip in sentence case with its icon chips removed. **The shop
  page is now fully through the owner's pass.**
- **Files:** `content/shop.ts`, `components/shop/atelier-lab.tsx`.
- **Callout:** `rounded border bg-surface-container-low p-inset-card` →
  `border-t border-rule/70 pt-gutter-lg`, the same hairline the manifesto stat
  row and horizon list use. Eyebrow lost `withRule` (that was the dash) and took
  sentence case; the notify button took `text-label-md normal-case` over the
  base's caps — the 6px radius already came from the shared button.
- **Trust strip:** the 40px `bg-secondary-container` chips are gone; each icon
  now stands alone at 24px in terracotta, matching the Three Pillars fix. The
  tinted band stays, as asked.
- **Delivery title still comes from `DELIVERY`.** Only the casing changed —
  `${minDays}–${maxDays} days nationwide delivery` — so the confirmed 1–5 day
  window keeps driving the copy rather than being typed in as a literal.
- **Content-honesty notes:**
  - The new atelier copy still names unannounced products, but only as things
    being worked on — no dates, no prices, no promises. That framing is what
    keeps it out of GAP-004.
  - **"100% churned butter" is still an unverified ingredient claim.** It was
    reworded, not confirmed, and the `UNVERIFIED` marker was kept and reworded
    to say so. The frying copy is now the owner's own words, so that one's
    marker became an attribution instead.
- **Verified:** all nine new strings render, all seven old ones gone, the
  callout container carries only `border-t` with no radius/fill/padding, the
  three titles read exactly as specified with the en-dash intact, and no icon
  chip remains. Lint, typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened; GAP-004 unchanged in status.
- **Next / open threads:** unchanged — GAP-004's remainder (now: the butter
  claim here, `MANIFESTO.stats`, `FLAVOURS.items[].body`), landing badge casing,
  the self-linking gifting button, Flavours/Horizon adjacency, `<ul><div>` in
  four components, two "chin-chin" in `about.ts`, the pillars jar line.

## 2026-09-08 — Shop tiles de-carded, matching the landing row

- **Done:** Removed the outer container from each shop product tile, put both
  actions in sentence case, and lightened the unselected size buttons.
- **Files:** `components/shop/{product-card,shop-catalogue}.tsx`.
- **Same treatment as the landing row, by the same mechanics:** the `<li>` drops
  its border, radius, fill and `overflow-hidden`; the photograph takes over the
  rounding and clipping it used to inherit from the wrapper; the body drops
  `p-inset-card` so the copy starts flush with the image's left edge. Verified
  the rendered `<li>` is just `flex h-full flex-col`.
- **Grid gap widened** to `gap-x-gutter-lg gap-y-gutter-xl`, matching the
  landing. The brief said not to change the grid layout, and the column count is
  untouched — but the boxes were contributing 24px of padding on each side, so
  without a wider gap the three blocks of copy would sit *closer* together than
  they did inside their borders. The gap is what the brief asked to do the
  separating.
- **Size buttons:** unselected lost `bg-surface`, keeping a 1px `border-rule`
  hairline; selected keeps `bg-cacao text-linen` because a solid fill there is
  state, not decoration.
- **Both actions** now carry `text-label-md normal-case`, the same override used
  on the hero, final CTA and landing add-to-bag.
- **Verified:** no `border`, `rounded`, `shadow`, `bg-*` or padding on the tile;
  image keeps `overflow-hidden rounded`; both size states render as intended.
  Lint, typecheck, build and `prettier --check` pass.
- **Docs updated:** progress.md.
- **Gaps:** none opened.
- **Next / open threads:** unchanged — GAP-004's remainder, the landing badge
  still uppercase against the shop's sentence case, the self-linking gifting
  button, Flavours/Horizon adjacency and Horizon's outer panel, `<ul><div>` in
  four components, two "chin-chin" in `about.ts`, and the pillars line
  mentioning a jar.

## 2026-09-08 — Three pouch sizes and real prices — GAP-015 closed (filed as GAP-011 at the time; renumbered 2026-09-09 after a collision with the backend branch)

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
- **Gaps:** **GAP-015 CLOSED** (filed as GAP-011 at the time).
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
## 2026-09-08 — Inline order operations and dispatch CSV

- **Done:** Added the forward-only status dropdown to every `/admin/orders`
  row, made rows and a visible action open full order details, and promoted
  phone, email, address, city/state, and landmark into a clear dispatch card.
  Replaced the disabled dashboard export with an authenticated all-orders CSV
  download available from both dashboard and orders page.
- **Files:** `components/admin/{orders-table,order-status-control,
  order-detail-view,orders-view,admin-dashboard}.tsx`,
  `components/ui/button.tsx`, `server/orders/{repository,csv}.ts`,
  `app/api/admin/orders/export/route.ts`.
- **Decisions:** CSV includes delivery PII by explicit owner choice but excludes
  IDs, access tokens, and payment references; it is generated server-side with
  formula neutralisation and no-store/nosniff attachment headers.
- **Docs updated:** `api-integration.md`, `architecture.md`, `gaps.md`,
  `progress.md`.
- **Gaps:** GAP-001 expanded with CSV security/contract coverage; no new gap.
- **Verified:** CSV quote/formula/Unicode assertions, unauthenticated `401`,
  monorepo typecheck/lint, whitespace checks, and isolated production build
  pass; the build lists `/api/admin/orders/export` as dynamic.
- **Next / open threads:** Refresh the open admin pages to see the new controls;
  add automated route/UI coverage when GAP-001 is addressed.

## 2026-09-08 — Forward-only admin fulfilment and delivery emails

- **Done:** Replaced arbitrary admin status changes with the server-enforced
  `pending → paid → processing → shipped → delivered` workflow; cancellation
  is available only before dispatch and fulfilment requires confirmed payment.
  Manual bank-transfer confirmation now also moves a pending order to `paid`.
  Dispatch and delivery email flags use permanent milestone timestamps, so
  reversals, retries, and concurrent stale writes cannot duplicate an attempt.
- **Files:** `packages/types/src/order.ts`, `server/orders/repository.ts`,
  `app/api/admin/orders/[reference]/route.ts`, `lib/api/admin-orders.ts`,
  `components/admin/order-status-control.tsx`.
- **Decisions:** The shared transition graph drives both UI and server, but the
  locked server transaction remains authoritative; invalid/stale writes return
  `409 ORDER_STATUS_CONFLICT`. Full rationale is in `architecture.md`.
- **Docs updated:** `api-integration.md`, `architecture.md`, `gaps.md`,
  `progress.md`.
- **Gaps:** GAP-001 expanded with transition/concurrency/idempotency coverage;
  GAP-012 remains open because failed best-effort email attempts are not
  retryable or visible to the owner.
- **Verified:** transition-helper assertions, monorepo lint and typecheck, and
  `NEXT_DIST_DIR=.next-verify npm run build` all pass.
- **Next / open threads:** Add a test runner before relying on manual coverage;
  add persisted email failure/resend support if GAP-012 is prioritised.

## 2026-09-08 — Admin-editable WhatsApp number & bank-transfer details

- **Done:** The owner asked to be able to change the WhatsApp contact number
  themselves (they may switch to a dedicated business number later) without
  a code deploy. Built the first genuinely admin-writable setting in the
  app: a `site_settings` table (singleton row) holds the WhatsApp number and
  bank-transfer details (name/account number/account name), editable from a
  new form on `/admin/settings`'s "Delivery & payment" panel. Since bank
  details were hardcoded the same way in the same file and about to need
  the same treatment for GAP-013, both moved together in one pass (owner
  confirmed this scope). `packages/config/src/payment.ts`'s old constants
  are now only the fallback used when `DATABASE_URL` is unset.
- **Files:** new `migrations/0005_settings.sql`, `server/settings/
  repository.ts` (`getSettings`/`updateSettings`), `lib/admin/settings-
  schema.ts`, `app/api/admin/settings/route.ts`, `lib/api/admin-settings.ts`,
  `components/admin/payment-settings-form.tsx`. Edited `packages/config/src/
  payment.ts` (added the shared `PaymentSettings` type), `components/admin/
  settings-view.tsx` + `app/admin/(portal)/settings/page.tsx` (wire the form
  in), `content/admin-settings.ts` (updated stale "deliberately not built"
  framing for this one panel), `app/order-success/page.tsx` +
  `components/order/payment-actions.tsx` (consume the DB-backed value as
  props instead of a static `@lamiefoods/config` import — the same
  props-only rule GAP-009 already established for this file).
- **Decisions:** full rationale in `architecture.md`'s 2026-09-08 rows — a
  singleton table over a generic key-value settings store; bank fields
  all-or-nothing (matches the existing display-side rule); `PaymentSettings`
  type lives in `@lamiefoods/config`, not the `server-only` repository file,
  so it can reach client code cleanly.
- **Docs updated:** architecture.md (status header, 4 new decision rows),
  gaps.md (GAP-013 — the fix is now a form, not a code edit; only real
  numbers are missing), api-integration.md (new `PATCH /api/admin/settings`
  entry), progress.md (this entry).
- **Gaps:** GAP-013 narrowed further — the mechanism to set bank details
  now exists, only the owner's real numbers are still missing.
- **Verified:** typecheck/lint/format clean. Full real end-to-end pass
  against the live database via the actual API (not mocked): saved
  WhatsApp-number-only (bank fields blank) — succeeded; attempted one bank
  field alone — correctly rejected `400` with the all-or-nothing message;
  saved all three bank fields + WhatsApp — succeeded, confirmed the values
  round-tripped back into the settings form on reload, AND confirmed a real
  `/order-success` page picked up the new values immediately with no
  redeploy (the actual point of the feature). **Cleaned up before finishing:**
  the verification pass used fake bank details ("GTBank"/"0123456789") and a
  fake WhatsApp number to prove the mechanism works — these were cleared
  back to the real WhatsApp number and `null` bank fields immediately after,
  since (unlike the test orders from the previous session, which are
  harmless to leave) a fake bank account left live on the customer-facing
  page would tell a real customer to wire money to a fake account.
  `NEXT_DIST_DIR=.next-verify npm run build` confirms `/api/admin/settings`
  is `ƒ` (dynamic), same as every other admin route.
- **Next / open threads:** Owner can now enter real bank details themselves
  whenever ready — no engineering follow-up needed for GAP-013. Everything
  else from the previous entry's open threads (Paystack keys, Blob token,
  `ORDER_EMAIL_TO`, real stock quantities, tests) is unchanged.

## 2026-09-08 — Launch-readiness pass: real dashboard/customers/inventory, admin write-cookie bug fixed

- **Done:** Owner reported the admin dashboard showing an invented ₦1,842,500
  "Settled revenue" and asked for the project to be launch-ready. Root cause:
  `content/admin-dashboard.ts` was 100% sample content (disclosed by an
  on-page banner) still fully wired into the live component — not a bug in
  any computation. Fixed by making every remaining admin screen real:
  `/admin`'s full dashboard (settled revenue, order/customer counts, a real
  7-day revenue-by-flavour chart, best sellers, recent orders, low-stock
  alerts — all from `server/orders/repository.ts`/`server/products/
  repository.ts`), `/admin/customers` (derived from `orders`/`order_items`
  grouped by email — there is no `customers` table), and `/admin/inventory`
  (one row per product — stock is tracked per product, not per pack size).
  `/admin/settings`'s one non-real panel (reading the now-deleted static
  `content/products.ts`) was repointed to the live catalogue too, so it can
  keep its "everything here is real" promise. Two sample-data features were
  removed outright rather than kept fake: a rider/delivery-fleet tracking
  card and packaging-materials stock — neither has ever had a real data
  source. Also set `WHATSAPP_NUMBER` (owner-supplied, temporary number) in
  `packages/config/src/payment.ts`; `BANK_TRANSFER` stays `null` (GAP-013).
- **Two real bugs found and fixed while verifying this end-to-end** (placing
  a real order via the API and clicking through the real admin actions, not
  just loading pages):
  1. `stockStatus()` lived in a `"use client"` file and was called directly
     from a Server Component — compiles and typechecks fine, throws at
     request time ("Attempted to call stockStatus() from the server but
     stockStatus is on the client"). Fixed by moving it to a plain shared
     module, `lib/admin/stock-status.ts`.
  2. The admin session cookie's `path: "/admin"` silently withheld the
     cookie from every admin **write** call (`/api/admin/...`) while every
     admin **page load** kept working — `/admin` is not a path-prefix of
     `/api/admin/...`. A signed-in admin would get a confusing 401 on
     mark-paid, status updates, product save, and sign-out. Fixed by
     changing the cookie's path to `"/"`. Full writeup in `architecture.md`'s
     Gotchas — this is exactly the class of bug that only end-to-end
     verification catches, not lint/typecheck/page-rendering.
- **Files:** new `lib/admin/stock-status.ts`; rewrote `app/admin/(portal)/
  page.tsx`, `components/admin/{admin-dashboard,revenue-chart,customers-view,
  customers-directory,inventory-view,inventory-table}.tsx`,
  `app/admin/(portal)/{customers,inventory,settings}/page.tsx`,
  `content/admin-settings.ts` (storefront panel now a function taking real
  products), `server/admin/session.ts` (cookie path fix). Added
  `getDashboardStats`/`getRevenueTrend`/`getBestSellers`/
  `listCustomersForAdmin` and a `customerEmail` field on `AdminOrderSummary`
  to `server/orders/repository.ts`. Deleted `content/{admin-customers,
  admin-inventory,admin-order-detail,products}.ts` — all fully dead once
  their last real consumers were rewritten (`admin-order-detail.ts` turned
  out to already be orphaned, referenced only in a comment).
- **Decisions:** full rationale in `architecture.md`'s 2026-09-08 rows — real
  data over honest-but-stripped placeholders; no invented percentage deltas;
  removing (not reskinning) the two features with zero real data source;
  per-product not per-pack inventory; customers keyed by email with no new
  table; the cookie path fix.
- **Docs updated:** architecture.md (status header, 8 new decision rows, 2
  new Gotchas), gaps.md (GAP-009 fully resolved including the cookie bug,
  GAP-010's stale file references updated, GAP-013 split — WhatsApp resolved,
  bank details still open), progress.md (this entry).
- **Gaps:** GAP-009 resolved (all admin data real, auth actually works
  end-to-end); GAP-013 narrowed to bank-transfer details only; GAP-010's
  location note updated (its files were deleted, the underlying compliance
  gap is unchanged and stays open). No new gap opened for either bug found —
  both were fixed in the same session, documented as Gotchas/decision rows
  instead per house rule 8's spirit (nothing vanishes with the session).
- **Verified:** typecheck/lint clean throughout. Placed two real orders
  through `POST /api/orders` (kept in the database at the owner's choice —
  not test fixtures to clean up); marked one paid via the real
  `PATCH /api/admin/orders/:reference` (this is what surfaced the cookie
  bug); confirmed after the fix that settled revenue, order count, customer
  count, best-sellers, the revenue chart, recent-orders table, the new
  customer's row on `/admin/customers`, and stock decrement (clamped at 0 —
  all three products were seeded with zero stock, real quantities are an
  owner input, not a code fix) all updated correctly. Confirmed the
  `/order-success` WhatsApp fix: with only `WHATSAPP_NUMBER` set, the button
  reads "Message us on WhatsApp" (general contact), never "Send payment
  proof" — verified on a live unpaid order. `NEXT_DIST_DIR=.next-verify npm
  run build` confirms `/admin`, `/admin/customers`, `/admin/inventory`,
  `/admin/settings` are all `ƒ` (dynamic), same as every other admin route.
- **Next / open threads:** Owner still needs to supply bank account details
  (GAP-013) and set real stock quantities per product (currently all zero
  from the seed migration — every product reads as out-of-stock until this
  happens). Live Paystack keys, `BLOB_READ_WRITE_TOKEN`, `ORDER_EMAIL_TO`
  remain unset (owner chose to defer these). `/admin/orders`'s customer
  history lookup (used by the customers dossier) inherits that list's
  existing 50-order cap — fine at current volume, worth revisiting together
  if that page ever gets pagination. Tests remain entirely absent (GAP-001) —
  the two real-world bugs found this session (an RSC boundary violation and
  a cookie-path scoping error) are exactly the kind neither lint nor
  typecheck catches, and neither would a unit test without one that actually
  exercises a real HTTP round trip — worth keeping in mind when GAP-001 is
  finally picked up.

## 2026-09-07 — Real product catalog: admin CRUD, packaging, discounts, photo upload

- **Done:** Products moved from static `content/products.ts` to Postgres
  (`products`/`product_packs`/`product_images` — `migrations/0003_products.sql`,
  seeded from the old file by `0004_seed_existing_products.sql`). Admin can
  now create and edit real products end to end: `/admin/products/new` and
  the new `/admin/products/[id]/edit` (a route `ADMIN_ROUTES.editProduct`
  pointed at with no page behind it until now) both use the same `ProductForm`,
  which actually saves via `POST`/`PATCH /api/admin/products`. New per-product
  fields: `discountPercent` (1-99 or `null`, applied uniformly across every
  pack) and real image upload via Vercel Blob (`@vercel/blob`, client-side
  direct upload — one new dependency) replacing the old decorative
  "Photography" panel that had no `<input type="file">` anywhere. Stock now
  decrements automatically the moment an order is confirmed paid (same
  transaction as `confirmPayment`/`updateOrderStatus`), honoring a promise
  the disabled form copy had been making since before either prerequisite
  existed. The storefront (shop grid, product detail, cart, checkout,
  homepage, related-products, order confirmation) all read the real catalogue
  now and show discounted prices where set.
- **Design simplification:** the DB-backed product matches the ADMIN FORM's
  field set, not the old design's richer "proof"/"provenance" narrative
  structure (flavour-profile percentage bars, an "acoustic crunch" rating,
  hero badges) — that content was always hardcoded, never admin-editable, and
  carrying it forward as DB content nobody could change would have repeated
  the exact "fake permanence" mistake this codebase already refused for admin
  panels. `Provenance` (component) is deleted, replaced by the leaner
  `ProductDetails` (ingredients/allergens, pairings, storage/shelf-life — all
  real, all editable).
- **Architecture refinement made during implementation, not in the original
  plan:** client-side cart/checkout pricing reads the catalogue via a React
  context (`CatalogProvider`/`useCatalog()` in
  `lib/products/catalog-context.tsx`), populated by whichever Server
  Component page already fetched `listPublishedProducts()` — NOT the planned
  public `GET /api/products` + client-side fetch-and-cache layer. The two
  real consumers (`/cart`, `/checkout`) are both Server Component pages that
  can fetch server-side anyway, so the simpler mechanism achieves the same
  goal (no stale static import in a Client Component) with less code, no new
  public endpoint, and no client-side loading state to get wrong.
- **A second static/dynamic bug of the same shape as last session's, caught
  before shipping:** `/shop`, `/shop/[slug]`, `/cart`, `/checkout`, the
  homepage and `sitemap.ts` all now read Postgres directly via the `postgres`
  driver — which, unlike `cookies()`, Next does NOT auto-detect as a
  Request-time API. Left unset, every one of these would have baked today's
  product list into the build permanently. Fixed by adding
  `export const revalidate = 60` to each (ISR, not `force-dynamic` — a
  public catalogue this small doesn't need per-request freshness, and the
  actual charge is always the server re-price at order-creation time
  regardless of what any of these pages happen to show).
- **Files:** new `server/products/repository.ts`, `app/api/admin/{products,
  products/[slug],uploads}/route.ts`, `components/admin/{image-upload,
  edit-product-view}.tsx`, `app/admin/(portal)/products/[id]/edit/page.tsx`,
  `lib/products/catalog-context.tsx`, `migrations/0003_products.sql`,
  `migrations/0004_seed_existing_products.sql`. Rewrote `packages/types/src/
  product.ts` (superseding the unused provisional shape), `lib/cart/
  cart-store.ts` (`resolveLines` takes a catalog param now), `product-form.tsx`,
  `product-schema.ts` (added `slug`/`discountPercent`/`images`), every
  storefront product-display component (`product-card`, `product-gallery`,
  `product-purchase`, `related-products`, `product-suggestions`,
  `shop-catalogue`, `flavours`), `sample-order.ts` (now async, DB-backed).
  Deleted `components/product/provenance.tsx`, `content/admin-products.ts`
  (orphaned once `products-view.tsx`/`products-list.tsx` were rewritten
  against real data).
- **Decisions:** full rationale in `architecture.md`'s 2026-09-07 rows —
  product schema matches the admin form not the old narrative structure;
  discount is one nullable percent per product, never per-tier or `0`;
  `CatalogProvider` over a public endpoint; Vercel Blob for upload; automatic
  stock decrement; `revalidate = 60` on every product-reading page.
- **Docs updated:** architecture.md (status header, decision log ×6, System
  map, Data flow rewrite, 2 new Gotchas — the `TransactionSql` type split and
  the Turbopack Google Fonts network dependency), api-integration.md (3 new
  endpoints), gaps.md (GAP-004 location updated to Postgres, GAP-001 extended
  to cover pricing/discount arithmetic, GAP-009's status line updated —
  `/admin/products` is no longer sample data).
- **Gaps:** GAP-004 (prices) unchanged in substance, relocated; GAP-001
  extended (pricing/discount math now untested); no new GAP opened — the
  build blocker below is environmental, not a code weakness, and is recorded
  in architecture.md's Gotchas instead of the gaps ledger.
- **Verified:** typecheck and lint clean across the whole monorepo. `next build`
  failed twice on `fonts.gstatic.com` being unreachable (confirmed via direct
  `curl`, unrelated to any code here — see architecture.md's Gotchas); network
  recovered mid-session and a clean rebuild confirmed both (1) every
  `/admin/**` route including the two new ones (`/admin/products`,
  `/admin/products/[id]/edit`) is `ƒ` (dynamic) — the `force-dynamic` fix from
  last session correctly covers new admin pages too — and (2)
  `/`, `/shop`, `/shop/[slug]`, `/cart`, `/checkout`, `/sitemap.xml` all show
  `Revalidate: 1m`, confirming ISR is actually active, not silently ignored.
  **Not yet verified: an actual end-to-end order** — no `DATABASE_URL`
  supplied this session, so migrations were never applied against a real
  database.
- **Next / open threads:** apply migrations 0003 and 0004, then place one
  real end-to-end test order against a product with a discount to confirm
  the charged price matches the discounted display and stock decrements
  correctly. `/admin/customers` and `/admin/inventory` are the two remaining
  sample-data admin screens —
  natural next target if the owner wants those real too. The "general UX
  pass" named in this session's plan was not reached given the size of the
  rest of the work — worth a dedicated pass, not squeezed into this one.

## 2026-09-07 — Payment (Paystack + bank transfer) and real admin order management

- **Done:** Orders can now actually be paid, and the owner can actually manage
  them. **Payment:** checkout collects a payment-method choice (Paystack
  default/primary, bank-transfer fallback); `/order-success` is the single
  payment hub (`PaymentActions`) regardless of whether it's the first visit or
  a return via the emailed link. Paystack path: server-generated reference
  (`prepare-payment`) → inline popup → client verify + a webhook backup, both
  calling one idempotent `confirmPaystackPayment`. Paystack charges the
  subtotal only (delivery still unpriced). Bank-transfer path: account details
  + a pre-filled `wa.me` link, gated behind `packages/config/src/payment.ts`
  (currently `null` — GAP-013) until the owner supplies real values. **Admin:**
  `NODE_ENV` gate replaced everywhere with real session auth
  (`getAdminSession()` — one shared credential, HMAC-signed httpOnly cookie,
  `scrypt` via Node built-ins, zero new dependency). `/admin` (needs-dispatch
  section) and `/admin/orders` (list + detail) now show real orders; a live
  `OrderStatusControl` changes delivery status and confirms bank-transfer
  payments manually. Three new emails (payment confirmed / shipped /
  delivered), each idempotent on its own DB timestamp. Added a working
  sign-out button — the login flow didn't have one before.
- **Bug found and fixed before shipping:** a production build with
  `ADMIN_SESSION_SECRET` unset baked every `/admin/**` page as a
  **permanently cached static 404** — `getAdminSession()` checked the secret
  and returned early *before* calling `cookies()`, so Next never detected a
  Request-time API on that path. Fixed by calling `cookies()` first, plus
  `export const dynamic = "force-dynamic"` on every admin page as defense in
  depth. Caught by reading the build's own route table (`○` vs `ƒ`), not by
  lint or typecheck — neither flagged it. Full writeup in `architecture.md`'s
  Gotchas section and GAP-009's 2026-09-07 update.
- **Files:** new `server/orders/paystack.ts`, `server/admin/{auth,session}.ts`,
  `server/security/rate-limit.ts` (generalised from `server/orders/`),
  `app/api/{orders/[token]/{prepare,verify}-payment,webhooks/paystack,
  admin/{login,logout,orders/[reference]}}/route.ts`,
  `components/order/payment-actions.tsx`,
  `components/admin/{order-status-control,sign-out-button}.tsx`,
  `packages/config/src/payment.ts`, `migrations/0002_payments_and_admin.sql`.
  Rewrote `orders-view.tsx`/`orders-table.tsx`/`order-detail-view.tsx` for
  real data (dropped the Kitchen Timeline / Geolocation / Notes / Dossier
  panels — no real data source for any of them). `packages/types/src/order.ts`
  gained `PaymentMethod`.
- **Decisions:** full rationale in `architecture.md`'s 2026-09-07 rows —
  payment on `/order-success` not `/checkout`; server-generated Paystack
  reference bound to the order (closes a reference-replay hole); the
  `force-dynamic` requirement for any cookie-gated route.
- **Docs updated:** architecture.md (status header, decision log ×9, System
  map, Data flow, a new Gotchas entry), api-integration.md (6 new endpoints,
  the Paystack PENDING answer updated), gaps.md (GAP-009 resolved for the auth
  mechanism, GAP-001/GAP-011 updated for the new untested/under-limited
  surface, GAP-013/GAP-014 opened), CLAUDE.md unchanged (rule 10 already
  covered this).
- **Gaps:** GAP-009 (admin auth) resolved as a security gap, open as a content
  gap (products/customers/inventory/settings still sample data behind the
  real gate); GAP-011 raised (rate limiter now also guards admin login);
  GAP-001 updated (payment/auth logic now untested); opened GAP-013 (no bank/
  WhatsApp details yet) and GAP-014 (webhook unregistered, untested against
  live Paystack traffic).
- **Verified:** typecheck/lint/format clean; a from-scratch production build
  succeeds AND its route table was inspected directly — every `/admin/**`
  route is `ƒ` (dynamic), confirming the fix above actually took. **Not
  verified:** an actual Paystack test payment or a real admin login — no
  `PAYSTACK_SECRET_KEY`/`ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH`/
  `ADMIN_SESSION_SECRET` supplied this session.
- **Next / open threads:** owner still needs to supply the bank/WhatsApp
  details (GAP-013), an admin email + a generated password hash (see
  `server/admin/auth.ts`'s header comment for the one-off `node -e` command),
  and, once deployed, register the Paystack webhook URL (GAP-014). Delivery
  fee (Q16) and GAP-004 (prices)/GAP-007 (allergens) still block public
  launch. Products/customers/inventory/settings still show sample data behind
  the now-real admin gate — next natural target if the owner wants those live
  too.

## 2026-09-07 — Guest checkout is real: backend built in `apps/web`, storefront wired to it

- **Done:** Owner overrode CLAUDE.md rule 10 — backend is now Next.js Route
  Handlers in `apps/web/src/app/api/` (`POST /api/orders`, `GET
  /api/orders/[token]`), not the separate `apps/backend`. Backed by Postgres
  (`postgres` driver) + best-effort Resend email (raw `fetch`, no SDK).
  Checkout really submits now (all 4 UI states), `/order-success?token=…`
  renders a real order fetched server-side, "Instant checkout" works. Owner's
  25-answer brief also turned several "unverified" claims into confirmed-false
  — deleted the free-delivery/gift-packaging offers and every "Paystack
  Secured/verified" claim (no Paystack account exists — Q15). No design work:
  the existing system already derives from the brand logo.
- **Security:** every order line is re-priced server-side from
  `content/products.ts` — the request schema carries no price field at all.
  Orders are read back by a 32-byte `access_token`, never the human-readable
  reference. `config/server-env.ts` is `server-only`-guarded so a secret
  importing into a Client Component fails the build, not just a code review.
- **Files:** new `app/api/orders/`, `server/{db,orders,email}/`,
  `config/server-env.ts`, `lib/orders/order-request.ts`,
  `migrations/0001_orders.sql`; `packages/types/src/order.ts` (`OrderItem`
  gained required `pack`; `deliveryFee`/`total` are now `Money | null`);
  `checkout-form.tsx`, `order-success/page.tsx`, `product-purchase.tsx`,
  content files for the removed false claims; `apps/backend/README.md`,
  `CLAUDE.md` rule 10.
- **Decisions:** full rationale is in `architecture.md`'s 2026-09-07 rows —
  backend-in-`apps/web`, plain Postgres only (Supabase now, Railway later),
  Server Components call `server/` directly instead of self-fetching.
- **Docs updated:** architecture.md, api-integration.md (contract recorded,
  PENDING section resolved), gaps.md, CLAUDE.md, `apps/backend/README.md`.
- **Gaps:** closed GAP-008; split GAP-007 (allergens still open); raised
  GAP-001 to high; opened GAP-011 (in-memory rate limit), GAP-012 (silent
  email failures).
- **Verified:** typecheck/lint/format clean; `NEXT_DIST_DIR` build succeeds
  (dev server untouched); live dev server confirms an honest 503 (not a fake
  success) with no `DATABASE_URL`; `.next-verify/static` has zero occurrences
  of any removed false claim. **Not verified:** a real order end-to-end — no
  `DATABASE_URL`/`RESEND_API_KEY` supplied this session.
- **Next / open threads:** owner needs to supply a Supabase transaction-pooler
  connection string and a Resend API key to actually place an order. Paystack
  (Q15), delivery-fee calc (Q16), GAP-004 (prices) and GAP-007 (allergens)
  still block public launch. Admin auth (GAP-009) stays out of scope.

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
