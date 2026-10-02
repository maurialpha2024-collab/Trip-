# Task 12 — Admin: export to Excel

**Goal:** download the census as an Excel file, all of it or one family at a time.

Files: `src/app/(app)/admin/export/page.tsx`, `export-form.tsx`, `src/app/api/export/route.ts`.

---

## 1. Layout

```
┌──────────────────────────────────────────────────────────┐
│  التصدير                                                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ What to export                                     │  │
│  │ Large family  [الكل ▾]                              │  │
│  │ Small family  [الكل ▾]                              │  │
│  │ Status        (•) المكتملة فقط  ( ) الكل             │  │
│  │ ☐ إخفاء رقم التعريف والهاتف                         │  │
│  │                                                    │  │
│  │ سيتم تصدير 312 أسرة و 1,980 فرداً.                   │  │
│  │                           [تنزيل ملف Excel]         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Recent exports (from audit_log): who, when, what        │
└──────────────────────────────────────────────────────────┘
```

## 2. The file
- Name: `census-<large family or all>-<YYYY-MM-DD>.xlsx`.
- Sheet **الأسر**: large family, small family, family name, wilaya, city, number of persons, status, agent, date.
- Sheet **الأفراد**: large family, small family, family name, role (أب / أم / ابن / بنت), full name, gender, birth date (or year), age, NNI, phone, wilaya, job, education, marital status, alive.
- Sheets are right-to-left, header row bold and frozen, columns sized to fit.
- The optional checkbox replaces NNI and phone with empty cells, for sharing outside the admin team.

## 3. Rules
- Generated on the server (route handler), admin only.
- Every export is saved in `audit_log` with the filters used.
- Button shows "جارٍ التحضير…" while the file is built.

## Done when
- [ ] The file opens correctly in Excel and LibreOffice with Arabic text right to left.
- [ ] Counts in the file match the preview sentence.
- [ ] The export appears in "recent exports".
