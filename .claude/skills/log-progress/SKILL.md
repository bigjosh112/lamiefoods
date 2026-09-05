---
name: log-progress
description: Use immediately after completing any task, fix, feature, review, or audit — appends a structured entry to the top of docs/ai-memory/progress.md so a fresh session can catch up without re-deriving anything.
---

# Log progress

Append one entry to the **top** of `docs/ai-memory/progress.md` after every completed
task. This is the catch-up file: the top few entries must let a brand-new session
(any model) resume work without asking "where were we?".

## Process

1. Read the current top entry (avoid duplicating; if the task extends the same-day
   entry for the same thread, extend it rather than adding a near-duplicate).
2. Write the entry using the template in progress.md, newest first:
   - **Done** — what actually shipped, 1–3 bullets, past tense, verified claims only.
     If tests failed or something is unverified, say so plainly.
   - **Files** — key files touched, not an exhaustive diff.
   - **Decisions** — anything decided along the way. Architectural decisions ALSO get
     a row in architecture.md's decision table — this line just points at them.
   - **Docs updated** — which memory docs changed, or "none needed".
   - **Gaps** — GAP-IDs opened or closed this task, or "none".
   - **Next / open threads** — the single most useful line: what should happen next,
     what is mid-flight, what is blocked on the user.
3. Keep it short. An entry over ~10 lines is hiding depth that belongs in
   architecture.md, gaps.md, or the code itself.

## Triggers people forget

- After a `/security-review` or `/code-review` run (entry notes findings were
  persisted to gaps.md — the audit-gaps skill handles the persisting).
- After a session that was pure investigation (the findings are the "Done").
- After abandoning an approach — a "what we tried and why it didn't work" entry saves
  the next session from repeating it.
