---
name: audit-gaps
description: Use when asked to audit the codebase for weaknesses, after /security-review or /code-review produce findings that must be persisted, or when installing the AI memory kit into an existing repo — populates docs/ai-memory/gaps.md with evidenced, prioritized gaps.
---

# Audit gaps

Systematically find weaknesses and record them in `docs/ai-memory/gaps.md` so they
survive the session. Follow the ledger's own rules (evidence required, severity guide,
sequential IDs, never delete closed gaps).

## Non-negotiables

- **Evidence or it doesn't go in.** Every gap cites a real `file:line` you have read.
  No hypothetical gaps, no "there might be".
- **Dedupe first.** Read the existing ledger before writing; update an existing GAP
  rather than opening a duplicate.
- **Audit order = priority order:** security → tests → fragile edge cases → tech debt.
  Do not polish tech-debt findings while a security pass is unfinished.

## Process

1. **Read** `docs/ai-memory/gaps.md` and `architecture.md` (if populated) to know what
   is already known.
2. **Security pass** — check, with the codebase's stack in mind:
   - secrets/keys committed or shipped to the client bundle (env misuse, hardcoded tokens)
   - auth: unprotected routes/actions, token storage (localStorage vs httpOnly), expiry handling
   - injection surfaces: `dangerouslySetInnerHTML`/`innerHTML`, unsanitized user input,
     URL/query building, `eval`-like sinks
   - data exposure: PII in logs, verbose errors surfaced to users, overshared API responses
   - dependencies: run the ecosystem's audit command (`npm audit` etc.) and record actionable results
   - If `/security-review` is available, tell the user it exists and that its findings
     should be persisted here — when its output is in the conversation, convert every
     finding into a GAP entry.
3. **Test pass** — identify critical paths (money, auth, data mutation, the app's core
   loop) and check each has meaningful coverage. Missing coverage on a critical path is
   a gap; missing coverage on trivia is not.
4. **Edge-case pass** — empty states, error states, race conditions (double submit,
   stale async), boundary values, offline/slow network, unusual viewport sizes.
5. **Tech-debt pass** — duplication that has already caused drift, dead code, magic
   numbers where tokens exist, components doing too much, TODOs rotting in code.
6. **Write the ledger.** One GAP entry per finding using the template in gaps.md:
   category, severity per the guide, location, concrete failure scenario, and a fix
   that names the file and the change — "improve validation" is not a fix.
7. **Report.** Summarize counts by severity to the user, lead with criticals, and
   append a progress.md entry (log-progress skill) noting the audit ran.

## Scope control

On large repos, agree scope with the user first (e.g. "security pass only" or "src/
only"). A partial audit that is recorded beats a full audit that never finishes —
note un-audited areas at the bottom of gaps.md as `<!-- not yet audited: ... -->`.
