// Step 6: the children. The form opens in a dialog that goes full screen on a
// phone, and the fields it shows depend on the child's age.

"use client";

import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { PersonCard } from "@/components/census/person-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  educationLevels,
  jobAge,
  phoneAndMarriageAge,
  type Locale,
} from "@/lib/constants";
import { ageFromBirthDate } from "@/lib/validation/person";
import { PersonFields } from "../person-fields";
import { emptyPerson, type PersonDraft } from "../types";

type StepChildrenProps = {
  values: PersonDraft[];
  onChange: (next: PersonDraft[]) => void;
  hasNoChildren: boolean;
  onHasNoChildrenChange: (value: boolean) => void;
  mothers: { id: string; name: string }[];
  locale: Locale;
  currentHouseholdId: string | null;
};

export function StepChildren({
  values,
  onChange,
  hasNoChildren,
  onHasNoChildrenChange,
  mothers,
  locale,
  currentHouseholdId,
}: StepChildrenProps) {
  const t = useTranslations();
  const checkboxId = useId();
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<PersonDraft>(emptyPerson("child"));

  const age = ageFromBirthDate(form.birthDate) ?? 0;

  function startAdding() {
    setForm(emptyPerson("child"));
    setEditingIndex(null);
    setOpen(true);
  }

  function startEditing(index: number) {
    setForm(values[index]);
    setEditingIndex(index);
    setOpen(true);
  }

  function save() {
    onChange(
      editingIndex === null
        ? [...values, form]
        : values.map((child, position) =>
            position === editingIndex ? form : child
          )
    );
    setOpen(false);
  }

  function move(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= values.length) {
      return;
    }

    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function educationLabel(child: PersonDraft): string[] {
    const level = educationLevels.find(
      (item) => item.key === child.educationLevel
    );
    return level ? [level[locale]] : [];
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Checkbox
          id={checkboxId}
          checked={hasNoChildren}
          onCheckedChange={(checked) => onHasNoChildrenChange(checked === true)}
        />
        <Label htmlFor={checkboxId} className="text-label text-ink">
          {t("register.noChildren")}
        </Label>
      </div>

      {!hasNoChildren ? (
        <>
          <ul className="space-y-3">
            {values.map((child, index) => (
              <li
                key={child.id ?? `new-${index}`}
                className="flex items-start gap-2"
              >
                <div className="flex-1">
                  <PersonCard
                    role={child.gender === "female" ? "daughter" : "son"}
                    name={child.fullName}
                    age={ageFromBirthDate(child.birthDate) ?? 0}
                    facts={educationLabel(child)}
                    deceased={!child.isAlive}
                    onEdit={() => startEditing(index)}
                    onDelete={() =>
                      onChange(
                        values.filter((_, position) => position !== index)
                      )
                    }
                  />
                </div>

                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("register.moveUp")}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ChevronUpIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("register.moveDown")}
                    disabled={index === values.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ChevronDownIcon />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <Button variant="outline" onClick={startAdding}>
            <PlusIcon />
            {t("register.addChild")}
          </Button>
        </>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        {/* Full screen below the sm breakpoint, a normal dialog above it. */}
        <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-2xl max-sm:h-dvh max-sm:max-w-full max-sm:rounded-none">
          <DialogHeader>
            <DialogTitle className="text-heading text-ink text-start">
              {t("register.addChild")}
            </DialogTitle>
          </DialogHeader>

          <PersonFields
            value={form}
            onChange={setForm}
            locale={locale}
            showGender
            showPhone={age >= phoneAndMarriageAge}
            showJob={age >= jobAge}
            showMaritalStatus={age >= phoneAndMarriageAge}
            mothers={mothers}
            currentHouseholdId={currentHouseholdId}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={save}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
