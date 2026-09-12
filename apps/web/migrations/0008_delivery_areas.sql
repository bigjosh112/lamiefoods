-- 0008_delivery_areas.sql — admin-managed delivery zones + fees at checkout.
--
-- Supersedes the Q16 "delivery quoted separately / Paystack charges subtotal
-- only" decision: when a customer picks an area, `orders.delivery_fee_kobo`
-- and `orders.total_kobo` are set at create time and payment charges that total.
--
-- Apply with:  psql "$DATABASE_URL" -f apps/web/migrations/0008_delivery_areas.sql

create table if not exists delivery_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee_kobo integer not null check (fee_kobo >= 0),
  region text not null check (region in ('lagos', 'interstate')),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint delivery_areas_name_unique unique (name)
);

create index if not exists delivery_areas_active_region_sort_idx
  on delivery_areas (active, region, sort_order, name);

alter table orders
  add column if not exists delivery_area_id uuid references delivery_areas (id) on delete set null;

alter table orders
  add column if not exists delivery_area_name text;

-- --- Seed: interstate -------------------------------------------------------

insert into delivery_areas (name, fee_kobo, region, sort_order) values
  ('Sango', 600000, 'interstate', 10),
  ('Abeokuta', 800000, 'interstate', 20),
  ('Ibadan — Doorstep', 950000, 'interstate', 30),
  ('Benin City — Doorstep', 1100000, 'interstate', 40),
  ('Asaba — Doorstep', 1250000, 'interstate', 50),
  ('Onitsha — Doorstep', 1250000, 'interstate', 60),
  ('Enugu', 1300000, 'interstate', 70),
  ('Abuja', 1400000, 'interstate', 80),
  ('Port Harcourt', 1400000, 'interstate', 90),
  ('Kano', 1600000, 'interstate', 100),
  ('Kaduna', 1500000, 'interstate', 110),
  ('Jos', 1500000, 'interstate', 120),
  ('Calabar', 1600000, 'interstate', 130),
  ('Sokoto', 1600000, 'interstate', 140)
on conflict (name) do update set
  fee_kobo = excluded.fee_kobo,
  region = excluded.region,
  sort_order = excluded.sort_order,
  updated_at = now();

-- --- Seed: Lagos ------------------------------------------------------------

insert into delivery_areas (name, fee_kobo, region, sort_order) values
  ('Mainland Ikeja', 350000, 'lagos', 210),
  ('Egbeda / Iyana Ipaja', 250000, 'lagos', 220),
  ('Magodo / Berger / Ogudu', 400000, 'lagos', 230),
  ('Abule Egba / Ifako-Ijaiye', 400000, 'lagos', 240),
  ('Yaba / Surulere / Maryland', 400000, 'lagos', 250),
  ('Gbagada / Oshodi', 400000, 'lagos', 260),
  ('Ogba / Agege', 300000, 'lagos', 270),
  ('Ikorodu', 500000, 'lagos', 280),
  ('Festac / Amuwo Odofin', 450000, 'lagos', 290),
  ('Lagos Island / VI', 500000, 'lagos', 300),
  ('Lekki / Oniru / Ikate', 550000, 'lagos', 310),
  ('Ajah / Sangotedo', 600000, 'lagos', 320),
  ('Epe', 650000, 'lagos', 330),
  ('Badagry / Agbara', 700000, 'lagos', 340)
on conflict (name) do update set
  fee_kobo = excluded.fee_kobo,
  region = excluded.region,
  sort_order = excluded.sort_order,
  updated_at = now();
