# إحصاء الأسر — Build kit for Claude Code

This kit builds a private web app for the family census of a tribe in Mauritania.
Each file below is **one task**. Give Claude Code **one file at a time**, in order.
When a task is finished, check it in the browser, then give it the next file.

## How to use it

1. Create an empty folder, open it in Claude Code.
2. Copy this whole `census-kit` folder into it (so Claude Code can read every file).
3. Send Claude Code this message:

   > Read `census-kit/00-START-HERE.md` and `census-kit/01-design-system.md`. Then do only the task in `01-design-system.md`. Stop when it is done and tell me how to check it.

4. When you are happy, send: *"Now do `census-kit/02-database.md`"*, and so on.

## The tasks (in order)

| File | What it builds | Who uses it |
|---|---|---|
| `01-design-system.md` | Project setup, colors, fonts, shared UI pieces | everyone |
| `02-database.md` | Supabase tables, security rules, sample data | everyone |
| `03-app-shell.md` | Sidebar, top bar, mobile menu: how every page connects | everyone |
| `04-login.md` | Login page | everyone |
| `05-agent-home.md` | Agent home page | agent |
| `06-register-household.md` | The 7-step registration form | agent |
| `07-households-list.md` | List of households with search and filters | agent + admin |
| `08-household-details.md` | One household: parents and children | agent + admin |
| `09-admin-dashboard.md` | Admin dashboard with numbers and charts | admin |
| `10-admin-families.md` | Manage large and small families | admin |
| `11-admin-agents.md` | Manage agent accounts | admin |
| `12-admin-export.md` | Export to Excel | admin |
| `13-final-checks.md` | French, dark mode, testing, deploy | everyone |

## How the pages connect

```
                       /login
                         │  (after login, send by role)
             ┌───────────┴────────────┐
             ▼                        ▼
      agent:  /                admin: /admin
      (home)                    (dashboard)
             │                        │
             ├──► /households/new ◄───┤   register a household
             │         │              │
             │         ▼ (after save) │
             ├──► /households/[id] ◄──┤   one household
             │         ▲              │
             └──► /households ────────┤   list + search
                                      ├──► /admin/families
                                      ├──► /admin/agents
                                      └──► /admin/export
```

Every page lives inside the same **app shell** (sidebar on the right, top bar), so moving between pages feels like one app.

---

## Rules for Claude Code (apply to every task)

### Stack
- Next.js 15 (App Router, TypeScript, Server Actions), `src/` folder
- Supabase (Postgres, Auth, Row Level Security) with `@supabase/ssr`
- Tailwind CSS v4 + shadcn/ui
- react-hook-form + zod
- next-intl **without locale in the URL** (language saved in a cookie). Arabic `ar` is the default (`dir="rtl"`), French `fr` (`dir="ltr"`)
- lucide-react icons, Recharts charts, SheetJS (`xlsx`) export

### Folder structure (keep exactly this)

```
src/
  app/
    (auth)/
      login/
        page.tsx            ← the page (layout only, no logic)
        login-form.tsx      ← the form (client component)
        actions.ts          ← server actions for this page
    (app)/
      layout.tsx            ← app shell: sidebar + top bar
      page.tsx              ← agent home
      households/
        page.tsx            ← list
        new/
          page.tsx
          steps/            ← one file per step
          actions.ts
        [id]/
          page.tsx
          actions.ts
      admin/
        page.tsx            ← admin dashboard
        families/ agents/ export/
  components/
    ui/                     ← shadcn components (do not edit much)
    census/                 ← our own components (LineageRail, PersonCard, StatCard…)
    layout/                 ← Sidebar, TopBar, MobileNav
  lib/
    supabase/ server.ts  client.ts  admin.ts
    validation/ person.ts  household.ts  family.ts
    constants.ts            ← wilayas, education levels, marital status
    arabic.ts               ← Arabic search normalisation
    auth.ts                 ← getCurrentProfile(), requireAdmin()
  messages/ ar.json  fr.json
  middleware.ts
supabase/
  migrations/
  seed.sql
```

### Write code like a careful human developer
- **One job per file.** A page file shows the layout; forms, tables and actions live in their own files next to it.
- **No file longer than ~200 lines.** If it grows, split it into smaller components.
- **Clear English names:** `HouseholdTable`, `createHousehold`, `fatherSchema`. No `data2`, `tmp`, `handleIt`.
- **Short comments that explain *why***, not what. One comment at the top of each file saying what the file is for.
- **No `any`.** Types come from zod schemas or from `supabase gen types`.
- **All user-facing text in `messages/ar.json` and `messages/fr.json`**, never written directly in components.
- **All colors from the design tokens** in `01-design-system.md`, never raw hex in components.
- Same zod schema validates on the client and again in the server action.

### Working rules
- Do **only** the task in the file you were given. Do not start the next one.
- At the end of each task: run `npm run build` and `npm run lint`, fix errors, then give me a short list of **what you created** and **how I can check it in the browser**.
- If something in a task is unclear, ask me before guessing.
