# Lamie Foods

Monorepo for the Lamie Foods product: a Next.js customer-facing web app plus a not-yet-implemented backend, sharing typed config, UI, and tooling packages.

## Stack

- Monorepo: npm workspaces (`apps/*`, `packages/*`) orchestrated by Turborepo 2.10 — migrated off pnpm, so internal deps are pinned `"*"` (npm has no `workspace:` protocol)
- Language: TypeScript 6.0 (`@lamiefoods/typescript-config` holds the shared base)
- Web app: Next.js 16.3.4 + React 19.2.8, Tailwind, `framer-motion` 13, `zod` 4 for validation
- Backend: `apps/backend` is a **stub** — scripts only echo; owned by the backend developer. No contract exists yet.
- Deploy: **Vercel** (also the reason for the pnpm→npm migration). Build/promotion flow: <TODO — fill in how>

## Commands

- Dev server: `npm run dev` (turbo, runs every app)
- Build: `npm run build`  |  Typecheck: `npm run typecheck`
- Test: none configured — no runner in any workspace. Logged as a gap.
- Lint: `npm run lint`  |  Format: `npm run format` (Prettier + tailwind plugin)

## House rules

1. Priority order for every decision: **security → code quality → architecture fit → Figma fidelity → endpoint consumption**.
2. Read the relevant memory doc before working (see pointers below) — do not guess what these docs already answer.
3. **Never invent request/response shapes.** Record the contract in `docs/ai-memory/api-integration.md` first (consume-endpoint skill), then implement.
4. Use design tokens from `docs/ai-memory/frontend-conventions.md`, never magic numbers.
5. Plan first — do not just execute — for anything touching auth, payments, migrations, or webhooks.
6. If a change would contradict a documented decision in `architecture.md`, stop and flag it instead of proceeding.
7. After every completed task, append an entry to `docs/ai-memory/progress.md` (log-progress skill).
8. Persist `/security-review` and `/code-review` findings into `docs/ai-memory/gaps.md` — findings must never vanish with the session.
9. **Respect workspace boundaries.** Shared code belongs in `packages/*` (`config`, `types`, `ui`, `eslint-config`, `typescript-config`), not copied into an app. `apps/web` has its own `CLAUDE.md`/`AGENTS.md` for Next 16 specifics — read them before writing framework code.
10. **Do not implement `apps/backend`** without checking in — it is owned by the backend developer. Capture its contract in `api-integration.md` before `apps/web` consumes anything.
11. `save-exact=true` and npm install scripts stay enabled (see `.npmrc` for why). Audit every new dependency before adding it.

## Memory docs (read on demand — never inline their content here)

| Doc | Read it when |
|---|---|
| `docs/ai-memory/architecture.md` | before structural changes, new features, or "where does X live?" |
| `docs/ai-memory/gaps.md` | before claiming something is safe/done; when picking what to fix |
| `docs/ai-memory/api-integration.md` | before writing or editing any API call |
| `docs/ai-memory/frontend-conventions.md` | before writing any UI |
| `docs/ai-memory/progress.md` | at session start, to catch up on recent work |

Keep this file lean — it loads into context every session. Depth belongs in `docs/ai-memory/`. To add knowledge, run the distill-session skill; it routes each learning to the right doc.
