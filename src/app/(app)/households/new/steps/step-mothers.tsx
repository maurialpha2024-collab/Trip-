// Step 5: the mother. A second wife is possible but uncommon, so the link that
// adds one stays quiet below the first form.

"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/constants";
import { PersonFields, type PersonFieldErrors } from "../person-fields";
import { emptyPerson, type PersonDraft } from "../types";

type StepMothersProps = {
  values: PersonDraft[];
  onChange: (next: PersonDraft[]) => void;
  locale: Locale;
  errors?: PersonFieldErrors[];
  currentHouseholdId: string | null;
};

export function StepMothers({
  values,
  onChange,
  locale,
  errors,
  currentHouseholdId,
}: StepMothersProps) {
  const t = useTranslations();

  // There is always one form on screen, even before anything is typed.
  const mothers = values.length === 0 ? [emptyPerson("mother")] : values;

  return (
    <div className="space-y-6">
      {mothers.map((mother, index) => (
        <div
          key={mother.id ?? `new-${index}`}
          className="rounded-card border-line bg-surface space-y-4 border p-4"
        >
          {mothers.length > 1 ? (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("common.delete")}
                onClick={() =>
                  onChange(mothers.filter((_, position) => position !== index))
                }
              >
                <Trash2Icon />
              </Button>
            </div>
          ) : null}

          <PersonFields
            value={mother}
            onChange={(next) =>
              onChange(
                mothers.map((current, position) =>
                  position === index ? next : current
                )
              )
            }
            locale={locale}
            errors={errors?.[index]}
            currentHouseholdId={currentHouseholdId}
            showGender={false}
            showPhone
            showJob
          />
        </div>
      ))}

      <Button
        variant="ghost"
        onClick={() => onChange([...mothers, emptyPerson("mother")])}
      >
        <PlusIcon />
        {t("register.addWife")}
      </Button>
    </div>
  );
}
