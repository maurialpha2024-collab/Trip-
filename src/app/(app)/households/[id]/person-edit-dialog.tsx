// Edits one person in place, using the same fields as the registration form.
// It is mounted only while editing, so it always opens with fresh values, and
// on success it refreshes the page data rather than reloading the whole page.

"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { jobAge, phoneAndMarriageAge, type Locale } from "@/lib/constants";
import { ageFromBirthDate } from "@/lib/validation/person";
import { savePerson } from "../new/actions";
import { PersonFields } from "../new/person-fields";
import { toPersonInput, type PersonDraft } from "../new/types";

type PersonEditDialogProps = {
  householdId: string;
  person: PersonDraft;
  sortOrder: number;
  mothers: { id: string; name: string }[];
  locale: Locale;
  onClose: () => void;
};

export function PersonEditDialog({
  householdId,
  person,
  sortOrder,
  mothers,
  locale,
  onClose,
}: PersonEditDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const [form, setForm] = useState(person);
  const [saving, setSaving] = useState(false);

  const isChild = person.role === "child";
  const age = ageFromBirthDate(form.birthDate) ?? 0;

  async function save() {
    setSaving(true);
    const result = await savePerson(
      householdId,
      person.role,
      toPersonInput(form),
      form.id,
      sortOrder
    );
    setSaving(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(t("detail.saved"));
    onClose();
    router.refresh();
  }

  return (
    <Dialog open onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-2xl max-sm:h-dvh max-sm:max-w-full max-sm:rounded-none">
        <DialogHeader>
          <DialogTitle className="text-heading text-ink text-start">
            {t("detail.editPerson", {
              name: person.fullName || t("fields.empty"),
            })}
          </DialogTitle>
        </DialogHeader>

        <PersonFields
          value={form}
          onChange={setForm}
          locale={locale}
          currentHouseholdId={householdId}
          showGender={isChild}
          showPhone={!isChild || age >= phoneAndMarriageAge}
          showJob={!isChild || age >= jobAge}
          showMaritalStatus={isChild && age >= phoneAndMarriageAge}
          mothers={isChild ? mothers : undefined}
        />

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
