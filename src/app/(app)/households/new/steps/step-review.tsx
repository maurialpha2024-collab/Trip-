// Step 7: the whole household as a small family tree, joined by the ochre rail.
// Every block can jump back to the step that produced it.

"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  educationLevels,
  maritalStatuses,
  phonePrefix,
  wilayas,
  type Locale,
} from "@/lib/constants";
import { ageFromBirthDate } from "@/lib/validation/person";
import type { PersonDraft, WizardDraft } from "../types";

type StepReviewProps = {
  draft: WizardDraft;
  largeFamilyName: string;
  smallFamilyName: string;
  locale: Locale;
  onEditStep: (step: number) => void;
};

export function StepReview({
  draft,
  largeFamilyName,
  smallFamilyName,
  locale,
  onEditStep,
}: StepReviewProps) {
  const t = useTranslations();
  const dash = t("fields.empty");

  function lookup(
    list: { key: string; ar: string; fr: string }[],
    key: string
  ): string {
    return list.find((item) => item.key === key)?.[locale] ?? dash;
  }

  function maritalLabel(person: PersonDraft): string {
    const match = maritalStatuses.find(
      (item) => item.key === person.maritalStatus
    );
    if (!match) {
      return dash;
    }
    return match[locale][person.gender === "female" ? "female" : "male"];
  }

  function facts(person: PersonDraft): { label: string; value: string }[] {
    const age = ageFromBirthDate(person.birthDate);

    return [
      {
        label: t("fields.birthDate"),
        value: age === null ? dash : t("person.age", { count: String(age) }),
      },
      { label: t("fields.nni"), value: person.nni || dash },
      {
        label: t("fields.phone"),
        value: person.phone ? `${phonePrefix}${person.phone}` : dash,
      },
      { label: t("fields.wilaya"), value: lookup(wilayas, person.wilaya) },
      { label: t("fields.job"), value: person.job || dash },
      {
        label: t("fields.education"),
        value: lookup(educationLevels, person.educationLevel),
      },
      { label: t("fields.maritalStatus"), value: maritalLabel(person) },
    ];
  }

  function PersonBlock({
    person,
    step,
  }: {
    person: PersonDraft;
    step: number;
  }) {
    return (
      <div className="rounded-card border-line bg-surface border p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-title-family text-ink text-start">
            {person.fullName || dash}
          </p>
          <Button variant="ghost" onClick={() => onEditStep(step)}>
            {t("common.edit")}
          </Button>
        </div>

        <dl className="text-small mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {facts(person).map((fact) => (
            <div key={fact.label} className="flex gap-2 text-start">
              <dt className="text-ink-muted shrink-0">{fact.label}:</dt>
              <dd className="text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <div className="border-ochre/40 space-y-5 border-s-2 ps-4">
      <div className="rounded-card border-line bg-surface border p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-title-family text-ink text-start">
            {largeFamilyName} <span className="text-ochre">‹</span>{" "}
            {smallFamilyName} <span className="text-ochre">‹</span>{" "}
            {draft.familyName || dash}
          </p>
          <Button variant="ghost" onClick={() => onEditStep(3)}>
            {t("common.edit")}
          </Button>
        </div>
        <p className="text-small text-ink-muted mt-1 text-start">
          {lookup(wilayas, draft.wilaya)} · {draft.city || dash}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {draft.father ? <PersonBlock person={draft.father} step={4} /> : null}
        {draft.mothers.map((mother, index) => (
          <PersonBlock
            key={mother.id ?? `mother-${index}`}
            person={mother}
            step={5}
          />
        ))}
      </div>

      {draft.hasNoChildren ? (
        <p className="text-body text-ink-muted text-start">
          {t("register.noChildren")}
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-heading text-ink text-start">
              {t("steps.children")}
            </h3>
            <Button variant="ghost" onClick={() => onEditStep(6)}>
              {t("common.edit")}
            </Button>
          </div>

          {draft.children.map((child, index) => (
            <PersonBlock
              key={child.id ?? `child-${index}`}
              person={child}
              step={6}
            />
          ))}
        </div>
      )}
    </div>
  );
}
