# @lamiefoods/web

Next.js (App Router) frontend for Lamie Foods.

## Structure

```
src/
  app/            routes, layouts, robots.ts, sitemap.ts
  components/
    layout/       shells, providers
    navigation/   header and mobile nav
    footer/
    ui/           generic primitives (buttons, inputs, …)
    products/     product cards, galleries, detail sections
    cart/         cart drawer, line items
    seo/          JSON-LD renderer
  config/         env validation, site + brand config
  hooks/          shared client hooks
  lib/
    api/          the ONLY place that talks to the backend
    seo.ts        per-page metadata builder
    structured-data.ts
  styles/         globals.css — Tailwind v4 theme tokens
  types/          frontend-only types (shared ones live in @lamiefoods/types)
```

Empty directories are placeholders for the structure above and carry a
`.gitkeep`. Server Components are the default; add `"use client"` only where an
interaction genuinely needs it.

## Environment

Copy `.env.example` to `.env.local`. Values are validated in `src/config/env.ts`
at load, so a missing or malformed variable fails fast. Only `NEXT_PUBLIC_*`
reaches the browser — never put a secret behind that prefix.

## Styling

Tailwind CSS v4, configured in CSS (`src/styles/globals.css`), not a JS config
file. Colour, fluid type, fluid spacing and radius tokens live in `@theme`.
Use tokens, never magic numbers.
