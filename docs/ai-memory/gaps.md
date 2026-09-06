# Gaps — known weaknesses ledger

> A living ledger of everything known to be weak: security holes, missing/weak tests,
> fragile edge cases, tech debt. Populated by the `audit-gaps` skill and by persisting
> `/security-review` and `/code-review` findings; updated the moment a new weakness is
> noticed mid-task. **A gap that isn't written here does not exist for the next session.**
>
> Rules:
> - Every gap needs evidence — a real `file:line`, never a hypothetical.
> - Severity reflects the priority order: security > code quality > architecture fit.
> - Fixed gaps move to **Closed** with date + commit; never delete them.
> - IDs are sequential (`GAP-001`, `GAP-002`, …) and never reused.

**Severity guide:** `critical` = exploitable or data-loss now · `high` = will bite users or block a release · `medium` = costs real time or risk if left · `low` = worth fixing opportunistically.

## Open

<!-- Newest gaps at top of their severity group. Keep critical/high at the top of the file. -->

### GAP-008 — The cart mock's free-delivery figure does not add up

- **Category:** content-risk
- **Severity:** low
- **Location:** design mock only; our implementation computes the value.
- **Found:** 2026-09-06 while building the cart
- **Problem:** The mock shows a ₦13,000 subtotal against a stated ₦15,000
  free-delivery threshold, then says "You are **₦4,200** away". ₦15,000 − ₦13,000
  is ₦2,000. Either the threshold is not ₦15,000 or the figure is wrong; the mock
  cannot be both. Line items and subtotal in the mock DO reconcile exactly
  (₦3,600 × 2 + ₦5,800 = ₦13,000), so only this one number is off.
- **Fix:** Our cart derives the remaining amount from the real subtotal and
  threshold, so it currently shows ₦2,000 for that basket — correct, but visibly
  different from the mock. Confirm the real threshold (GAP-007 covers whether the
  offer exists at all) and the number resolves itself.
- **Status:** open — no code change expected

### GAP-010 — No record of who agreed to be contacted

- **Category:** compliance / content-risk
- **Severity:** high (before any marketing feature ships)
- **Location:** `apps/web/src/content/admin-customers.ts` (`CUSTOMERS_OUTREACH`)
  and `apps/web/src/content/admin-order-detail.ts` (`patron.whatsapp`).
- **Found:** 2026-09-06 while building the customer directory
- **Problem:** The mock had a "Broadcast" button for a batch announcement and a
  patron field reading "WhatsApp: Active & verified · opted in for order
  updates". Nothing anywhere records messaging consent — not the checkout form,
  not any API. Shipping a screen that asserts someone opted in is an invented
  permission, and it is exactly how a business ends up messaging people who
  never agreed. Under the NDPA that is the business's liability, not the
  frontend's.
- **Deliberately not shipped:** the opt-in claim (now "Not recorded"), and the
  broadcast control is disabled with the reason stated on the card.
- **Fix:** before any outreach feature is built —
  1. Capture consent explicitly at checkout (separate, unticked, per channel),
     with a timestamp and the wording the customer agreed to.
  2. Store it against the customer and expose it on the API, so the admin shows
     what was actually recorded rather than a default.
  3. Provide an unsubscribe path, and honour it server-side.
  4. Do not let a "select all patrons" control exist before 1–3 do.
- **Status:** open

### GAP-009 — Admin area has no authentication, and must stay empty until it does

- **Category:** security
- **Severity:** critical (if violated)
- **Location:** `apps/web/src/app/admin/` — only `login/page.tsx` exists.
  `ADMIN_ROUTES` in `packages/config` names eight more that are unbuilt.
- **Found:** 2026-09-06 while building the admin sign-in screen
- **Problem:** There is no auth backend, so nothing can protect an admin page.
  The sign-in form validates and then states plainly that sign-in is not
  connected; it creates no session and sends nothing anywhere.
  **The risk is what gets built next.** Adding `/admin`, `/admin/orders` or
  `/admin/customers` before authentication exists would put real order and
  customer data on public URLs — `robots.txt` and `noindex` keep pages out of
  search results, they do not stop anyone who visits the URL.
  A client-side guard is not a substitute: anything the browser checks, the
  browser can be told to skip. Protection has to be server-side.
