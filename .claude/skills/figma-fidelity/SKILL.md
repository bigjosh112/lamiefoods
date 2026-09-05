---
name: figma-fidelity
description: Use whenever the user shares a Figma frame, screenshot, or design export to be turned into code, or reports visual mismatches against a design — reproduces the frame with design tokens instead of magic numbers, then iterates via visual diff until it matches.
---

# Figma fidelity

Reproduce a design frame as closely as possible using the project's design tokens,
then close the gap with an explicit visual-diff loop. The token tables and the full
checklist live in `docs/ai-memory/frontend-conventions.md` — this skill operates them.

## Non-negotiables

- **Tokens, not magic numbers.** Every color, size, space, radius, and shadow maps to
  a token from frontend-conventions.md. If no token is close enough, add one there
  first (and to the token source file), then use it.
- **The frame is one viewport.** Delivering only the pictured breakpoint is half the
  job — apply the fluid rules from the global standards at all sizes.
- **Fidelity means measured, not eyeballed once.** The diff pass is a listed set of
  mismatches, fixed and re-checked, not a single glance.

## Process

1. **Read** `frontend-conventions.md` (tokens, component conventions) before looking
   at the frame in detail.
2. **Inventory the frame:** layout structure and nesting, exact spacings, type
   sizes/weights/line-heights, colors, radii, shadows, imagery, and any states shown.
   Write the inventory down — it becomes the diff checklist in step 5.
3. **Map values → tokens.** Record each mapping (`Figma 18px gap → --space-4`).
   Ambiguous calls (17px between two tokens) get resolved toward the existing scale,
   noted so the user can override.
4. **Build:** semantic structure first, correct layout method, then styling from the
   mapped tokens. Add the states Figma didn't show (hover, focus-visible, disabled,
   loading) using existing conventions.
5. **Visual diff pass:** render the result (use the project's dev server / the `run`
   capability if available; otherwise reason section-by-section against the frame) and
   compare against the inventory item by item — spacing, alignment, type, color,
   radii. Produce an explicit mismatch list, fix every item, re-compare. Repeat until
   the list is empty or remaining deltas are token-scale decisions the user should call.
6. **Report:** state what matches, any deliberate deviations (and why — usually token
   snapping or responsive behavior), and show the mapping notes.

## When the user points out errors

Fix exactly what was pointed at, first and verbatim — do not relitigate the feedback
or bundle it with other changes. Then re-run one diff pass to catch drift the fix may
have introduced. If the correction reveals a token is wrong project-wide, update
frontend-conventions.md and flag other components that use it.

## Finish

New tokens or conventions established → recorded in frontend-conventions.md.
Task logged in progress.md (log-progress skill).
