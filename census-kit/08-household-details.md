# Task 08 — Household page

**Goal:** see one household clearly as a family, and edit it.

Files: `src/app/(app)/households/[id]/page.tsx`, `family-tree.tsx`, `person-edit-dialog.tsx`, `actions.ts`.

---

## 1. Layout

```
┌──────────────────────────────────────────────────────────────┐
│  أهل محمد الأمين  ›  أهل الشيخ                (lineage line)  │
│  بيت أحمد ولد محمد                             (Amiri, 32px)  │
│  اترارزة، روصو · مكتملة           [تعديل البيانات] [⋯ more]    │
│                                                              │
│  ┌──────── الأب ────────┐    ┌──────── الأم ────────┐         │
│  │ PersonCard           │────│ PersonCard           │         │
│  └──────────┬───────────┘    └──────────────────────┘         │
│             │  (ochre rail line)                             │
│   ┌─────────┴──────────┬──────────────┬──────────────┐        │
│   │ Child card         │ Child card   │ Child card   │        │
│   └────────────────────┴──────────────┴──────────────┘        │
│                                          [+ إضافة طفل]        │
│                                                              │
│  Summary: 6 أفراد · 3 ذكور · 3 إناث                           │
│  سجّلها: عداد 1 — 12 سبتمبر 2026 · آخر تعديل: ...              │
└──────────────────────────────────────────────────────────────┘
```

- Family tree drawn with CSS (flex/grid + borders in `--ochre`), not an image. On mobile it becomes a vertical list: parents, then children, with the rail on the start side.
- Each `PersonCard` has "تعديل" (opens the same fields as task 06 in a dialog / sheet) and, for children, "حذف".
- If there are 2 mothers, each mother's children are grouped under her.
- A draft shows a yellow bar: "هذه الأسرة مسودة لم تكتمل." + "متابعة التسجيل".

## 2. Actions
- **Edit household details:** family name, wilaya, city, notes. Admin can also move it to another small family.
- **Add / edit / delete a child**, **edit parents**.
- **Delete household** (under ⋯): agents only for their own drafts, admins always. `ConfirmDialog`: "حذف أسرة «بيت أحمد» وكل أفرادها؟ لا يمكن التراجع عن هذا." Button: "حذف الأسرة".
- **Print** (under ⋯): a clean print stylesheet (no sidebar, black on white).
- Every save shows a toast using the same verb: "تم حفظ التعديلات", "تم حذف الطفل".

## 3. Access
- An agent opening another agent's household gets a 404 page: "لم يتم العثور على هذه الأسرة." + link back to the list.

## Done when
- [ ] The tree looks right with 0, 1, 5 and 12 children, and with 2 mothers.
- [ ] Edits are saved and appear without a full page reload.
- [ ] Printing gives a clean one-page sheet.
