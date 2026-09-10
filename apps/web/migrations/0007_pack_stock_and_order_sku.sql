-- 0007_pack_stock_and_order_sku.sql — inventory per packaging size + frozen order SKU.
--
-- Launch sells three sizes per flavour. Stock and restock alerts must live on
-- `product_packs`, not `products`, so buying out the 100g pouch does not mark
-- the 300g/500g as gone. Order lines also freeze the pack SKU for dispatch.
--
-- Overrides the 2026-09-08 "one stock row per product" decision — see
-- architecture.md's decision log for the reverse.
--
-- Also re-asserts the confirmed 100g/300g/500g pouch range with launch SKUs
-- for the three seeded flavours, in case an environment still has the old
-- mock packs ("250g Pouch" / "500g Gourmet Jar") because 0006 was never
-- applied.
--
-- Apply with:  psql "$DATABASE_URL" -f apps/web/migrations/0007_pack_stock_and_order_sku.sql

-- --- Pack-level stock columns ----------------------------------------------

alter table product_packs
  add column if not exists stock_quantity integer not null default 0
    check (stock_quantity >= 0);

alter table product_packs
  add column if not exists restock_threshold integer;

-- Preserve flavour-level counters onto existing packs before we reshape the
-- launch catalogue (column may already be gone on a re-run).
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_name = 'products' and column_name = 'stock_quantity'
  ) then
    update product_packs pp
       set stock_quantity = p.stock_quantity,
           restock_threshold = coalesce(pp.restock_threshold, p.restock_threshold)
      from products p
     where pp.product_id = p.id;
  end if;
end $$;

-- --- Launch packs: 3 flavours × 3 sizes + SKUs -----------------------------
-- Deleting is safe: orders freeze `pack_name` (and now `sku`) as text with no
-- FK to product_packs.

delete from product_packs
 where product_id in (
   select id from products
    where slug in (
      'milky-velvet-chinchin',
      'coco-velvet-chinchin',
      'cinnamon-chinchin'
    )
 );

insert into product_packs (
  product_id, name, price_kobo, sku, stock_quantity, restock_threshold, sort_order
)
select p.id, v.name, v.price_kobo, v.sku, 100, 20, v.sort_order
from products p
join (values
  ('milky-velvet-chinchin', '100g Pouch', 200000, 'LF-MVC-100', 0),
  ('milky-velvet-chinchin', '300g Pouch', 350000, 'LF-MVC-300', 1),
  ('milky-velvet-chinchin', '500g Pouch', 500000, 'LF-MVC-500', 2),
  ('coco-velvet-chinchin',  '100g Pouch', 200000, 'LF-CVC-100', 0),
  ('coco-velvet-chinchin',  '300g Pouch', 350000, 'LF-CVC-300', 1),
  ('coco-velvet-chinchin',  '500g Pouch', 500000, 'LF-CVC-500', 2),
  ('cinnamon-chinchin',     '100g Pouch', 200000, 'LF-CIN-100', 0),
  ('cinnamon-chinchin',     '300g Pouch', 350000, 'LF-CIN-300', 1),
  ('cinnamon-chinchin',     '500g Pouch', 500000, 'LF-CIN-500', 2)
) as v(slug, name, price_kobo, sku, sort_order) on v.slug = p.slug;

create unique index if not exists product_packs_sku_unique
  on product_packs (sku)
  where sku is not null;

alter table products drop column if exists stock_quantity;
alter table products drop column if exists restock_threshold;

-- --- Frozen SKU on order lines ---------------------------------------------

alter table order_items
  add column if not exists sku text;

update order_items oi
   set sku = pp.sku
  from products p
  join product_packs pp on pp.product_id = p.id
 where oi.product_slug = p.slug
   and oi.pack_name = pp.name
   and oi.sku is null;
