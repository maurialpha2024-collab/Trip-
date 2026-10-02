# CLAUDE.md — Rules for this project (read before every task)

This is **إحصاء الأسر**, a private web app for the family census of a tribe in Mauritania.
The full plan is in `census-kit/`. Start by reading `census-kit/00-START-HERE.md`.
It holds real personal data (names, NNI, phone numbers), so correctness and security matter more than speed.

## How we work

1. **One task at a time.** Only do the task file I name (e.g. `census-kit/04-login.md`). Never start the next task.
2. **Plan first.** Before writing code, give me a short plan: the files you will create or change, and anything unclear. Wait for my OK.
3. **Ask, don't guess.** If the task file does not say something, ask me. Do not invent features, fields, pages or libraries.
4. **Stay inside the plan.** Use only the stack, folders, colors, fonts and text from `census-kit/`. Do not add new packages without asking.
5. **Small steps.** Build one file or component, check it works, then the next. Do not write 20 files at once.
6. **Finish properly.** At the end of every task:
   - run `npm run lint` and `npm run build` and fix every error and warning,
   - go through the "Done when" list of the task and say which items pass,
   - tell me exactly how to check it in the browser (URL, which account, what to click).
7. **Never say something works if you did not run it.** If you could not test something, say so.

## Code quality (no "vibe code")

- One job per file. Page files only arrange components; logic lives in `actions.ts`, forms in their own file.
- No file longer than ~200 lines; split it into components.
- Clear English names (`createHousehold`, `ChildForm`). No `data2`, `temp`, `test123`.
- One short comment at the top of each file saying what it is for. Comments explain *why*, not *what*.
- TypeScript strict. **No `any`, no `@ts-ignore`, no `eslint-disable`.**
- Types come from zod schemas or from the generated Supabase types.
- The same zod schema validates on the client **and** again in the server action.
- No copy-pasted code: if the same code appears twice, make a shared function or component.
- No leftover `console.log`, commented-out code, unused imports or unused files.
- No fake or placeholder logic left in finished work (no `// TODO: implement`, no hardcoded sample data in pages).

## Design rules

- All colors from the tokens in `01-design-system.md`. **No raw hex values in components.**
- Fonts: Readex Pro for interface, Amiri only for family names and page titles.
- RTL first: use `ms- me- ps- pe- start- end- text-start`, never `ml- mr- pl- pr- left- right-`.
- All user text in `messages/ar.json` and `messages/fr.json`, never written inside components.
- Buttons and links at least 44px tall; visible labels on every input; errors under the field.
- Every save shows a loading state and then a confirmation.
- Check every page at 360px width (phone) and 1280px (desktop).

## Security rules (never break these)

- Row Level Security stays on for every table. Never disable it to "make something work".
- The service role key is used **only** in `src/lib/supabase/admin.ts` and server code. Never in client components.
- Every admin page and admin action checks the role on the server with `requireAdmin()`.
- Never log NNI, phone numbers or passwords.
- **Never write any username or password in code, seed files, README, tests or comments.** Accounts are created only by the owner, with `npm run create-user` or the "الموظفون" page.
- Two-step login (`aal2`) is optional per account and is never forced on anyone. But once an account has an authenticator registered, the app must require the code.
- Never commit `.env.local`.
- Never change the database without a new migration file in `supabase/migrations/`.

## If something goes wrong

- If a fix needs changing earlier tasks' files, tell me first and explain why.
- If you are stuck after two tries, stop and explain the problem instead of trying random changes.
