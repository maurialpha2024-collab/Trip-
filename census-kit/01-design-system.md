# Task 01 — Project setup and design system

**Goal:** create the project and the shared look (colors, fonts, reusable pieces) that every page will use. No real pages yet, only a `/design` preview page to check the pieces.

---

## 1. Setup

1. `create-next-app` with TypeScript, Tailwind, ESLint, App Router, `src/` folder.
2. Install: `@supabase/ssr @supabase/supabase-js next-intl react-hook-form zod @hookform/resolvers lucide-react recharts xlsx`.
3. `npx shadcn@latest init`, then add: `button input label select checkbox radio-group dialog alert-dialog dropdown-menu sheet table badge tabs sonner skeleton tooltip command popover`.
4. Create the folders from `00-START-HERE.md` (empty files are fine).
5. `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
6. next-intl: cookie `locale` (`ar` default). The root `<html>` gets `lang` and `dir` from the locale.

---

## 2. The idea behind the look

**Concept: "Nasab" (the lineage).** The app records family lines, so the one memorable element is the **lineage rail**: a thin ochre line that links large family → small family → household → people, like family trees drawn in old Chinguetti manuscripts. It appears in the registration form and the household page.

The second touch of identity is a **geometric pattern** taken from Mauritanian leatherwork (triangles and diamonds), drawn as an SVG in ochre lines on indigo. It appears in **only two places**: the side panel of the login page and a thin band at the top of the sidebar. Everywhere else the app is calm, clean and practical, like a good government tool.

---

## 3. Color tokens

Define them as CSS variables in `globals.css` and map them in the Tailwind theme. Components use the token names only.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--canvas` | `#F3F4F6` | `#10141C` | Page background |
| `--surface` | `#FFFFFF` | `#181D28` | Cards, forms, tables |
| `--ink` | `#1A2233` | `#E7EAF0` | Main text |
| `--ink-muted` | `#5B6474` | `#9AA3B2` | Secondary text, hints |
| `--line` | `#D9DDE5` | `#2A3140` | Borders, dividers |
| `--indigo` | `#233B7A` | `#8FA6E0` | Primary buttons, links, active items |
| `--indigo-deep` | `#1B2C5C` | `#0C1222` | Sidebar background, login panel |
| `--indigo-soft` | `#E6EAF4` | `#1F2A45` | Selected rows, active step background |
| `--ochre` | `#B7812A` | `#D9A34A` | Lineage rail and pattern only (never body text) |
| `--success` | `#2E7D5B` | `#5CC096` | Saved, complete |
| `--warning` | `#9A6300` | `#E0B04F` | Draft |
| `--danger` | `#B3261E` | `#F2867E` | Errors, delete |

Chart colors (dashboard): `--indigo`, `#4F7BC8`, `#8FB0E3`, `--ochre`, `#6B7A8F`. Check all text pairs reach **4.5:1** contrast.

---

## 4. Typography

- **Readex Pro** (Google Fonts, Arabic + Latin) for all interface text.
- **Amiri** (Google Fonts, naskh) **only** for family names and page titles.
- Load both with `next/font/google`.
- Western digits (0–9) everywhere. Numbers in tables use `font-variant-numeric: tabular-nums`.

| Style | Font | Size / line height | Weight | Use |
|---|---|---|---|---|
| `title-page` | Amiri | 32 / 1.3 | 700 | Page titles |
| `title-family` | Amiri | 24 / 1.35 | 700 | Family names on cards and the rail |
| `heading` | Readex Pro | 20 / 1.4 | 600 | Section headings |
| `body` | Readex Pro | 17 / 1.6 | 400 | Normal text, inputs |
| `label` | Readex Pro | 15 / 1.4 | 500 | Form labels, table headers |
| `small` | Readex Pro | 14 / 1.5 | 400 | Hints, dates |
| `stat` | Readex Pro | 34 / 1.1 | 600 | Dashboard numbers |

No ALL-CAPS text. No small grey labels above every heading.

---

## 5. Spacing, shape, motion

- Spacing scale: 4, 8, 12, 16, 24, 32, 48.
- Radius: inputs and buttons 8px, cards 12px, badges full.
- Shadow: none on cards (use `--line` borders). One soft shadow only for the sticky bottom bar and dialogs.
- Motion: 150–200ms ease-out for step changes, dialogs, rows being added. Respect `prefers-reduced-motion`.
- Focus ring: 2px `--indigo` with 2px offset, on every interactive element.
- RTL: use logical Tailwind classes only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`). Arrow icons flip with `rtl:rotate-180`.

---

## 6. Shared components to build (in `src/components/census/`)

| Component | What it looks like |
|---|---|
| `PageHeader` | Amiri title on the start side, optional short description under it, action buttons on the end side. |
| `LineageRail` | Vertical list of levels (large family → small family → household → people). A 2px ochre line joins small ochre dots; the current level has a filled dot and bold text, past levels are links. On mobile it becomes a horizontal breadcrumb with the same dots. |
| `StatCard` | White card, `stat` number, one-line label under it, optional small change text ("+12 هذا الأسبوع"). |
| `PersonCard` | Card for one person: icon (father / mother / child), name, age, 2–3 key facts, edit and delete buttons. Deceased people show a small grey "متوفى/متوفاة" badge. |
| `FormField` | Label above, input, hint text, error under the field in `--danger` with an icon. Wraps shadcn inputs for react-hook-form. |
| `BirthDateInput` | Day / month / year selects plus a "السنة فقط" checkbox that hides day and month. |
| `StatusBadge` | "مكتملة" (success) or "مسودة" (warning). |
| `EmptyState` | Icon, one sentence, one action button. |
| `ConfirmDialog` | Uses shadcn `alert-dialog`; the danger button names the action ("حذف الطفل"). |
| `GeoPattern` | The leatherwork SVG pattern (ochre lines on transparent), used as a background. |

Buttons: primary (indigo fill), secondary (white with border), ghost, danger. Height 44px minimum. Every saving button shows a spinner and is disabled while saving.

---

## 7. Preview page

Create `src/app/design/page.tsx` that shows every component above with sample Arabic data, in light and dark mode, so I can review the look. (We will delete it in task 13.)

## Done when
- [ ] `npm run dev` runs, `/design` shows all components in Arabic, right to left.
- [ ] Changing the `locale` cookie to `fr` switches to left to right.
- [ ] Fonts load (Amiri titles, Readex Pro everything else).
- [ ] Build and lint pass.
