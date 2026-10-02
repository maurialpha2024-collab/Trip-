// Sign-in for the login page. Failures come back as keys, not sentences, so
// the wording stays in the message files and the reason never reaches a URL.
// A wrong username and a wrong password give the same answer on purpose.

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/login";
import { usernameToEmail } from "@/lib/validation/username";
import {
  clearAttempts,
  isLockedOut,
  recordFailedAttempt,
} from "./rate-limit";

export type SignInState = {
  errorKey: "invalid" | "inactive" | "locked";
} | null;

export async function signIn(
  _previousState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const parsed = loginSchema.safeParse({
    username: String(formData.get("username") ?? "").toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { errorKey: "invalid" };
  }

  const { username, password } = parsed.data;

  if (await isLockedOut(username)) {
    return { errorKey: "locked" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error || !data.user) {
    await recordFailedAttempt(username);
    return (await isLockedOut(username))
      ? { errorKey: "locked" }
      : { errorKey: "invalid" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return { errorKey: "inactive" };
  }

  await clearAttempts(username);
  await supabase.from("audit_log").insert({ action: "login" });

  // Admins land on the dashboard, agents straight on registering a household.
  redirect(profile.role === "admin" ? "/admin" : "/households/new");
}
