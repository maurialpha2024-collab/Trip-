# Task 11 — Admin: staff accounts

**Goal:** the admin creates and manages accounts for census agents (there is no public sign-up).

Files: `src/app/(app)/admin/agents/page.tsx`, `agents-table.tsx`, `agent-form-dialog.tsx`, `reset-password-dialog.tsx`, `actions.ts`.

---

## 1. Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  الموظفون                                       [+ إضافة عداد]     │
│                                                                  │
│  Name          Username   Role    Status    Households  Last login│
│  ──────────────────────────────────────────────────────────────  │
│  محمد سالم      agent1     عداد    نشط          312      today  [⋯]│
│  فاطمة أحمد     agent2     عداد    موقوف        280     3 days [⋯]│
└──────────────────────────────────────────────────────────────────┘
```
Mobile: cards.

## 2. Add an account (the admin writes the username and password)

The admin chooses every username and password. Nothing is sent by email.

```
┌──────────── إضافة حساب ────────────┐
│ الاسم الكامل     [________________] │
│ اسم المستخدم     [________________] │
│ الصلاحية        (•) عداد  ( ) مشرف  │
│ كلمة المرور      [____________ 👁]  │
│ تأكيد كلمة المرور [____________ 👁]  │
│ ████████░░  قوية                    │  ← strength bar
│ [توليد كلمة مرور قوية]  (optional)  │
│                                    │
│ [إلغاء]              [إنشاء الحساب] │
└────────────────────────────────────┘
```

- Password typed twice; the strength bar shows ضعيفة / متوسطة / قوية.
- "توليد كلمة مرور قوية" is only a helper: it fills both fields with a random 14-character password the admin can see and copy. The admin can also type their own.
- Password rules: the shared schema from task 04 (12+ characters, not common, not the username).
- After saving: toast "تم إنشاء الحساب: <username>". The password is **never stored or shown again** (only Supabase keeps its hash).
- New **admin** accounts must set up the two-step check at their first login (task 04).

## 3. Other actions (server actions using the service role key, admin only, and only after the two-step check)
- **Edit:** full name, role.
- **Change password:** the admin types the new password twice (same form as above). All sessions of that account end immediately.
- **Deactivate / activate:** deactivated users are signed out everywhere at once and cannot log in; their households stay.
- **Reset two-step check** (admins only): removes the authenticator so the person can set it up again on a new phone. Asks for confirmation.
- An admin cannot deactivate or demote themselves, and the last active admin can never be removed.
- **Before any of these actions, ask the admin for their own password again** ("أدخل كلمة مرورك للتأكيد"), so an unlocked computer left open cannot be misused.
- Every action writes to `audit_log` (who, what, when; never the password).

## 4. Validation
- Username: lowercase Latin letters, numbers, `_`, 3–30 characters, unique ("اسم المستخدم مستخدم من قبل.").
- Password: shared schema from task 04; both fields must match ("كلمتا المرور غير متطابقتين.").

## Done when
- [ ] I can create an agent with a username and password I typed myself, and log in with them.
- [ ] After changing an agent's password, the agent is signed out on their phone.
- [ ] The password never appears in the database tables, `audit_log`, the console or the network responses.
- [ ] A deactivated agent sees "هذا الحساب موقوف" on login.
- [ ] The service role key never appears in browser code (check the built JS).
