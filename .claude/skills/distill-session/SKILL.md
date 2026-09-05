---
name: distill-session
description: Use at the end of a working session, before context runs out, or whenever significant understanding was gained that exists only in conversation — routes each learning into the correct memory doc so future sessions (including smaller models) start already knowing it.
---

# Distill session

Whatever was learned this session exists only in this context window until it is
written down. This skill extracts those learnings and routes each to its correct home,
so the next session — possibly a cheaper model — starts with this session's
understanding instead of re-deriving it.

## Process

1. **Sweep the session** for anything true tomorrow that isn't in the docs yet:
   - decisions made (and the real why, including rejected alternatives)
   - gotchas discovered the hard way (bugs whose cause was non-obvious, ordering
     constraints, environment quirks)
   - endpoint contracts or backend behavior observed
   - visual/UI conventions or tokens established
   - weaknesses noticed but not fixed
   - approaches tried and abandoned, with the reason
2. **Route each item to exactly one primary home:**

   | Learning | Goes to |
   |---|---|
   | decision + rationale | `architecture.md` → Key decisions |
   | non-obvious constraint/quirk | `architecture.md` → Gotchas |
   | weakness, missing test, debt | `gaps.md` (full GAP entry) |
   | endpoint contract/behavior | `api-integration.md` |
   | token, visual convention | `frontend-conventions.md` |
   | what happened + what's next | `progress.md` |
   | new domain term | `architecture.md` → Glossary |

3. **Dedupe, don't append blindly.** Read the target section first; update or
   supersede existing entries instead of stacking near-duplicates. Correct anything
   the session proved wrong — a stale doc is worse than an empty one.
4. **CLAUDE.md almost never changes.** Only a rule that must hold in *every* future
   session, is not project-doc-routable, and fits in one line earns a spot — and it
   replaces something or goes in the `<PROJECT_SPECIFIC_RULE>` slot. CLAUDE.md loads
   every session; it stays lean by policy. When in doubt, it goes in a deep doc.
5. **Write for the next model, not this one.** No references to "this conversation",
   no shorthand coined mid-session; absolute dates, full paths, complete sentences.
   The test: would a fresh Sonnet session with zero context act correctly on this line?
6. Finish with a progress.md entry if one wasn't already written for the session's work.
