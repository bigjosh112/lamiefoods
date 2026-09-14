-- 0010_delivery_area_state.sql — Nigerian state on each delivery area.
--
-- Checkout no longer collects State / region. The area the customer picks
-- carries the state (Ibadan → Oyo, Lagos zones → Lagos). `region` stays
-- lagos | interstate (fee grouping). Distinct from `orders.state`.
--
-- Apply with:  psql "$DATABASE_URL" -f apps/web/migrations/0010_delivery_area_state.sql

alter table delivery_areas
  add column if not exists state text;

-- Lagos grouping is always Lagos state.
update delivery_areas
  set state = 'Lagos'
  where region = 'lagos'
    and (state is null or state = '');

-- Seeded interstate names → Nigerian state.
update delivery_areas set state = 'Ogun' where name in ('Sango', 'Abeokuta');
update delivery_areas set state = 'Oyo' where name = 'Ibadan — Doorstep';
update delivery_areas set state = 'Edo' where name = 'Benin City — Doorstep';
update delivery_areas set state = 'Delta' where name = 'Asaba — Doorstep';
update delivery_areas set state = 'Anambra' where name = 'Onitsha — Doorstep';
update delivery_areas set state = 'Enugu' where name = 'Enugu';
update delivery_areas set state = 'Federal Capital Territory' where name = 'Abuja';
update delivery_areas set state = 'Rivers' where name = 'Port Harcourt';
update delivery_areas set state = 'Kano' where name = 'Kano';
update delivery_areas set state = 'Kaduna' where name = 'Kaduna';
update delivery_areas set state = 'Plateau' where name = 'Jos';
update delivery_areas set state = 'Cross River' where name = 'Calabar';
update delivery_areas set state = 'Sokoto' where name = 'Sokoto';

-- Fail loudly if an admin-created interstate row was not mapped above.
do $$
declare
  leftover text;
begin
  select string_agg(name, ', ' order by name)
    into leftover
  from delivery_areas
  where state is null or btrim(state) = '';

  if leftover is not null then
    raise exception
      'delivery_areas.state backfill incomplete for: %. Set those rows, then re-run.',
      leftover;
  end if;
end $$;

alter table delivery_areas
  alter column state set not null;
