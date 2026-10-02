// Confirms a six-digit code from the authenticator app. The same action both
// activates a new factor and clears an existing one, because Supabase treats
// the first successful verify as the activation.

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { totpCodeSchema } from "@/lib/validation/login";

export type MfaState = { errorKey: "invalid" } | null;

export async function verifyCode(
  _previousState: MfaState,
  formData: FormData
): Promise<MfaState> {
  const factorId = String(formData.get("factorId") ?? "");
  const parsed = totpCodeSchema.safeParse(String(formData.get("code") ?? ""));

  if (!factorId || !parsed.success) {
    return { errorKey: "invalid" };
  }

  const supabase = await createClient();

  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId });

  if (challengeError || !challenge) {
    return { errorKey: "invalid" };
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: parsed.data,
  });

  if (error) {
    return { errorKey: "invalid" };
  }

  redirect("/admin");
}
