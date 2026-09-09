-- 0004_seed_existing_products.sql — one-time seed of the three products that
-- used to live in the static apps/web/src/content/products.ts catalogue,
-- into the real products/product_packs tables from 0003_products.sql.
--
-- Safe to re-run: every insert is guarded by `where not exists`, keyed on
-- slug, so running this twice does not create duplicates. All three publish
-- immediately (storefront_active = true) since they were already live on
-- the storefront under the static catalogue.
--
-- Crunch scores and ingredient copy are carried over UNCHANGED from the static
-- file — still UNVERIFIED (GAP-004); this migration relocates them, it does not
-- confirm them.
--
-- PACK SIZES AND PRICES ARE THE EXCEPTION: those the owner confirmed on
-- 2026-09-08 (three pouches, ₦2,000 / ₦3,500 / ₦5,000) and they are seeded as
-- confirmed, not as placeholders. Teasers are the owner's shortened copy from
-- the same pass.
--
-- Apply with:  psql "$DATABASE_URL" -f apps/web/migrations/0004_seed_existing_products.sql

insert into products (
  slug, name, category, teaser, crunch_score, ingredients,
  allergens, allergens_confirmed, storefront_active, feature_on_homepage
)
select * from (values
  (
    'milky-velvet-chinchin', 'Milky Velvet Chinchin', 'chinchin',
    'Soft, buttery crumb with real vanilla and stone-ground nutmeg.',
    8,
    'Premium unbleached wheat flour, churned sweet cream butter, whole cow milk, unrefined cane sugar, fine sea salt crystals, freshly hand-ground nutmeg, and high-smoke refined vegetable oil for flash frying.',
    array[]::text[], false, true, true
  ),
  (
    'coco-velvet-chinchin', 'Coco Velvet Chinchin', 'chinchin',
    'Toasted coconut folded into buttery dough, for a light tropical crunch.',
    8,
    'Premium unbleached wheat flour, churned sweet cream butter, toasted coconut flakes, whole cow milk, unrefined cane sugar, fine sea salt, and high-smoke refined vegetable oil for flash frying.',
    array[]::text[], false, true, true
  ),
  (
    'cinnamon-chinchin', 'Cinnamon Chinchin', 'chinchin',
    'Fresh cinnamon and whole nutmeg, toasted deep for a warm, spiced crunch.',
    10,
    'Premium unbleached wheat flour, churned sweet cream butter, freshly milled cinnamon bark, whole grated nutmeg, whole cow milk, unrefined cane sugar, fine sea salt, and high-smoke refined vegetable oil for flash frying.',
    array[]::text[], false, true, true
  )
) as v(slug, name, category, teaser, crunch_score, ingredients, allergens, allergens_confirmed, storefront_active, feature_on_homepage)
where not exists (select 1 from products p where p.slug = v.slug);

-- PLACEHOLDER STOCK. Nobody has counted anything; these exist only so a fresh
-- database does not open with every product asserting "Sold out". Set real
-- figures in /admin/products.
update products
   set stock_quantity = 100
 where slug in ('milky-velvet-chinchin', 'coco-velvet-chinchin', 'cinnamon-chinchin')
   and stock_quantity = 0;

-- Packaging tiers — THREE pouches per product.
--
-- These are the owner's CONFIRMED range and prices (2026-09-08): 100g, 300g
-- and 500g resealable pouches at ₦2,000 / ₦3,500 / ₦5,000, the same for every
-- flavour. They are not the mock's placeholders.
--
-- This file previously seeded '250g Pouch' and '500g Gourmet Jar' at the old
-- unverified prices, because it was written against the static catalogue as it
-- stood before that confirmation. Two things were wrong with it: the brand
-- sells no jar at all, and 250g is not a size it offers. Seeding those would
-- have put a product the brand does not sell on the storefront, priced from a
-- design mock.
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
) as v(slug, name, price_kobo, sort_order) on v.slug = p.slug
where not exists (
  select 1 from product_packs pk where pk.product_id = p.id and pk.name = v.name
);

-- ⚠ PLACEHOLDER PHOTOGRAPHY — stock packaging mockups belonging to OTHER
-- brands, supplied by the owner as local stand-ins until the brand shoot. They
-- carry third-party names, an Instagram handle, barcodes and legible nutrition
-- panels, so they must not reach production: they would put another company's
-- trade dress on the storefront and show allergen and nutritional information
-- that is not Lamie Foods' own. Tracked as GAP-006. Replace by uploading real
-- photography through /admin/products.
--
-- This used to seed the two leftover photos from the static catalogue and
-- leave Milky Velvet with none.
insert into product_images (product_id, url, alt, role, sort_order)
select p.id, v.url, v.alt, 'hero', 0
from products p
join (values
  ('milky-velvet-chinchin', '/images/packagedchinchin.jpeg', 'Milky Velvet Chinchin in its pack'),
  ('coco-velvet-chinchin', '/images/packagedchinchin1.jpeg', 'Coco Velvet Chinchin in its pack'),
  ('cinnamon-chinchin', '/images/packagedchinchin3.jpeg', 'Cinnamon Chinchin in its pack')
) as v(slug, url, alt) on v.slug = p.slug
where not exists (
  select 1 from product_images pi where pi.product_id = p.id and pi.role = 'hero'
);
