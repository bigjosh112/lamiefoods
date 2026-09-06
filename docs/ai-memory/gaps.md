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
