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

### GAP-010 — No record of who agreed to be contacted

- **Category:** compliance / content-risk
- **Severity:** high (before any marketing feature ships)
- **Location:** No outreach control exists anywhere as of 2026-09-08 — both
  files originally cited here (`content/admin-customers.ts`'s
  `CUSTOMERS_OUTREACH`, `content/admin-order-detail.ts`'s `patron.whatsapp`)
  were deleted when `/admin/customers` moved to real data (they were sample
  content, and the real `CustomersView` has no outreach card at all). The
  underlying compliance problem below is unchanged and stays open for
  whenever a real outreach feature is next proposed — it is not tied to a
  specific file.
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
- **Update 2026-09-07 — real authentication shipped, plus a THIRD gate failure
  mode, different from both leaks above.** `NODE_ENV !== "development"` is
  replaced everywhere with `getAdminSession()` (`server/admin/session.ts`): a
  stateless, HMAC-signed httpOnly cookie, one shared credential (`ADMIN_EMAIL`
  + a `scrypt` hash in `ADMIN_PASSWORD_HASH`), rate-limited login. Every rule
  above was kept — gate in the page before the dynamic import, data as props
  into client components, never an import.
  **The new failure mode: availability, not a leak, and just as easy to miss.**
  A production build run with `ADMIN_SESSION_SECRET` unset baked every
  `/admin/**` page as a **permanently cached static 404** — Next only detects
  `cookies()` as a dynamic API on the code path it actually executes, and
  `getAdminSession()` used to check the secret and return early *before*
  calling `cookies()`. With the secret unset (this exact build), that early
  return meant `cookies()` was never reached, so Next never saw a reason to
  mark the route dynamic, and cached the 404 forever — `initialRevalidateSeconds:
  false` in the prerender manifest, confirmed by inspecting `.next/server/app/
  admin.html` directly. In real deployment the secret would be set, so this
  would self-correct on that build — but a route this security-critical
  should never depend on an env var happening to be set for its
  static/dynamic classification to come out right. Fixed two ways: (1)
  `getAdminSession()` now calls `cookies()` unconditionally, before checking
  the secret; (2) every `/admin/**` page and its layout also export
  `dynamic = "force-dynamic"` explicitly, as defense in depth, so this can
  never again depend on incidental Request-time-API detection. Verified: a
  clean rebuild shows `ƒ /admin`, `ƒ /admin/orders`, etc. (dynamic), not `○`.
  **Lesson for any future auth-gated route: never trust that a `cookies()`
  call somewhere in the function will be enough — export `force-dynamic`
  explicitly and verify the build's own route table, not just that lint and
  typecheck pass.**
- **Update 2026-09-08 — every admin screen is now real; a second bug found
  in the same auth mechanism, different failure mode from either above.**
  `/admin` (full dashboard — revenue, orders, customers, best sellers, stock
  — not just needs-dispatch), `/admin/customers` (derived from `orders`,
  grouped by email — there is no `customers` table) and `/admin/inventory`
  (one row per product — stock is tracked per product, not per pack) are all
  wired to the database now; `/admin/settings`'s one non-real panel
  (`SETTINGS_STOREFRONT`, previously reading the deleted static
  `content/products.ts`) now reads the live catalogue too. **While verifying
  this end-to-end** (placing a real order and clicking the real "mark as
  paid" action, not just loading pages), a real bug surfaced in
  `server/admin/session.ts`: the session cookie's `path: "/admin"` is not a
  prefix of `/api/admin/...` (a sibling path), so the browser silently
  withheld the cookie from every admin **write** call while every admin
  **page load** kept working perfectly — a signed-in admin got a confusing
  401 on every mark-paid/status-update/product-save/sign-out action, with
  zero signal from lint, typecheck, or successfully rendering every page.
  Fixed by setting `path: "/"` — full writeup in `architecture.md`'s Gotchas
  section. **Status:** Authentication mechanism: **resolved**, cookie
  actually reaches every route that needs it: **resolved**. Real data: every
  admin screen. Multi-user roles were never asked for (Q21) and are out of
  scope; this is one shared credential for one owner.

### GAP-007 — Allergen statement needs owner sign-off

- **Category:** content-risk / legal
- **Severity:** high
- **Location:** `apps/web/src/content/products.ts` (`detail.ingredients.allergens`,
  set to `null` for all three products).
- **Found:** 2026-09-06 while building the product detail page
- **Problem:** The mock printed "Contains: Wheat (Gluten), Milk. Free from
  preservatives, artificial colourants, or trans fats." That contradicts the
  landing page's own "whole farm eggs", so the mock's allergen data is
  demonstrably unreliable — and an allergen declaration is a food-safety and
  labelling matter, not copy. Publishing an invented one could genuinely harm
  someone with an allergy. **Deliberately not shipped:** `allergens` is `null`
  and the page renders "Allergen information to be confirmed before
  publication."
- **Fix:** Owner supplies the real allergen statement (and confirms whether eggs
  are an ingredient — the landing and product copy disagree), then set
  `allergens` per product.
- **Update 2026-09-06 — the capture point now exists.** `/admin/products/new`
  has an allergen register, and `lib/admin/product-schema.ts` makes it
  **non-optional**: the form will not validate unless the operator ticks the
  allergens that apply or explicitly confirms none do. Silence is not an
  accepted answer, because a product published with no allergen decision
  recorded is precisely this gap. When the catalogue API arrives, the backend
  must enforce the same rule — a browser-side check is a convenience, not a
  control. This does not close the gap: the three existing products still carry
  `allergens: null`.
- **Update 2026-09-07 — the free-delivery half of this gap is resolved, by
  removal, not confirmation.** This entry originally covered two items: the
  allergen statement (still open, above) and "Free Lagos delivery on orders over
  ₦15,000" (`content/shop.ts`, `ANNOUNCEMENT`), which was live on the site. The
  owner's brand questionnaire (Q16) confirmed delivery pricing is still being
  worked out, which makes the offer confirmed-false rather than merely
  unverified. It has been deleted outright — from the announcement bar
  (`content/shop.ts:ANNOUNCEMENT`), the cart's progress bar and gift-packaging
  card (`components/cart/cart-view.tsx`, `content/cart.ts`), and the
  free-delivery note in `order-success` copy — rather than left pending
  confirmation. This also closed GAP-008, which only existed because of this
  offer. Allergens remain the sole reason this gap stays open.
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
- **Update 2026-09-07 — product prices moved to Postgres, unverified status
  unchanged.** Prices/crunch scores/ingredient copy now live in
  `products`/`product_packs` (`migrations/0004_seed_existing_products.sql`,
  carried over byte-for-byte from the old `content/products.ts`) instead of
  static content — this is a relocation, not a resolution. The `FLAVOURS.items`
  reference above is stale (that field no longer exists; the homepage's
  featured-flavours row is now real product data passed as a prop — see
  `components/landing/flavours.tsx`). **Fixing this gap now means editing rows
  in the admin `/admin/products` edit form, not a content file.**
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
- **Severity:** high (raised 2026-09-07 — see below; was medium)
- **Location:** `package.json` (no `test` script), no runner in `apps/web/package.json`, `apps/backend/package.json`, or any `packages/*/package.json`; `turbo.json:6-29` defines no `test` task. Confirmed: `git ls-files` shows no test files, `grep '"test"'` across all workspace manifests returns nothing.
- **Found:** 2026-09-05 via audit-gaps
- **Problem:** There is no way to write or run a test today. The moment money/cart/checkout logic lands (kobo arithmetic in `packages/types/src/common.ts:4-13`, `OrderItem.lineTotal` in `order.ts`, the `apiFetch` gateway, Paystack flow), it will ship with zero automated coverage on paths where a bug means mischarging a customer or losing an order. The priority order (security → **code quality/tests** → …) ranks this above tech debt, and CLAUDE.md already acknowledges it informally ("Test: none configured — logged as a gap") without it living in this ledger.
- **Fix:** Pick a runner (Vitest fits the Vite/TS + Next 16 stack). Add it as a dev dependency at the root, add a `test` script to each workspace that has logic, and add a `test` task to `turbo.json` (`"test": { "dependsOn": ["^build"] }`). Wire `npm run test` into CI alongside `build` and `lint`. First tests to write when logic exists: kobo `Money` arithmetic and `OrderItem` line-total freezing. Verify: `npm run test` runs and a deliberately broken assertion fails the pipeline.
- **Update 2026-09-06:** no longer hypothetical. `lib/cart/cart-store.ts` and
  `lib/money.ts` now do real money arithmetic (kobo integers, line totals,
  subtotals) and `sanitise()` guards untrusted localStorage input. These are
  exactly the paths where a silent bug mischarges a customer, and none of them
  has a test. Raise to **high** once checkout lands.
- **Update 2026-09-07 — checkout landed; raised to high, as flagged above.**
  `server/orders/pricing.ts` is now the entire server-side trust boundary
  against a tampered client price, and `server/orders/repository.ts` writes
  real money to a real database with no automated coverage on either. Highest
  priority tests to add first: `priceLines()` rejects an unknown slug/pack
  (`UnknownLineError`) and never trusts a client-sent price; `subtotalOf()`
  sums correctly; the create-order route returns 409 for a mismatched line and
  503 when `DATABASE_URL` is unset. Manually verified once at ship time (see
  `progress.md`), which is exactly the kind of check that should be automated
  and isn't.
- **Update 2026-09-07 — payments and admin auth landed; both are now
  untested.** `server/orders/paystack.ts:confirmPaystackPayment` is the only
  thing standing between "a customer paid" and "the database says so" — it
  re-verifies against Paystack, checks amount/currency, and its idempotency
  guard (`repository.confirmPayment`'s `WHERE payment_status != 'paid'`) is
  exactly the kind of logic a refactor could silently break without a test
  catching it. `server/admin/auth.ts:verifyCredentials` and
  `server/admin/session.ts` (the HMAC sign/verify pair) are the entire admin
  authentication boundary. Priority tests, in order: the idempotent-confirm
  path (two calls with the same reference → one email, `newlyConfirmed: false`
  on the second); the partial-unique-index reuse rejection
  (`PaymentReferenceReusedError`); session HMAC verification rejects a
  tampered expiry and an expired-but-correctly-signed cookie; `scrypt`
  credential verification takes the same time whether the email or the
  password was wrong (the whole point of the constant-time compare in
  `verifyCredentials`).
- **Update 2026-09-07 — the real product catalog adds a third untested trust
  boundary.** `server/orders/pricing.ts:priceLines` (re-prices every order
  line from Postgres, applies `discount_percent`, rejects unpublished/unknown
  products) and `lib/money.ts:applyDiscount` (the one formula both the
  storefront display and the actual charge use) are exactly the kind of
  arithmetic a refactor could silently get wrong without a test catching it —
  a discount computed one kobo off is a real, if small, billing error on
  every single order for that product. `server/products/repository.ts`'s
  transactional create/update (packs and images deleted-and-reinserted, not
  diffed) and `decrementStockInTx`'s clamp-at-zero are the next tier down.
  Priority tests to add alongside the ones above:
  `applyDiscount(1000, 20) === 800`, `applyDiscount(1001, 20) === 800`
  (floors, doesn't round up past what the percentage promises),
  `applyDiscount(x, null) === x`; `priceLines` rejects a line naming an
  unpublished product's slug with the same error as an unknown slug (the
  "can't distinguish draft from missing" property GAP-004's fix depends on).
- **Update 2026-09-08 — fulfilment transitions are now another untested
  trust boundary.** `packages/types/src/order.ts` defines the forward-only
  graph and `server/orders/repository.ts:updateOrderStatus` enforces it under
  a row lock, synchronises manual bank-transfer confirmation, and derives
  one-time email flags from permanent milestone timestamps. Add coverage for
  every allowed edge, rejected skips/reversals/reopening, unpaid advancement,
  concurrent stale updates, one stock decrement, and one dispatch/delivery
  notification attempt per order.
- **Update 2026-09-08 — authenticated dispatch CSV is also untested.**
  `server/orders/csv.ts` neutralises spreadsheet formulas and
  `api/admin/orders/export/route.ts` is the PII-bearing download boundary.
  Add coverage for quotes/commas/newlines/Unicode, every dangerous formula
  prefix, fixed column order, exclusion of IDs/tokens/payment references,
  no-store/nosniff attachment headers, and a `401` response containing no
  customer data.
- **Status:** open

### GAP-011 — Rate limits are in-memory, not correct across multiple instances

- **Category:** architecture fit
- **Severity:** medium (raised from low-stakes-only 2026-09-07 — see below)
- **Location:** `apps/web/src/server/security/rate-limit.ts` (generalised
  2026-09-07 from `server/orders/rate-limit.ts`, which only guarded order
  creation)
- **Found:** 2026-09-07 while building `POST /api/orders`
- **Problem:** The limiter's state (`Map<key, timestamp[]>`) lives in one
  serverless instance's memory. On Vercel, concurrent requests can land on
  different instances that don't share this map, so the real ceiling under
  concurrent abuse is `max × (number of warm instances)`, not `max`. This was
  a deliberate trade for now — see the decision log in `architecture.md` —
  rather than an oversight, but it means every caller of this limiter gets a
  speed bump, not a guarantee.
- **Update 2026-09-07 — now guards three endpoints, one of them credential-
  guessing, not just abuse-of-a-free-endpoint.** `POST /api/admin/login`
  (`admin-login:${ip}`, 5/15min) reuses this exact limiter. Order creation and
  payment-verification endpoints being under-limited during a traffic spike is
  a cost/availability problem; the SAME weakness on the login endpoint is a
  credential-stuffing problem — an attacker spread across enough warm
  instances gets `5 × instances` guesses per 15 minutes, not 5. Raised from
  the original framing (accepted risk for "a guest-checkout endpoint selling
  three products") because that framing no longer covers what this file
  protects.
- **Fix:** If abuse actually shows up, or before deploying with real
  customers, move the counter to a shared store (Upstash Redis fits Vercel's
  edge runtime) keyed the same way (`checkRateLimit`'s `key` param already
  namespaces by endpoint). Do the admin-login endpoint first if only one gets
  fixed — it is the one where "occasionally works for an attacker" is a
  meaningfully worse outcome than for the others.
- **Status:** open

### GAP-012 — Failed order emails are not retried, queued, or surfaced to the owner

- **Category:** reliability
- **Severity:** low
- **Location:** `apps/web/src/server/email/send.ts` (`sendMail`)
- **Found:** 2026-09-07 while building order emails
- **Problem:** `sendMail` is deliberately best-effort — a Resend outage must
  never fail or roll back an already-saved order (see the decision log in
  `architecture.md`). The trade-off: if the send fails, the only record is a
  `console.error` line. The customer gets no confirmation email and nobody is
  notified that they didn't; the order is correct in the database but silent
  everywhere else.
- **Fix:** At minimum, add an `email_sent boolean` (or a `last_email_error`
  text column) to `orders` so a failed send is queryable and re-sendable from
  the admin once `/admin/orders` is real. A retry queue is over-building for
  the current volume; a visible "resend confirmation" admin action is not.
- **Update 2026-09-08:** Dispatch/delivery transition flags now use permanent
  `shipped_at`/`delivered_at` milestone timestamps and the status graph no
  longer permits reversals, so stale or repeated admin writes cannot duplicate
  those email attempts. Reliability is unchanged: setting the timestamp and
  then failing to send still leaves no retry/resend path or owner-visible
  failure, so this gap remains open.
- **Status:** open

### GAP-013 — Bank-transfer account details are unset; bank-transfer path still inert

- **Category:** content-risk
- **Severity:** high (blocks the fallback payment path entirely)
- **Location:** `site_settings` table (`migrations/0005_settings.sql`) — the
  `bank_name`/`bank_account_number`/`bank_account_name` columns are `null`.
  As of 2026-09-08 this is admin-editable at `/admin/settings`, not a code
  file — `packages/config/src/payment.ts`'s `BANK_TRANSFER` constant is now
  only the fallback used when no database is configured.
- **Found:** 2026-09-07 while building the Paystack + bank-transfer payment flow
- **Problem:** The owner chose to offer a real bank number for anyone who picks
  it over Paystack. The account details don't exist anywhere confirmed yet —
  inventing them would mean money sent to a wrong or fictional account, a
  materially worse mistake than any content error elsewhere in this app.
  Until set, `components/order/payment-actions.tsx` renders an honest
  "details are being confirmed" panel instead of the bank-transfer
  instructions, and the WhatsApp CTA (see below) stays a general contact
  link rather than a "send payment proof" flow.
- **Update 2026-09-08 — WhatsApp half resolved.** `WHATSAPP_NUMBER` is now
  set (`2347059721857`, the owner's stated temporary number — they said
  they'll swap it for the business's real number later). While building this,
  a real bug was found and fixed: `BankTransferPanel` gated
  `WHATSAPP_NUMBER`/`BANK_TRANSFER` independently, so setting only the
  WhatsApp number would have shown a live "Send payment proof on WhatsApp"
  button and a "transfer X, then send your screenshot" instruction while the
  bank-details block right above still said "being confirmed" — telling a
  customer to wire money with no account number ever shown. Fixed: the
  "send proof" flow (and its instruction text) now requires BOTH to be set;
  with only `WHATSAPP_NUMBER` set, the button is a general "Message us on
  WhatsApp" contact link instead. Bank account details are still the sole
  remaining blocker on this gap.
- **Update 2026-09-08 — the fix is now a form, not a code edit.** Owner can
  sign into `/admin/settings` and enter bank name/account number/account
  name themselves (validated all-or-nothing — the same three-fields-together
  rule from the update above, enforced server-side too). Verified end to
  end: saved via the real admin form, confirmed the value round-trips back
  into the form on reload, and confirmed a real `/order-success` page picks
  up the new value immediately with no redeploy. No remaining code work —
  this gap is now purely "waiting for the owner to type in real numbers."
- **Fix:** Owner signs into `/admin/settings` and fills in the bank fields.
  Until then, Paystack is the only payment path that functions end to end.
- **Status:** open — needs owner input only (bank account details); the
  mechanism to set them without a code deploy now exists

### GAP-014 — Paystack webhook is unregistered; only tested against Paystack's test mode, not live traffic

- **Category:** architecture fit / payments
- **Severity:** high until verified against a production Paystack account
- **Location:** `apps/web/src/app/api/webhooks/paystack/route.ts`
- **Found:** 2026-09-07 while building the payment flow
- **Problem:** The webhook exists and its signature verification is written
  against Paystack's documented HMAC-SHA512 scheme, but it has not been
  registered in a real Paystack dashboard or received a real event yet — there
  is no production URL to register it against until this deploys. Without the
  webhook actually wired up and firing, payment confirmation depends entirely
  on the client-triggered `POST /api/orders/:token/verify-payment` call
  succeeding, which it will not if the customer's browser closes or loses
  connection between the Paystack popup reporting success and that call
  completing — exactly the gap the webhook exists to cover.
- **Fix:** Once a production domain exists, register
  `<domain>/api/webhooks/paystack` in the Paystack dashboard, then place one
  real test-mode transaction end to end and confirm in the database that
  `paid_at` gets set even when the client-side verify call is deliberately
  blocked (e.g. by killing the tab right after the popup closes) — that is the
  actual scenario this endpoint exists for, not just "does it 200."
- **Status:** open — needs a production deploy to verify against

<!-- not yet audited (surface does not exist yet — re-run audit-gaps when it lands):
     delivery-fee calculation, stock/inventory checks at order time,
     multi-user admin roles (never asked for — see Q21). apps/backend is
     retired — see its README; audit apps/web/src/app/api and
     apps/web/src/server instead. Auth on admin routes and the Paystack
     payment flow ARE now built and audited — see GAP-009, GAP-013, GAP-014
     above, not this note. -->

## Closed

<!-- Move entries here when fixed. Keep them — they document why the code is the way it is. -->

### GAP-008 — The cart mock's free-delivery figure does not add up

- **Category:** content-risk · **Severity:** low · **Found:** 2026-09-06 while building the cart
- **Was:** The mock showed a ₦13,000 subtotal against a stated ₦15,000
  free-delivery threshold, then said "You are **₦4,200** away" — arithmetically
  wrong either way (should be ₦2,000). Depended on GAP-007's free-delivery
  offer, which the mismatch lived inside.
- **Fixed:** 2026-09-07, not by correcting the number.
- **How:** The whole free-delivery offer was deleted (see GAP-007's 2026-09-07
  update) — the ₦15,000 threshold was never a real quote, so there was no
  correct figure to compute in the first place. `cart-view.tsx`'s progress bar,
  `FREE_DELIVERY_THRESHOLD`, and the free-delivery note are all gone.

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
