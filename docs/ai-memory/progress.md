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
