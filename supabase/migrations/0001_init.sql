-- Initial schema for إحصاء الأسر: staff accounts, the family tree, households,
-- people, and the audit trail. Row Level Security keeps each agent to the
-- households they entered; admins see everything.

-- ---------------------------------------------------------------- tables ---

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  full_name text not null,
  role text not null check (role in ('admin', 'agent')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.large_families (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  notes text,
  created_at timestamptz not null default now()
);

create table public.small_families (
  id uuid primary key default gen_random_uuid(),
  large_family_id uuid not null references public.large_families on delete restrict,
  name text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (large_family_id, name)
);

create table public.households (
  id uuid primary key default gen_random_uuid(),
  small_family_id uuid not null references public.small_families on delete restrict,
  family_name text not null,
  wilaya text,
  city text,
  address_notes text,
  status text not null default 'draft' check (status in ('draft', 'complete')),
  -- Which step of the 7-step form a draft stopped on.
  last_step int not null default 3 check (last_step between 3 and 7),
  has_no_children boolean not null default false,
  created_by uuid not null references public.profiles,
  updated_by uuid references public.profiles,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.persons (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households on delete cascade,
  role text not null check (role in ('father', 'mother', 'child')),
  full_name text not null,
  gender text check (gender in ('male', 'female')),
  birth_date date,
  birth_date_precision text check (birth_date_precision in ('day', 'year')),
  nni text unique check (nni ~ '^[0-9]{10}$'),
  phone text check (phone ~ '^\+222[234][0-9]{7}$'),
  wilaya text,
  job text,
  education_level text,
  marital_status text check (marital_status in ('single', 'married', 'divorced', 'widowed')),
  is_alive boolean not null default true,
  mother_id uuid references public.persons on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_log (
  id bigserial primary key,
  actor uuid references public.profiles,
  action text not null check (action in ('create', 'update', 'delete', 'export', 'login')),
  table_name text,
  record_id uuid,
  at timestamptz not null default now()
);

-- Failed sign-in tries, for the lock-out in task 04. Server code only.
create table public.login_attempts (
  id bigserial primary key,
  username text not null,
  at timestamptz not null default now()
);

-- --------------------------------------------------------------- indexes ---

create index small_families_large_family_idx on public.small_families (large_family_id);
create index households_small_family_idx on public.households (small_family_id);
create index households_created_by_idx on public.households (created_by);
create index persons_household_idx on public.persons (household_id);
create index login_attempts_username_at_idx on public.login_attempts (username, at desc);

-- A household has at most one father.
create unique index one_father on public.persons (household_id) where role = 'father';

-- -------------------------------------------------------------- triggers ---

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger households_set_updated_at
  before update on public.households
  for each row execute function public.set_updated_at();

create trigger persons_set_updated_at
  before update on public.persons
  for each row execute function public.set_updated_at();

-- Security definer so the trigger can write the log even though agents may
-- only insert into audit_log, never read it.
create function public.write_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  performed text;
  target uuid;
begin
  if tg_op = 'INSERT' then
    performed := 'create';
    target := new.id;
  elsif tg_op = 'UPDATE' then
    performed := 'update';
    target := new.id;
  else
    performed := 'delete';
    target := old.id;
  end if;

  insert into public.audit_log (actor, action, table_name, record_id)
  values ((select auth.uid()), performed, tg_table_name, target);

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger households_audit
  after insert or update or delete on public.households
  for each row execute function public.write_audit();

create trigger persons_audit
  after insert or update or delete on public.persons
  for each row execute function public.write_audit();

-- ------------------------------------------------------ helper functions ---

-- Security definer, otherwise reading profiles inside a profiles policy
-- would recurse into that same policy.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and is_active
  );
$$;

create function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and is_active
  );
$$;

-- Tells the registration form that an NNI is already taken, and by which
-- household, without exposing any other agent's data.
create function public.find_household_by_nni(p_nni text)
returns table (id uuid, family_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select h.id, h.family_name
  from public.persons p
  join public.households h on h.id = p.household_id
  where p.nni = p_nni
    and public.is_active_staff()
  limit 1;
$$;

-- ----------------------------------------------------------------- views ---

create view public.large_family_stats
with (security_invoker = true) as
select
  lf.id,
  lf.name,
  count(distinct sf.id) as small_family_count,
  count(distinct h.id) as household_count,
  count(p.id) as person_count
from public.large_families lf
left join public.small_families sf on sf.large_family_id = lf.id
left join public.households h on h.small_family_id = sf.id
left join public.persons p on p.household_id = h.id
group by lf.id, lf.name;

create view public.census_totals
with (security_invoker = true) as
select
  (select count(*) from public.households) as household_count,
  (select count(*) from public.persons) as person_count,
  (select count(*) from public.large_families) as large_family_count,
  (select count(*) from public.households
    where created_at >= now() - interval '7 days') as households_last_7_days;

create view public.agent_stats
with (security_invoker = true) as
select
  pr.id as agent_id,
  pr.full_name,
  count(h.id) filter (where h.status = 'complete') as complete_households,
  count(h.id) filter (where h.status = 'draft') as draft_households,
  max(h.created_at) as last_entry_at
from public.profiles pr
left join public.households h on h.created_by = pr.id
where pr.role = 'agent'
group by pr.id, pr.full_name;

-- ------------------------------------------------------ row level security ---

alter table public.profiles enable row level security;
alter table public.large_families enable row level security;
alter table public.small_families enable row level security;
alter table public.households enable row level security;
alter table public.persons enable row level security;
alter table public.audit_log enable row level security;
alter table public.login_attempts enable row level security;

-- profiles: anyone signed in may read their own row, so the app can tell a
-- deactivated user why they are being turned away. Admins manage the rest.
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

create policy profiles_admin_insert on public.profiles
  for insert to authenticated
  with check (public.is_admin());

create policy profiles_admin_update on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy profiles_admin_delete on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- The family tree: every active member of staff reads it, admins edit it.
create policy large_families_select on public.large_families
  for select to authenticated
  using (public.is_active_staff());

create policy large_families_admin_write on public.large_families
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy small_families_select on public.small_families
  for select to authenticated
  using (public.is_active_staff());

create policy small_families_admin_write on public.small_families
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- households: agents see and edit only what they entered, and may delete a
-- record only while it is still a draft.
create policy households_select on public.households
  for select to authenticated
  using (
    public.is_admin()
    or (public.is_active_staff() and created_by = (select auth.uid()))
  );

create policy households_insert on public.households
  for insert to authenticated
  with check (
    public.is_admin()
    or (public.is_active_staff() and created_by = (select auth.uid()))
  );

create policy households_update on public.households
  for update to authenticated
  using (
    public.is_admin()
    or (public.is_active_staff() and created_by = (select auth.uid()))
  )
  with check (
    public.is_admin()
    or (public.is_active_staff() and created_by = (select auth.uid()))
  );

create policy households_delete on public.households
  for delete to authenticated
  using (
    public.is_admin()
    or (
      public.is_active_staff()
      and created_by = (select auth.uid())
      and status = 'draft'
    )
  );

-- persons follow whatever the household they belong to allows.
create policy persons_select on public.persons
  for select to authenticated
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id
        and (
          public.is_admin()
          or (public.is_active_staff() and h.created_by = (select auth.uid()))
        )
    )
  );

create policy persons_insert on public.persons
  for insert to authenticated
  with check (
    exists (
      select 1 from public.households h
      where h.id = household_id
        and (
          public.is_admin()
          or (public.is_active_staff() and h.created_by = (select auth.uid()))
        )
    )
  );

create policy persons_update on public.persons
  for update to authenticated
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id
        and (
          public.is_admin()
          or (public.is_active_staff() and h.created_by = (select auth.uid()))
        )
    )
  )
  with check (
    exists (
      select 1 from public.households h
      where h.id = household_id
        and (
          public.is_admin()
          or (public.is_active_staff() and h.created_by = (select auth.uid()))
        )
    )
  );

create policy persons_delete on public.persons
  for delete to authenticated
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id
        and (
          public.is_admin()
          or (public.is_active_staff() and h.created_by = (select auth.uid()))
        )
    )
  );

-- audit_log: staff add entries, only admins read them back.
create policy audit_log_insert on public.audit_log
  for insert to authenticated
  with check (public.is_active_staff());

create policy audit_log_admin_select on public.audit_log
  for select to authenticated
  using (public.is_admin());

-- login_attempts deliberately has no policy: with RLS on and nothing granted,
-- it is reachable only by server code using the service role key.
