// The six-digit code field, shared by the first-time setup screen and the
// everyday verify screen.

"use client";

import { AlertCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { FormField } from "@/components/census/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyCode, type MfaState } from "./mfa-actions";

export function CodeForm({ factorId }: { factorId: string }) {
  const t = useTranslations("mfa");
  const [state, formAction, pending] = useActionState<MfaState, FormData>(
    verifyCode,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="factorId" value={factorId} />

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
            className="text-center tracking-[0.4em]"
          />
        )}
      </FormField>

      {state ? (
        <p
          role="alert"
          className="text-small text-danger flex items-center gap-1.5 text-start"
        >
          <AlertCircleIcon className="size-4 shrink-0" aria-hidden="true" />
          {t("invalid")}
        </p>
      ) : null}

      <Button type="submit" loading={pending} className="w-full">
        {pending ? t("verifying") : t("submit")}
      </Button>
    </form>
  );
}
