// The password pair, strength bar and generator, shared by the create dialog
// and the change-password dialog. The generated password is shown so the admin
// can copy it; it is never stored anywhere by this app.

"use client";

import { EyeIcon, EyeOffIcon, SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormField } from "@/components/census/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  generatePassword,
  passwordStrength,
  type PasswordStrength,
} from "@/lib/validation/password";

const strengthTone: Record<PasswordStrength, string> = {
  weak: "bg-danger",
  medium: "bg-warning",
  strong: "bg-success",
};

const filledSegments: Record<PasswordStrength, number> = {
  weak: 1,
  medium: 2,
  strong: 3,
};

type PasswordFieldsProps = {
  username: string;
  password: string;
  confirmPassword: string;
  onChange: (next: { password: string; confirmPassword: string }) => void;
};

export function PasswordFields({
  username,
  password,
  confirmPassword,
  onChange,
}: PasswordFieldsProps) {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);

  const strength = passwordStrength(password, username);
  const filled = password.length === 0 ? 0 : filledSegments[strength];

  return (
    <div className="space-y-4">
      <FormField label={t("staff.password")}>
        {(control) => (
          <div className="relative">
            <Input
              {...control}
              type={visible ? "text" : "password"}
              autoComplete="new-password"
              className="pe-12"
              value={password}
              onChange={(event) =>
                onChange({ password: event.target.value, confirmPassword })
              }
            />
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              aria-label={
                visible ? t("login.hidePassword") : t("login.showPassword")
              }
              className="text-ink-muted hover:text-ink absolute end-0 top-0 flex size-11 items-center justify-center"
            >
              {visible ? (
                <EyeOffIcon className="size-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </FormField>

      <div className="space-y-1">
        <div className="flex gap-1" aria-hidden="true">
          {[0, 1, 2].map((segment) => (
            <span
              key={segment}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                segment < filled ? strengthTone[strength] : "bg-line"
              )}
            />
          ))}
        </div>
        {password.length > 0 ? (
          <p className="text-small text-ink-muted text-start">
            {t(`staff.${strength}`)}
          </p>
        ) : null}
      </div>

      <FormField
        label={t("staff.confirmPassword")}
        error={
          confirmPassword.length > 0 && confirmPassword !== password
            ? t("staff.mismatch")
            : undefined
        }
      >
        {(control) => (
          <Input
            {...control}
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) =>
              onChange({ password, confirmPassword: event.target.value })
            }
          />
        )}
      </FormField>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const generated = generatePassword();
          setVisible(true);
          onChange({ password: generated, confirmPassword: generated });
        }}
      >
        <SparklesIcon />
        {t("staff.generate")}
      </Button>
    </div>
  );
}
