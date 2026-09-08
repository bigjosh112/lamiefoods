-- 0002_payments_and_admin.sql — payment method/tracking for orders.
--
-- Additive only. 0001_orders.sql is never edited after being applied — new
-- columns arrive in new migration files, in order.
--
-- Apply with:  psql "$DATABASE_URL" -f apps/web/migrations/0002_payments_and_admin.sql

alter table orders
  add column if not exists payment_method text not null default 'paystack'
    check (payment_method in ('paystack', 'whatsapp_transfer')),
  -- Paystack's own reference for the current/most recent payment attempt.
  -- Not unique: a customer can retry after a cancelled/failed attempt, and
  -- each attempt needs a fresh Paystack reference (Paystack requires one).
  add column if not exists payment_reference text,
  -- Set exactly once, the moment payment_status first becomes 'paid'. Also
  -- the idempotency guard for the payment-confirmed email — see
  -- server/orders/paystack.ts and the admin status-update route.
  add column if not exists paid_at timestamptz,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz;

-- Plain index: the Paystack webhook payload carries only a reference, never
-- our order id/token, so confirming a payment starts with this lookup.
create index if not exists orders_payment_reference_idx on orders (payment_reference);

-- Partial UNIQUE index: once a reference has actually been used to mark an
-- order paid, no other order may claim it. This is the DB-enforced defense
-- against a forged/reused reference being replayed against a second order —
-- see server/orders/paystack.ts for the full reasoning. Deliberately partial
-- (only while payment_status = 'paid') rather than a plain unique constraint,
-- because the SAME reference is legitimately assigned, then possibly
-- abandoned and reassigned, across a customer's retried, failed, or
-- cancelled attempts before one finally succeeds.
create unique index if not exists orders_paid_payment_reference_idx
  on orders (payment_reference) where payment_status = 'paid';
