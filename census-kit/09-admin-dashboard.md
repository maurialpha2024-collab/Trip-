# Task 09 — Admin dashboard

**Goal:** in one look, the admin knows how far the census has come, which families are covered, and how each agent is doing.

Files: `src/app/(app)/admin/page.tsx`, `src/components/census/dashboard/` → `TotalsRow.tsx`, `FamilyTreeChart.tsx`, `GenderChart.tsx`, `AgeChart.tsx`, `AgentsTable.tsx`, `WeeklyChart.tsx`.

---

## 1. Layout (desktop, 12-column grid)

```
┌──────────────────────────────────────────────────────────────────┐
│  لوحة القيادة                        [This week ▾]  [تصدير Excel] │
│  آخر تحديث: منذ دقيقتين                                           │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │  1,248   │ │  7,930   │ │    12    │ │    86    │              │
│  │ أسرة     │ │ فرد      │ │ أسرة كبرى │ │ هذا الأسبوع│             │
│  │ +86      │ │ +512     │ │ 41 صغرى  │ │ 9 مسودات  │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                  │
│  ┌──── Households by family (8 cols) ────┐ ┌─ Registrations ──┐   │
│  │ أهل محمد الأمين  ██████████████ 312  ▾ │ │ per day, last 30 │   │
│  │   │ أهل الشيخ    ██████ 120            │ │ days (line)      │   │
│  │   │ أهل سيدي     ████ 98               │ │                  │   │
│  │   └ أهل باب      ███ 94                │ └──────────────────┘   │
│  │ أهل أحمد سالم    ██████████ 240      ▸ │ ┌─ Gender ─────────┐   │
│  │ ...                                   │ │ ذكور 51% إناث 49% │   │
│  └───────────────────────────────────────┘ └──────────────────┘   │
│                                                                  │
│  ┌─ Age groups (6 cols) ─┐ ┌─ Agents (6 cols) ──────────────────┐ │
│  │ 0–14   ██████████     │ │ Agent    Complete  Drafts  Last     │ │
│  │ 15–24  ██████         │ │ عداد 1     312       2     today    │ │
│  │ 25–59  ████████       │ │ عداد 2     280       5     3 days   │ │
│  │ 60+    ██             │ │                                     │ │
│  └───────────────────────┘ └─────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

Mobile: everything stacks in one column in the same order.

## 2. The signature chart: households by family

This is the heart of the dashboard and follows the lineage idea:
- One horizontal bar per **large family** (indigo), sorted largest first, value at the bar's end.
- Clicking ▾ opens its **small families** underneath, indented, joined by the thin ochre rail line, with lighter bars (`#8FB0E3`).
- Clicking any bar goes to `/households?large=…` (or `&small=…`).
- Built with plain HTML/CSS bars (easier for RTL and for clicking) rather than Recharts.

## 3. Other cards
- **Totals row:** 4 `StatCard`s from `census_totals`. The small line under each number gives context (new this week, number of small families, drafts).
- **Registrations over time:** Recharts line chart, households completed per day, last 30 days. Axis labels in Arabic, tooltips with the exact number.
- **Gender:** a simple two-part horizontal bar with numbers and percentages written on it (not a pie).
- **Age groups:** horizontal bars for 0–14, 15–24, 25–59, 60+ (age from birth date; year-only dates use 1 July).
- **Agents table:** from `agent_stats`, sortable by any column; clicking a row → `/households?agent=…`.
- **Period filter** (هذا الأسبوع / هذا الشهر / الكل) changes the "new" numbers and the line chart.

## 4. Chart rules
- Every chart has a clear title and its numbers written on or next to the bars; color is never the only way to read it.
- Tooltips on hover and on tap.
- Colors from task 01 only. Works in dark mode.

## 5. States
- Loading: skeleton cards of the same size (no layout jump).
- Empty census: `EmptyState` "لم تُسجَّل أي أسرة بعد. أضف العائلات أولاً ثم أنشئ حسابات العدادين." + buttons to `/admin/families` and `/admin/agents`.

## Done when
- [ ] Numbers match the database (check against the seed data).
- [ ] Opening a large family shows its small families with the rail line.
- [ ] Every bar and row links to the filtered list.
- [ ] Looks right at 360px and 1440px, light and dark.
