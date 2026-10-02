// Birth date as three selects. Many people in the census know only the year
// they were born, so "السنة فقط" hides the day and month instead of forcing a guess.

"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BirthDate = {
  day: number | null;
  month: number | null;
  year: number | null;
  yearOnly: boolean;
};

const oldestAgeRecorded = 120;

const days = Array.from({ length: 31 }, (_, index) => index + 1);
const months = Array.from({ length: 12 }, (_, index) => index + 1);

type BirthDateInputProps = {
  value: BirthDate;
  onChange: (value: BirthDate) => void;
};

export function BirthDateInput({ value, onChange }: BirthDateInputProps) {
  const t = useTranslations("birthDate");
  const checkboxId = useId();

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: oldestAgeRecorded + 1 },
    (_, index) => currentYear - index
  );

  const toText = (part: number | null) => (part === null ? undefined : String(part));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {!value.yearOnly ? (
          <>
            <Part
              label={t("day")}
              placeholder={t("day")}
              options={days}
              value={toText(value.day)}
              onSelect={(day) => onChange({ ...value, day })}
            />
            <Part
              label={t("month")}
              placeholder={t("month")}
              options={months}
              value={toText(value.month)}
              onSelect={(month) => onChange({ ...value, month })}
            />
          </>
        ) : null}

        <Part
          label={t("year")}
          placeholder={t("year")}
          options={years}
          value={toText(value.year)}
          onSelect={(year) => onChange({ ...value, year })}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={checkboxId}
          checked={value.yearOnly}
          onCheckedChange={(checked) =>
            onChange({
              ...value,
              yearOnly: checked === true,
              day: checked === true ? null : value.day,
              month: checked === true ? null : value.month,
            })
          }
        />
        <Label htmlFor={checkboxId} className="text-label text-ink">
          {t("yearOnly")}
        </Label>
      </div>
    </div>
  );
}

type PartProps = {
  label: string;
  placeholder: string;
  options: number[];
  value: string | undefined;
  onSelect: (value: number) => void;
};

function Part({ label, placeholder, options, value, onSelect }: PartProps) {
  return (
    <Select value={value} onValueChange={(next) => onSelect(Number(next))}>
      <SelectTrigger className="min-w-24" aria-label={label}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={String(option)}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
