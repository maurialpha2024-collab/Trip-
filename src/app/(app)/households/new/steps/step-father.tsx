// Step 4: the father. Gender is fixed, so the form never asks for it.

"use client";

import type { Locale } from "@/lib/constants";
import { PersonFields, type PersonFieldErrors } from "../person-fields";
import type { PersonDraft } from "../types";

type StepFatherProps = {
  value: PersonDraft;
  onChange: (next: PersonDraft) => void;
  locale: Locale;
  errors?: PersonFieldErrors;
};

export function StepFather({
  value,
  onChange,
  locale,
  errors,
}: StepFatherProps) {
  return (
    <PersonFields
      value={value}
      onChange={onChange}
      locale={locale}
      errors={errors}
      showGender={false}
      showPhone
      showJob
    />
  );
}