- **Fix / rules for whoever continues this:**
  1. Do not build any admin page that renders real data until the backend
     provides sessions and the server can reject an unauthenticated request.
  2. The session belongs in an **httpOnly, Secure, SameSite cookie set by the
     backend**. If the backend hands back a token for JS-readable storage,
     record that here as a gap rather than quietly accepting it.
  3. Authorisation is checked server-side on every admin request, not once at
     login.
  4. Rate-limit and log failed sign-ins — the backend's job, but the frontend
     must surface lockouts rather than retrying silently.
  5. Keep sign-in errors non-specific; distinguishing "no such account" from
     "wrong password" lets an attacker enumerate staff addresses.
- **Deliberately not shipped:** the mock's fabricated security telemetry
  ("Node terminal LKI-HQ-04", "Active Operational Handshake", an "ENFORCED"
  badge, "256-Bit Encrypted · Restricted Network"). None of it was true, and a
  badge asserting protection that does not exist trains an operator to trust the
  screen over the system — and would keep reassuring after a real compromise.
- **Update 2026-09-06 — dashboard built, gated, and a leak found and closed.**
  `/admin` now exists but is compiled out of production: the page calls
  `notFound()` before a dynamic `import()` of the dashboard, so the module is
  never evaluated when the gate is closed.
  **The first attempt was not enough and this is the lesson:** gating in the
  *layout* returned a correct 404, but Next still rendered the page component
  and the entire dashboard tree — names, addresses, revenue — came back inside
  the **RSC flight payload of the 404 response** (39KB, greppable with `curl`).
  A 404 that ships the data anyway is not a gate. Verified after the fix: the
  response is 10KB with zero data strings, and zero admin data anywhere in
  `/static`.
  When wiring real data, gate *before* the fetch, and re-run that curl check —
  status codes prove nothing about payloads.
- **Update 2026-09-06 (second leak, different mechanism).** Building `/admin/orders`
  surfaced a *second* way data escapes the gate: `OrdersTable` is a client
  component and imported the sample rows directly. **A client component's imports
  are bundled into client JavaScript**, so every customer name, phone number and
  address shipped in a downloadable `/static` chunk — completely past the
  server-side gate. Fixed by passing rows down as props and keeping the data
  server-side, which is also what real orders will require.
  Two rules now, both learned the hard way:
    1. Gate in the **page**, before any data is read (the RSC payload leak).
    2. Never `import` sensitive data **into a client component** — pass it as
       props from the server (the bundle leak).
  Verification for both: `curl` the route from a production build AND
  `grep -rl <name> .next/static`. A 404 proves nothing about either.
- **Update 2026-09-06 — `/admin/customers` built, the worst case for this gap.**
  That screen is nothing but customer PII: names, emails, phone numbers,
  addresses, spend and order history. Both rules were followed by construction —
  the gate runs in the page before the dynamic import, and `CustomersDirectory`
  receives patrons as props rather than importing them. Verified on a production
  build: the prerendered route is a 404 with zero patron strings in the HTML or
  the RSC payload, and no patron name, phone or address appears anywhere in
  `/static`. **This screen must be the last thing un-gated**, and only once the
  backend rejects unauthenticated requests server-side.
- **Status:** open

### GAP-007 — Regulated and commercially binding claims need owner sign-off

- **Category:** content-risk / legal
- **Severity:** high
- **Location:** `apps/web/src/content/products.ts` (`detail.ingredients.allergens`,
  set to `null` for all three products) and `apps/web/src/content/shop.ts`
  (`ANNOUNCEMENT`).
- **Found:** 2026-09-06 while building the product detail page
- **Problem:** Two items in the mock go beyond marketing copy into territory that
  carries legal weight:
  1. **Allergens.** The mock printed "Contains: Wheat (Gluten), Milk. Free from
     preservatives, artificial colourants, or trans fats." That contradicts the
     landing page's own "whole farm eggs", so the mock's allergen data is
     demonstrably unreliable — and an allergen declaration is a food-safety and
     labelling matter, not copy. Publishing an invented one could genuinely harm
     someone with an allergy. **Deliberately not shipped:** `allergens` is `null`
     and the page renders "Allergen information to be confirmed before
     publication."
  2. **A free-delivery offer.** "Free Lagos delivery on orders over ₦15,000" is an
     invented commercial term the owner has never quoted, and customers could hold
     the business to it. It IS currently rendered, because it is a visible design
     element — but it must be confirmed or removed before launch.
- **Fix:** Owner supplies the real allergen statement (and confirms whether eggs
  are an ingredient — the landing and product copy disagree), then set
  `allergens` per product. Separately, confirm or delete the delivery offer.
