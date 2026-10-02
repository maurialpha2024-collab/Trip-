# Task 06 — Register a household (the main form)

**Goal:** the 7-step form agents use all day. It must be fast on a phone, hard to get wrong, and never lose work.

Files (one per step, so each stays small):

```
src/app/(app)/households/new/
  page.tsx                   ← loads draft (if ?draft=id) and families, renders the wizard
  wizard.tsx                 ← client: current step, navigation, the LineageRail
  steps/
    step-large-family.tsx    ← 1
    step-small-family.tsx    ← 2
    step-household.tsx       ← 3
    step-father.tsx          ← 4
    step-mothers.tsx         ← 5
    step-children.tsx        ← 6
    step-review.tsx          ← 7
  person-fields.tsx          ← shared fields used by father, mother and child forms
  actions.ts                 ← server actions (one per save)
  use-offline-backup.ts      ← localStorage backup hook
src/app/(app)/households/[id]/saved/page.tsx   ← success screen
src/lib/validation/person.ts, household.ts
src/lib/constants.ts
```

---

## 1. Layout

Desktop:

```
┌──────────────────────────────────────────────────────┬──────────────────┐
│  تسجيل أسرة جديدة                     (Amiri, 32px)   │  LINEAGE RAIL    │
│  الخطوة 4 من 7 — الأب                                 │                  │
│  ──────────────────────────────────────────────────   │  ● أهل محمد الأمين│
│                                                      │  │  (large)      │
│   ┌──────────── form card (max 720px) ────────────┐  │  ● أهل الشيخ      │
│   │  Full name       [_______________________]    │  │  │  (small)      │
│   │  Date of birth   [dd][mm][yyyy]  ☐ year only  │  │  ● بيت أحمد       │
│   │  NNI             [__________]                 │  │  │  (household)  │
│   │  Phone           [+222 ________]              │  │  ◉ الأب  ← now    │
│   │  Wilaya [____▾]   City [________]             │  │  ○ الأم           │
│   │  Job [________]   Education [______▾]         │  │  ○ الأبناء        │
│   │  Status  (•) حي  ( ) متوفى                     │  │  ○ المراجعة       │
│   └───────────────────────────────────────────────┘  │                  │
│                                                      │                  │
│   [السابق]                          [التالي: الأم]     │                  │
└──────────────────────────────────────────────────────┴──────────────────┘
```

- The **LineageRail** (from task 01) sits on the end side on desktop. Filled ochre dots for finished levels (click to go back), a ring for the current one, empty for next ones. Chosen names appear on the rail as the agent fills them in, so the family line "grows" down the rail.
- On mobile the rail becomes a compact line at the top ("أهل محمد الأمين ‹ أهل الشيخ ‹ بيت أحمد") plus a thin 7-part progress bar, and the buttons move to a **sticky bottom bar**.
- The primary button always names the next step: "التالي: الأم".

## 2. The steps

### Step 1 — الأسرة الكبرى
- Search box on top (Arabic normalisation from `lib/arabic.ts`).
- Large families as big tappable rows (min 56px): name in Amiri + "12 أسرة صغرى · 140 بيت".
- Tapping a row selects it and goes to step 2.

### Step 2 — الأسرة الصغرى
- Same pattern, filtered by the chosen large family.
- "تغيير الأسرة الكبرى" link back.
- If the list is empty: "لا توجد أسر صغرى في هذه الأسرة الكبرى. اطلب من المشرف إضافتها."

### Step 3 — بيانات البيت
Fields: family name (اسم الأسرة / البيت), wilaya (select), city, address notes (optional).
Saving this step **creates the household as a draft** in the database.

### Step 4 — الأب
Fields from the table below. Gender is set automatically.

### Step 5 — الأم
Same fields. Under the form, a small link "إضافة زوجة أخرى" adds a second mother form (each with a delete button). Most households have one, so the link stays quiet.

