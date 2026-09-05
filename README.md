# Lamie Foods

Monorepo for **LAMIE FOODS** — _Crafted for Good Taste._

> Status: **foundation only.** The website UI has not been built yet. It follows
> once the approved designs and brand assets are supplied.

## Stack

pnpm workspaces · Turborepo · Next.js 16 (App Router) · React 19 · TypeScript ·
Tailwind CSS v4 · Framer Motion

## Layout

```
apps/
  web/        Next.js frontend (the app we build)
  backend/    reserved workspace — owned by the backend developer, not implemented here
packages/
  types/      shared domain types (product, order, customer, cart)
  config/     brand constants and route paths
  ui/         shared presentational primitives (near-empty by design)
  eslint-config/
  typescript-config/
```

## Getting started

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

## Commands

Run from the repo root; Turborepo fans them out across workspaces.

| Command            | Does                                  |
| ------------------ | ------------------------------------- |
| `pnpm dev`         | Start the frontend in dev mode        |
| `pnpm build`       | Production build                      |
| `pnpm lint`        | ESLint across all workspaces          |
| `pnpm typecheck`   | `tsc --noEmit` across all workspaces  |
| `pnpm format`      | Prettier write                        |
| `pnpm format:check`| Prettier check (use in CI)            |

Next 16 removed build-time linting, so `pnpm lint` is a **separate** step and
must run in CI alongside `pnpm build`.

## Conventions

- **Server Components by default.** Add `"use client"` only where an interaction
  needs it.
- **Design tokens, never magic numbers.** Colour, fluid type, fluid spacing and
  radius tokens live in `apps/web/src/styles/globals.css` under `@theme`.
- **One place talks to the backend:** `apps/web/src/lib/api`. Components never
  call `fetch` directly.
- **Secrets never cross into the frontend.** Only `NEXT_PUBLIC_*` reaches the
  browser bundle, and `apps/web/src/config/env.ts` validates every value at load.
