# Task 02 — Database (Supabase)

**Goal:** create the tables, the security rules and some sample data. No pages in this task.

Put the SQL in `supabase/migrations/0001_init.sql` and `supabase/seed.sql`. Also write `lib/supabase/server.ts`, `client.ts`, `admin.ts` (service role, server only) and `lib/auth.ts`.

---

## 1. Tables

```sql
-- Staff accounts (one row per Supabase Auth user)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  full_name text not null,
  role text not null check (role in ('admin','agent')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- الأسر الكبرى
create table large_families (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  notes text,
  created_at timestamptz not null default now()
);

-- الأسر الصغرى
create table small_families (
  id uuid primary key default gen_random_uuid(),
  large_family_id uuid not null references large_families on delete restrict,
  name text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (large_family_id, name)
);

-- One household (بيت)
create table households (
  id uuid primary key default gen_random_uuid(),
  small_family_id uuid not null references small_families on delete restrict,
  family_name text not null,
  wilaya text,
  city text,
  address_notes text,
  status text not null default 'draft' check (status in ('draft','complete')),
  last_step int not null default 3,   -- where a draft stopped (steps 3–7 of the form)
  has_no_children boolean not null default false,
  created_by uuid not null references profiles,
  updated_by uuid references profiles,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Father, mother(s), children
create table persons (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  role text not null check (role in ('father','mother','child')),
  full_name text not null,
  gender text check (gender in ('male','female')),
  birth_date date,
  birth_date_precision text check (birth_date_precision in ('day','year')),
  nni text unique,
  phone text,
  wilaya text,
  job text,
  education_level text,
  marital_status text check (marital_status in ('single','married','divorced','widowed')),
  is_alive boolean not null default true,
  mother_id uuid references persons on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_log (
  id bigserial primary key,
  actor uuid references profiles,
  action text not null,          -- create | update | delete | export | login
  table_name text,
  record_id uuid,
  at timestamptz not null default now()
);
```

```sql
-- Failed login tries, for the 15-minute lock-out in task 04 (server only, no RLS access for users)
create table login_attempts (
  id bigserial primary key,
  username text not null,
  at timestamptz not null default now()
);
```

Also:
- Indexes on `small_families.large_family_id`, `households.small_family_id`, `households.created_by`, `persons.household_id`.
- Only one father per household: `create unique index one_father on persons (household_id) where role = 'father';`
- Trigger to set `updated_at` on households and persons.
- Trigger that writes create / update / delete of households and persons into `audit_log` (actor = `auth.uid()`).
- `nni` check: 10 digits. `phone` check: `^\+222[234][0-9]{7}$`.

## 2. Views for the dashboard

- `large_family_stats`: per large family: number of small families, households, persons.
- `census_totals`: total households, persons, large families, households created in the last 7 days.
- `agent_stats`: per agent: complete households, drafts, last entry date.

Views must use `security_invoker = true` so the security rules still apply.

## 3. Security rules (Row Level Security)

Turn RLS on for **every** table. Helper functions:

```sql
create function is_admin() returns boolean ...   -- active profile with role 'admin'
create function is_active_staff() returns boolean ...
```

| Table | Agent | Admin |
|---|---|---|
| profiles | read own row | read / write all |
| large_families, small_families | read | read / write |
| households | read / insert / update rows they created; delete only their own **drafts** | everything |
| persons | same as the household they belong to | everything |
| audit_log | insert only | read |

Inactive profiles get nothing.

**NNI duplicate check:** a function `find_household_by_nni(nni text)` (security definer) that returns only the `family_name` and `id` of the household holding that NNI, so the form can say "هذا الرقم مسجل في أسرة: …" without showing other agents' details.

## 4. Login by username

Supabase Auth needs an email, so each account uses a hidden email: `username@census.local`. Users only ever see and type the username.

## 5. Creating accounts from the terminal (the owner types them, not the code)

**No username or password is ever written in the code, the seed or the README.**

First create the shared password rules (used again in tasks 04 and 11):
- `src/lib/validation/password.ts`: zod schema, at least **12 characters**, not in the common-password list, not the same as the username. Error: "كلمة المرور ضعيفة: 12 حرفاً على الأقل، وتجنّب الكلمات الشائعة."
- `src/lib/common-passwords.ts`: the 1,000 most common passwords.

Then create `scripts/create-user.ts` and the npm script `npm run create-user`. When the owner runs it in the terminal it:
1. Asks for full name, username, role (admin / agent) and password (password typed hidden, asked twice to confirm).
2. Checks the username format and the password rules above.
3. Creates the Supabase Auth user (`username@census.local`, email already confirmed) and the `profiles` row, using the service role key from `.env.local`.
4. Prints only "تم إنشاء الحساب: <username> (<role>)". Never prints the password.

The owner uses it to create **the first admin**, and during development a few **test agents**. After task 11, all other accounts are created from the "الموظفون" page in the app.

## 6. Sample data (`seed.sql`, for local development only)

Use **invented** names and numbers only. The seed creates **no accounts**.
- 3 large families (e.g. أهل محمد الأمين، أهل أحمد سالم، أهل سيدي عبد الله), each with 2–3 small families.
- A second script `npm run seed-households` (dev only, refuses to run if `NODE_ENV=production`) adds 6 sample households with a father, a mother and 1–4 children to existing agent accounts; 1 of them is a draft.

## 7. Helpers in `lib/auth.ts`

- `getCurrentProfile()` → the logged-in profile or `null`.
- `requireProfile()` → redirects to `/login` if not logged in or inactive.
- `requireAdmin()` → redirects agents to `/`.

## Done when
- [ ] Migration and seed run without errors on a fresh Supabase project.
- [ ] `npm run create-user` creates an admin or agent with the username and password I type, and the password never appears on screen or in any file.
- [ ] No username or password exists anywhere in the code, seed or README.
- [ ] Types generated into `src/lib/supabase/types.ts`.
- [ ] README explains: create the project, run migration, run seed, **turn off public sign-up** in Auth settings, run `npm run create-user` to create the first admin.
- [ ] (Checked later, after task 11) An agent cannot read another agent's households.
