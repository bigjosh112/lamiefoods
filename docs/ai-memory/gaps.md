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

### GAP-003 — Two design-system colour pairs fail WCAG AA for text

- **Category:** accessibility
- **Severity:** medium
- **Location:** `apps/web/src/styles/globals.css` — `--color-brand-ember: #e65b00` and
  `--color-outline: #85736d`, both against `--color-background: #fff8f6`. Ratios
  computed from the approved design system's own values.
- **Found:** 2026-09-05 while configuring the design system
- **Problem:** The design system's prose specifies an **"Accent / CTA"** button as
  Warm Confectionery Orange `#E65B00` with white text — that is **3.58:1, failing AA
  (needs 4.5:1)** for normal-size text. It is the spec'd treatment for "key sales
  conversion actions", i.e. Add to Cart and Checkout, so the least readable control
  would be the most important one. Separately the prose specifies placeholder text at
  `#A68677` on `#FDF9F7` (**3.19:1, fails**), and `--color-outline` is 4.28:1 — fine
  for borders (3:1) but failing if used for text.
- **Fix:** For an orange CTA carrying white text at body size, use
  `--color-secondary` (`#a33e00`, **6.47:1**) — same hue family, passes. Keep
  `--color-brand-ember` for large text (24px+, or 19px bold, where 3:1 applies),
  icons, focus rings and fills. Placeholders use `--color-on-surface-variant`
  (8.93:1). Documented in `frontend-conventions.md` under "Contrast rules". Verify by
  re-running a contrast check on the final button and input components once built.
- **Status:** open — **needs an owner decision**: fixing this deviates from the
  approved design system's literal hex, so confirm with the owner before shipping a
  CTA that is not `#E65B00`.

### GAP-001 — No test runner or test infrastructure in any workspace

- **Category:** tests
- **Severity:** medium
- **Location:** `package.json` (no `test` script), no runner in `apps/web/package.json`, `apps/backend/package.json`, or any `packages/*/package.json`; `turbo.json:6-29` defines no `test` task. Confirmed: `git ls-files` shows no test files, `grep '"test"'` across all workspace manifests returns nothing.
- **Found:** 2026-09-05 via audit-gaps
- **Problem:** There is no way to write or run a test today. The moment money/cart/checkout logic lands (kobo arithmetic in `packages/types/src/common.ts:4-13`, `OrderItem.lineTotal` in `order.ts`, the `apiFetch` gateway, Paystack flow), it will ship with zero automated coverage on paths where a bug means mischarging a customer or losing an order. The priority order (security → **code quality/tests** → …) ranks this above tech debt, and CLAUDE.md already acknowledges it informally ("Test: none configured — logged as a gap") without it living in this ledger.
- **Fix:** Pick a runner (Vitest fits the Vite/TS + Next 16 stack). Add it as a dev dependency at the root, add a `test` script to each workspace that has logic, and add a `test` task to `turbo.json` (`"test": { "dependsOn": ["^build"] }`). Wire `npm run test` into CI alongside `build` and `lint`. First tests to write when logic exists: kobo `Money` arithmetic and `OrderItem` line-total freezing. Verify: `npm run test` runs and a deliberately broken assertion fails the pipeline.
- **Status:** open

<!-- not yet audited (surface does not exist yet — re-run audit-gaps when it lands):
     real pages/components, live API endpoint modules in apps/web/src/lib/api/,
     auth on admin routes, Paystack payment flow, apps/backend (owned by backend dev). -->

## Closed

<!-- Move entries here when fixed. Keep them — they document why the code is the way it is. -->

### GAP-002 — Sitemap advertises routes that don't exist yet (indexable 404s)

- **Category:** edge-case · **Severity:** low · **Found:** 2026-09-05 via audit-gaps
- **Was:** `sitemap.ts` listed `/shop` and `/about`, which have no route (only `page.tsx`/home exists) — indexable 404s once deployed. `robots.ts:9` allows `/`, `layout.tsx` sets `index: true`.
- **Fixed:** 2026-09-05 (uncommitted working tree — not yet committed).
- **How:** Trimmed `sitemap.ts` to emit only `ROUTES.home` (the one route that renders); left a comment to re-add `/shop`, `/about`, and product URLs as each ships. `npm run typecheck --workspace=@lamiefoods/web` passes.

### <GAP-XXX — title>
- **Fixed:** <YYYY-MM-DD>, <commit hash / PR>
- **How:** <one line>
