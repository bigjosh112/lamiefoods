# API Integration — contract catalog + client pattern

> The single source of truth for every backend endpoint this app consumes, plus the
> canonical pattern for consuming them. Populated by the `consume-endpoint` skill.
>
> **The iron rule: contracts are recorded, never invented.** Every entry cites its
> evidence — backend source code, a screenshot from the backend platform, an API doc,
> or a real captured response. If a field's type or optionality is unknown, it stays
> marked `UNKNOWN — ask backend` until confirmed. No guessed shapes, ever.

## RESOLVED 2026-09-07 — what the questions below turned into

> This section stood as PENDING from 2026-09-06. It is answered now: the owner
> overrode CLAUDE.md rule 10 and the backend was built as Next.js Route Handlers
> in this same app rather than a separate `apps/backend` service — see
> `architecture.md`'s decision log. Answers, in the original numbered order:
>
> 1. **Create-order endpoint** — `POST /api/orders`, catalogued below. Takes
>    `{slug, pack, quantity}[]`, exactly as guessed.
> 2. **Who owns pricing?** The server. `server/orders/pricing.ts` re-prices every
>    line from `content/products.ts`; the request body has no price field for a
>    tampered value to even go in.
> 3. **Delivery fee** — still not calculated anywhere. `Order.deliveryFee` is
>    `Money | null` and stored `null` on every order. Paystack now charges the
>    subtotal only (see item 4's update) — delivery is still collected
>    separately once a fee exists.
> 4. **Paystack flow — UPDATE 2026-09-07: built.** The owner got a Paystack
>    account; see `POST /api/orders/:token/prepare-payment`,
>    `POST /api/orders/:token/verify-payment`, and
>    `POST /api/webhooks/paystack` below for the real, now-recorded flow. The
>    original answer ("not built... do not simulate it") stood for one day.
> 5. **Order reference** — generated server-side in `createOrder()`
>    (`server/orders/repository.ts`), returned in the 201 response.
> 6. **Error envelope** — `{ error: string }`, optionally `{ issues }` for
>    validation failures. Documented per-endpoint below.
> 7. **Stock** — not checked at *order create*. Stock lives on
>    `product_packs.stock_quantity` (per size) and decrements on payment
>    confirmation (`decrementStockInTx` matches slug + pack name). Oversell
>    between place and pay is still possible; create-time stock checks remain
>    a future audit surface. `/admin/inventory` lists one row per pack.
>    Order lines freeze `sku` at purchase.
>
> 8. **Sales ranking — STILL OPEN.** Nothing yet says how much of each product
>    has actually sold. Both the landing row and the shop grid hardcode a "New"
>    badge because that is a launch status true of everything; the owner wants
>    **"Best seller"** once records exist. That badge is a claim about what other
>    customers bought, so it must come from real order data — inventing it would
>    be inventing social proof, the same failure as a fabricated review. Nothing
>    renders it until this is answered.
>
> Note on answer 7: pack-level stock and decrement-on-pay landed 2026-09-10
> (migration 0007); the create-order path still does not reject an
> out-of-stock line before writing the order.


## Base configuration

- **Base URL:** same-origin. `NEXT_PUBLIC_API_URL` is checked first for a
  genuinely external backend; when unset (the normal case), `apiFetch` resolves
  against this app's own `siteUrl` (`config/env.ts`).
- **Auth scheme:** none. Guest checkout only — no accounts exist (owner
  confirmed, Q12/Q13). Reading an order back is gated by a random 32-byte
  `access_token` in the URL, not a session.
- **Common headers:** `Content-Type: application/json`, `Accept: application/json`.
- **Common error envelope:** `{ "error": "human-readable message" }`. Validation
  failures additionally carry `{ "issues": ZodIssue[] }` (from
  `createOrderSchema.safeParse`).

## Canonical consumption pattern

Every endpoint is consumed in three layers, in this order. Follow the shapes of the
first implemented endpoint in this repo; if none exists yet, establish them from this
template.

1. **Typed client function** — `src/lib/api/<resource>.ts`
   One function per endpoint. Owns: URL building, method, headers, serialization,
   throwing a typed error on non-2xx. Owns nothing about React.
2. **Hook** — `src/hooks/use<Resource>.ts`, when there's real state to share.
   Wraps the client function. Owns: loading/error/data state, cancellation/stale
   guards, cache or refetch policy. Returns `{ data, error, isLoading, <actions> }`.
   **Not mandatory for a one-shot mutation with exactly one call site** — `useCart`
   is a real example of layer 2 (shared read state, multiple consumers);
   `CheckoutForm`'s own `useState` around `createOrder()` is the layer-2-skipped
   case, and that's fine: a hook wrapping a single call site with nothing to share
   is indirection, not abstraction. Add the hook the moment a second consumer or
   real caching need appears.
3. **UI states** — every consuming component renders **all four**:
   loading (skeleton/spinner), error (message + retry), empty (real empty-state, not
   a blank screen), success. A PR that adds an endpoint without all four is incomplete.

## Endpoint catalog

<!-- One entry per endpoint. Copy the template at the bottom. Newest at the bottom, grouped by resource. -->

---

### POST `/api/orders`

- **Purpose:** Places a guest order (no account). Called on checkout submit.
- **Auth:** none — guest checkout by design (Q12/Q13).
- **Evidence:** this repo, `apps/web/src/app/api/orders/route.ts`, built 2026-09-07.
  Recorded here per house rule 3 — this IS the source, not a third-party doc.
- **Rate limit:** ~8 requests / 10 min per IP, in-memory and best-effort (not
  correct across multiple serverless instances — see `architecture.md`'s
  2026-09-07 decision log). Returns 429 with `Retry-After` when exceeded.
- **Request:**
  - Body (validated by `lib/orders/order-request.ts` → `createOrderSchema`, the
    exact same schema the client uses before sending):
    ```jsonc
    {
      "customer": {
        "fullName": "string, 2–80 chars",
        "email": "string, valid email, ≤160 chars",
        "phone": "string, +234 then 7/8/9 then 9 digits — e.g. +2348012345678",
        "deliveryAddress": {
          "addressLine": "string, 6–160 chars",
          "landmark": "string, 3–160 chars — required, not optional",
          "city": "string, 2–80 chars",
          "state": "string, 1–80 chars"
        }
      },
      "lines": [
        { "slug": "string, matches content/products.ts", "pack": "string, exact pack display name, e.g. \"250g Pouch\"", "quantity": "integer 1–20" }
      ]
    }
    ```
  - **No price field anywhere in the request.** This is deliberate, not an
    omission — see the pricing decision in `architecture.md`. Up to 24 lines.
- **Response 2xx:** `201`
  ```jsonc
  { "reference": "LF-7K2QX4", "token": "base64url, 32 random bytes" }
  ```
  `token` is the capability to read the order back at
  `/order-success?token=…` — treat it like a credential (it's in a URL, so
  don't log full request URLs server-side with it present). `reference` is
  human-readable only; it is NOT sufficient to fetch the order.
- **Errors:**
  - `400` — body isn't JSON, or fails `createOrderSchema` → `{ error, issues }`
  - `409` — a line's `slug`/`pack` doesn't match the catalogue → `{ error, detail }`
  - `429` — rate limited → `{ error }`, `Retry-After` header
  - `503` — `DATABASE_URL` unset → `{ error }`. Distinguishes "ordering isn't
    built" from "ordering broke" for the UI's error copy.
  - `500` — DB write failed → `{ error }`. Order is NOT recorded; safe to retry.
- **Quirks:** Delivery fee and total are never set by this endpoint — every
  order is created with `deliveryFee: null`, `total: null`, `status: "pending"`,
  `paymentStatus: "unpaid"`. Email (customer confirmation + owner notification,
  `server/email/order-emails.ts`) is sent after the DB write and is best-effort:
  a Resend failure does not fail the request or roll back the order.
- **Consumed by:** client `createOrder` (`lib/api/orders.ts`) · no hook (see
  "Canonical consumption pattern" above) · UI `CheckoutForm`
  (`components/checkout/checkout-form.tsx`)

---

### GET `/api/orders/:token`

- **Purpose:** Fetches one order for `/order-success?token=…`.
- **Auth:** the token itself IS the auth — 32 random bytes, not guessable.
  Deliberately **not** keyed on `reference`; see the lookup decision in
  `architecture.md` (a short, printed reference must never be sufficient to
  pull a name/phone/address).
- **Evidence:** this repo, `apps/web/src/app/api/orders/[token]/route.ts`,
  built 2026-09-07.
- **Request:** Path param `token: string`. No body, no query.
- **Response 2xx:** an `Order` from `@lamiefoods/types` (see that package for
  the full shape — `items[]` each carry `pack`, `deliveryFee`/`total` are
  `Money | null`).
- **Errors:** `404` → no order for that token (wrong/expired/never existed —
  same response either way, so a token can't be used to distinguish those).
  `503` → `DATABASE_URL` unset. `500` → lookup failed.
- **Quirks:** In Next 16, `params` is a `Promise` — `await params` before use.
  This endpoint is **not actually called by the frontend** today: the one
  consumer is `app/order-success/page.tsx`, a Server Component, which calls
  `findOrderByToken()` in `server/orders/repository.ts` directly, in-process,
  rather than fetching this route over HTTP (see the Server-Component rule in
  "Canonical consumption pattern"). This route exists for any future
  non-Next consumer (a status-check script, a different client) and is
  exercised by hitting it directly, not through `apiFetch`.
- **Consumed by:** `server/orders/repository.ts:findOrderByToken` (direct,
  in-process, from `app/order-success/page.tsx`) — no client function, no hook.

---

### POST `/api/orders/:token/prepare-payment`

- **Purpose:** Registers a fresh Paystack reference for this order's payment
  attempt, BEFORE the customer's browser opens the inline popup. Called by
  `/order-success`'s "Pay now" button, every time (including a retry).
- **Auth:** token-guarded, same trust boundary as `GET /api/orders/:token`.
- **Evidence:** this repo,
  `apps/web/src/app/api/orders/[token]/prepare-payment/route.ts`, built
  2026-09-07.
- **Rate limit:** 20 requests / 10 min per IP.
- **Request:** Path param `token`. No body.
- **Response 2xx:** `200`
  ```jsonc
  { "reference": "LF-7K2QX4-a1b2c3d4", "amountKobo": 760000, "email": "customer@example.com" }
  ```
  `reference` is server-generated (`${order.reference}-${4 random bytes hex}`)
  and immediately stored as the order's current `payment_reference` — the
  client MUST use exactly this value when calling `PaystackPop.setup`, not
  invent its own. See the design decision in `architecture.md`: this is what
  makes `verify-payment` (below) safe to trust a client-reported reference at
  all — without it, a reference from someone else's real, successful
  transaction could be replayed against this order.
- **Errors:** `404` no such order · `409` order already paid · `429` rate
  limited · `503` `DATABASE_URL` or `PAYSTACK_SECRET_KEY` unset.
- **Consumed by:** client `preparePayment` (`lib/api/orders.ts`) · no hook ·
  UI `PaymentActions` (`components/order/payment-actions.tsx`)

---

### POST `/api/orders/:token/verify-payment`

- **Purpose:** Confirms a Paystack popup's reported success against the order
  it was prepared for. Called immediately after `PaystackPop`'s `callback`
  fires.
- **Auth:** token-guarded.
- **Evidence:** this repo,
  `apps/web/src/app/api/orders/[token]/verify-payment/route.ts`, built
  2026-09-07.
- **Rate limit:** 20 requests / 10 min per IP.
- **Request:** Path param `token`. Body: `{ "paystackReference": "string" }`.
- **Response 2xx:** `200`, `{ "order": Order }` — the updated order.
- **Errors:** `400` bad body · `402` Paystack verification failed (wrong
  status/amount/currency — see `paystack.ts:confirmPaystackPayment`) ·
  `404` no such order · `409` reference doesn't match this order's current
  attempt, or has already been used to pay a **different** order (the
  partial unique index in `migrations/0002_payments_and_admin.sql`) ·
  `503` Paystack/DB unset.
- **Quirks:** Idempotent. A second call with a reference this order already
  used to get paid returns `200` with the same order, not an error — see
  `repository.confirmPayment`'s doc comment. This lets both this route and
  the webhook below call the same underlying function without coordinating.
  On the first unpaid→paid transition (`newlyConfirmed`),
  `confirmPaystackPayment` best-effort emails the customer
  (`paymentConfirmedEmail`) and, when `ORDER_EMAIL_TO` is set, the shop
  (`ownerPaymentConfirmedEmail`). Failed Resend sends do not fail this
  response (GAP-012); a later verify/webhook will not re-send.
- **Consumed by:** client `verifyPayment` (`lib/api/orders.ts`) · no hook ·
  UI `PaymentActions`

---

### POST `/api/webhooks/paystack`

- **Purpose:** The durable backup confirmation path — fires even if the
  customer's browser never completes the call above (closed tab, dropped
  connection right after the popup reports success).
- **Auth:** Paystack's own `x-paystack-signature` header (HMAC-SHA512 of the
  **raw** request body, keyed with `PAYSTACK_SECRET_KEY`), verified before
  the body is parsed as JSON at all.
- **Evidence:** this repo, `apps/web/src/app/api/webhooks/paystack/route.ts`,
  built 2026-09-07. **Not yet registered against a real Paystack dashboard or
  exercised by a live event — see GAP-014 in gaps.md.**
- **Request:** Paystack's standard webhook envelope,
  `{ "event": "charge.success", "data": { "reference", "amount", "currency", "status", ... } }`.
- **Response:** Always `200` (Paystack retries on non-2xx, and there is
  nothing to usefully retry into for an event this route doesn't act on) —
  **except** an invalid signature, which is `401`.
- **Quirks:** Re-verifies via Paystack's own verify API even though the
  signature already proves the request's origin — a webhook proves *who
  sent this*, not that its claimed amount/status is what actually happened;
  Paystack's own guidance is to treat verification as the source of truth.
  Calls the exact same `confirmPaystackPayment` as `verify-payment` above,
  so it inherits the same idempotency guarantee and the same customer +
  owner payment-confirmed email side effects (owner only when
  `ORDER_EMAIL_TO` is set).
- **Consumed by:** Paystack's servers only — no `apiFetch` client, by
  definition (nothing in this app calls its own webhook).

---

### POST `/api/admin/login`

- **Purpose:** Verifies the shared admin credential and issues the session
  cookie. The only write `AdminLoginForm` performs.
- **Auth:** none required to call it (it's how auth starts) — the response
  itself IS the auth grant.
- **Evidence:** this repo, `apps/web/src/app/api/admin/login/route.ts`, built
  2026-09-07.
- **Rate limit:** 5 requests / 15 min per IP — tighter than every other
  limiter in this app, deliberately: this is the one endpoint that exists
  specifically to be guessed against.
- **Request:** `{ "email": "string", "password": "string", "remember": "boolean" }`
  (`lib/admin/login-schema.ts`).
- **Response 2xx:** `200`, `{ "ok": true }`. Sets `lamie_admin_session`,
  `httpOnly`, `secure` in production, `sameSite: "lax"`, `path: "/"`,
  `maxAge` 12h (or 30d if `remember`).
- **Errors:** `400` bad body · `401` incorrect email or password (identical
  message for both — see `login-schema.ts` on why) · `429` rate limited ·
  `503` `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH`/`ADMIN_SESSION_SECRET` not all set.
- **Consumed by:** client `adminLogin` (`lib/api/admin.ts`) · no hook · UI
  `AdminLoginForm` (`components/admin/admin-login-form.tsx`)

---

### POST `/api/admin/logout`

- **Purpose:** Clears the session cookie.
- **Auth:** none needed — clearing a cookie that may not exist is always safe.
- **Evidence:** this repo, `apps/web/src/app/api/admin/logout/route.ts`, built
  2026-09-07.
- **Request:** none.
- **Response 2xx:** `200`, `{ "ok": true }`.
- **Consumed by:** client `adminLogout` (`lib/api/admin.ts`) · no hook · UI
  `SignOutButton` (`components/admin/sign-out-button.tsx`), rendered from
  `AdminShell`'s header and its operator card.

---

### PATCH `/api/admin/orders/:reference`

- **Purpose:** The one real write path the admin order screens use: changing
  delivery status, and/or manually confirming a bank-transfer payment.
- **Auth:** session-guarded (`getAdminSession()`) — a completely different
  trust boundary from every customer-facing endpoint above, none of which
  accept a session cookie or check for one.
- **Evidence:** this repo,
  `apps/web/src/app/api/admin/orders/[reference]/route.ts`, built 2026-09-07.
- **Request:** Path param `reference` (the human reference, e.g. `LF-7K2QX4`
  — safe to look up directly here, unlike the customer-facing token rule,
  because this route is already behind the session gate). Body:
  `{ "status"?: OrderStatus, "paymentStatus"?: "paid" }` — exactly one admin
  action is normally sent at a time. `paymentStatus: "paid"` is only valid for
  a manually confirmed `whatsapp_transfer`; it also moves a still-`pending`
  order to `paid`.
- **Status transitions:** forward-only
  `pending → paid → processing → shipped → delivered`; `cancelled` may be
  reached from `pending`, `paid`, or `processing`, but `shipped`, `delivered`,
  and `cancelled` are never reopened. Fulfilment cannot advance until
  `paymentStatus` is `paid`. The UI labels `shipped` as “Out for delivery.”
- **Response 2xx:** `200`, `{ "order": Order }`.
- **Errors:** `400` neither field provided / bad body · `401` no session ·
  `404` no such order · `409`
  `{ "error": "string", "code": "ORDER_STATUS_CONFLICT" }` for an invalid,
  stale, or conflicting transition ·
  `503` `DATABASE_URL` unset.
- **Side effects/idempotency:** Sends whichever milestone email was reached
  (`justProcessing`/`justShipped`/`justDelivered`/`justPaid` from
  `repository.updateOrderStatus`). Customer always gets the matching
  template (`paymentConfirmedEmail` / `orderProcessingEmail` /
  `orderShippedEmail` / `orderDeliveredEmail`). When `ORDER_EMAIL_TO` is set,
  the shop also gets `ownerPaymentConfirmedEmail` /
  `ownerProcessingEmail` / `ownerShippedEmail` / `ownerDeliveredEmail`. The
  transaction locks the current order and uses the persisted
  `shipped_at`/`delivered_at`/`paid_at` timestamps (and the forward-only
  `paid` → `processing` transition for preparing), so a milestone
  notification is attempted only once and a concurrent stale write cannot
  overwrite the winning transition. Email remains best-effort: a provider
  failure does not roll back the saved status.
  A Paystack-paid order can never trigger the `justPaid` email through this
  route, since `confirmPaystackPayment` already sent its own the moment
  payment cleared — this route's `paymentStatus: "paid"` path exists for the
  bank-transfer manual-confirmation case only.
- **Consumed by:** client `updateOrderStatus` (`lib/api/admin-orders.ts`) ·
  no hook · UI `OrderStatusControl` (`components/admin/order-status-control.tsx`)

---

### GET `/api/admin/orders/export`

- **Purpose:** Downloads the complete order ledger as a dispatch-ready CSV.
  This is intentionally separate from `listOrdersForAdmin()`'s latest-50 UI
  query: “all orders” means every stored order, newest first.
- **Auth:** session-guarded (`getAdminSession()`). The response contains
  customer contact details and home addresses, so authentication happens
  before the export query.
- **Evidence:** this repo,
  `apps/web/src/app/api/admin/orders/export/route.ts`, built 2026-09-08.
- **Request:** none.
- **Response 2xx:** `200`, UTF-8 `text/csv` attachment named
  `lamie-foods-orders-YYYY-MM-DD.csv`. Columns, in order:
  `order_reference`, `ordered_at`, `customer_name`, `customer_email`,
  `customer_phone`, `address_line`, `landmark`, `city`, `state`, `items`,
  `subtotal_ngn`, `currency`, `payment_method`, `payment_status`,
  `fulfilment_status`. Customer/product text is CSV-escaped and neutralised
  against spreadsheet formula injection. The export never includes database
  IDs, customer `access_token`, or Paystack/payment references.
- **Headers:** `Content-Disposition: attachment`,
  `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`.
- **Errors:** JSON `401` no session · `503` `DATABASE_URL` unset · `500`
  export query/serialization failure.
- **Consumed by:** direct browser links on the admin dashboard and
  `/admin/orders`; no JSON client helper is involved.

---

### POST `/api/admin/products`

- **Purpose:** Create a product.
- **Auth:** session-guarded (`getAdminSession()`).
- **Evidence:** this repo, `apps/web/src/app/api/admin/products/route.ts`,
  built 2026-09-07.
- **Request:** the exact shape `productSchema` validates client-side
  (`lib/admin/product-schema.ts`) — re-validated here, not trusted. Notably:
  `slug` (lowercase-kebab, admin-editable, auto-suggested from the title but
  not re-derived on every keystroke once touched), `category` (real
  `ProductCategory` enum, not a free string), `tiers` (each: name, naira
  price string → kobo, required SKU, stock on hand, restock threshold —
  inventory is **per size**, not per flavour), `discountPercent`
  (`1`-`99` or `null` — never `0`), `images` (`{url, alt, role}[]`, max **5**,
  populated client-side by uploading to Vercel Blob first — see
  `POST /api/admin/uploads` below — never containing raw file bytes). Array
  index 0 is always the hero; `toProductInput` forces `role`/`alt` accordingly
  (blank alt falls back to the product title). More than five images → `400`.
  Duplicate pack SKUs → `400`/`409` via unique index on `product_packs.sku`.
- **Response 2xx:** `201`, `{ "product": Product }`.
- **Errors:** `400` invalid body · `401` no session · `409` slug already used
  by another product · `503` `DATABASE_URL` unset.
- **Consumed by:** client `createProduct` (`lib/api/admin-products.ts`) · no
  hook · UI `ProductForm` (`components/admin/product-form.tsx`)

---

### PATCH `/api/admin/products/:slug`

- **Purpose:** Full replace of one product's fields, packs and images.
  `:slug` is the product's CURRENT slug; the body's own `slug` field may
  rename it (same distinction the admin orders route makes between the URL
  identifier and what's inside the body).
- **Auth:** session-guarded.
- **Evidence:** this repo,
  `apps/web/src/app/api/admin/products/[slug]/route.ts`, built 2026-09-07.
- **Request:** identical shape to `POST /api/admin/products`.
- **Response 2xx:** `200`, `{ "product": Product }`.
- **Errors:** `400` invalid body · `401` no session · `404` no such product ·
  `409` renamed slug collides with another product · `503` `DATABASE_URL` unset.
- **Quirks:** Packs and images are deleted and reinserted on every save, not
  diffed — at three products this is simpler code for a cost nobody will
  notice; reconsider if the catalogue grows into the hundreds.
- **Consumed by:** client `updateProduct` (`lib/api/admin-products.ts`) · no
  hook · UI `ProductForm`

---

### DELETE `/api/admin/products/:slug`

- **Purpose:** Permanently remove one product from the catalogue. Packs and
  images cascade-delete with the product row. Past `order_items` are
  untouched (frozen text, no FK). Blob URLs are not cleaned up.
- **Auth:** session-guarded.
- **Evidence:** this repo,
  `apps/web/src/app/api/admin/products/[slug]/route.ts`, built 2026-09-10
  (admin bulk delete plan).
- **Request:** none (slug in path).
- **Response 2xx:** `204` empty body.
- **Errors:** `401` no session · `404` no such product · `503` `DATABASE_URL`
  unset.
- **Consumed by:** client `deleteProduct` (`lib/api/admin-products.ts`) · no
  hook · available for single-row use; bulk UI prefers `POST …/bulk`

---

### POST `/api/admin/products/bulk`

- **Purpose:** Apply one action to many products by slug: `unpublish` (set
  `storefront_active = false`) or `delete` (hard delete, same cascade rules
  as single DELETE).
- **Auth:** session-guarded.
- **Evidence:** this repo, `apps/web/src/app/api/admin/products/bulk/route.ts`,
  built 2026-09-10.
- **Request:** `{ "action": "unpublish" | "delete", "slugs": string[] }` —
  `slugs` non-empty, unique, max 50, each a non-empty string. Validated with
  zod server-side.
- **Response 2xx:** `200`, `{ "affected": number }` — rows updated or
  deleted (unknown slugs are skipped, not an error).
- **Errors:** `400` invalid body · `401` no session · `503` `DATABASE_URL`
  unset.
- **Consumed by:** client `bulkUnpublishProducts` / `bulkDeleteProducts`
  (`lib/api/admin-products.ts`) · no hook · UI `ProductsList`

---

### PATCH `/api/admin/settings`

- **Purpose:** Save the WhatsApp contact number and bank-transfer account
  details — the first genuinely admin-writable site setting. Full replace of
  the one `site_settings` row (a singleton — see `architecture.md`'s
  2026-09-08 decision log).
- **Auth:** session-guarded (`getAdminSession()`).
- **Evidence:** this repo, `apps/web/src/app/api/admin/settings/route.ts`,
  built 2026-09-08.
- **Request:** the exact shape `settingsSchema` validates client-side
  (`lib/admin/settings-schema.ts`) — re-validated here, not trusted.
  `whatsappNumber` (digit-only, `7`-`15` digits, no `+`/spaces — the `wa.me`
  format) or empty string for "unset". `bankName`/`bankAccountNumber`/
  `bankAccountName` are all-or-nothing: filling in one without the other two
  fails validation (`400`), matching the display-side rule that a "send
  payment proof" WhatsApp flow only ever renders once every bank field is
  real.
- **Response 2xx:** `200`, `{ "settings": PaymentSettings }` (`{
  whatsappNumber: string | null; bankTransfer: BankTransferDetails | null }`,
  types in `@lamiefoods/config`).
- **Errors:** `400` invalid body (including the all-or-nothing bank-fields
  violation) · `401` no session · `503` `DATABASE_URL` unset.
- **Consumed by:** client `updateSettings` (`lib/api/admin-settings.ts`) · no
  hook · UI `PaymentSettingsForm` (`components/admin/payment-settings-form.tsx`,
  rendered inside `/admin/settings`'s "Delivery & payment" panel). The saved
  value is read by `server/settings/repository.ts`'s `getSettings()` and
  flows into `order-success/page.tsx` → `PaymentActions` as props — never a
  static `@lamiefoods/config` import on the customer-facing side anymore.

---

### POST `/api/admin/uploads`

- **Purpose:** Issues a short-lived Vercel Blob client-upload token, so a
  product photo goes straight from the admin's browser to Blob storage —
  never through this app's own server, avoiding its request body-size limits
  entirely.
- **Auth:** session-guarded, checked inside `onBeforeGenerateToken` — per
  Vercel's own docs, that callback is the ONLY thing standing between this
  endpoint and a public, unauthenticated upload target.
- **Evidence:** this repo, `apps/web/src/app/api/admin/uploads/route.ts`,
  built 2026-09-07, following `@vercel/blob/client`'s documented
  `handleUpload` pattern exactly (verified against
  vercel.com/docs/vercel-blob/client-upload before implementing, not
  written from memory — a payments-adjacent integration got the same
  treatment last session for the same reason).
- **Request:** `@vercel/blob/client`'s own `HandleUploadBody` — the calling
  browser's `upload()` call constructs this, never called directly by this
  app's own code.
- **Response 2xx:** `200`, `@vercel/blob/client`'s own token/callback
  envelope — opaque to this app, just passed through.
- **Errors:** `401` no session · `503` `BLOB_READ_WRITE_TOKEN` unset · `400`
  anything `handleUpload` itself rejects (wrong content type, over the 8MB
  cap — both enforced in `onBeforeGenerateToken`'s returned options, not
  just client-side).
- **Quirks:** `onUploadCompleted` is omitted. The uploaded URL is already
  returned directly to the browser by `upload()`, which is what actually
  attaches it to a product on save (`POST`/`PATCH /api/admin/products`).
  Passing even an empty completion callback makes the SDK demand a public
  webhook URL (`VERCEL_BLOB_CALLBACK_URL`) that localhost and Railway
  cannot serve; nothing here needs that webhook. `BLOB_STORE_ID` is unused
  — the store id is already inside `BLOB_READ_WRITE_TOKEN`. The Blob
  **store itself must be Public**: a private store rejects
  `access: "public"` (`Cannot use public access on a private store`), and
  product photos have to be public for `next/image` and the shop. Verified
  2026-09-10 with a live `put()` against this project's token.
- **Consumed by:** `@vercel/blob/client`'s `upload()`, called directly from
  `components/admin/image-upload.tsx` — no wrapper in `lib/api/`, since the
  request/response shapes are entirely the SDK's, not this app's own contract.

---

### `<METHOD>` `/path/:param` <!-- template entry — copy, fill, delete this comment -->

- **Purpose:** <one line — what the UI uses this for>
- **Auth:** <required? which role?>
- **Evidence:** <backend file / screenshot / doc + date recorded, e.g. "routes/orders.js shared 2026-07-07">
- **Request:**
  - Path params: `<name: type>`
  - Query: `<name: type — optional?>`
  - Body:

    ```jsonc
    { "field": "type — required/optional, constraints" }
    ```

- **Response 2xx:**

  ```jsonc
  { "field": "type — nullable? shape of nested objects spelled out" }
  ```

- **Errors:** `<status → meaning + body shape, e.g. 401 → token expired, envelope above>`
- **Quirks:** <pagination style, rate limits, date formats, anything surprising>
- **Consumed by:** client `<fn name>` · hook `<hook name>` · UI `<components>`
