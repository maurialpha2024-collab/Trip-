-- Search support for the households list. The same name gets typed with
-- different alef and hamza forms and with or without diacritics, so a folded
-- copy of the text is stored and searched instead of the original.

create extension if not exists pg_trgm;

-- Mirrors normalizeArabic() in src/lib/arabic.ts. Marked immutable so it can
-- back a stored generated column.
create function public.normalize_arabic(value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select regexp_replace(
    lower(
      translate(
        regexp_replace(value, '[ًٌٍَُِّْٰـ]', '', 'g'),
        'أإآٱىةؤئ',
        'اااايهوي'
      )
    ),
    '\s+', ' ', 'g'
  );
$$;

alter table public.households
  add column search_text text
  generated always as (public.normalize_arabic(family_name)) stored;

-- A person is findable by name, national ID or phone number.
alter table public.persons
  add column search_text text
  generated always as (
    public.normalize_arabic(
      coalesce(full_name, '') || ' ' ||
      coalesce(nni, '') || ' ' ||
      coalesce(phone, '')
    )
  ) stored;

create index households_search_idx
  on public.households using gin (search_text gin_trgm_ops);

create index persons_search_idx
  on public.persons using gin (search_text gin_trgm_ops);

-- One row per household carrying everything the list shows, plus the folded
-- text of every person in it, so "find the household containing this NNI" is a
-- single query. security_invoker keeps each agent inside their own rows.
create view public.household_search
with (security_invoker = true) as
select
  h.id,
  h.family_name,
  h.wilaya,
  h.city,
  h.status,
  h.created_at,
  h.created_by,
  h.small_family_id,
  sf.name as small_family_name,
  lf.id as large_family_id,
  lf.name as large_family_name,
  count(p.id) as person_count,
  h.search_text || ' ' || coalesce(string_agg(p.search_text, ' '), '') as search_all
from public.households h
join public.small_families sf on sf.id = h.small_family_id
join public.large_families lf on lf.id = sf.large_family_id
left join public.persons p on p.household_id = h.id
group by h.id, sf.name, lf.id, lf.name;
