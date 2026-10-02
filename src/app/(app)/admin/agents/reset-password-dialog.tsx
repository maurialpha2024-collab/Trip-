// Sets a new password for someone else's account. The admin confirms with their
// own password first, and the new one is never shown again after this dialog.

"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { changeStaffPassword } from "./actions";
import { PasswordFields } from "./password-fields";

type ResetPasswordDialogProps = {
  id: string;
  username: string;
  onClose: () => void;
};

export function ResetPasswordDialog({
  id,
  username,
  onClose,
}: ResetPasswordDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [ownPassword, setOwnPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);

    const result = await changeStaffPassword({
      id,
      username,
      password: passwords.password,
      confirmPassword: passwords.confirmPassword,
      ownPassword,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    toast.success(t("staff.passwordChanged"));
    onClose();
    router.refresh();
  }

  return (
    <Dialog open onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading text-ink text-start">
            {t("staff.changePassword")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <PasswordFields
            username={username}
            password={passwords.password}
            confirmPassword={passwords.confirmPassword}
            onChange={setPasswords}
          />

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
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
