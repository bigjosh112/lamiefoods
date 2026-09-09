-- 0006_correct_seeded_catalogue.sql — corrects the three seeded chinchin
-- products to the owner's confirmed range, copy and photography.
--
-- WHY A NEW MIGRATION RATHER THAN FIXING 0004.
--
-- 0004 was written against the static catalogue as it stood before the owner
-- confirmed the range, and every insert in it is guarded by `where not exists`
-- so it is safe to re-run. That guard is exactly why editing 0004 does not
-- help anyone who has already applied it: the rows exist, so the corrected
-- inserts are skipped and the database keeps the old values. This migration
-- UPDATEs what is already there.
--
-- What was wrong, and what a customer saw because of it:
--   * Packs read "250g Pouch" and "500g Gourmet Jar" at the design mock's
--     prices. The brand sells no jar and does not offer 250g, so the shop was
--     offering a product that does not exist, priced from a mock.
--   * Teasers were the mock's long paragraphs, not the owner's shortened copy.
--   * Hero images were the two leftover photos from the static catalogue, and
--     Milky Velvet had none at all.
--   * `stock_quantity` defaults to 0 in 0003, and nothing set it — so every
--     product rendered "Sold out" with its "Add to bag" button disabled.
--
-- Scoped by slug to the three seeded products, so it never touches anything
-- created later through /admin/products.
--
-- Safe to re-run: every statement is an UPDATE, or a DELETE followed by an
-- INSERT of the same rows.
--
-- Apply with:  psql "$DATABASE_URL" -f apps/web/migrations/0006_correct_seeded_catalogue.sql

begin;

-- ── Teasers: the owner's shortened copy ──────────────────────────────────────
update products set teaser = 'Soft, buttery crumb with real vanilla and stone-ground nutmeg.'
  where slug = 'milky-velvet-chinchin';
update products set teaser = 'Toasted coconut folded into buttery dough, for a light tropical crunch.'
  where slug = 'coco-velvet-chinchin';
update products set teaser = 'Fresh cinnamon and whole nutmeg, toasted deep for a warm, spiced crunch.'
  where slug = 'cinnamon-chinchin';

-- ── Stock ────────────────────────────────────────────────────────────────────
-- PLACEHOLDER COUNTS. Nobody has counted anything; these exist only so the
-- storefront stops asserting "Sold out", which is itself a false claim about
-- real goods. Set the true figures in /admin/products — this migration only
-- raises stock that is still sitting at the 0 default, so a real count entered
-- through the admin is never overwritten by re-running it.
update products
   set stock_quantity = 100
 where slug in ('milky-velvet-chinchin', 'coco-velvet-chinchin', 'cinnamon-chinchin')
   and stock_quantity = 0;

-- ── Packs: three pouches, confirmed by the owner 2026-09-08 ──────────────────
-- 100g / 300g / 500g at ₦2,000 / ₦3,500 / ₦5,000, the same for every flavour.
-- Deleting is safe: orders record `pack_name` as their own text column with no
-- foreign key here, so order history keeps whatever was bought at the time.
delete from product_packs
 where product_id in (
   select id from products
    where slug in ('milky-velvet-chinchin', 'coco-velvet-chinchin', 'cinnamon-chinchin')
 );

insert into product_packs (product_id, name, price_kobo, sort_order)
select p.id, v.name, v.price_kobo, v.sort_order
from products p
join (values
  ('milky-velvet-chinchin', '100g Pouch', 200000, 0),
  ('milky-velvet-chinchin', '300g Pouch', 350000, 1),
  ('milky-velvet-chinchin', '500g Pouch', 500000, 2),
  ('coco-velvet-chinchin', '100g Pouch', 200000, 0),
  ('coco-velvet-chinchin', '300g Pouch', 350000, 1),
  ('coco-velvet-chinchin', '500g Pouch', 500000, 2),
  ('cinnamon-chinchin', '100g Pouch', 200000, 0),
  ('cinnamon-chinchin', '300g Pouch', 350000, 1),
  ('cinnamon-chinchin', '500g Pouch', 500000, 2)
) as v(slug, name, price_kobo, sort_order) on v.slug = p.slug;

-- ── Hero images ──────────────────────────────────────────────────────────────
-- ⚠ PLACEHOLDER PHOTOGRAPHY — these are stock packaging mockups belonging to
-- OTHER brands, supplied by the owner as local stand-ins until the brand shoot.
-- They carry third-party names, an Instagram handle, barcodes and legible
-- nutrition panels. They must not reach production: they would put another
-- company's trade dress on the storefront and display allergen and nutritional
-- information that is not Lamie Foods' own. Tracked as GAP-006.
--
-- Replace by uploading real photography through /admin/products, which writes
-- Vercel Blob URLs into this same table.
delete from product_images
 where role = 'hero'
   and product_id in (
     select id from products
      where slug in ('milky-velvet-chinchin', 'coco-velvet-chinchin', 'cinnamon-chinchin')
   );

insert into product_images (product_id, url, alt, role, sort_order)
select p.id, v.url, v.alt, 'hero', 0
from products p
join (values
  ('milky-velvet-chinchin', '/images/packagedchinchin.jpeg',  'Milky Velvet Chinchin in its pack'),
  ('coco-velvet-chinchin',  '/images/packagedchinchin1.jpeg', 'Coco Velvet Chinchin in its pack'),
  ('cinnamon-chinchin',     '/images/packagedchinchin3.jpeg', 'Cinnamon Chinchin in its pack')
) as v(slug, url, alt) on v.slug = p.slug;

commit;
