-- 0004_seed_existing_products.sql — one-time seed of the three products that
-- used to live in the static apps/web/src/content/products.ts catalogue,
-- into the real products/product_packs tables from 0003_products.sql.
--
-- Safe to re-run: every insert is guarded by `where not exists`, keyed on
-- slug, so running this twice does not create duplicates. All three publish
-- immediately (storefront_active = true) since they were already live on
-- the storefront under the static catalogue.
--
-- Prices, crunch scores and ingredient copy are carried over UNCHANGED from
-- the static file — they were already marked UNVERIFIED there (GAP-004) and
-- remain exactly as unverified here; this migration does not confirm them,
-- only relocates them.
--
-- Apply with:  psql "$DATABASE_URL" -f apps/web/migrations/0004_seed_existing_products.sql

insert into products (
  slug, name, category, teaser, crunch_score, ingredients,
  allergens, allergens_confirmed, storefront_active, feature_on_homepage
)
select * from (values
  (
    'milky-velvet-chinchin', 'Milky Velvet Chinchin', 'chinchin',
    'Rich velvety milk indulgence, tender melt-in-the-mouth golden crumb, and gentle undertones of vanilla and stone-grated nutmeg.',
    8,
    'Premium unbleached wheat flour, churned sweet cream butter, whole cow milk, unrefined cane sugar, fine sea salt crystals, freshly hand-ground nutmeg, and high-smoke refined vegetable oil for flash frying.',
    array[]::text[], false, true, true
  ),
  (
    'coco-velvet-chinchin', 'Coco Velvet Chinchin', 'chinchin',
    'Toasted coastal coconut flakes folded into buttery dough for a warm tropical snap with balanced sweetness.',
    8,
    'Premium unbleached wheat flour, churned sweet cream butter, toasted coconut flakes, whole cow milk, unrefined cane sugar, fine sea salt, and high-smoke refined vegetable oil for flash frying.',
    array[]::text[], false, true, true
  ),
  (
    'cinnamon-chinchin', 'Cinnamon Chinchin', 'chinchin',
    'Freshly milled cinnamon bark and warm whole nutmeg toasted deeply into a crisp, acoustic crunch.',
    10,
    'Premium unbleached wheat flour, churned sweet cream butter, freshly milled cinnamon bark, whole grated nutmeg, whole cow milk, unrefined cane sugar, fine sea salt, and high-smoke refined vegetable oil for flash frying.',
    array[]::text[], false, true, true
  )
) as v(slug, name, category, teaser, crunch_score, ingredients, allergens, allergens_confirmed, storefront_active, feature_on_homepage)
where not exists (select 1 from products p where p.slug = v.slug);

-- Packaging tiers — two per product, matching the static catalogue exactly.
insert into product_packs (product_id, name, price_kobo, sort_order)
select p.id, v.name, v.price_kobo, v.sort_order
from products p
join (values
  ('milky-velvet-chinchin', '250g Pouch', 360000, 0),
  ('milky-velvet-chinchin', '500g Gourmet Jar', 560000, 1),
  ('coco-velvet-chinchin', '250g Pouch', 380000, 0),
  ('coco-velvet-chinchin', '500g Gourmet Jar', 580000, 1),
  ('cinnamon-chinchin', '250g Pouch', 380000, 0),
  ('cinnamon-chinchin', '500g Gourmet Jar', 580000, 1)
) as v(slug, name, price_kobo, sort_order) on v.slug = p.slug
where not exists (
  select 1 from product_packs pk where pk.product_id = p.id and pk.name = v.name
);

-- Images: only two of the three had a real photo in the static catalogue
-- (milky-velvet-chinchin's was still a placeholder — `image.src: null`) —
-- carried over as-is, not invented. Re-upload through the admin form
-- (Vercel Blob) to add real photography for any product.
insert into product_images (product_id, url, alt, role, sort_order)
select p.id, v.url, v.alt, 'hero', 0
from products p
join (values
  ('coco-velvet-chinchin', '/images/chinchin10.png', 'Coco Velvet Chinchin with fresh coconut'),
  ('cinnamon-chinchin', '/images/chinchin11.png', 'Cinnamon Chinchin on a wooden board')
) as v(slug, url, alt) on v.slug = p.slug
where not exists (
  select 1 from product_images pi where pi.product_id = p.id and pi.role = 'hero'
);
