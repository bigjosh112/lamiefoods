# Architecture

> The mental model a senior engineer would hand a new hire: how this project is put
> together and **why** the big decisions were made. Maintained by the
> `document-architecture` skill; updated by `distill-session` when decisions change.
>
> **Status: storefront, payments, admin auth and the product catalog are all
> real.** Every customer route and every admin screen are built. Guest
> checkout writes to Postgres and sends email; orders can actually be paid
> (Paystack inline). New orders no longer offer a manual bank-transfer
> fallback (owner, 2026-09-14); `whatsapp_transfer` remains only on
> historical rows. The admin
> panel has real sign-in (`getAdminSession()`) with real order AND real
> product data (`/admin/orders`, `/admin/products`, create/edit both real).
> As of 2026-09-07, products themselves moved from static content to
> Postgres too — admin sets packaging, a promotional discount, and uploads
> real photos (Vercel Blob), and the storefront (shop, cart, checkout)
> reflects it, including stock that now actually decrements on payment.
> As of 2026-09-08, `/admin` (full dashboard, not just needs-dispatch),
> `/admin/customers` and `/admin/inventory` are ALSO real — no admin screen
> shows invented data anymore. Customers are derived from `orders` (there is
> no `customers` table); inventory is one row per **packaging size** (stock,
> restock threshold, price, and SKU live on `product_packs` — a flavour with
> three sizes is three inventoriable units). Two sample-data features were
> removed outright rather than kept fake: a rider/delivery-fleet tracking
> card and packaging-materials stock, neither of which has ever had a real
> data source. What remains open is mostly content and owner-supplied facts, not
> plumbing: real prices (GAP-004), an allergen statement (GAP-007), bank
> account details (GAP-013 — the owner can now set both via `/admin/settings`
> themselves, no code deploy needed, since the WhatsApp number/bank details
> moved to a real `site_settings` table on 2026-09-08 — bank details just
> haven't been entered yet), a live Paystack webhook test (GAP-014), and a
> delivery areas + checkout fees (migration `0008`, `/admin/delivery`) so
> new orders set `delivery_fee_kobo` / `total_kobo` and Paystack charges the
> total. This header has gone stale after every big feature shipped so
> far; if you find another claim here the code has since outgrown, fix it in
> the same pass rather than trusting the header.

## Mental model

Lamie Foods is a Nigerian food brand (launch product: chinchin). This repo is an npm
+ Turborepo monorepo. `apps/web` is a Next.js 16 App Router app that is now **both**
the storefront and the backend: guest checkout (no accounts — see Q12/Q13 in the
brand questionnaire) is Route Handlers under `apps/web/src/app/api/`, backed by
Postgres and Resend. `apps/backend` was the original plan for a separately owned
backend; the owner overrode that on 2026-09-07 (see Key decisions), and it is now a
retired-in-place stub — see its README for where everything actually lives.
Everything is still built to make swaps happen in one place each: brand/design values
flow from tokens and a `config` package, all backend traffic flows through one
`apiFetch` gateway (Client Components) or a direct in-process call (Server
Components), and domain shapes live in a shared `types` package — no longer
hypothetical for `Order`/`OrderItem`, which a real schema now backs, though the rest
stays *provisional* pending backend growth beyond guest checkout. The guiding
discipline across the codebase is **don't invent** — no fake prices, addresses, API
shapes, or sampled colours; unknowns are left as typed placeholders (or, for money
whose value is genuinely unset, `null` — never a guessed `0`), not plausible guesses.

## System map

Only the parts that matter for placing new code correctly.

| Path | Owns | Notes |
|---|---|---|
| `apps/web/src/app/` | Next.js App Router entry, every real route (`/`, `/shop`, `/shop/[slug]`, `/cart`, `/checkout`, `/order-success`, `/about`, `/admin/**`) plus `layout.tsx`, `error.tsx`, `not-found.tsx`, `robots.ts`, `sitemap.ts` | Server Components by default; `"use client"` only where interaction needs it |
| `apps/web/src/app/api/` | Route Handlers — the backend. `orders/` (create, read-by-token, prepare/verify-payment), `webhooks/paystack/`, `admin/{login,logout,orders/[reference],products,products/[slug],uploads}/`, `products/` doesn't exist as a public GET (see the 2026-09-07 catalogue-fetch decision below for why) | Params are a `Promise` in Next 16 — see `node_modules/next/dist/docs/`. Add one `route.ts` per resource as the API grows |
| `apps/web/src/server/` | Server-only backend logic: `db/client.ts` (Postgres pool, exports the `Db` type covering both the pool and a `sql.begin` transaction handle), `orders/{pricing,repository,paystack}.ts`, `products/repository.ts`, `email/{send,order-emails}.ts`, `admin/{auth,session}.ts`, `security/rate-limit.ts` | Every file starts with `import "server-only"` — importing one from a Client Component fails the build |
| `apps/web/src/lib/api/` | **The only place a Client Component talks to the backend.** `apiFetch` gateway + typed error class + one module per resource (`orders.ts`, `admin.ts`, `admin-orders.ts`, `admin-products.ts`) | Server Components call `server/` directly instead — no self-fetch over HTTP |
| `apps/web/src/lib/products/catalog-context.tsx` | `CatalogProvider`/`useCatalog()` — the published product list, made available to Client Components (cart/checkout pricing) via React context instead of a client-side fetch | Populated by whichever Server Component page already fetched `listPublishedProducts()` — see the Data flow section |
| `apps/web/migrations/` | Plain SQL migrations (`0001_orders.sql`, `0002_payments_and_admin.sql`, `0003_products.sql`, `0004_seed_existing_products.sql`) | Plain Postgres only — no Supabase-specific SQL, so Railway is a `DATABASE_URL` swap |
| `apps/web/src/config/` | `env.ts` (zod-validated **client** env), `server-env.ts` (zod-validated **server** env, `server-only`-guarded), `site.ts` (metadata defaults) | `env.ts` values are public by construction; `server-env.ts` values must never cross into a Client Component |
| `apps/web/src/styles/globals.css` | **All design tokens** — colour ramps, fluid type/space/radius — under Tailwind v4 `@theme` | PROVISIONAL palette; swap here and nowhere else once brand assets arrive |
| `apps/web/src/lib/` + `components/seo/` | SEO/structured-data helpers (JSON-LD, canonical URLs) | Only confirmed brand facts go into schema — no invented ratings/addresses |
| `apps/web/src/components/` | App-specific components (mostly empty `.gitkeep` dirs by domain: cart, footer, navigation, products, ui) | Stays app-local until a primitive is used in 2+ places |
| `packages/config/` | Brand facts (`BRAND`, `DELIVERY`) + route paths (`ROUTES`, `ADMIN_ROUTES`) | Single source of truth so names/links can't drift |
| `packages/types/` | Shared domain types (product, order, cart, customer, common) | `Order`/`OrderItem` (`migrations/0001_orders.sql`) and `Product`/`ProductPack`/`ProductImage` (`migrations/0003_products.sql`) are now backed by real schemas; `cart`/`customer` stay **provisional** |
| `packages/ui/` | Shared presentational primitives — only `cn` today | Intentionally near-empty; not a dumping ground |
| `packages/eslint-config/`, `packages/typescript-config/` | Shared lint/TS bases | — |
| `apps/backend/` | **Retired in place, 2026-09-07** — do not add sources here | Scripts stay no-op `echo` stubs. See its README for where server code actually lives now (`apps/web/src/{app/api,server}/`) |

## Data flow

**The catalogue** (browsing `/`, `/shop`, `/shop/[slug]`) is real now — Postgres via
`server/products/repository.ts`, not the old static `content/products.ts` (superseded,
2026-09-07; kept only as a data source for the still-sample `/admin/customers` and
`/admin/inventory` screens). `/shop`, `/shop/[slug]`, `/cart`, `/checkout`, the homepage
and `sitemap.ts` all set `export const revalidate = 60` — a raw Postgres query is
NOT a Next Request-time API the way `cookies()` is, so Next won't auto-detect it
and mark the route dynamic; left unset, any of these would bake stale prices into
the build forever. See the Gotchas entry on this from the admin-auth static-cache
bug — same root cause, different trigger.

**The cart** is 100% client-side for its lines: a zustand store persisted to
`localStorage` (`lib/cart/cart-store.ts`), holding only `{slug, pack, quantity}`
— never a price. Resolving a line to a priced, discounted item
(`resolveLines(lines, catalog)`) needs the catalogue, which a Client Component
can no longer import statically now that it's in Postgres — see the
"client-side cart pricing" decision below for how `CatalogProvider` solves
this without a public API or a client-side fetch. Whatever the display shows,
the actual charge is always the server re-price at order-creation time, so
this can never be a source of a wrong charge, only of cosmetic staleness.

**Placing an order** is the one real client→server round trip:
`CheckoutForm` (Client Component) → `createOrder()` in `lib/api/orders.ts` →
`apiFetch<T>` in `lib/api/client.ts` → `POST /api/orders` (same-origin Route
Handler) → the request is re-priced from Postgres server-side
(`server/orders/pricing.ts`, joining `products`/`product_packs` and applying
`discount_percent` — the browser's payload carries no price for this to
trust, and only published products price successfully) → written transactionally
to Postgres (`server/orders/repository.ts`) →
best-effort email via Resend (`server/email/`) → `{reference, token}` returned →
cart cleared, browser redirected to `/order-success?token=…`. Non-2xx is thrown
as `ApiError`; the form renders all four states (loading/error+retry/empty/
success) per `api-integration.md`.

**Reading an order back** (`/order-success?token=…`) does NOT go through
`apiFetch`: it's a Server Component, so it calls `findOrderByToken()` in
`server/orders/repository.ts` directly, in-process — no self-fetch back into the
app's own API. This is the general rule now: Server Components call `server/`
functions directly; `apiFetch` is for Client Components, which only have the
browser's fetch.

**Paying for an order** happens on `/order-success`, not `/checkout` — see the
2026-09-07 design decision below for why. `PaymentActions`
(`components/order/payment-actions.tsx`, a Client Component) gets only
`{token, reference, amountKobo, initialMethod}` as props, never the order
itself. Paystack path: `POST .../prepare-payment` registers a fresh
server-generated reference on the order → the browser opens Paystack's inline
popup with that exact reference → on success, `POST .../verify-payment` →
`server/orders/paystack.ts:confirmPaystackPayment` re-verifies with Paystack,
checks the reference matches what the order has on file, and updates the DB
idempotently (`server/orders/repository.ts:confirmPayment`) → `router.refresh()`
re-reads the real server state. The same `confirmPaystackPayment` is also
called from `POST /api/webhooks/paystack`, the durable backup for a browser
that closes mid-flow. Bank-transfer path: no server call to open — the panel
shows account details from `packages/config/src/payment.ts` (`null` until the
owner supplies them — GAP-013) and a `wa.me` link; the order stays `unpaid`
until the owner manually confirms via `PATCH /api/admin/orders/:reference`.

**The admin panel** (`/admin/**`) is a second, separate trust boundary from
everything above: a signed session cookie (`server/admin/session.ts`), not a
per-order token. `/admin/orders` and `/admin/orders/[id]` read real data via
`server/orders/repository.ts`'s admin-only functions (safe to look up by the
human reference there, unlike the customer-facing token rule, because the
session gate already ran); the one write path is the same `PATCH` endpoint
above, which the customer-facing flows never call.

