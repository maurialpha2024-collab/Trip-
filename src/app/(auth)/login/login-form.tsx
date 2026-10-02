// The sign-in form. Users type a username; the hidden @census.local address is
// added on the server. One alert sits above the button rather than under each
// field, so the page never reveals which of the two was wrong.

"use client";

import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { FormField } from "@/components/census/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, type SignInState } from "./actions";

export function LoginForm() {
  const t = useTranslations("login");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signIn,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormField label={t("username")}>
        {(control) => (
          <Input
            {...control}
            name="username"
            autoComplete="username"
            autoFocus
            required
          />
        )}
      </FormField>

      <FormField label={t("password")}>
        {(control) => (
          <div className="relative">
            <Input
              {...control}
              name="password"
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
              required
              className="pe-12"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={
                passwordVisible ? t("hidePassword") : t("showPassword")
              }
              className="text-ink-muted hover:text-ink absolute end-0 top-0 flex size-11 items-center justify-center"
            >
              {passwordVisible ? (
                <EyeOffIcon className="size-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </FormField>

      {state ? (
        <p
          role="alert"
          className="text-small text-danger flex items-center gap-1.5 text-start"
        >
          <AlertCircleIcon className="size-4 shrink-0" aria-hidden="true" />
          {t(state.errorKey)}
        </p>
      ) : null}

      <Button type="submit" loading={pending} className="w-full">
        {pending ? t("signingIn") : t("submit")}
      </Button>
    </form>
  );
}