### Step 6 — الأبناء
- List of saved children as `PersonCard`s (name, gender, age, education).
- "إضافة طفل" opens the child form in a **dialog on desktop** and a **full-screen sheet on mobile**.
- Fields change with age: phone and marital status appear at 15+, job at 18+.
- If more than one mother: "الأم" select appears.
- Children can be reordered (oldest first by default).
- Checkbox "لا يوجد أبناء في هذه الأسرة" lets the agent continue with no children.

### Step 7 — المراجعة
- The whole household as a **small family tree**: the lineage (large → small → household) at the top, then father and mother(s) side by side, and the children underneath, joined by the ochre rail line.
- Each block has "تعديل" that jumps to its step.
- Missing optional fields show quietly as "—".
- Button "حفظ الأسرة" sets `status='complete'`.

## 3. Fields

| Field (Arabic label) | Father | Mother | Child | Rule |
|---|---|---|---|---|
| الاسم الكامل | required | required | required | 3–120 characters |
| الجنس | auto | auto | required | ذكر / أنثى |
| تاريخ الميلاد | required | required | required | `BirthDateInput`; not in the future |
| رقم التعريف الوطني (NNI) | optional | optional | optional | 10 digits, unique |
| الهاتف | optional | optional | 15+ | `+222` shown fixed, then 8 digits starting with 2, 3 or 4 |
| الولاية / المدينة | yes | yes | – | from `constants.ts` |
| المهنة | yes | yes | 18+ | free text |
| المستوى التعليمي | yes | yes | yes | select |
| الحالة الاجتماعية | – | – | 15+ | select |
| على قيد الحياة | yes | yes | yes | حي / متوفى (feminine for mother) |
| الأم | – | – | if 2+ mothers | select |

**Lists (`lib/constants.ts`, key + Arabic + French):**
- Wilayas: الحوض الشرقي، الحوض الغربي، لعصابة، كوركول، لبراكنة، اترارزة، أدرار، داخلت نواذيبو، تكانت، كيدي ماغا، تيرس زمور، إينشيري، نواكشوط الشمالية، نواكشوط الغربية، نواكشوط الجنوبية، خارج موريتانيا.
- Education: بدون، محظرة، ابتدائي، إعدادي، ثانوي، جامعي، دراسات عليا، أخرى.
- Marital status: أعزب/عزباء، متزوج/ة، مطلق/ة، أرمل/ة.

**Error messages** (under the field):
- "هذا الحقل مطلوب."
- "رقم التعريف الوطني يتكون من 10 أرقام."
- "رقم الهاتف يتكون من 8 أرقام ويبدأ بـ 2 أو 3 أو 4."
- "تاريخ الميلاد لا يمكن أن يكون في المستقبل."
- NNI already used: "هذا الرقم مسجل في أسرة: <family name>." (from `find_household_by_nni`)

## 4. Never lose work

- From step 3 on, **each step saves to the database** when the agent presses "التالي" (update `last_step`).
- While typing, the current step is copied to `localStorage` every 2 seconds (`use-offline-backup.ts`).
- If saving fails because there is no connection: show a yellow bar "لا يوجد اتصال. بياناتك محفوظة على هذا الجهاز وسيتم إرسالها عند عودة الاتصال." and retry every 10 seconds.
- Opening `/households/new?draft=<id>` reloads everything and opens at `last_step`.
- Leaving the page with unsaved typing asks for confirmation.

## 5. After saving

Go to `/households/<id>/saved`:
- Green check, "تم حفظ الأسرة" and the family name in Amiri.
- Short summary: "أب، أم، 4 أبناء".
- Buttons: "تسجيل أسرة أخرى في «<small family>»" (opens the form at step 3 with steps 1–2 already chosen), "عرض الأسرة", "العودة إلى الرئيسية".

## Done when
- [ ] A full household can be registered on a 360px phone using only thumbs.
- [ ] Refreshing the page in the middle of step 5 loses nothing.
- [ ] A duplicate NNI is caught with the family name shown.
- [ ] Fields for children appear and hide correctly by age.
- [ ] Review screen matches what was entered; "تعديل" jumps to the right step.
- [ ] Every step works with keyboard only; errors are read by a screen reader (`aria-describedby`).
