-- Agents register families; they do not browse personal data. Once a household
-- is complete an agent can no longer read or change its people, so an NNI or a
-- phone number they typed stays with the admin. Admins are unaffected.
--
-- The rule lives here, in Row Level Security, because hiding a field on the
-- screen protects nothing: a signed-in agent could still query the API.

-- An agent may edit a household only while it is a draft. Without this they
-- could set a finished household back to "draft" and read its people again.
drop policy households_update on public.households;

create policy households_update on public.households
  for update to authenticated
  using (
    public.is_admin()
    or (
      public.is_active_staff()
      and created_by = (select auth.uid())
      and status = 'draft'
    )
  )
  with check (
    public.is_admin()
    or (public.is_active_staff() and created_by = (select auth.uid()))
  );

-- People follow their household, but for agents only while it is a draft.
drop policy persons_select on public.persons;
drop policy persons_insert on public.persons;
drop policy persons_update on public.persons;
drop policy persons_delete on public.persons;

create policy persons_select on public.persons
  for select to authenticated
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id
        and (
          public.is_admin()
          or (
            public.is_active_staff()
            and h.created_by = (select auth.uid())
            and h.status = 'draft'
          )
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
          or (
            public.is_active_staff()
            and h.created_by = (select auth.uid())
            and h.status = 'draft'
          )
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
          or (
            public.is_active_staff()
            and h.created_by = (select auth.uid())
            and h.status = 'draft'
          )
        )
    )
  )
  with check (
    exists (
      select 1 from public.households h
      where h.id = household_id
        and (
          public.is_admin()
          or (
            public.is_active_staff()
            and h.created_by = (select auth.uid())
            and h.status = 'draft'
          )
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
          or (
            public.is_active_staff()
            and h.created_by = (select auth.uid())
            and h.status = 'draft'
          )
        )
    )
  );

-- What an agent sees in "أسرتي": their own households, with a head count but
-- no person columns. This view deliberately runs with its owner's rights, so it
-- can count people the agent is not allowed to read; the where clause is what
-- keeps every row inside the caller's own registrations. It searches the family
-- name only, never the NNI or phone text of the people inside.
create view public.my_households as
select
  h.id,
  h.family_name,
  h.status,
  h.last_step,
  h.created_at,
  h.search_text,
  sf.name as small_family_name,
  lf.name as large_family_name,
  (select count(*) from public.persons p where p.household_id = h.id)
    as person_count
from public.households h
join public.small_families sf on sf.id = h.small_family_id
join public.large_families lf on lf.id = sf.large_family_id
where h.created_by = (select auth.uid())
  and public.is_active_staff();

revoke all on public.my_households from anon;
grant select on public.my_households to authenticated;
