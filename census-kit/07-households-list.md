# Task 07 — Households list

**Goal:** find any household quickly by name, NNI or phone, and filter by family.

Files: `src/app/(app)/households/page.tsx`, `households-filters.tsx`, `households-table.tsx`, `households-cards.tsx`, `src/lib/arabic.ts`.

---

## 1. Layout

```
┌──────────────────────────────────────────────────────────────┐
│  الأسر المسجلة                              [+ تسجيل أسرة]    │
│  1,248 أسرة                                                  │
│                                                              │
│  [🔍 ابحث باسم الأسرة أو اسم شخص أو رقم التعريف أو الهاتف   ] │
│  [Large family ▾] [Small family ▾] [Wilaya ▾] [Status ▾]     │
│  [Agent ▾ (admin only)]                      [مسح الفلاتر]    │
│                                                              │
│  Family name   Large › Small    People  Wilaya  Status  Date │
│  ─────────────────────────────────────────────────────────── │
│  بيت أحمد      أهل محمد › أهل الشيخ   6   اترارزة  مكتملة  12/09 │
│  ...                                                         │
│                                                              │
│                    ‹  1  2  3  …  50  ›                       │
└──────────────────────────────────────────────────────────────┘
```

- Desktop: table with sticky header, family name in Amiri, `StatusBadge`, whole row clickable.
- Mobile: one card per household (family name, lineage line, number of people, status).
- 25 per page.

## 2. Search and filters
- All filters live in the URL (`?q=&large=&small=&wilaya=&status=&agent=&mine=&page=`) so a filtered list can be bookmarked and "back" works.
- Search waits 300ms after typing stops.
- `lib/arabic.ts` → `normalizeArabic(text)`: remove tashkeel and tatweel, أ/إ/آ → ا, ة → ه, ى → ي. Store a normalised search column (generated column or trigger) on households and persons and search that.
- The small family filter only shows small families of the chosen large family.
- Agents see only their own households (security rules already do this); the agent filter is admin only.

## 3. States
- Loading: 8 skeleton rows.
- No results: "لا توجد نتائج لهذا البحث." + "مسح الفلاتر".
- No households at all: `EmptyState` + "تسجيل أسرة جديدة".

## Done when
- [ ] Searching "احمد" finds "أحمد".
- [ ] Filters combine correctly and survive a page refresh.
- [ ] Clicking a row opens `/households/<id>`.
