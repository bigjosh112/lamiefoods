-- 0005_settings.sql — one owner-editable settings row (WhatsApp + bank transfer).
--
-- Additive only. Earlier migrations are never edited after being applied —
-- new columns/tables arrive in new migration files, in order.
--
-- Singleton table: there is exactly one owner, so exactly one settings row.
-- `id boolean primary key default true check (id)` is Postgres's own idiom
-- for enforcing a single row — any second insert violates the primary key,
-- so the app never has to handle a "which row?" or "no row yet" case.
--
-- Both WhatsApp number and bank details start NULL — "unconfirmed until the
-- owner sets it", the same convention as `orders.delivery_fee_kobo` and
-- every other not-yet-confirmed fact in this app. A wrong bank account
-- number is money sent to the wrong place, so nothing here is ever defaulted
-- to a plausible-looking value.
--
-- Apply with:  psql "$DATABASE_URL" -f apps/web/migrations/0005_settings.sql

create table if not exists site_settings (
  id boolean primary key default true check (id),
  whatsapp_number text,
  bank_name text,
  bank_account_number text,
  bank_account_name text,
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (true) on conflict (id) do nothing;
