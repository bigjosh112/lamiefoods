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
