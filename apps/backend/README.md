# @lamiefoods/backend

**Retired in place, 2026-09-07.** This workspace was reserved for a separately
owned backend; the owner overrode that plan (see `docs/ai-memory/architecture.md`
decision log) and the API now lives in `apps/web/src/app/api/` as Next.js Route
Handlers, in the same app and the same deploy. See `apps/web/src/lib/api/README.md`
for how it's structured, and `docs/ai-memory/api-integration.md` for the recorded
contract.

This workspace is kept — not deleted — as a placeholder so the scripts stay
no-op stubs and `turbo run build|lint|typecheck` stays green. **Do not build
anything here.** If server-side logic outgrows `apps/web` later (a genuinely
separate service, a different deploy cadence), that is a new decision to make
deliberately, not a default to drift back into.

## Where things actually are now

| Was going to live here | Actually lives at |
|---|---|
| API routes | `apps/web/src/app/api/` |
| DB access | `apps/web/src/server/db/`, `apps/web/src/server/orders/` |
| Server secrets | `apps/web/src/config/server-env.ts` (guarded with `server-only`) |
| Email sending | `apps/web/src/server/email/` |
| DB schema | `apps/web/migrations/` (plain SQL, plain Postgres — Supabase today, Railway later) |

`packages/types` holds the domain shapes; `Order`/`OrderItem` are backed by a
real schema now, not just provisional guesses.
