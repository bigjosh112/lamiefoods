-- 0009_admin_auth.sql — writable admin password hash + one-time reset token.
--
-- Additive only. The live password hash moves here from ADMIN_PASSWORD_HASH
-- (env) so forgot/reset can update it. Env ADMIN_PASSWORD_HASH remains a
-- one-time bootstrap seed when this table is empty — see server/admin/auth.ts.
--
-- Singleton: one owner, one credential row (same idiom as site_settings).
-- Reset token is stored hashed (SHA-256 of the raw token); plaintext never
-- lands in the database.
--
-- Apply with:  psql "$DATABASE_URL" -f apps/web/migrations/0009_admin_auth.sql
-- Or via the app's usual postgres.js apply practice when psql is unavailable.

create table if not exists admin_auth (
  id boolean primary key default true check (id),
  password_hash text not null,
  reset_token_hash text,
  reset_expires_at timestamptz,
  updated_at timestamptz not null default now()
);
