// Creates a new staff account, or edits an existing one's name and role.
// The admin types the username and password themselves; nothing is emailed.

"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/census/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createStaffAccount, updateStaffAccount } from "./actions";
import { PasswordFields } from "./password-fields";

export type AgentFormValue = {
  id: string | null;
  fullName: string;
  username: string;
  role: "admin" | "agent";
};

type AgentFormDialogProps = {
  value: AgentFormValue;
  onClose: () => void;
};

export function AgentFormDialog({ value, onClose }: AgentFormDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const roleId = useId();

  const [form, setForm] = useState(value);
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [ownPassword, setOwnPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = value.id === null;

  async function submit() {
    setSaving(true);
    setError(null);

    const result = isNew
      ? await createStaffAccount({
          fullName: form.fullName,
          username: form.username,
          role: form.role,
          password: passwords.password,
          confirmPassword: passwords.confirmPassword,
          ownPassword,
        })
      : await updateStaffAccount({
          id: value.id,
          fullName: form.fullName,
          role: form.role,
          ownPassword,
        });

    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    toast.success(
      isNew
        ? t("staff.created", { username: form.username })
        : t("staff.updated")
    );
    onClose();
    router.refresh();
  }

  return (
    <Dialog open onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading text-ink text-start">
            {isNew ? t("staff.createTitle") : t("staff.editTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <FormField label={t("staff.fullName")}>
            {(control) => (
              <Input
                {...control}
                autoFocus
                value={form.fullName}
                onChange={(event) =>
                  setForm({ ...form, fullName: event.target.value })
                }
              />
            )}
          </FormField>

          {isNew ? (
            <FormField label={t("staff.username")}>
              {(control) => (
                <Input
                  {...control}
                  autoComplete="off"
                  value={form.username}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      username: event.target.value.toLowerCase(),
                    })
                  }
                />
              )}
            </FormField>
          ) : null}

          <fieldset className="space-y-1.5">
            <legend className="text-label text-ink">{t("staff.role")}</legend>
            <RadioGroup
              value={form.role}
              onValueChange={(next) =>
                setForm({ ...form, role: next === "admin" ? "admin" : "agent" })
              }
              className="flex gap-6"
            >
              <span className="flex items-center gap-2">
                <RadioGroupItem value="agent" id={`${roleId}-agent`} />
                <Label htmlFor={`${roleId}-agent`}>{t("roles.agent")}</Label>
              </span>
              <span className="flex items-center gap-2">
                <RadioGroupItem value="admin" id={`${roleId}-admin`} />
                <Label htmlFor={`${roleId}-admin`}>{t("roles.admin")}</Label>
              </span>
            </RadioGroup>
          </fieldset>

          {isNew ? (
            <PasswordFields
              username={form.username}
              password={passwords.password}
              confirmPassword={passwords.confirmPassword}
              onChange={setPasswords}
            />
          ) : null}

          <FormField
            label={t("staff.confirmOwnPassword")}
            error={error ?? undefined}
          >
            {(control) => (
              <Input
                {...control}
                type="password"
                autoComplete="current-password"
                value={ownPassword}
                onChange={(event) => setOwnPassword(event.target.value)}
              />
            )}
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} loading={saving}>
            {isNew ? t("staff.create") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
