// The sign-in form. Users type a username; the hidden @census.local address is
// added on the server. One alert sits above the button rather than under each
// field, so the page never reveals which of the two was wrong.

"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { FormAlert } from "@/components/census/form-alert";
import { FormField } from "@/components/census/form-field";
import { Input } from "@/components/ui/input";
import { signIn, type SignInState } from "./actions";
import { AuthSubmit } from "./auth-submit";

export function LoginForm() {
  const t = useTranslations("login");
  const [passwordVisible, setPasswordVisible] = useState(false);
  // Counts submissions so the alert is rebuilt, and shakes again, on every
  // failed try rather than only the first.
  const [attempt, setAttempt] = useState(0);
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signIn,
    null
  );

  return (
    <form
      action={formAction}
      onSubmit={() => setAttempt((count) => count + 1)}
      className="space-y-5"
    >
      <div className="animate-rise [animation-delay:450ms] lg:[animation-delay:250ms]">
        <FormField label={t("username")}>
          {(control) => (
            <Input
              {...control}
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              className="bg-surface h-12 text-base"
            />
          )}
        </FormField>
      </div>

      <div className="animate-rise [animation-delay:550ms] lg:[animation-delay:350ms]">
        <FormField label={t("password")}>
          {(control) => (
            <div className="relative">
              <Input
                {...control}
                name="password"
                type={passwordVisible ? "text" : "password"}
                autoComplete="current-password"
                required
                className="bg-surface h-12 pe-12 text-base"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={
                  passwordVisible ? t("hidePassword") : t("showPassword")
                }
                aria-pressed={passwordVisible}
                className="text-ink-muted hover:text-ink rounded-control absolute end-0 top-0 flex size-12 items-center justify-center transition-[color,scale] active:scale-90"
              >
                {passwordVisible ? (
                  <EyeOffIcon
                    className="animate-in fade-in zoom-in-75 size-5 duration-200"
                    aria-hidden="true"
                  />
                ) : (
                  <EyeIcon
                    className="animate-in fade-in zoom-in-75 size-5 duration-200"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          )}
        </FormField>
      </div>

      {state ? (
        <div key={attempt} className="animate-shake">
          <FormAlert message={t(state.errorKey)} />
        </div>
      ) : null}

      <AuthSubmit
        pending={pending}
        label={t("submit")}
        pendingLabel={t("signingIn")}
        className="animate-rise [animation-delay:650ms] lg:[animation-delay:450ms]"
      />
    </form>
  );
}
