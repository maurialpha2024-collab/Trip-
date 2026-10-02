// Form field states: hint, error, and the birth date with its "year only" escape.

"use client";

import { useState } from "react";
import {
  BirthDateInput,
  type BirthDate,
} from "@/components/census/birth-date-input";
import { FormField } from "@/components/census/form-field";
import { Input } from "@/components/ui/input";
import { Section } from "./section";

export function FormsPreview() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState<BirthDate>({
    day: null,
    month: null,
    year: null,
    yearOnly: false,
  });

  return (
    <Section title="حقول النموذج">
      <div className="rounded-card border border-line bg-surface grid gap-5 p-4 sm:grid-cols-2">
        <FormField label="الاسم الكامل" hint="كما يظهر في بطاقة التعريف">
          {(control) => (
            <Input
              {...control}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          )}
        </FormField>

        <FormField label="رقم الهاتف" error="هذا الحقل مطلوب">
          {(control) => <Input {...control} inputMode="tel" />}
        </FormField>

        <div className="space-y-1.5 sm:col-span-2">
          <p className="text-label text-ink text-start">تاريخ الميلاد</p>
          <BirthDateInput value={birthDate} onChange={setBirthDate} />
        </div>
      </div>
    </Section>
  );
}
