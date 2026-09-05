# Frontend Conventions — design tokens + Figma fidelity

> The visual system of this project. The `figma-fidelity` skill maps Figma values onto
> these tokens; components use tokens, never magic numbers. When a Figma frame needs a
> value that has no token, **add the token here first**, then use it.

## Design tokens

**Token source of truth:** `apps/web/src/styles/globals.css` (the `@theme` block).
Tailwind v4 is configured in CSS — there is no `tailwind.config.js`. Edit tokens there;
this file documents them.

**Design source of truth:** the approved Stitch design system, *Artisanal Confectionery
System*. Values in `@theme` are transcribed from it. Two additions are marked in-file:
fluid type (the system gives fixed px; the spec value is kept as each step's max) and
elevation (specified in the system's prose, absent from its token export).

**Brand asset:** `apps/web/public/Lamie Foods - Logo.svg`. Its own colours are
`#512411` cocoa, `#da5102` orange, `#e2ba85` cream-gold, plus `#a49643` olive-gold and
`#6b0607` maroon. The design system is derived from these but does not match them
exactly, and it has no token for the last two. The design system wins; the logo colours
are recorded here only so nobody "corrects" the palette toward the SVG by mistake.

### Color

Role tokens come in `x` / `on-x` pairs — **always use the matching `on-` token for
foreground**. Full set in `globals.css`; the ones reached for most:

| Token | Value | Use for |
|---|---|---|
| `--color-background` / `--color-on-background` | `#fff8f6` / `#2a1710` | page canvas, body text |
| `--color-surface-container-lowest` | `#ffffff` | elevated/active panels |
| `--color-surface-container-low` | `#fff1ec` | cards at rest |
| `--color-on-surface-variant` | `#53433e` | secondary/meta copy |
| `--color-primary` / `--color-on-primary` | `#2d0900` / `#ffffff` | darkest brand anchor |
| `--color-primary-container` | `#4a1b07` | **Deep Cocoa** — the named brand primary |
| `--color-secondary` / `--color-on-secondary` | `#a33e00` / `#ffffff` | accent that passes AA on text |
| `--color-outline` | `#85736d` | borders, dividers (**non-text only** — 4.28:1) |
| `--color-outline-variant` | `#d8c2bb` | subtle dividers |
| `--color-hairline` | `rgb(74 27 7 / 0.08)` | card-group hairline borders |
| `--color-error` / `--color-on-error` | `#ba1a1a` / `#ffffff` | destructive, validation |
| `--color-brand-cocoa` | `#4a1b07` | named swatch (= primary-container) |
| `--color-brand-ember` | `#e65b00` | named swatch; focus ring |
| `--color-brand-amber` | `#e8c88b` | named swatch; tags, soft accents |
| `--color-brand-espresso` | `#24120b` | named swatch; inverted surfaces |

**Contrast rules learned the hard way** (see GAP-003 in `gaps.md`):

- White on `--color-brand-ember` (`#e65b00`) is **3.58:1 — fails AA for text.** For an
  orange CTA with white text use `--color-secondary` (`#a33e00`, 6.47:1). Reserve
  ember for large text (24px+/19px bold), icons, focus rings and fills.
- `--color-outline` on the canvas is 4.28:1 — fine for borders (needs 3:1), **not for
  text or placeholders**. Placeholders use `--color-on-surface-variant` (8.93:1).

### Typography

Two families, strictly divided:

| Token | Value | Use for |
|---|---|---|
| `--font-display` | Bodoni Moda (variable) | display + headline steps only |
| `--font-sans` | Plus Jakarta Sans (variable) | body, titles, labels, all dense UI |

`h1`–`h3` default to `--font-display` in `@layer base`. Override to `font-sans` where a
heading is really UI chrome (a card title in a dense admin table). **Never** put Bodoni
on long body copy or form controls.

Type steps carry their own line-height, letter-spacing and weight, so `text-body-md`
alone is enough — do not re-specify them.

| Token | Value | Use for |
|---|---|---|
| `--text-display-lg` | `clamp(2.5rem, …, 3.5rem)` | hero headline |
| `--text-display-md` | `clamp(2rem, …, 2.75rem)` | major section opener |
| `--text-headline-lg` | `clamp(1.75rem, …, 2.25rem)` | page/section title |
| `--text-headline-md` / `-sm` | `clamp(…, 1.75rem)` / `clamp(…, 1.375rem)` | sub-sections |
| `--text-title-lg` / `-md` | `clamp(…, 1.25rem)` / `1rem` | card + control titles |
| `--text-body-lg` / `-md` / `-sm` | `clamp(…, 1.125rem)` / `(…, 0.9375rem)` / `(…, 0.8125rem)` | copy |
| `--text-label-lg` / `-md` / `-sm` | `0.875rem` / `0.75rem` / `0.625rem` | buttons, chips, table heads |

Line heights are **unitless ratios** (spec px ÷ spec size) so they stay correct at every
size a clamp resolves to. Labels and `title-md` are deliberately **fixed**, not fluid:
they are UI chrome whose letter-spacing is tuned to an exact size.

### Spacing / radii / shadows / breakpoints

| Token | Value | Use for |
|---|---|---|
| `--spacing-xxs … -3xl` | `0.25` `0.5` `0.75` `1` `1.5` `2` `3` `4` rem | 8px-base rhythm; gaps, padding |
| `--spacing-gutter` | `clamp(1rem, …, 1.5rem)` | grid gutters |
| `--spacing-margin` | `clamp(1rem, …, 3.5rem)` | page edge margins |
| `--radius-sm` / *(default)* / `-md` | `0.25` / `0.5` / `0.75` rem | micro-controls, inputs, buttons |
| `--radius-lg` / `-xl` | `1rem` / `1.5rem` | cards + panels / master wrappers, modals |
| `--radius-full` | `9999px` | pills, chips, search bars, FAB clusters |
| `--shadow-card` | warm brown, level 1 | card at rest |
| `--shadow-card-hover` | warm brown, level 2 | hover / active card |
| `--shadow-float` | warm espresso, level 3 | docks, dropdowns, overlays |
| `--breakpoint-desktop` | `1200px` | the system's desktop tier (`desktop:` variant) |
| `--container-page` | `1440px` | max reading width |

Shadows are **warm-tinted, never neutral grey** — grey reads as dirt against this
palette. Prefer tonal stepping (canvas → `surface-container-low` → white) over shadow;
add elevation only for genuinely floating things.

Breakpoints: Tailwind defaults plus `desktop:` at 1200px. The system's tablet tier
starts at 768px, which is already `md:`.

## Component conventions

- **Server Components by default.** `"use client"` only where interaction needs it —
  currently just `motion-provider.tsx` and `error.tsx`.
- Components live in `apps/web/src/components/<domain>/`, one component per file,
  kebab-case filenames, named exports. Genuinely shared primitives move to
  `packages/ui` **only once reused twice** — not preemptively.
- Styling is Tailwind utilities in the component. No CSS modules, no styled-components.
  `cn()` from `@lamiefoods/ui` merges classes so a caller's override wins.
- **Motion:** Framer Motion via `LazyMotion`/`domAnimation` (smaller bundle) with
  `MotionConfig reducedMotion="user"`, so every animation defers to the OS setting
  automatically. A CSS `prefers-reduced-motion` block in `globals.css` backs it up for
  non-Framer transitions. The hero carries the strongest motion; do not animate
  everything.
- **Images:** `next/image` always. Remote hosts must be added to
  `next.config.ts` → `images.remotePatterns` (currently empty). Alt text is required by
  the `ImageAsset` type — it is not optional.
- Touch targets are at least 44px (`min-h-11`).

## Figma → code fidelity checklist

Run this loop for every reproduced frame (the `figma-fidelity` skill automates it):

1. **Inventory before coding.** From the frame, list: layout structure, exact spacing,
   type sizes/weights/line-heights, colors, radii, shadows, states shown.
2. **Map every value to a token.** Nearest token wins; if nothing is within tolerance,
   add a token above — do not hardcode. Note each mapping (`Figma 18px → --space-4`).
3. **Build structure first, then style.** Semantic HTML, correct layout method
   (flex/grid), then visual polish.
4. **All states, not just the happy frame:** hover, focus-visible, active, disabled,
   loading — even if Figma only shows one.
5. **Responsive pass:** the frame is one viewport; make it behave at the others per the
   fluid rules in the global standards (clamp() headings, intermediate `sm:` steps,
   mobile body text ~2px smaller, hamburger must actually open/close).
6. **Visual diff pass:** render the result and compare against the frame side by side —
   spacing, alignment, type scale, color. List every mismatch found, fix, re-compare.
   Repeat until no visible drift.
7. **On human-reported errors:** fix exactly what was pointed at first, then re-run the
   diff pass to catch collateral drift.
