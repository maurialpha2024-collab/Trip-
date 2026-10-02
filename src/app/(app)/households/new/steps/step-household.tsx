// Step 3: the household's own details. Saving this step is what creates the
// draft row in the database, so everything after it can be recovered.

"use client";

import { useTranslations } from "next-intl";
import { FormField } from "@/components/census/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { wilayas, type Locale } from "@/lib/constants";
import { OptionSelect } from "../person-fields";
import type { WizardDraft } from "../types";

export type HouseholdErrors = Partial<
  Record<"familyName" | "wilaya" | "city" | "addressNotes", string>
>;

type StepHouseholdProps = {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
  locale: Locale;
  errors?: HouseholdErrors;
};

export function StepHousehold({
  draft,
  onChange,
  locale,
  errors,
}: StepHouseholdProps) {
  const t = useTranslations("fields");

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormField label={t("householdName")} error={errors?.familyName}>
          {(control) => (
            <Input
              {...control}
              value={draft.familyName}
              onChange={(event) => onChange({ familyName: event.target.value })}
            />
          )}
        </FormField>
      </div>

      <OptionSelect
        label={t("wilaya")}
        value={draft.wilaya}
        onChange={(next) => onChange({ wilaya: next })}
        options={wilayas.map((item) => ({
          key: item.key,
          label: item[locale],
        }))}
        error={errors?.wilaya}
      />

      <FormField label={t("city")} error={errors?.city}>
        {(control) => (
          <Input
            {...control}
            value={draft.city}
            onChange={(event) => onChange({ city: event.target.value })}
          />
        )}
      </FormField>

      <div className="sm:col-span-2">
        <FormField label={t("addressNotes")} error={errors?.addressNotes}>
          {(control) => (
            <Textarea
              {...control}
              rows={3}
              value={draft.addressNotes}
              onChange={(event) =>
                onChange({ addressNotes: event.target.value })
              }
            />
          )}
        </FormField>
      </div>
    </div>
  );
}
