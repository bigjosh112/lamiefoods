# Architecture

> The mental model a senior engineer would hand a new hire: how this project is put
> together and **why** the big decisions were made. Maintained by the
> `document-architecture` skill; updated by `distill-session` when decisions change.
>
> **Status: foundation only.** The monorepo, frontend shell, shared packages, SEO
> plumbing and design-token system exist. The *site itself* — real pages, components,
> API calls — does not, and waits on approved designs, brand assets, and a backend
> contract. Sections below describe what has genuinely been decided; TODOs mark what
> forms later.

## Mental model

Lamie Foods is a Nigerian food brand (launch product: chinchin). This repo is an npm
+ Turborepo monorepo whose only real app today is `apps/web`, a Next.js 16 App Router
storefront running as a scaffold. `apps/backend` is a **reserved, unimplemented**
workspace owned by a separate backend developer — no API contract exists yet, so the
frontend deliberately ships **zero endpoint calls**. Everything is built to make the
eventual swaps happen in exactly one place each: brand/design values flow from tokens
and a `config` package, all backend traffic will flow through one `apiFetch` gateway,
and domain shapes live in a shared `types` package that is explicitly *provisional*
until reconciled with the real backend. The guiding discipline across the codebase is
**don't invent** — no fake prices, addresses, API shapes, or sampled colours; unknowns
are left as typed placeholders, not plausible guesses.

## System map

Only the parts that matter for placing new code correctly.

| Path | Owns | Notes |
|---|---|---|
| `apps/web/src/app/` | Next.js App Router entry: `layout.tsx`, `page.tsx` (scaffold), `error.tsx`, `not-found.tsx`, `robots.ts`, `sitemap.ts` | Server Components by default; `"use client"` only where interaction needs it |
| `apps/web/src/lib/api/` | **The only place that talks to the backend.** `apiFetch` gateway + typed error classes | No endpoint functions yet — add one module per resource (`products.ts`, …) when the contract lands |
| `apps/web/src/config/` | `env.ts` (zod-validated client env), `site.ts` (metadata defaults) | Secrets never cross here; only `NEXT_PUBLIC_*` |
| `apps/web/src/styles/globals.css` | **All design tokens** — colour ramps, fluid type/space/radius — under Tailwind v4 `@theme` | PROVISIONAL palette; swap here and nowhere else once brand assets arrive |
| `apps/web/src/lib/` + `components/seo/` | SEO/structured-data helpers (JSON-LD, canonical URLs) | Only confirmed brand facts go into schema — no invented ratings/addresses |
| `apps/web/src/components/` | App-specific components (mostly empty `.gitkeep` dirs by domain: cart, footer, navigation, products, ui) | Stays app-local until a primitive is used in 2+ places |
| `packages/config/` | Brand facts (`BRAND`, `DELIVERY`) + route paths (`ROUTES`, `ADMIN_ROUTES`) | Single source of truth so names/links can't drift |
| `packages/types/` | Shared domain types (product, order, cart, customer, common) | **Provisional**, not a contract — backend wins on any conflict |
| `packages/ui/` | Shared presentational primitives — only `cn` today | Intentionally near-empty; not a dumping ground |
| `packages/eslint-config/`, `packages/typescript-config/` | Shared lint/TS bases | — |
| `apps/backend/` | Reserved workspace, **not implemented here** | Scripts are no-op `echo` stubs so the turbo pipeline stays green monorepo-wide |

## Data flow

**Today:** UI event → (no data layer wired) → static/scaffold render. There is no
state store, no persisted state, and no live API call anywhere in the app.

**Intended, once the contract exists:**
Server Component or client hook → `apiFetch<T>(path, opts)` in `lib/api/` → `fetch`
against `NEXT_PUBLIC_API_URL` with `credentials: "include"` → JSON parsed, non-2xx
thrown as `ApiError` (or `ApiNotConfiguredError` if the base URL is unset) → typed
result (`@lamiefoods/types`) returned to the caller, which renders loading/error/
empty/success. Side effects (fetching, mutations) live in `lib/api/` and hooks — never
inline in components.

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

## Gotchas (non-obvious things that will bite you)

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
- `ApiNotConfiguredError` has status `0` and is thrown whenever `NEXT_PUBLIC_API_URL`
  is unset — which is *always*, today. Any code calling `apiFetch` right now throws. —
  `apps/web/src/lib/api/client.ts:27-28`, `errors.ts:15-20`
- `ADMIN_ROUTES` and `ProductCategory`/`OrderStatus` enums exist in packages, but no
  admin app, pages, or logic consume them yet — they're forward declarations, not
  live features. Nothing should branch on a specific category value. —
  `packages/config/src/routes.ts`, `packages/types/src/product.ts:6`

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
