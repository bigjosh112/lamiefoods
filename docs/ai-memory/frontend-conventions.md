# Frontend Conventions — design tokens + Figma fidelity

> The visual system of this project. The `figma-fidelity` skill maps Figma values onto
> these tokens; components use tokens, never magic numbers. When a Figma frame needs a
> value that has no token, **add the token here first**, then use it.

## Design tokens

**Token source of truth:** `apps/web/src/styles/globals.css` (the `@theme` block).
Tailwind v4 is configured in CSS — there is no `tailwind.config.js`.

**Design source of truth:** the approved Stitch system **"Artisanal West African
Confectionery"**. It *superseded* an earlier system on 2026-09-05 — if you find a
reference to "Artisanal Confectionery System", cocoa/ember/amber colours, Plus Jakarta
Sans, or 16px radii, it is stale.

**Brand asset:** `apps/web/public/Lamie Foods - Logo.svg` (`#512411`, `#da5102`,
`#e2ba85`, `#a49643`, `#6b0607`). The design system is derived from it but does not
match exactly. The design system wins.

### Color

Role tokens come in `x` / `on-x` pairs — **always use the matching `on-` token**.

| Token | Value | Use for |
|---|---|---|
| `--color-background` / `--color-on-background` | `#fff8f1` / `#1e1b15` | page canvas, body text |
| `--color-surface-container-low` | `#fbf2e7` | cards, alternating section bands |
| `--color-surface-container-lowest` | `#ffffff` | elevated panels, product tiles |
| `--color-on-surface-variant` | `#56423c` | secondary copy (8.9:1) |
| `--color-primary` | `#893517` | icon glyphs on light chips |
| `--color-primary-container` | `#a84c2c` | **Toasted Terracotta** — primary CTA fill |
| `--color-secondary-container` | `#fcd8ca` | soft chips, icon tiles |
| `--color-tertiary` | `#7a4000` | eyebrow/kicker text on light |
| `--color-tertiary-fixed-dim` | `#ffb77d` | accent text on cacao |
| `--color-terracotta` | `#a84c2c` | brand mark, focus ring, story links |
| `--color-cacao` | `#2b1810` | inverted sections, headings, button hover |
| `--color-saffron` | `#d97706` | story-link hover only |
| `--color-linen` | `#f4ece1` | text on cacao/terracotta |
| `--color-rule` | `#d8c3b0` | hairline borders (use `/70` for softness) |
| `--color-nutmeg` | `#7a5e54` | de-emphasised meta text (5.6:1) |

**Contrast: every pair used on the landing page passes WCAG AA**, verified 2026-09-05;
the tightest is the primary CTA at 4.80:1. That is close to the 4.5:1 floor, so
**re-run a contrast check if the terracotta or linen values change at all.**

### Typography

**Two families.** Only two tokens name a typeface, and nothing else in the codebase
— storefront or admin — may write a family name. Reverting or swapping the pair is a
two-value edit in `globals.css`:

| Token | Family | Loaded by |
|---|---|---|
| `--font-display` | Fraunces | `next/font/google` (self-hosted at build) |
| `--font-body` | General Sans | `next/font/local` from `src/fonts/` |

General Sans is **not on Google Fonts** — it is a Fontshare/ITF face, so its two
variable cuts are vendored. See `apps/web/src/fonts/README.md` for the licence and
how to re-fetch them.

Everything else is a **role alias** pointing at one of those two, so a component says
what the text *is* rather than which font to set:

| Role token | Resolves to | Use for |
|---|---|---|
| `--font-sans` | `--font-body` | body copy (the `body` default) |
| `--font-label` | `--font-body` | labels, eyebrows, nav, buttons, badges |
| `--font-numeral` | `--font-display` | prices and stat figures |

`h1`–`h3` default to `--font-display` in `@layer base`.

**Roles by weight:** headlines 400–500 · product names 500 · body 400 · nav, buttons,
form labels and badges 500–600 · eyebrows 600 with wide tracking · prices and stat
figures 500. The `--text-*` steps already carry these weights, so `text-body-md` or
`text-label-caps` alone is enough — do not add a `font-*` weight utility on top.

