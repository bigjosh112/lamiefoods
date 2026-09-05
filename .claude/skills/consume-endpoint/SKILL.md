---
name: consume-endpoint
description: Use whenever the user shares backend logic, endpoint screenshots, API docs, or asks to wire the frontend to any backend endpoint — captures the exact contract into docs/ai-memory/api-integration.md FIRST, then implements the typed client, hook, and all four UI states.
---

# Consume endpoint

Two phases, always in order: **capture the contract, then consume it.** The contract
catalog in `docs/ai-memory/api-integration.md` is the source of truth; implementation
follows the canonical pattern documented there.

## The iron rule

**Never invent request/response shapes.** Every field written into the catalog must
come from evidence the user shared — backend source, a screenshot, an API doc, a real
response. Unknown fields are recorded as `UNKNOWN — ask backend`, and you ask rather
than guess. A wrong guessed shape is worse than a delay: it fails at runtime in ways
that look like frontend bugs.

## Phase 1 — capture

1. Read `api-integration.md`: base config, error envelope, existing entries (the
   endpoint may already be cataloged — update, don't duplicate).
2. From the shared material, extract for each endpoint: method, path, auth, path/query
   params, body shape, success response shape (spell out nested objects and
   nullability), error statuses and bodies, quirks (pagination, date formats, limits).
3. Record an entry per the catalog template, **including the Evidence line** (what was
   shared + date). Screenshots: transcribe exactly what is visible; anything cropped
   or ambiguous is `UNKNOWN`.
4. If anything needed for implementation is UNKNOWN, ask now — batched into one
   message — before writing code.

## Phase 2 — consume

Implement in the three canonical layers (shapes per api-integration.md, following the
repo's existing endpoint implementations if any exist):

1. **Typed client function** — one per endpoint; URL building, serialization, throws a
   typed error on non-2xx using the common error envelope. TypeScript: types mirror
   the catalog exactly. JavaScript: JSDoc typedefs mirroring the catalog.
2. **Hook** — wraps the client; owns loading/error/data, stale-response guards
   (ignore out-of-order resolutions), refetch policy. Returns `{ data, error,
   isLoading, ...actions }`.
3. **UI states — all four, every time:** loading (skeleton/spinner), error (human
   message + retry), empty (designed empty state), success. Missing any state means
   the task is not done.

## Finish

- Update the catalog entry's **Consumed by** line with the real names.
- Verify against the real endpoint if reachable; otherwise say plainly it is untested
  against the live backend and open a GAP entry (severity per risk) in gaps.md.
- Log the task in progress.md (log-progress skill).
