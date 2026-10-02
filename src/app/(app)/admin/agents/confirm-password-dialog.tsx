// Confirms an account action by asking the admin for their own password, so a
// computer left unlocked cannot be used to deactivate staff or clear a
// two-step check.

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormField } from "@/components/census/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { StaffResult } from "./actions";

type ConfirmPasswordDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: (ownPassword: string) => Promise<StaffResult>;
  onClose: () => void;
};

export function ConfirmPasswordDialog({
  title,
  description,
  confirmLabel,
  danger = false,
  onConfirm,
  onClose,
}: ConfirmPasswordDialogProps) {
  const t = useTranslations();
  const [ownPassword, setOwnPassword] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setWorking(true);
    setError(null);

    const result = await onConfirm(ownPassword);
    setWorking(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onClose();
  }

  return (
    <Dialog open onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading text-ink text-start">
            {title}
          </DialogTitle>
          <DialogDescription className="text-body text-ink-muted text-start">
            {description}
          </DialogDescription>
        </DialogHeader>

        <FormField
          label={t("staff.confirmOwnPassword")}
          error={error ?? undefined}
        >
          {(control) => (
            <Input
              {...control}
              type="password"
              autoComplete="current-password"
              autoFocus
              value={ownPassword}
              onChange={(event) => setOwnPassword(event.target.value)}
            />
          )}
        </FormField>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            variant={danger ? "danger" : "default"}
            onClick={run}
            loading={working}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
