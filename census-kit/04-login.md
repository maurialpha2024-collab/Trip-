# Task 04 — Login page

**Goal:** agents and admins sign in with username and password.

Files: `src/app/(auth)/login/page.tsx`, `login-form.tsx`, `actions.ts`, `src/lib/validation/login.ts`.

---

## 1. Layout

Desktop (two halves):

```
┌───────────────────────────────┬───────────────────────────────┐
│                               │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│      تسجيل الدخول              │ ▓   GeoPattern on indigo    ▓ │
│      (Amiri, 32px)            │ ▓                           ▓ │
│                               │ ▓     إحصاء الأسر            ▓ │
│      Username  [__________]   │ ▓     (Amiri, 40px, white)  ▓ │
│      Password  [________ 👁]   │ ▓                           ▓ │
│                               │ ▓   "سجلّ كل أسرة، وحافظ     ▓ │
│      [   تسجيل الدخول   ]      │ ▓    على النسب."             ▓ │
│                               │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│   هذا النظام مخصص لفريق        │                               │
│   الإحصاء فقط.                 │                               │
└───────────────────────────────┴───────────────────────────────┘
      form side (start)                 identity panel (end)
```

- Identity panel: `--indigo-deep` background, `GeoPattern` in ochre at low opacity, app name in white Amiri. On mobile it shrinks to a 140px band at the top.
- Form: max width 380px, centered in its half. Language switch (ع / FR) in the corner.

## 2. Text

| Element | Arabic |
|---|---|
| Title | تسجيل الدخول |
| Username label | اسم المستخدم |
| Password label | كلمة المرور |
| Show / hide button | إظهار / إخفاء كلمة المرور (as `aria-label`) |
| Button | تسجيل الدخول |
| Button while loading | جارٍ تسجيل الدخول… |
| Wrong details | اسم المستخدم أو كلمة المرور غير صحيحة. |
| Inactive account | هذا الحساب موقوف. تواصل مع المشرف. |
| Too many tries | محاولات كثيرة. حاول مرة أخرى بعد 15 دقيقة. |
| Empty field | هذا الحقل مطلوب. |
| Footer | هذا النظام مخصص لفريق الإحصاء فقط. |

## 3. Behaviour

1. zod checks both fields are filled (username: lowercase letters, numbers, `_`, 3–30 chars).
2. Server action `signIn`: turns the username into `username@census.local`, calls `signInWithPassword`.
3. Checks the profile is active; if not, signs out and shows the inactive message.
4. Writes `login` to `audit_log`.
5. Redirects: admin → `/admin`, agent → `/`.
6. Lock-out: after 5 failed tries for a username in 15 minutes, refuse for 15 minutes (store tries in a small `login_attempts` table).
7. Errors appear in one alert above the button (not under each field, so we do not reveal which one was wrong).
8. Autofocus on username. Enter submits. `autocomplete="username"` and `"current-password"`.

## 4. Second check for admins (two-step login)

Admins can see everything, so an admin password alone is not enough. Use **Supabase MFA (TOTP)** with an authenticator app (Google Authenticator, Microsoft Authenticator…).

- **First admin login:** after the password, show "تفعيل التحقق بخطوتين": a QR code to scan with the authenticator app, then a field for the 6-digit code. The admin cannot reach any page until this is done.
- **Every later admin login:** after the password, a second screen "أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة". Field: `inputMode="numeric"`, `autocomplete="one-time-code"`.
- Wrong code: "الرمز غير صحيح أو انتهت صلاحيته."
- `requireAdmin()` must check the session is at level `aal2` (MFA done), not only that the role is admin.
- Agents: MFA is optional (off by default) so field work stays simple. The admin can turn it on for an agent later.

## 5. Password rules

Use the shared schema `src/lib/validation/password.ts` created in task 02 (12+ characters, not common, not the username). Also set the same minimum length in Supabase Auth settings, so the rule holds even outside the app.

## 6. Sessions
- A session ends after **8 hours**, or after **30 minutes without activity** (show a warning 2 minutes before: "ستنتهي الجلسة بعد دقيقتين. هل تريد المتابعة؟").
- When an account is deactivated or its password changes, **all its sessions end immediately** (sign out everywhere).

## Done when
- [ ] The admin account goes to the two-step check, then to `/admin`; an agent account goes to `/`.
- [ ] Without the 6-digit code, the admin cannot open any `/admin` page (try the URL directly).
- [ ] A password of 11 characters or a common password like `password1234` is refused.
- [ ] Wrong password shows the message, 6th try shows the lock-out message.
- [ ] Looks right on a 360px phone and on desktop, in Arabic and French.
- [ ] "تسجيل الخروج" in the top bar returns to this page.
