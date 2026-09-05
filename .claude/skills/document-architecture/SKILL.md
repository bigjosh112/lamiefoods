---
name: document-architecture
description: Use when installing the AI memory kit into an existing repo, when architecture.md is stale or empty, or after a structural change — derives docs/ai-memory/architecture.md from the real code and records the WHY behind decisions.
---

# Document architecture

Produce or refresh `docs/ai-memory/architecture.md` — the mental model a senior
engineer would hand a new hire. Derived from code that was actually read, with
rationale that is real, not invented.

## Non-negotiables

- **The "why" is the point.** Anyone can regenerate a directory tree; the doc's value
  is rationale and gotchas. If a decision's reason is not derivable from code, commit
  messages, or existing docs, **ask the human** — never fabricate a plausible rationale.
- **Decisions are append-only.** Supersede with a new row explaining why; never delete.
- **It's a map, not a mirror.** Record what someone needs to place new code correctly;
  skip anything obvious from a glance at the file tree.

## Process

1. **Explore from the entry points**, not alphabetically: how the app boots (entry
   file, providers, router), where state lives, how data is fetched and cached, where
   side effects are allowed, how styles/tokens are organized, how it builds and deploys.
   Read the actual key files — do not infer from names.
2. **Mine history for rationale:** `git log` around load-bearing files, existing
   README/docs, comments explaining constraints.
3. **Fill each section** of architecture.md:
   - *Mental model* — the 3–6 sentences you would say out loud to a new hire.
   - *System map* — only the directories that matter, with what each owns.
   - *Data flow* — the real path from user action to persisted state.
   - *Key decisions* — with genuine why + alternatives. Mark unverifiable rationale as
     `WHY UNCONFIRMED — ask` and collect these into questions for the user.
   - *Gotchas* — everything that surprised you during exploration is a gotcha by
     definition; record each with a file reference.
   - *Glossary* — domain terms the code assumes.
4. **Ask the collected questions** (batched, at the end — not one interruption per
   unknown) and fold answers in.
5. **Cross-link:** weaknesses discovered while exploring go to gaps.md (as proper GAP
   entries), not into architecture.md. Log the run in progress.md.

## For new/empty projects

Do not invent an architecture. Seed only what has genuinely been decided (stack,
initial structure, deliberate conventions) into *Mental model* and *Key decisions*,
leave the TODOs standing, and rely on distill-session to grow the doc as real
decisions get made.
