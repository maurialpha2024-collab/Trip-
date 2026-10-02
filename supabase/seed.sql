-- Sample family tree for local development. Invented names only.
-- Creates no accounts: those are made by the owner with npm run create-user.
-- Safe to run more than once.

insert into public.large_families (name) values
  ('أهل محمد الأمين'),
  ('أهل أحمد سالم'),
  ('أهل سيدي عبد الله')
on conflict (name) do nothing;

insert into public.small_families (large_family_id, name)
select lf.id, v.small_name
from (values
  ('أهل محمد الأمين',   'أولاد الشيخ'),
  ('أهل محمد الأمين',   'أولاد محمدن'),
  ('أهل محمد الأمين',   'أولاد البخاري'),
  ('أهل أحمد سالم',     'أولاد سالم'),
  ('أهل أحمد سالم',     'أولاد الداه'),
  ('أهل سيدي عبد الله', 'أولاد سيدي'),
  ('أهل سيدي عبد الله', 'أولاد عبد الله'),
  ('أهل سيدي عبد الله', 'أولاد أحمدو')
) as v (large_name, small_name)
join public.large_families lf on lf.name = v.large_name
on conflict (large_family_id, name) do nothing;
