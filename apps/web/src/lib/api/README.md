# API layer

The backend is Next.js Route Handlers in this same app, at `src/app/api/`. This
supersedes the original plan of a separate `apps/backend` service — see
`docs/ai-memory/architecture.md` for the decision and why.

**Client Components** talk to it through `apiFetch`, never a raw `fetch`, so
base URL, credentials and error handling stay in one place. One module per
resource lives next to this file (`orders.ts`, …), each returning types from
`@lamiefoods/types`.

**Server Components** should call the `server/` functions the route handlers
themselves call (e.g. `server/orders/repository.ts`) directly, in-process —
not `apiFetch` back into the app's own API. Self-fetching over HTTP from the
server is a wasted network hop for a call that never needed one.

Every contract here is also recorded in `docs/ai-memory/api-integration.md`,
which is the source of truth if the two ever disagree.
