// Failed sign-in tracking for the lock-out. The login_attempts table has Row
// Level Security on and no policies at all, so only the service role can read
// or write it — a signed-out visitor can never probe it.

import { createAdminClient } from "@/lib/supabase/admin";

export const maxAttempts = 5;
export const windowMinutes = 15;

function windowStart(): string {
  return new Date(Date.now() - windowMinutes * 60_000).toISOString();
}

export async function isLockedOut(username: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { count } = await supabase
    .from("login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("username", username)
    .gte("at", windowStart());

  return (count ?? 0) >= maxAttempts;
}

export async function recordFailedAttempt(username: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("login_attempts").insert({ username });
}

export async function clearAttempts(username: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("login_attempts").delete().eq("username", username);
}
