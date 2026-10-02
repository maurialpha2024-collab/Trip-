// The fields every person shares. The father, mother and child forms all use
// this and only differ in which optional fields they switch on.

"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { BirthDateInput } from "@/components/census/birth-date-input";
import { FormField } from "@/components/census/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  educationLevels,
  maritalStatuses,
  phonePrefix,
  wilayas,
  type Locale,
} from "@/lib/constants";
import { checkNni } from "./actions";
import type { PersonDraft } from "./types";

export type PersonFieldErrors = Partial<Record<keyof PersonDraft, string>>;

type PersonFieldsProps = {
  value: PersonDraft;
  onChange: (next: PersonDraft) => void;
  locale: Locale;
  showGender?: boolean;
  showPhone?: boolean;
  showJob?: boolean;
  showMaritalStatus?: boolean;
  mothers?: { id: string; name: string }[];
  errors?: PersonFieldErrors;
  // Lets the duplicate check ignore a match inside the household being edited,
  // so a person's own NNI is not reported against them.
  currentHouseholdId?: string | null;
};

export function PersonFields({
  value,
  onChange,
  locale,
  showGender = false,
  showPhone = true,
  showJob = true,
  showMaritalStatus = false,
  mothers,
  errors,
  currentHouseholdId = null,
}: PersonFieldsProps) {
  const t = useTranslations("fields");
  const tRegister = useTranslations("register");
  const groupId = useId();
  const feminine = value.gender === "female";
  const [nniWarning, setNniWarning] = useState<string | null>(null);

  async function verifyNni() {
    if (value.nni.length === 0) {
      setNniWarning(null);
      return;
    }

    const result = await checkNni(value.nni);
    const isAnotherHousehold =
      result.taken && result.householdId !== currentHouseholdId;

    setNniWarning(
      isAnotherHousehold && result.familyName
        ? tRegister("nniTaken", { family: result.familyName })
        : null
    );
  }

  function set<K extends keyof PersonDraft>(key: K, next: PersonDraft[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormField label={t("fullName")} error={errors?.fullName}>
          {(control) => (
            <Input
              {...control}
              value={value.fullName}
              onChange={(event) => set("fullName", event.target.value)}
            />
          )}
        </FormField>
      </div>

      {showGender ? (
        <fieldset className="space-y-1.5">
          <legend className="text-label text-ink">{t("gender")}</legend>
          <RadioGroup
            value={value.gender}
            onValueChange={(next) =>
              set("gender", next === "female" ? "female" : "male")
            }
            className="flex gap-6"
          >
            <span className="flex items-center gap-2">
              <RadioGroupItem value="male" id={`${groupId}-male`} />
              <Label htmlFor={`${groupId}-male`}>{t("male")}</Label>
            </span>
            <span className="flex items-center gap-2">
              <RadioGroupItem value="female" id={`${groupId}-female`} />
              <Label htmlFor={`${groupId}-female`}>{t("female")}</Label>
            </span>
          </RadioGroup>
        </fieldset>
      ) : null}

      <div className="space-y-1.5 sm:col-span-2">
        <p className="text-label text-ink text-start">{t("birthDate")}</p>
        <BirthDateInput
          value={value.birthDate}
          onChange={(next) => set("birthDate", next)}
        />
        {errors?.birthDate ? (
          <p className="text-small text-danger text-start">{errors.birthDate}</p>
        ) : null}
      </div>

      <FormField label={t("nni")} error={errors?.nni ?? nniWarning ?? undefined}>
        {(control) => (
          <Input
            {...control}
            inputMode="numeric"
            maxLength={10}
            value={value.nni}
            onChange={(event) => {
              setNniWarning(null);
              set("nni", event.target.value);
            }}
            onBlur={verifyNni}
          />
        )}
      </FormField>

      {showPhone ? (
        <FormField label={t("phone")} error={errors?.phone}>
          {(control) => (
            <div className="flex items-center gap-2">
              <span className="text-body text-ink-muted shrink-0">
                {phonePrefix}
              </span>
              <Input
                {...control}
                inputMode="tel"
                maxLength={8}
                value={value.phone}
                onChange={(event) => set("phone", event.target.value)}
              />
            </div>
          )}
        </FormField>
      ) : null}

      <OptionSelect
        label={t("wilaya")}
        value={value.wilaya}
        onChange={(next) => set("wilaya", next)}
        options={wilayas.map((item) => ({
          key: item.key,
          label: item[locale],
        }))}
        error={errors?.wilaya}
      />

      <OptionSelect
        label={t("education")}
        value={value.educationLevel}
        onChange={(next) => set("educationLevel", next)}
        options={educationLevels.map((item) => ({
          key: item.key,
          label: item[locale],
        }))}
        error={errors?.educationLevel}
      />

      {showJob ? (
        <FormField label={t("job")} error={errors?.job}>
          {(control) => (
            <Input
              {...control}
              value={value.job}
              onChange={(event) => set("job", event.target.value)}
            />
          )}
        </FormField>
      ) : null}

      {showMaritalStatus ? (
        <OptionSelect
          label={t("maritalStatus")}
          value={value.maritalStatus}
          onChange={(next) => set("maritalStatus", next)}
          options={maritalStatuses.map((item) => ({
            key: item.key,
            label: item[locale][feminine ? "female" : "male"],
          }))}
          error={errors?.maritalStatus}
        />
      ) : null}

      {mothers && mothers.length > 1 ? (
        <OptionSelect
          label={t("mother")}
          value={value.motherId ?? ""}
          onChange={(next) => set("motherId", next)}
          options={mothers.map((item) => ({ key: item.id, label: item.name }))}
          error={errors?.motherId}
        />
      ) : null}

      <fieldset className="space-y-1.5">
        <legend className="text-label text-ink">{t("alive")}</legend>
        <RadioGroup
          value={value.isAlive ? "alive" : "deceased"}
          onValueChange={(next) => set("isAlive", next === "alive")}
          className="flex gap-6"
        >
          <span className="flex items-center gap-2">
            <RadioGroupItem value="alive" id={`${groupId}-alive`} />
            <Label htmlFor={`${groupId}-alive`}>
              {feminine ? t("aliveFemale") : t("aliveMale")}
            </Label>
          </span>
          <span className="flex items-center gap-2">
            <RadioGroupItem value="deceased" id={`${groupId}-deceased`} />
            <Label htmlFor={`${groupId}-deceased`}>
              {feminine ? t("deceasedFemale") : t("deceasedMale")}
            </Label>
          </span>
        </RadioGroup>
      </fieldset>
    </div>
  );
}

type OptionSelectProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: { key: string; label: string }[];
  error?: string;
};

// Exported so the household step can offer the same wilaya list.
export function OptionSelect({
  label,
  value,
  onChange,
  options,
  error,
}: OptionSelectProps) {
  return (
    <FormField label={label} error={error}>
      {(control) => (
        <Select value={value === "" ? undefined : value} onValueChange={onChange}>
          <SelectTrigger id={control.id} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  );
}
