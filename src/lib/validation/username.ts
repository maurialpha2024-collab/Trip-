// Username rules, shared by the account script and the login form.
// Supabase Auth requires an email, so each account is stored as
// <username>@census.local. Users only ever see and type the username itself.

import { z } from "zod";

export const authEmailDomain = "census.local";

export const usernameMessage =
  "اسم المستخدم: من 3 إلى 30 حرفاً، حروف إنجليزية صغيرة وأرقام و _ فقط.";

export const usernameSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9_]{3,30}$/, usernameMessage);

export function usernameToEmail(username: string): string {
  return `${username}@${authEmailDomain}`;
}
