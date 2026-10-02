# Task 03 — App shell (how every page connects)

**Goal:** the frame around every page after login: sidebar, top bar and mobile navigation. Pages themselves can be simple placeholders for now ("قريباً").

Files: `src/app/(app)/layout.tsx`, `src/components/layout/Sidebar.tsx`, `TopBar.tsx`, `MobileNav.tsx`, `NavItems.ts`, `src/middleware.ts`.

---

## 1. Desktop layout (≥ 1024px)

Arabic is right to left, so the sidebar sits on the **right**.

```
┌───────────────────────────────────────────────────┬──────────────────┐
│ TOP BAR                                           │ ▓▓ pattern band ▓│
│ [search households…]        [ع/FR] [☾] [user ▾]   │  إحصاء الأسر      │
├───────────────────────────────────────────────────┤                  │
│                                                   │  ● Dashboard     │
│   PAGE CONTENT                                    │    Households    │
│   (max width 1200px, 32px padding)                │    Register      │
│                                                   │  ─────────────   │
│                                                   │    Families      │
│                                                   │    Agents        │
│                                                   │    Export        │
│                                                   │                  │
│                                                   │  [name / role]   │
│                                                   │  [Log out]       │
└───────────────────────────────────────────────────┴──────────────────┘
```

- Sidebar: 264px wide, `--indigo-deep` background, white text. A 56px band of `GeoPattern` at the top behind the app name.
- Active item: `--indigo-soft` background with indigo text, plus a 3px ochre bar on the outer edge.
- Items have icon + text, 44px tall.
- The sidebar can collapse to icons only (72px); remember the choice in a cookie.

## 2. Mobile layout (< 1024px)

```
┌───────────────────────────┐
│ ☰   إحصاء الأسر     [user] │  top bar
├───────────────────────────┤
│                           │
│   PAGE CONTENT (16px pad) │
│                           │
├───────────────────────────┤
│ Home  Register  List  Me  │  bottom nav (agents)
└───────────────────────────┘
```

- **Agents:** bottom nav with 4 items: الرئيسية، تسجيل أسرة، الأسر، حسابي. "تسجيل أسرة" is the middle, most visible item.
- **Admins:** ☰ opens the full sidebar as a sheet from the right.
- Respect safe areas (`env(safe-area-inset-bottom)`).

## 3. Navigation items by role

| Arabic label | Icon | Route | Agent | Admin |
|---|---|---|---|---|
| الرئيسية | `Home` | `/` | ✓ | – |
| لوحة القيادة | `LayoutDashboard` | `/admin` | – | ✓ |
| الأسر المسجلة | `Users` | `/households` | ✓ | ✓ |
| تسجيل أسرة | `UserPlus` | `/households/new` | ✓ | ✓ |
| العائلات | `GitBranch` | `/admin/families` | – | ✓ |
| الموظفون | `ShieldCheck` | `/admin/agents` | – | ✓ |
| التصدير | `Download` | `/admin/export` | – | ✓ |

Keep the list in one file (`NavItems.ts`) so sidebar and mobile nav use the same source.

## 4. Top bar

- Search box (desktop): typing and pressing Enter goes to `/households?q=…`.
- Language switch (ع / FR): sets the cookie and refreshes.
- Theme switch (light / dark).
- User menu: full name, role badge ("مشرف" / "عداد"), "تسجيل الخروج".

## 5. Protection (`middleware.ts`)

- Refresh the Supabase session on every request.
- Not logged in → `/login`.
- Logged in and visiting `/login` → send to `/admin` (admin) or `/` (agent).
- In `(app)/admin/*` pages, call `requireAdmin()` on the server as well; hiding the link is not enough.

## 6. Placeholder pages

Create simple pages for every route in the table with a `PageHeader` and "قريباً" so all links work.

## Done when
- [ ] Every link in the sidebar and bottom nav opens a page; the active item is highlighted.
- [ ] Agents do not see admin items and get redirected if they type `/admin` in the URL.
- [ ] Layout is correct at 360px, 768px, 1280px, in Arabic and French.
- [ ] Keyboard: Tab moves through the sidebar with a visible focus ring.
