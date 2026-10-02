// Adds or renames a family. The same dialog serves both levels: a small family
// additionally picks its large family, which is also how it gets moved.

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
import { Textarea } from "@/components/ui/textarea";
import { OptionSelect } from "../../households/new/person-fields";
import { saveLargeFamily, saveSmallFamily } from "./actions";

export type FamilyFormValue = {
  id: string | null;
  name: string;
  notes: string;
  // null means this is a large family; a string means a small one.
  largeFamilyId: string | null;
};

type FamilyFormDialogProps = {
  value: FamilyFormValue;
  largeFamilies: { id: string; name: string }[];
  onClose: () => void;
};

export function FamilyFormDialog({
  value,
  largeFamilies,
  onClose,
}: FamilyFormDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const [form, setForm] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSmall = form.largeFamilyId !== null;
  const isNew = form.id === null;

  const parentName =
    largeFamilies.find((family) => family.id === form.largeFamilyId)?.name ?? "";

  const title = isSmall
    ? isNew
      ? t("families.addSmall", { family: parentName })
      : t("families.editSmall")
    : isNew
      ? t("families.addLarge")
      : t("families.editLarge");

  async function save() {
    setSaving(true);
    setError(null);

    const result = isSmall
      ? await saveSmallFamily(
          {
            name: form.name,
            notes: form.notes,
            largeFamilyId: form.largeFamilyId,
          },
          form.id
        )
      : await saveLargeFamily({ name: form.name, notes: form.notes }, form.id);

    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    toast.success(t("detail.saved"));
    onClose();
    router.refresh();
  }

  return (
    <Dialog open onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading text-ink text-start">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <FormField label={t("families.name")} error={error ?? undefined}>
            {(control) => (
              <Input
                {...control}
                autoFocus
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            )}
          </FormField>

          {isSmall ? (
            <OptionSelect
              label={t("families.largeFamily")}
              value={form.largeFamilyId ?? ""}
              onChange={(next) => setForm({ ...form, largeFamilyId: next })}
              options={largeFamilies.map((family) => ({
                key: family.id,
                label: family.name,
              }))}
            />
          ) : null}

          <FormField label={t("families.notes")}>
            {(control) => (
              <Textarea
                {...control}
                rows={3}
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
              />
            )}
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={save} loading={saving}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
