// The six-digit code field, shared by the first-time setup screen and the
// everyday verify screen.

"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { FormAlert } from "@/components/census/form-alert";
import { FormField } from "@/components/census/form-field";
import { Input } from "@/components/ui/input";
import { AuthSubmit } from "./auth-submit";
import { verifyCode, type MfaState } from "./mfa-actions";

export function CodeForm({ factorId }: { factorId: string }) {
  const t = useTranslations("mfa");
  // Counts submissions so a wrong code shakes the alert every time.
  const [attempt, setAttempt] = useState(0);
  const [state, formAction, pending] = useActionState<MfaState, FormData>(
    verifyCode,
    null
  );

  return (
    <form
      action={formAction}
      onSubmit={() => setAttempt((count) => count + 1)}
      className="space-y-5"
    >
      <input type="hidden" name="factorId" value={factorId} />

      <div className="animate-rise [animation-delay:250ms]">
        <FormField label={t("code")}>
          {(control) => (
            <Input
              {...control}
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              autoFocus
              dir="ltr"
              className="bg-surface h-14 text-center font-mono text-2xl tracking-[0.5em]"
            />
          )}
        </FormField>
      </div>

      {state ? (
        <div key={attempt} className="animate-shake">
          <FormAlert message={t("invalid")} />
        </div>
      ) : null}

      <AuthSubmit
        pending={pending}
        label={t("submit")}
        pendingLabel={t("verifying")}
        className="animate-rise [animation-delay:350ms]"
      />
    </form>
  );
}