- **Update 2026-09-06 — the capture point now exists.** `/admin/products/new`
  has an allergen register, and `lib/admin/product-schema.ts` makes it
  **non-optional**: the form will not validate unless the operator ticks the
  allergens that apply or explicitly confirms none do. Silence is not an
  accepted answer, because a product published with no allergen decision
  recorded is precisely this gap. When the catalogue API arrives, the backend
  must enforce the same rule — a browser-side check is a convenience, not a
  control. This does not close the gap: the three existing products still carry
  `allergens: null`, and nothing about the invented delivery offer has changed.
- **Status:** open — blocks public launch alongside GAP-004

### GAP-004 — Landing page ships unverified product claims from the design mock

- **Category:** content-risk
- **Severity:** high
- **Location:** `apps/web/src/content/landing.ts` — every value marked `UNVERIFIED`,
  notably `PLACEHOLDER_PRICE_FROM` (lines ~31-35), `HERO.stats`, `MANIFESTO.stats`,
  `CRUNCH.profile`, `FLAVOURS.items[].body`, and `HORIZON.items`.
- **Found:** 2026-09-05 while building the landing page
- **Problem:** The approved design mock was generated with sample copy that invents
  specifics the brand has never stated: **prices** (₦3,500 / ₦3,800), sensory scores
  ("9.4 / 10 Crisp Snap"), shelf claims ("Zero Artificial Preservatives", "48 Hrs
  Kettle To Pack"), ingredient origins, a batch number, and three unannounced future
  products. CLAUDE.md forbids inventing exactly these. Publishing them would state
  untrue things about a real food business to real customers — a pricing or
  preservative claim is a consumer-protection matter, not a copy nit.
- **Fix:** Owner to confirm or replace every `UNVERIFIED` value. All of them are
  centralised in one file, so this is an edit pass, not a rebuild. **Do not deploy
  publicly until this is done.** `Product` structured data is deliberately withheld
  from `page.tsx` for the same reason — add it once pricing is real.
- **Status:** open — blocks public launch

### GAP-005 — Supplied photography is below the resolution its slots need

- **Category:** asset-quality
- **Severity:** medium
- **Location:** `apps/web/public/images/` — wired in `apps/web/src/content/landing.ts`.
- **Found:** 2026-09-06 when the first six images were supplied
- **Problem:** `next/image` caps output at the source width — it never upscales —
  so a small source stays small and the browser stretches it. Measured against each
  slot's desktop CSS width (1360px envelope):

  | image | slot | source | CSS px | needs @2x |
  |---|---|---|---|---|
  | `chinchin10.png` | Coco card | 310px | 408 | 816 |
  | `chinchin11.png` | Cinnamon card | 310px | 408 | 816 |
  | `chinchin7.png` | Manifesto | 444px | 612 | 1224 |
  | `workspace1.png` | Coffee feature | 580px | 612 | 1224 |
  | `chinchin8.png` | Crunch | 616px | 612 | 1224 |
  | `chinchin5.jpg.png` | Hero | 1600px | 1360 | 2720 |
  | `card.png` | Philosophy card | 219px | 219 | 438 |

  Four are short of their slot even at 1x, so they are visibly soft on any
  display; all six are short at 2x, which is most phones and laptops. Verified by
  requesting `w=1920` from the optimiser and getting 310px back.
- **Fix:** Re-export at roughly 2x the CSS width — ~1600px for product cards and
  feature images, ~1200px for the manifesto portrait, ~2700px for the hero. Source
  format does not matter (`next/image` re-encodes to AVIF; the 2.6MB hero PNG ships
  as 69KB), so favour the largest original available.
- **Also:** `card.png` is placed as artwork rather than markup at the owner's
  request, so its wording ("Philosophy — Good food respects the craft.") lives in
  the pixels. It is carried in `alt`, but it cannot be selected, resized with the
  browser's text controls, or read as text by search engines, and it will not
  restyle with the design system. If that matters, rebuild it as markup — the
  design's line break falls after "respects".
- **Status:** open

### GAP-006 — Two supplied images carry baked-in artwork that conflicts with the UI

- **Category:** asset-quality · content-risk
- **Severity:** medium
- **Location:** `apps/web/public/images/chinchin11.png`, `chinchin7.png`
- **Found:** 2026-09-06
- **Problem:** Two separate issues:
  1. `chinchin11.png` (Cinnamon card) has an **"AROMATIC HEARTH" badge rendered into
     the pixels** at top-left, exactly where `flavours.tsx` positions its own badge
     component — they overlap. It also shows a laptop displaying a mocked-up Lamie
     Foods website, so it reads as a marketing render rather than product photography.
  2. `chinchin7.png` (Manifesto) shows packaging labelled **"LAMIE FOODS
     ENTERPRISE"** — the exact name that must not appear customer-facing. The code
     avoids that name everywhere, but the photograph reintroduces it.
- **Fix:** Re-export `chinchin11` without the baked-in badge and laptop; the UI
  supplies the badge. For `chinchin7`, either photograph current packaging that uses
  the customer-facing name, or crop so the label is not legible. If the physical
  packaging genuinely reads "Enterprise", that is an owner decision about brand
  consistency, not something to solve in code.
- **Status:** open — needs owner input

### GAP-001 — No test runner or test infrastructure in any workspace

- **Category:** tests
- **Severity:** medium
- **Location:** `package.json` (no `test` script), no runner in `apps/web/package.json`, `apps/backend/package.json`, or any `packages/*/package.json`; `turbo.json:6-29` defines no `test` task. Confirmed: `git ls-files` shows no test files, `grep '"test"'` across all workspace manifests returns nothing.
- **Found:** 2026-09-05 via audit-gaps
- **Problem:** There is no way to write or run a test today. The moment money/cart/checkout logic lands (kobo arithmetic in `packages/types/src/common.ts:4-13`, `OrderItem.lineTotal` in `order.ts`, the `apiFetch` gateway, Paystack flow), it will ship with zero automated coverage on paths where a bug means mischarging a customer or losing an order. The priority order (security → **code quality/tests** → …) ranks this above tech debt, and CLAUDE.md already acknowledges it informally ("Test: none configured — logged as a gap") without it living in this ledger.
- **Fix:** Pick a runner (Vitest fits the Vite/TS + Next 16 stack). Add it as a dev dependency at the root, add a `test` script to each workspace that has logic, and add a `test` task to `turbo.json` (`"test": { "dependsOn": ["^build"] }`). Wire `npm run test` into CI alongside `build` and `lint`. First tests to write when logic exists: kobo `Money` arithmetic and `OrderItem` line-total freezing. Verify: `npm run test` runs and a deliberately broken assertion fails the pipeline.
- **Update 2026-09-06:** no longer hypothetical. `lib/cart/cart-store.ts` and
  `lib/money.ts` now do real money arithmetic (kobo integers, line totals,
  subtotals, free-delivery thresholds) and `sanitise()` guards untrusted
  localStorage input. These are exactly the paths where a silent bug mischarges
  a customer, and none of them has a test. Raise to **high** once checkout lands.
- **Status:** open

<!-- not yet audited (surface does not exist yet — re-run audit-gaps when it lands):
     real pages/components, live API endpoint modules in apps/web/src/lib/api/,
     auth on admin routes, Paystack payment flow, apps/backend (owned by backend dev). -->

## Closed

<!-- Move entries here when fixed. Keep them — they document why the code is the way it is. -->

### GAP-003 — Two design-system colour pairs failed WCAG AA for text

- **Category:** accessibility · **Severity:** medium · **Found:** 2026-09-05
- **Was:** The superseded "Artisanal Confectionery System" specified an orange CTA
  (`#E65B00` + white) at **3.58:1**, failing AA on the most important buttons on the
  site, plus a placeholder tone at 3.19:1.
- **Fixed:** 2026-09-05 — resolved by the owner replacing the design system with
  "Artisanal West African Confectionery", not by a code workaround.
- **How:** The new palette's primary CTA is linen `#f4ece1` on terracotta `#a84c2c` =
  **4.80:1 (passes)**. All 17 foreground/background pairs actually used on the landing
  page were re-checked and every one passes AA; the worst is 4.80:1. Re-run that check
  whenever the palette changes.

### GAP-002 — Sitemap advertises routes that don't exist yet (indexable 404s)

- **Category:** edge-case · **Severity:** low · **Found:** 2026-09-05 via audit-gaps
- **Was:** `sitemap.ts` listed `/shop` and `/about`, which have no route (only `page.tsx`/home exists) — indexable 404s once deployed. `robots.ts:9` allows `/`, `layout.tsx` sets `index: true`.
- **Fixed:** 2026-09-05 (uncommitted working tree — not yet committed).
- **How:** Trimmed `sitemap.ts` to emit only `ROUTES.home` (the one route that renders); left a comment to re-add `/shop`, `/about`, and product URLs as each ships. `npm run typecheck --workspace=@lamiefoods/web` passes.

### <GAP-XXX — title>
- **Fixed:** <YYYY-MM-DD>, <commit hash / PR>
- **How:** <one line>