**Managing a product** is the same shape as managing an order:
`ProductForm` (Client Component, shared by create and edit) →
`createProduct`/`updateProduct` in `lib/api/admin-products.ts` → `apiFetch` →
`POST /api/admin/products` or `PATCH /api/admin/products/:slug`
(session-guarded, re-validates against the exact same `productSchema` the
form already checked) → `server/products/repository.ts`, one transaction per
save covering the product row, its packs (deleted and reinserted, not
diffed) and its images. Photo upload is a separate flow that happens
BEFORE the save: `ImageUpload` (`components/admin/image-upload.tsx`) uploads
straight to Vercel Blob via a short-lived token from
`POST /api/admin/uploads`, and only the resulting URL is submitted with the
rest of the form — no image bytes ever pass through this app's own server.

## Key decisions

<!-- Append-only. Never delete a decision — supersede it and say why. -->

| Date | Decision | Why | Alternatives rejected |
|---|---|---|---|
| 2026-09-05 | npm workspaces (migrated off pnpm); internal deps pinned `"*"` | Tooling/host compatibility (aligns with the Vercel deploy target and its `package-lock.json` expectations); npm has no `workspace:` protocol and errors on it, so shared packages are versioned `"*"` | pnpm (original scaffold) |
| 2026-09-05 | Turborepo 2.10 orchestrates all workspace scripts from root | Fan-out + caching across `apps/*`/`packages/*`; `dev`/`start` marked persistent, build outputs cached | Per-workspace scripts by hand |
| 2026-09-05 | Next.js 16 App Router, Server Components by default | Ship less client JS; opt into `"use client"` only for interaction | Pages Router; client-first |
| 2026-09-05 | One backend gateway (`apiFetch`); components never call `fetch` | Base URL, credentials, error handling defined once, not re-invented per component | Ad-hoc `fetch` in components |
| 2026-09-05 | **No endpoint functions built yet** | Backend has supplied no contract; inventing request/response shapes = UI against a non-existent API | Guess the shapes now |
| 2026-09-05 | Client env validated by zod at module load (`config/env.ts`); each `NEXT_PUBLIC_*` key written as a literal | Fail the build loudly on missing/malformed env instead of `undefined` deep in a component; Next only inlines full literal `process.env.NEXT_PUBLIC_*` refs | Read env ad-hoc; dynamic key lookup (breaks inlining) |
| 2026-09-05 | Session cookies over `localStorage` tokens (`credentials: "include"`); Paystack **public** key must start `pk_` | Security bar: keep secrets/tokens out of JS-readable storage and the client bundle | Bearer token in `localStorage` |
| 2026-09-05 | All design values are tokens in one `@theme` block; palette is a **provisional placeholder** | Single swap point when the real logo/Stitch design lands; everything downstream reads tokens | Magic numbers; sampling colours before assets exist |
| 2026-09-05 | Money as integer kobo (`Money.amount`) | Integer minor units avoid floating-point drift on prices/totals | Float naira |
| 2026-09-05 | Order line items frozen at purchase (`OrderItem` copies name/price) | Later product edits must not rewrite order history | Reference live product at render |
| 2026-09-05 | `packages/types` is provisional; backend contract is authoritative | Starting point for discussion; reconcile before wiring any endpoint | Treat frontend types as the contract |
| 2026-09-05 | `apps/backend` left as no-op stubs | Owned by the backend developer; stubs keep `turbo build/lint/typecheck` green today | Scaffold a backend the frontend doesn't own |
| 2026-09-05 | `LazyMotion` + `domAnimation`, `reducedMotion="user"` globally | Smaller animation bundle than full `motion`; OS reduced-motion respected without per-component checks | Full Framer Motion import; per-component motion guards |
| 2026-09-05 | `save-exact=true`, npm install scripts left **on** | `ignore-scripts` is all-or-nothing and would break `unrs-resolver`'s native binding; exact pins for reproducibility | `ignore-scripts=true` (breaks ESLint resolver) |
| 2026-09-05 | Deploy target: **Vercel** | First-party Next.js hosting; also the driver behind the npm/`package-lock.json` migration | Netlify; self-hosted/container |
| 2026-09-07 | **SUPERSEDES 2026-09-05 "`apps/backend` left as no-op stubs".** Backend is Next.js Route Handlers in `apps/web/src/app/api/`, same app, same deploy | Owner explicitly overrode CLAUDE.md rule 10 in-session — no separate backend developer is picking this up on the original timeline; one Vercel deploy avoids a second host, a second CORS setup, and a second thing to keep in sync | Wait for a separate backend team; scaffold `apps/backend` for real |
| 2026-09-07 | **SUPERSEDES 2026-09-05 "No endpoint functions built yet".** `lib/api/orders.ts` exists; `apiFetch` resolves against this app's own origin (`siteUrl`) when `NEXT_PUBLIC_API_URL` is unset, instead of throwing `ApiNotConfiguredError` (now removed) | A same-origin API needs no configuration to reach; the old throw existed only because the base URL was genuinely unknown for an external backend that no longer applies by default | Keep requiring `NEXT_PUBLIC_API_URL` even for the app's own routes |
| 2026-09-07 | Server Components call `server/` functions directly (in-process); `apiFetch` is for Client Components only | A Server Component self-fetching its own Route Handler over HTTP is a wasted network hop for a call that never needed one | Route every read, server or client, through `apiFetch` |
| 2026-09-07 | Database: **plain Postgres via the `postgres` driver**, `DATABASE_URL` only — no Supabase-specific feature (no RLS, no `@supabase/supabase-js`, no Supabase auth/storage) | Supabase now, **Railway later** (owner's stated plan) — moving hosts must be a connection-string change, not a rewrite | `@supabase/supabase-js`; an ORM (Prisma/Drizzle) — three tables doesn't warrant one yet |
| 2026-09-07 | Order lookup by unguessable `access_token` (32 random bytes), never by the human-readable `reference` | `/order-success` renders a name, phone number and home address; a short, printed, spoken-aloud reference must never be sufficient to fetch that | Look up by reference; sequential order IDs |
| 2026-09-07 | Every order line is re-priced server-side from `content/products.ts`; the create-order request carries no price field at all | `api-integration.md` already flagged client-held prices as tamperable — removing the field entirely (not just validating it) closes the hole structurally | Accept a client-sent price and validate it against the catalogue |
| 2026-09-07 | `Order.deliveryFee` and `Order.total` are `Money \| null`, not `Money` | `null` means "not yet quoted" (legacy orders); a `0` is only an authorised free-delivery quote on a selected area — never invent `0` when no area applies | Default to `ngn(0)` |
| 2026-09-12 | **SUPERSEDES 2026-09-07 “Paystack charges the subtotal only”.** Checkout requires an admin-managed `delivery_areas` row; server sets `delivery_fee_kobo` + `total_kobo`; Paystack / bank transfer charge `amountOwedKobo` = `total ?? subtotal` | Owner supplied Lagos + interstate fee lists and wants the fee paid with products at checkout | Keep quoting delivery separately; invent `0` when no area selected |
| 2026-09-07 | `OrderItem` gained a required `pack: string` field | Cart lines are `{slug, pack, quantity}` and packs are separately priced (`250g Pouch` vs `500g Gourmet Jar`) — an order line that doesn't record which pack was bought is unfulfillable | Leave pack unrecorded, as the old sample order did (slug stuffed into `productId`) |
| 2026-09-07 | Server secrets live in `config/server-env.ts`, guarded by the `server-only` package, never in `config/env.ts` | `env.ts` values are inlined into the client bundle by design; a secret in the same file would ship to every visitor. `server-only` makes the boundary a **build failure**, not a convention | One `env.ts` for everything; a code-review-only boundary |
| 2026-09-07 | Order confirmation and notification email via a raw `fetch` to Resend's HTTP API, not the `resend` SDK | The SDK pulls 2 transitive dependencies for one JSON POST; house rule 11 requires auditing every new dependency, and `fetch` was already available | Add the `resend` npm package |
| 2026-09-07 | In-memory per-IP rate limit on `POST /api/orders`, explicitly best-effort | The only unauthenticated write in the app, and it both writes a row and sends mail per call. In-memory is not correct on multi-instance serverless, but is still better than nothing for three products with no real abuse history yet — logged as a gap rather than reached for Redis pre-emptively | Upstash/Redis-backed limiter from day one |
| 2026-09-07 | Payment: **Paystack inline popup, primary; bank transfer + WhatsApp proof, fallback**. (Amount charged: see 2026-09-12 delivery-areas supersession — `total_kobo`, not products-only.) | Owner has a Paystack account now and named it "the main way"; inline avoids a redirect off-site. Bank transfer covers anyone who won't pay a card online | Paystack hosted-page redirect; card-only, no fallback |
| 2026-09-07 | Payment happens on `/order-success`, never on `/checkout` | One place owns Paystack-trigger logic whether it's the first attempt or a customer returning later via their emailed link to finish paying; the popup also needs a real click handler on a mounted page (most browsers block a popup opened outside a user gesture) | Trigger payment from the checkout form itself |
| 2026-09-07 | Paystack reference is **server-generated** (`POST .../prepare-payment`) and stored on the order BEFORE the popup opens; `verify-payment` requires an exact match against that stored value, enforced again by a DB partial-unique-index (`payment_reference` unique WHERE `payment_status='paid'`) | A client-supplied reference, trusted on its own, would let a real successful transaction from anywhere be replayed against a different order with a matching amount. Requiring the order to already hold the exact reference closes that regardless of amount | Accept any client-reported reference and just verify amount/status with Paystack |
| 2026-09-07 | Payment confirmation is idempotent with two triggers calling one function: the client (`verify-payment`) immediately, and the Paystack webhook as the durable backup | A browser that closes right after the popup succeeds must not leave a genuinely-paid order stuck `unpaid`. Both call `confirmPaystackPayment`, guarded by `WHERE payment_status != 'paid'`, so whichever lands first wins and the second is a no-op — no double emails | Client-only confirmation; no webhook |
| 2026-09-07 | `OrderStatus` gained real use for its `'paid'` stage: payment moves `pending` → `paid` automatically; the admin moves `paid` → `processing` manually when the kitchen actually starts | The enum already had five customer-relevant stages (`pending/paid/processing/shipped/delivered`) from before payment existed; collapsing payment straight into `processing` would have thrown away a real, useful "just paid, not yet started" signal | Skip `paid` and jump straight to `processing` on payment |
| 2026-09-08 | Admin fulfilment is a server-enforced, forward-only state machine: `pending → paid → processing → shipped → delivered`; cancellation is allowed only before dispatch, payment is required before fulfilment advances, and terminal orders cannot be reopened | Delivery happens outside the app, so the owner needs authoritative manual controls, but arbitrary jumps/reversals can falsely notify customers, overwrite milestone timestamps, and decrement stock twice after payment regression. `repository.updateOrderStatus` locks the order row before validating, while `paid_at`/`shipped_at`/`delivered_at` are permanent one-time milestone guards. Customer email is attempted on dispatch and delivery; provider failure remains best-effort and does not roll back the order | Let the status select write any enum value; rely on UI-only warnings; add a full transition-history table before enforcing the workflow |
| 2026-09-08 | The dispatch CSV is a session-guarded server download over a purpose-specific all-orders query, with customer delivery PII included by explicit owner choice | The owner gives order details to dispatch riders and selected a complete ledger (not only active dispatches). Generating it behind `/api/admin/orders/export` keeps the unrestricted dataset out of the client bundle, permits attachment/no-store/nosniff headers, and centralises CSV/formula-injection escaping. Database IDs, access tokens, and payment references are never selected | Export the five dashboard rows in the browser; reuse the latest-50 UI query; expose full `Order` records including credentials |
| 2026-09-08 | Admin order status editing appears both inline in the orders table and on detail; the row also has explicit, keyboard-accessible detail navigation | The existing detail-only control and small linked reference were technically functional but undiscoverable in real use. Both controls call the same typed PATCH client and shared transition graph; the server transaction remains authoritative, so convenience does not create a second workflow | Duplicate transition logic in the table; make the status badge decorative-only; wrap interactive dropdowns inside one row-wide anchor |
| 2026-09-07 | Admin auth: **one shared credential** (`ADMIN_EMAIL` + a `scrypt` hash, Node built-ins, zero new dependency), session as a **stateless HMAC-signed httpOnly cookie** — no session table | Single-owner business, no team accounts (Q21). `getAdminSession()` supersedes the `NODE_ENV` gate from GAP-009 everywhere it appeared | A users table + bcrypt/argon2 package; a DB-backed session store |
| 2026-09-14 | **SUPERSEDES env-only password hash.** Live `password_hash` lives in singleton `admin_auth` (migration 0009). Env `ADMIN_PASSWORD_HASH` is bootstrap-only when the table is empty. Forgot/reset email a one-hour SHA-256-hashed token via Resend. **In-session change** via Settings → Access (`POST /api/admin/change-password`) | App cannot rewrite Vercel env; reset requires a writable store. Same single-owner model (Q21); no invite/roles UI | Keep hash only in env; invent a dead “forgot password” link; multi-user invites |
| 2026-09-14 | Cancelling an order emails the customer (and the shop when `ORDER_EMAIL_TO` is set) via `justCancelled`; admin confirm is an in-page panel, not `window.confirm`. Cancel copy never invents a refund. `ORDER_EMAIL_FROM` must be a mailbox on a Resend-verified domain | Owner expected a customer cancel email and a branded confirm, not a native alert. Resend 422s personal FROM addresses even with a valid API key after a domain is merely added in the dashboard | Native `confirm()`; skip cancel mail; send FROM gmail.com |
| 2026-09-14 | Nigerian state lives on `delivery_areas.state` (migration `0010`). Checkout no longer collects State / region; `POST /api/orders` overwrites `orders.city` and `orders.state` from the selected area. Fee-grouping `region` stays `lagos` or `interstate` | Owner: picking Ibadan then Osun was a real mismatch; fee already comes from the area | Keep an independent 36-state dropdown on checkout |
| 2026-09-14 | **SUPERSEDES 2026-09-07 “Paystack primary; bank transfer fallback”.** New orders are Paystack-only. Checkout and order-success no longer offer a manual bank-transfer option. `whatsapp_transfer` stays on the type/DB check for historical orders; admin can still mark those paid | Owner asked to remove the checkout Bank transfer card | Keep the two-way chooser |
| 2026-09-07 | Every `/admin/**` page (and its layout) explicitly exports `dynamic = "force-dynamic"`, in addition to calling `getAdminSession()` | A real, reproduced bug: with `ADMIN_SESSION_SECRET` unset, `getAdminSession()` used to return early *before* calling `cookies()`, so Next never detected a Request-time API on that path and baked every admin page as a **permanently cached static 404** at build time — see the Gotchas entry below and GAP-009's 2026-09-07 update in `gaps.md`. `force-dynamic` makes this impossible regardless of what any function happens to call | Rely on `cookies()` usage alone to keep the route dynamic |
| 2026-09-07 | Admin order screens (`/admin/orders`, `/admin/orders/[id]`) keep their real, working parts (stat cards, status tabs/counts, table, header, items, totals, address, status/payment controls) and **drop** the fictional ones (Kitchen & Dispatch Timeline, Delivery & Geolocation map, Internal Atelier Notes, Patron Dossier link) rather than wiring them to fake data | None of the four dropped panels have a real data source (no notes table, no courier-location feed); inventing one would repeat the exact mistake this codebase already refused to make for delivery fees and the settlement account in Settings | Keep the panels and populate them with placeholder-but-labelled content |
| 2026-09-07 | Real product catalog: products move from static `content/products.ts` to Postgres (`products`/`product_packs`/`product_images`), matching the ADMIN FORM's field set (teaser/narrative/pairings/ingredients/allergens/packs/images/discount), not the old design's richer "proof"/"provenance" narrative structure | The admin form never had fields for `proof`/`provenance`/`tagline`/`atelier` — that content was always hardcoded, never editable. Carrying it forward as DB content nobody could change would repeat the exact "fake permanence" mistake already refused for admin panels | Preserve the full narrative schema and add admin fields to match it |
| 2026-09-07 | Discount is a single `discount_percent` (1-99, nullable) on the product, applied uniformly across all its packs — never per-tier, never `0` for "no discount" | One promo per product is what was asked for; `null` vs `0` is the same "not yet set" vs "authorised zero" distinction `Order.deliveryFee: null` already established | Per-pack discounts; `0` as the "no discount" sentinel |
| 2026-09-07 | Client-side cart/checkout pricing reads the catalogue via **React context** (`CatalogProvider`/`useCatalog()`), populated by whichever Server Component page already fetched `listPublishedProducts()` — not a public `GET /api/products` endpoint with a client-side fetch-and-cache layer | The only real consumers are `/cart` and `/checkout`, both Server Component pages that can fetch server-side anyway; a public endpoint plus a client fetch would be strictly more code for the same result, and a second way to reach data the page already has | `GET /api/products` + a client-side fetch/cache hook |
| 2026-09-07 | Vercel Blob for product photo upload, client-side direct upload (`@vercel/blob`'s `handleUpload`/`upload()`) — one new dependency | Already on Vercel (hosting); zero new vendor account. Client-side direct upload avoids routing image bytes through this app's own server function and its body-size limits | Supabase Storage; Cloudinary; routing uploads through a Next.js API route as multipart form data |
| 2026-09-07 | Stock decrements automatically the moment an order is confirmed paid (Paystack or a manually-confirmed bank transfer), inside the same transaction as the payment confirmation — clamped at zero, no backorder logic | The admin form's own disabled-state copy already promised this "once the ordering API and payment webhooks are connected" — both now exist, so honouring the promise is a small, natural addition rather than another stale claim left behind | Leave stock as an admin-set number with no automatic movement |
| 2026-09-07 | `/shop`, `/shop/[slug]`, `/cart`, `/checkout`, the homepage and `sitemap.ts` all export `revalidate = 60` | A raw Postgres query (`postgres` driver) is not a Next "Request-time API" the way `cookies()`/`headers()`/`searchParams` are — Next does NOT auto-detect it and mark the route dynamic. Left unset, any of these would have baked today's product list into the build forever, the exact same failure mode (different trigger) as the admin `force-dynamic` bug two rows up in this table | `force-dynamic` on every product-reading page (correct, but pays a full server round trip on every request for a catalogue that doesn't need per-request freshness) |
| 2026-09-08 | Admin dashboard, customers and inventory all moved from `content/*.ts` sample data to real queries in `server/orders/repository.ts`/`server/products/repository.ts`, fetched by each page and passed down as props — same rule every other real admin screen already followed | Owner reported an invented ₦1,842,500 "Settled revenue" figure and asked for the project to be launch-ready; almost the entire dashboard and both remaining screens were still 100% sample content, disclosed by an on-page banner but otherwise fully wired into the live components | Strip the fake numbers without replacing them (an honest-but-empty dashboard rather than a real one) |
| 2026-09-08 | Two dashboard/inventory features from the sample data were **removed**, not reskinned: a rider/delivery-fleet tracking card, and packaging-materials stock (kraft pouches, glass jars) | Neither has ever had a real data source — no delivery-zone/courier table, and `products` only tracks finished-goods stock, never raw packaging consumables. Inventing a placeholder for either repeats the exact "fake permanence" mistake already refused elsewhere in this app | Keep the cards with an honest "not tracked" placeholder |
| 2026-09-08 | Real inventory is one row per **product**, not per pack size | `products.stock_quantity`/`restock_threshold` (added in the 2026-09-07 product-catalog migration) are columns on the product, not the pack — the old sample data's per-pack-size model (`slug::packName` keys) has no real schema to back it | Add a `stock_quantity` column to `product_packs` instead, to preserve the old per-pack shape |
| 2026-09-10 | **Reverse:** inventory is one row per **packaging size** (`product_packs.stock_quantity`/`restock_threshold`/`sku`/`price_kobo`); product-level stock columns dropped | Launch sells three sizes per flavour (100g/300g/500g). Buying out the 100g must not empty the 300g/500g. Order lines freeze `sku` for dispatch. Migration `0007_pack_stock_and_order_sku.sql` | Keep flavour-level stock and treat sizes as display-only price options |
| 2026-09-08 | Customers are derived entirely from `orders`/`order_items`, grouped by `customer_email` — no `customers` table | Guest checkout with no account creation is a hard product requirement (Q12/Q13); email is the only real key across a customer's orders. Name/phone/city/landmark shown are from that customer's MOST RECENT order (an address can legitimately change between orders) | Add a `customers` table and start requiring account creation |
| 2026-09-08 | `AdminOrderSummary` gained a `customerEmail` field | Needed to group a flat list of orders by customer in the view layer (`/admin/customers`'s `page.tsx`) without a second, per-customer database round trip | A separate `getCustomerDetailForAdmin(email)` endpoint fetched on dossier-select (rejected: this UI's whole pattern is "preload everything, filter client-side," established by `customers-directory.tsx`/`inventory-table.tsx` before this session) |
| 2026-09-08 | Dropped the fabricated percentage "deltas" (`+13.4%`, a `Delta` badge component) from every stat tile | With a currently-empty (or just-started) order history there is no honest period-over-period baseline to diff against — a real delta would either divide by zero or show a meaningless `+∞%` the moment the first order lands. Plain totals only, added back later if/when a real baseline exists | Compute a real week-over-week delta now, showing "—" or "New" when the prior period has no data |
| 2026-09-08 | Admin session cookie's `path` changed from `"/admin"` to `"/"` | Real bug, not a security regression: `/admin` is not a path-prefix of `/api/admin/...` (a sibling path, not a child), so the browser was silently withholding the cookie from every admin **write** call (mark-paid, status updates, product create/edit, sign-out) while every admin **page** still gated correctly (`/admin/...` GETs matched fine) — found by placing a real end-to-end test order and hitting a 401 the code review and typecheck had no way to catch. `httpOnly`+`sameSite:"lax"` are the protections that actually matter here; the customer-facing order flow never uses a cookie at all (bearer token in a URL), so there was nothing for a site-wide admin cookie to collide with regardless of path | Scope the path to cover both `/admin` and `/api/admin` some other way (e.g. two cookies, or `path: "/admin"` plus a duplicate at `/api/admin`) — rejected as needless complexity once the actual collision risk turned out to be zero |
| 2026-09-08 | First genuinely admin-writable setting: WhatsApp number + bank-transfer details move from hardcoded constants in `packages/config/src/payment.ts` to a real `site_settings` table (`migrations/0005_settings.sql`), editable on `/admin/settings` | Owner asked to change the WhatsApp number without a code deploy; bank details live behind the exact same pattern and were about to need the same treatment for GAP-013, so both moved together | Env vars (still require a redeploy to change — same problem as hardcoding); a generic `settings(key,value)` table (over-building for four fixed fields) |
| 2026-09-08 | `site_settings` is a Postgres singleton table (`id boolean primary key default true check (id)`), not keyed by an owner id | Exactly one owner, exactly one settings row — the singleton-row idiom means the app never has to handle a "which row?" or "no row yet" case, and a second insert is a primary-key violation, not an application bug to guard against | A `uuid` primary key with an app-level "assume the first row" convention |
| 2026-09-08 | Bank fields (`bankName`/`bankAccountNumber`/`bankAccountName`) are all-or-nothing, enforced by one zod `.refine()` in `lib/admin/settings-schema.ts` | Matches the display-side rule `payment-actions.tsx` already had (the "send payment proof" flow only renders once every bank field is set) — a half-filled bank block saved from the admin form would otherwise be indistinguishable from a real, usable one until a customer actually tried to use it | Let each field validate independently and rely on the display layer alone to hide a half-filled block |
| 2026-09-08 | `PaymentSettings`/`BankTransferDetails` stay defined in `packages/config/src/payment.ts`, not in the (`server-only`) `server/settings/repository.ts` | The shape needs to reach a Client Component (`payment-actions.tsx`, the admin form) as well as server code; a type imported from a `server-only`-guarded module into client code is untested territory in this codebase, whereas `packages/config` is already freely imported everywhere, same precedent as `Product`/`Order` living in `@lamiefoods/types` rather than a repository file | Import `type` from `server/settings/repository.ts` into client files (relies on TS type-only imports being fully erased by the bundler — plausible, but a new, unproven pattern here) |

- **Supabase: use the transaction pooler connection string (port 6543), not the
  direct connection**, for `DATABASE_URL`. Serverless functions open a connection
  per invocation and exhaust Supabase's direct-connection limit quickly. Also set
  `prepare: false` on the `postgres()` client — pgBouncer-style poolers can't hold
  server-side prepared statements across pooled connections, and leaving it on
  produces intermittent "prepared statement already exists" errors that only show
  up under concurrency. — `apps/web/src/server/db/client.ts`
- The Postgres connection is cached on `globalThis`, not module scope. `next dev`
  re-evaluates modules on every hot reload; without the cache, each edit during
  development opens another pool and leaks connections until the database starts
  refusing new ones. — `apps/web/src/server/db/client.ts`
- **postgres.js types a transaction handle (`sql.begin(async (tx) => ...)`'s
  `tx`) as `TransactionSql`, a DIFFERENT, structurally-incompatible interface
  from `Sql`** (the type of `db()`'s return value), even though both are
  callable tagged-template functions with the identical query surface —
  `TransactionSql` just omits pool-management methods that make no sense
  mid-transaction (`.end()` etc.). A function meant to run either standalone
  or inside someone else's transaction (e.g. `decrementStockInTx`, called
  from both a bare `db()` context and from inside
  `confirmPayment`/`updateOrderStatus`'s transactions) needs the union type
  `Db = ReturnType<typeof db> | postgres.TransactionSql`, not just
  `ReturnType<typeof db>` — the latter compiles fine until the first caller
  tries to pass a real `tx` in. — `apps/web/src/server/db/client.ts`
- **Turbopack's Google Fonts optimization needs to fetch the actual font
  files at build time** (`next/font/google`, resolved through
  `@vercel/turbopack-next/internal/font/google/font` against
  `fonts.gstatic.com`) — if that host is unreachable from the build
  environment, `next build` fails with a `Module not found` error pointing at
  a `.module.css` file, which reads like a real code/config problem but
  isn't one. Confirmed via direct `curl` to `fonts.gstatic.com` returning no
  response at all while `fonts.googleapis.com` (a different host) responded
  normally — a real, intermittent network condition, not a Next.js or project
  configuration issue. `npm install` hit an unrelated but analogous network
  timeout earlier the same session (see `progress.md`, 2026-09-07). If this
  recurs: confirm with `curl -o /dev/null -w '%{http_code}' <host>` before
  assuming a code change broke the build — `next lint`/`tsc --noEmit` passing
  cleanly while `next build` fails this exact way is close to diagnostic on
  its own. — `apps/web/src/app/layout.tsx` (the `next/font/google` imports)
- **A `cookies()` call buried behind an early return does NOT reliably keep a
  route dynamic.** `getAdminSession()` checked whether `ADMIN_SESSION_SECRET`
  was set and returned `false` immediately if not — *before* ever calling
  `cookies()`. Built with the secret unset, Next's static analysis never saw
  a Request-time API on that code path and baked every `/admin/**` page as a
  **permanently cached static 404** (confirmed via the prerender manifest:
  `initialRevalidateSeconds: false`, and by reading the raw
  `.next/server/app/admin.html` — it was a frozen `NEXT_HTTP_ERROR_FALLBACK;404`).
  In a real deploy the secret would be set at build time, so this would
  self-correct on that particular build — but a security-critical route
  should never depend on an env var happening to be set for its static/
  dynamic classification to come out right. Fixed two ways, both now
  required for any future auth-gated route: (1) call the Request-time API
  **first**, before any early return; (2) export
  `const dynamic = "force-dynamic"` explicitly from the page — don't rely on
  incidental dynamic-API detection at all for something this important.
  **Verify by reading the build's own route table** (`○` vs `ƒ` in
  `next build`'s output), not just that lint and typecheck pass — neither
  would have caught this. — `server/admin/session.ts`, every
  `app/admin/(portal)/**/page.tsx`

- **A cookie's `path` attribute is not a security boundary you can guess at —
  verify it against every URL that needs to read the cookie, not just the
  ones that render pages.** The admin session cookie was set with
  `path: "/admin"`, intended to keep it off customer-facing routes. It
  compiled, typechecked, and every admin PAGE load worked perfectly (page
  navigations hit `/admin/...` directly, which matches). What silently broke:
  every admin **API call** from client-side JS (`fetch("/api/admin/orders/...")`
  etc.) — `/admin` is not a path-prefix of `/api/admin/...` per RFC 6265 (a
  sibling top-level segment, not a child), so the browser never attached the
  cookie to those requests, and every write action (mark-paid, status
  updates, product create/edit, sign-out) failed with a 401 that read as
  "somehow not signed in" despite the page clearly showing a signed-in admin.
  Found only by placing a real order through the real API end-to-end and
  clicking the real "mark as paid" action — lint, typecheck, and even
  rendering every admin page successfully gave zero signal. Fixed by using
  `path: "/"` — `httpOnly` + `sameSite: "lax"` are what actually matter for
  this cookie's security, and there was no real collision to guard against
  in the first place (the customer-facing order flow uses a bearer token in
  a URL, never a cookie). **Lesson: when a cookie (or any path-scoped
  credential) needs to reach both a page tree and a sibling API tree, test
  the actual write path, not just that the pages render.** —
  `apps/web/src/server/admin/session.ts`
- **A plain function exported from a `"use client"` file cannot be called
  from a Server Component** — only imported and rendered as JSX. Moving
  `stockStatus()` into `inventory-table.tsx` (a client component, for its
  filter-tab/status-badge logic) and then calling it directly from
  `inventory-view.tsx` (a Server Component) compiled and typechecked cleanly,
  then threw at request time: `Attempted to call stockStatus() from the
  server but stockStatus is on the client.` Next's RSC boundary rule isn't
  enforced by `tsc`. Fixed by moving the shared predicate into a plain
  (non-`"use client"`) module (`lib/admin/stock-status.ts`) that both the
  server and client sides import. — `apps/web/src/lib/admin/stock-status.ts`
- Internal deps are pinned `"*"`, **not** `workspace:*` — npm errors on the pnpm
  protocol. Don't "fix" them back. — `package.json` deps, `CLAUDE.md`, `README.md`
- Next 16 **removed build-time linting**, so `npm run lint` is a *separate* step that
  must run in CI alongside `build` — a green build does not mean lint passed. —
  `apps/web/next.config.ts:16-19`, `README.md`
- Tailwind v4 only scans imports it can see; the shared `packages/ui/src` is outside
  the app tree, so it's pointed at explicitly via `@source`. New shared UI dirs need
  the same. — `apps/web/src/styles/globals.css:5`
- Workspace packages ship **raw TypeScript**, so Next must transpile them —
  `transpilePackages` lists all three. A new shared package used by web must be added
  here or it won't compile. — `apps/web/next.config.ts:7`
- `config/env.ts` must reference each `NEXT_PUBLIC_*` key as a full literal; a dynamic
  lookup silently breaks Next's build-time inlining and the value becomes `undefined`
  in the browser. — `apps/web/src/config/env.ts:6-9,22-26`
- `apps/web/AGENTS.md` is **auto-regenerated by `next dev`** (see
  `node_modules/next/dist/server/lib/generate-agent-files.js`). It warns Next 16
  differs from training data — read `node_modules/next/dist/docs/` before writing
  framework code. Removing it from a diff just re-creates the change.
- `ignore-scripts` is deliberately **off** in `.npmrc` — turning it on breaks the
  ESLint import resolver's native binding. Audit new deps instead. — `.npmrc`
- **SUPERSEDED 2026-09-07**: `ApiNotConfiguredError` no longer exists. `apiFetch`
  used to throw it whenever `NEXT_PUBLIC_API_URL` was unset — which was always,
  since no backend existed. Now it resolves against this app's own `siteUrl`
  instead, since the API is same-origin. — `apps/web/src/lib/api/client.ts`
- **STALE, now false**: an earlier version of this doc said "no admin app, pages,
  or logic consume [`ADMIN_ROUTES`/the enums] yet." Every `ADMIN_ROUTES` screen is
  built (dev-gated behind GAP-009, see `gaps.md`). Left here as a reminder that
  this file drifts — if a claim reads stale, verify against the code before
  trusting it, and fix it in the same pass rather than propagating it further.

## Glossary

| Term | Meaning |
|---|---|
| Chinchin | Fried Nigerian dough snack; Lamie Foods' launch product/category (not the whole catalogue) |
| Kobo | Minor unit of the Nigerian naira (₦1 = 100 kobo); all money stored as integer kobo |
| NGN / en-NG | Nigerian naira currency code / Nigerian English locale — the app's only currency and default locale |
| Paystack | Nigerian payment gateway; only its `pk_`-prefixed **public** key may reach the frontend |
| Stitch design | The approved (not-yet-supplied) brand/visual design the placeholder palette and scaffold pages await |
| `apiFetch` | The single gateway function through which all backend requests must flow |
| Provisional (types/tokens) | Frontend's current best guess, explicitly **not** authoritative — reconciled against real brand/backend before use |
