# Task 05 — Agent home page

**Goal:** the first page an agent sees: start a new registration, continue unfinished ones, see recent work.

Files: `src/app/(app)/page.tsx`, `src/components/census/DraftList.tsx`, `RecentHouseholds.tsx`.

---

## 1. Layout

```
┌──────────────────────────────────────────────────────────┐
│  مرحباً، <first name>                     (Amiri, 32px)   │
│  سجّلت 14 أسرة حتى الآن، منها 3 هذا الأسبوع.              │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  [UserPlus]  تسجيل أسرة جديدة                        │  │
│  │  ابدأ باختيار الأسرة الكبرى ثم الأسرة الصغرى.   [ابدأ]│  │
│  └────────────────────────────────────────────────────┘  │
│   (indigo-deep card, thin ochre line on the start side)  │
│                                                          │
│  مسودات لم تكتمل (2)                                      │
│  ┌──────────────────────────────────────┐                │
│  │ أهل فلان · Small family · step 4 of 7 │ [متابعة]       │
│  └──────────────────────────────────────┘                │
│                                                          │
│  آخر ما سجلت                                   [عرض الكل] │
│  Family name   Small family   People   Date              │
│  ...10 rows (cards on mobile)                            │
└──────────────────────────────────────────────────────────┘
```

## 2. Data
- Counts: households created by me (complete), and in the last 7 days.
- Drafts: my households with `status='draft'`, with the step they stopped at (store `last_step` in the draft, see task 06).
- Recent: my last 10 complete households with small family name and number of persons.

## 3. States
- **No households yet:** `EmptyState` "لم تسجّل أي أسرة بعد." + button "تسجيل أسرة جديدة".
- **No drafts:** hide the drafts section completely.
- **Loading:** skeleton rows.

## 4. Connections
- "ابدأ" → `/households/new`
- "متابعة" → `/households/new?draft=<id>`
- A row → `/households/<id>`
- "عرض الكل" → `/households?mine=1`

## Done when
- [ ] A test agent sees only their own numbers, drafts and households.
- [ ] Empty state appears for a new agent with no data.
- [ ] Mobile shows cards instead of a table.
