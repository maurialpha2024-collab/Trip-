# Task 13 — Final checks and going live

**Goal:** finish the details, test everything, and put the app online.

---

## 1. Finish
- Complete `messages/fr.json` (every Arabic key has a French text).
- Check dark mode on every page.
- Every page has loading, empty and error states (`loading.tsx`, `error.tsx`, `not-found.tsx` in Arabic).
- Delete the `/design` preview page from task 01.
- Page titles (`<title>`) for every page, e.g. "تسجيل أسرة جديدة — إحصاء الأسر".
- App icon and `manifest.json` so agents can "Add to home screen" on their phones.

## 2. Test checklist (go through every page)

**Look and layout**
- [ ] No horizontal scroll at 360px; looks right at 768px and 1440px.
- [ ] Arabic right to left and French left to right, with arrows flipped.
- [ ] Text contrast at least 4.5:1 in light and dark mode.

**Use**
- [ ] All buttons and links at least 44px tall and easy to tap.
- [ ] Keyboard only: every page can be used with Tab / Enter / Esc, focus ring always visible.
- [ ] Every input has a visible label; errors are under the field and read by a screen reader.
- [ ] Every save button shows loading, then a confirmation.
- [ ] Reduced motion setting turns off animations.

**Security**
- [ ] With two agent accounts: agent 1 cannot see, edit or export agent 2's households (try the URLs directly).
- [ ] Agents get redirected from every `/admin` page.
- [ ] Public sign-up is off in Supabase.
- [ ] No secret keys in browser code; `.env.local` is in `.gitignore`.
- [ ] No NNI or phone numbers written to the console or logs.
- [ ] Admin cannot open any admin page without the 6-digit code (two-step check).
- [ ] No username or password anywhere in the code, git history, seed or README (search for them).
- [ ] `npm audit` shows no high or critical problems.

**Security settings to add in this task**
- Security headers in `next.config.ts`: `Content-Security-Policy` (only this site and Supabase), `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (no camera, microphone, location).
- Rate limit on login, export and account actions (per user and per IP).
- `robots.txt` that blocks all search engines, and `noindex` on every page: the census must never appear in Google.
- A "سجل النشاط" (activity log) tab in `/admin/agents` that shows `audit_log`: logins, exports, deletions, account changes.

**Data**
- [ ] Register 3 full households on a phone from start to finish.
- [ ] Turn off Wi-Fi in the middle of step 5, type, turn it back on: nothing is lost.
- [ ] Dashboard numbers match the households list and the Excel export.

## 3. Go live
- Push to GitHub, deploy on **Vercel**, add the 3 environment variables.
- In Supabase: add the Vercel URL to Auth "Site URL", turn on daily backups, set the minimum password length to 12.
- Use a **new, empty** Supabase project for the real census (not the development one). Run the migration only, no sample data, then `npm run create-user` to create the real admin.
- Turn on two-step login for the owner's **Supabase, Vercel and GitHub accounts**: whoever gets into those gets all the data.
- README: how to run locally, how to deploy, how to create the first admin with `npm run create-user`.

## Done when
- [ ] Every box above is checked.
- [ ] `npm run build` passes and the Vercel URL works on a phone.