**Prices use `font-numeral`, not `font-label`.** A price rendered inside a sentence
("Transfer ₦5,000, then…", "₦2,000 × 3", a button's "Pay ₦5,000 now") stays in body
type — the serif is for a figure standing on its own, not for a numeral inside prose.

Steps carry their own line-height, letter-spacing and weight, so `text-body-md` alone
is enough. `display-hero` and `headline-lg` clamp between the system's real mobile and
desktop sizes; **labels are fixed**, since their wide tracking breaks when scaled.

| Token | Range |
|---|---|
| `--text-display-hero` | 38 → 56px |
| `--text-headline-lg` / `-md` / `-sm` | 28→40 / 22→26 / 18→20px |
| `--text-body-lg` / `-md` / `-sm` | 16→18 / 13→15 / 12→13px |
| `--text-label-caps` / `-md` / `-sm` | 11 / 13 / 11px (fixed) |

### Spacing / radii / shadows / layout

| Token | Value | Use for |
|---|---|---|
| `--spacing-gutter-xs … -xl` | `0.5` `1` `1.5` `2.5` `4` rem | gaps, stack rhythm |
| `--spacing-inset-card` | `1.5rem` | card padding |
| `--spacing-margin` | `clamp(1.25rem, …, 5rem)` | page edge margin (`px-margin`) |
| `--spacing-section` | `clamp(3.5rem, …, 6rem)` | section padding (`py-section`) |
| `--radius-sm` / *(default)* / `-lg` | `2px` / `4px` / `8px` | badges / cards + buttons / larger panels |
| `--shadow-earth` | warm cacao ambient | floating elements only |
| `--container-page` | `1360px` | max content envelope |

**Radii are deliberately tiny.** 4px everywhere is the system's "knife-cut chin-chin
edge". Never reach for `rounded-full` on a card or button — pills are reserved for
nothing on this site. Depth comes from tonal stratification (canvas →
`surface-container-low` → white), not shadow.

Breakpoints are stock Tailwind: the system's tablet tier is `md:` (768px) and its
desktop tier is `lg:` (1024px). No custom breakpoint is defined.

## Content & honesty rules

**All landing copy lives in `apps/web/src/content/landing.ts`** — components hold no
strings. That file carries a READ-BEFORE-LAUNCH banner because the design mock invented
prices and product claims; each is tagged `UNVERIFIED` (see GAP-004).

Non-negotiables this codebase already follows:

- Never invent prices, ingredients, delivery fees, contact details, reviews or
  certifications. Placeholders must be *obviously* placeholders in code.
- The customer-facing name is **"Lamie Foods"**, never "Lamie Foods Enterprise" — even
  when a design mock shows otherwise.
- Confirmed delivery window is **1–5 days**. A mock saying otherwise is wrong.
- **Never fake backend behaviour.** No endpoint means a disabled control with an
  honest note — not a fake success message. The tasting-access form is the reference
  example.
- Contact rows without a confirmed destination render as plain text, not dead links.

## Component conventions

- **Server Components by default.** Client only where interaction demands it: the
  header (mobile menu), `Reveal`, and `error.tsx`. The hero is deliberately a Server
  Component.
- Components live in `apps/web/src/components/<domain>/`, one per file, kebab-case
  filenames, named exports. Promote to `packages/ui` only after genuine second reuse.
- Tailwind utilities in the component; `cn()` from `@lamiefoods/ui` merges classes so a
  caller's override wins. No CSS modules.
- **Motion:** Framer via `LazyMotion`/`domAnimation` + `MotionConfig
  reducedMotion="user"`. Use `m.*`, never `motion.*` — `strict` mode rejects the full
  component. `Reveal` uses `whileInView` (IntersectionObserver, no scroll listener).
  - **Never ship the LCP element at `opacity: 0`.** The hero uses the CSS
    `animate-rise` utility so it renders without hydration.
  - Reveal-animated elements carry `data-reveal`; the `no-js` class on `<html>` (an
    inline script removes it) forces them visible when scripting fails.
- **Images:** `next/image` only. Real photography does not exist yet — use `ImageSlot`,
  which renders a labelled tonal block until `src` is set in the content file. Remote
  hosts need `next.config.ts` → `images.remotePatterns`.
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
