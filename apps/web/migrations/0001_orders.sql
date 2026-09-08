-- 0001_orders.sql — guest-checkout order capture.
--
-- Plain Postgres on purpose. The database is Supabase today and Railway later,
-- so nothing here may use a Supabase-specific feature (no RLS policies, no
-- auth.uid(), no storage). Moving hosts must be a DATABASE_URL change only.
--
-- Money is INTEGER KOBO everywhere, matching apps/web/src/lib/money.ts. Naira
-- never exists as a float in this system; 1 naira = 100 kobo.
--
-- Apply with:  psql "$DATABASE_URL" -f apps/web/migrations/0001_orders.sql

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),

  -- Human-readable, shown to the customer and used in email subject lines.
  -- NOT a credential: it is short and guessable, so it must never be sufficient
  -- to fetch an order.
  reference text not null unique,

  -- The actual capability to read this order. Random, 32 bytes, base64url.
  -- /order-success?token=... is addressable by anyone holding it, and the page
  -- shows a name, phone number and home address — hence the entropy.
  access_token text not null unique,

  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  address_line text not null,
  landmark text not null,
  city text not null,
  state text not null,

  subtotal_kobo integer not null check (subtotal_kobo >= 0),

  -- Nullable because delivery pricing genuinely is not set yet. NULL means
  -- "not yet quoted". A 0 here would be a quote of free delivery that nobody
  -- authorised, and customers can hold a business to a quote.
  delivery_fee_kobo integer check (delivery_fee_kobo >= 0),
  total_kobo integer check (total_kobo >= 0),

  status text not null default 'pending'
    check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','paid','failed','refunded')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Line items are frozen copies of what was bought, never references to the live
-- catalogue: editing a product later must not rewrite order history.
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,

  product_slug text not null,
  product_name text not null,

  -- Which pack was bought ("250g Pouch" / "500g Gourmet Jar"). Required: the
  -- packs are different prices and different physical goods, so a line without
  -- one cannot be fulfilled.
  pack_name text not null,

  unit_price_kobo integer not null check (unit_price_kobo >= 0),
  -- Mirrors MAX_QUANTITY in apps/web/src/lib/cart/cart-store.ts.
  quantity integer not null check (quantity > 0 and quantity <= 20),
  line_total_kobo integer not null check (line_total_kobo >= 0)
);

create index if not exists order_items_order_id_idx on order_items (order_id);
create index if not exists orders_created_at_idx on orders (created_at desc);
