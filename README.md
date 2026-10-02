# إحصاء الأسر

A private web app for the family census of a tribe in Mauritania. It holds real
personal data — names, national ID numbers (NNI) and phone numbers — so every
table is protected by Row Level Security and accounts are created only by the
owner.

The build plan lives in [`census-kit/`](census-kit/), one task per file.
Project rules are in [`CLAUDE.md`](CLAUDE.md).

## Stack

Next.js 15 (App Router, TypeScript, Server Actions) · Supabase (Postgres, Auth,
RLS) · Tailwind CSS v4 + shadcn/ui · react-hook-form + zod · next-intl with the
locale in a cookie (Arabic default, right-to-left; French left-to-right).

## Setting up

### 1. Create the Supabase project

Create a project at [supabase.com](https://supabase.com) and keep the database
password it gives you.

### 2. Fill in the environment file

Copy `.env.example` to `.env.local` and fill in the four values from
**Settings → API** and **Connect → Session pooler**:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
SUPABASE_DB_URL=postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:5432/postgres
```

`.env.local` is git-ignored and must never be committed. Use the **Session
pooler** connection string, not "Direct connection" — the direct host is
IPv6-only. If the password contains `@`, write it as `%40`.

### 3. Create the tables

Run `supabase/migrations/0001_init.sql` against the database, either with the
SQL editor in the Supabase dashboard or with:

```bash
npx supabase db push --db-url "<your SUPABASE_DB_URL>"
```

### 4. Add the sample family tree

Run `supabase/seed.sql` the same way. It inserts three large families and their
small families, with invented names. It creates no accounts.

### 5. Turn off public sign-up

In the dashboard go to **Authentication → Sign In / Providers** and switch off
**Allow new users to sign up**. Only the owner may create accounts.

### 6. Create the first admin

```bash
npm install
npm run create-user
```

The script asks for a full name, a username, a role (`admin` or `agent`) and a
password, typed hidden and confirmed twice. The password must be at least 12
characters, must not be a common password, and must not match the username.

**No username or password is stored in this repository.** You choose them, they
go straight to Supabase Auth, and the script prints only the username and role.

Accounts after the first are created from the الموظفون page inside the app.

### 7. Optional: sample households for development

```bash
npm run seed-households
```

Adds six invented households to existing agent accounts. It refuses to run when
`NODE_ENV=production`.

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run create-user` | Create one staff account from the terminal |
| `npm run reset-mfa` | Remove an account's authenticator so it can be set up on a new phone |
| `npm run seed-households` | Sample households, development only |

### Locked out of the admin side

Admins sign in with a password and then a six-digit code from an authenticator
app. An admin can reset another person's authenticator from the الموظفون page.
If the only admin loses their phone, there is nobody left to press that button,
so run `npm run reset-mfa` instead: it asks for the username, removes the
authenticator, and the next sign-in offers a fresh QR code. It needs
`.env.local`, so only whoever holds the service role key can do it.

## Regenerating the database types

After any change to the schema:

```bash
npx supabase gen types typescript --db-url "<your SUPABASE_DB_URL>" > src/lib/supabase/types.ts
```

Never change the database without adding a new migration file in
`supabase/migrations/`.
