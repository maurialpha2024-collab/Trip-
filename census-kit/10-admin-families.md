# Task 10 — Admin: large and small families

**Goal:** the admin builds the family structure that agents choose from in steps 1 and 2 of the form.

Files: `src/app/(app)/admin/families/page.tsx`, `families-tree.tsx`, `family-form-dialog.tsx`, `actions.ts`, `src/lib/validation/family.ts`.

---

## 1. Layout

```
┌────────────────────────────────────────────────────────────────┐
│  العائلات                                 [+ إضافة أسرة كبرى]   │
│  12 أسرة كبرى · 41 أسرة صغرى                                   │
│  [🔍 ابحث عن أسرة…]                                             │
│                                                                │
│  ▾ أهل محمد الأمين            4 صغرى · 312 بيت    [تعديل] [⋯]   │
│     │  أهل الشيخ                    120 بيت      [تعديل] [⋯]   │
│     │  أهل سيدي                      98 بيت      [تعديل] [⋯]   │
│     │  أهل باب                       94 بيت      [تعديل] [⋯]   │
│     └  [+ إضافة أسرة صغرى إلى «أهل محمد الأمين»]               │
│  ▸ أهل أحمد سالم              3 صغرى · 240 بيت    [تعديل] [⋯]   │
│  ▸ ...                                                         │
└────────────────────────────────────────────────────────────────┘
```

- Tree with the ochre rail line between a large family and its small families (same look as the dashboard chart).
- Large family names in Amiri.

## 2. Actions
- **Add / rename large family:** dialog with name + optional notes. Button "حفظ".
- **Add / rename small family:** dialog with name, notes, and its large family (select, so it can also be moved).
- **Delete:** only when it has no households (or no small families for a large family). Otherwise the menu item is disabled with a tooltip: "لا يمكن الحذف: توجد 120 أسرة مسجلة فيها."
- **Import from Excel (optional, nice to have):** upload a sheet with two columns (large family, small family); show a preview table before saving.
- Duplicate name: "هذا الاسم موجود مسبقاً."

## Done when
- [ ] Added families appear right away in the registration form (steps 1 and 2).
- [ ] Delete is blocked when households exist, with the reason shown.
- [ ] Agents cannot open this page.
