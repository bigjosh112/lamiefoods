-- 0003_products.sql — real, admin-managed product catalog.
--
-- Supersedes `content/products.ts` (static content) as the source of truth.
-- Plain Postgres, same rule as 0001/0002 — no Supabase-specific feature.
--
-- Money is INTEGER KOBO everywhere, matching apps/web/src/lib/money.ts.
--
-- Apply with:  psql "$DATABASE_URL" -f apps/web/migrations/0003_products.sql

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null
    check (category in ('chinchin', 'snacks', 'packaged-foods', 'pastries', 'other')),

  -- Shop-grid card copy. Kept short deliberately (matches the admin form's
  -- own 140-char limit, enforced there, not repeated here as a DB check).
  teaser text not null,
  narrative text,
  pairings text,

  crunch_score integer not null check (crunch_score between 1 and 10),

  ingredients text not null,
  allergens text[] not null default '{}',
  -- True once someone has explicitly confirmed the list above is complete,
  -- even if empty. Distinguishes "no allergens" from "nobody checked yet" —
  -- an allergen declaration is a food-safety matter, not marketing copy.
  allergens_confirmed boolean not null default false,

  shelf_life text,
  storage_note text,

  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  restock_threshold integer,

  -- Draft vs published. False means the storefront never shows this row —
  -- this is how "not live yet" is represented now, not a hardcoded fictional
  -- product.
  storefront_active boolean not null default false,
  feature_on_homepage boolean not null default false,
  seasonal_edition boolean not null default false,

  -- 1-99, or NULL for no promotion. NULL, never 0 — a stored 0 would read as
  -- an authorised discount nobody actually offered, the same reasoning
  -- orders.delivery_fee_kobo being NULL (not 0) already uses.
  discount_percent integer check (discount_percent between 1 and 99),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Packaging tiers. A child table, not a JSON column, for the same reason
-- order_items is a table: a SKU and a per-tier price need real rows to query
-- and index, not values buried in a blob.
create table if not exists product_packs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,               -- "250g Pouch"
  price_kobo integer not null check (price_kobo >= 0),
  sku text,
  sort_order integer not null default 0
);

-- Uploaded photos (Vercel Blob URLs). `role = 'hero'` is the one shown first;
-- everything else is 'gallery'. Not unique-constrained to exactly one hero —
-- the application picks the first hero row if more than one ever exists,
-- rather than a constraint that would reject an in-progress edit.
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text not null default '',
  role text not null default 'gallery' check (role in ('hero', 'gallery')),
  sort_order integer not null default 0
);

create index if not exists product_packs_product_id_idx on product_packs (product_id);
create index if not exists product_images_product_id_idx on product_images (product_id);
