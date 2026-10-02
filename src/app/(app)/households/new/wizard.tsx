// The registration wizard: which step is open, the lineage rail beside it, and
// saving each step to the database as the agent moves forward.

"use client";

import { WifiOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/constants";
import {
  completeHousehold,
  saveHouseholdStep,
  savePeopleStep,
  type PersonRole,
} from "./actions";
import { PersonFields } from "./person-fields";
import { StepChildren } from "./steps/step-children";
import { StepHousehold } from "./steps/step-household";
import { StepLargeFamily } from "./steps/step-large-family";
import { StepMothers } from "./steps/step-mothers";
import { StepReview } from "./steps/step-review";
import { StepSmallFamily } from "./steps/step-small-family";
import {
  emptyPerson,
  toPersonInput,
  type LargeFamilyOption,
  type PersonDraft,
  type WizardDraft,
} from "./types";
import { backupKey, useOfflineBackup } from "./use-offline-backup";

const stepKeys = [
  "largeFamily",
  "smallFamily",
  "household",
  "father",
  "mother",
  "children",
  "review",
] as const;

type WizardProps = {
  families: LargeFamilyOption[];
  initialDraft: WizardDraft;
  initialStep: number;
  locale: Locale;
};

export function Wizard({
  families,
  initialDraft,
  initialStep,
  locale,
}: WizardProps) {
  const t = useTranslations();
  const [draft, setDraft] = useState(initialDraft);
  const [step, setStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsaved, setUnsaved] = useState(false);

  // Browsers show their own wording here and ignore any custom message, so this
  // only decides whether the confirmation appears at all.
  useEffect(() => {
    if (!unsaved) {
      return;
    }

    const confirmLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", confirmLeave);
    return () => window.removeEventListener("beforeunload", confirmLeave);
  }, [unsaved]);

  const { isOnline } = useOfflineBackup(
    backupKey(draft.householdId ?? "new"),
    draft
  );

  const largeFamily =
    families.find((family) => family.id === draft.largeFamilyId) ?? null;
  const smallFamily =
    largeFamily?.smallFamilies.find(
      (family) => family.id === draft.smallFamilyId
    ) ?? null;

  const patch = useCallback((next: Partial<WizardDraft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setUnsaved(true);
  }, []);

  // One request saves every person of the step, deletes anyone the agent
  // removed, and moves the draft on. Returns the people with their new ids, or
  // null after showing why it failed.
  async function persistPeople(
    householdId: string,
    role: PersonRole,
    people: PersonDraft[],
    nextStep: number,
    hasNoChildren: boolean | null = null
  ): Promise<PersonDraft[] | null> {
    const result = await savePeopleStep({
      householdId,
      role,
      nextStep,
      hasNoChildren,
      people: people.map((person) => ({
        id: person.id,
        fields: toPersonInput(person),
      })),
    });

    if (!result.ok) {
      setError(result.message);
      return null;
    }

    return people.map((person, index) => ({
      ...person,
      id: result.data.ids[index],
    }));
  }

  async function goNext() {
    setError(null);
    setSaving(true);

    try {
      if (step === 3) {
        const result = await saveHouseholdStep(
          {
            smallFamilyId: draft.smallFamilyId,
            familyName: draft.familyName,
            wilaya: draft.wilaya,
            city: draft.city,
            addressNotes: draft.addressNotes,
          },
          draft.householdId
        );

        if (!result.ok) {
          setError(result.message);
          return;
        }

        patch({ householdId: result.data.id });
        setStep(4);
        return;
      }

      const householdId = draft.householdId;
      if (!householdId) {
        return;
      }

      const next = step + 1;

      if (step === 4) {
        const saved = await persistPeople(
          householdId,
          "father",
          draft.father ? [draft.father] : [],
          next
        );
        if (saved === null) {
          return;
        }
        patch({ father: saved[0] ?? null });
      }

      if (step === 5) {
        const saved = await persistPeople(
          householdId,
          "mother",
          draft.mothers,
          next
        );
        if (saved === null) {
          return;
        }
        patch({ mothers: saved });
      }

      if (step === 6) {
        const saved = await persistPeople(
          householdId,
          "child",
          draft.hasNoChildren ? [] : draft.children,
          next,
          draft.hasNoChildren
        );
        if (saved === null) {
          return;
        }
        patch({ children: saved });
      }

      setUnsaved(false);
      setStep(next);
    } finally {
      setSaving(false);
    }
  }

  const stepName = t(`steps.${stepKeys[step - 1]}`);
  const nextName = step < 7 ? t(`steps.${stepKeys[step]}`) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <header className="space-y-1">
          <h1 className="text-title-page text-ink text-start">
            {t("register.title")}
          </h1>
          <p className="text-small text-ink-muted text-start">
            {t("register.stepOf", { step: String(step), name: stepName })}
          </p>

          {/* The chosen families, as plain text, once steps 1 and 2 are done. */}
          {step >= 3 && largeFamily && smallFamily ? (
            <p className="font-heading text-ink pt-1 text-start text-lg">
              {largeFamily.name} <span className="text-ochre">›</span>{" "}
              {smallFamily.name}
            </p>
          ) : null}
        </header>

        {!isOnline ? (
          <p className="text-small text-warning bg-warning/10 rounded-control flex items-center gap-2 p-3 text-start">
            <WifiOffIcon className="size-4 shrink-0" aria-hidden="true" />
            {t("register.offline")}
          </p>
        ) : null}

        <div className="rounded-card border-line bg-surface max-w-[720px] border p-4 sm:p-6">
          <StepBody
            step={step}
            draft={draft}
            families={families}
            largeFamily={largeFamily}
            locale={locale}
            patch={patch}
            setStep={setStep}
          />
        </div>

        {error ? (
          <p role="alert" className="text-small text-danger text-start">
            {error}
          </p>
        ) : null}

        {step >= 3 ? (
          <div className="border-line bg-surface sticky bottom-0 flex items-center justify-between gap-3 border-t py-3 lg:static lg:border-0 lg:bg-transparent">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={saving}
            >
              {t("register.back")}
            </Button>

            {step < 7 && nextName ? (
              <Button onClick={goNext} loading={saving}>
                {t("register.next", { name: nextName })}
              </Button>
            ) : (
              <Button
                loading={saving}
                onClick={async () => {
                  if (draft.householdId) {
                    setSaving(true);
                    await completeHousehold(draft.householdId);
                  }
                }}
              >
                {t("register.saveHousehold")}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type StepBodyProps = {
  step: number;
  draft: WizardDraft;
  families: LargeFamilyOption[];
  largeFamily: LargeFamilyOption | null;
  locale: Locale;
  patch: (next: Partial<WizardDraft>) => void;
  setStep: (step: number) => void;
};

function StepBody({
  step,
  draft,
  families,
  largeFamily,
  locale,
  patch,
  setStep,
}: StepBodyProps) {
  if (step === 1) {
    return (
      <StepLargeFamily
        families={families}
        selectedId={draft.largeFamilyId}
        onSelect={(id) => {
          patch({ largeFamilyId: id, smallFamilyId: null });
          setStep(2);
        }}
      />
    );
  }

  if (step === 2 && largeFamily) {
    return (
      <StepSmallFamily
        largeFamily={largeFamily}
        selectedId={draft.smallFamilyId}
        onSelect={(id) => {
          patch({ smallFamilyId: id });
          setStep(3);
        }}
        onChangeLargeFamily={() => setStep(1)}
      />
    );
  }

  if (step === 3) {
    return <StepHousehold draft={draft} onChange={patch} locale={locale} />;
  }

  if (step === 4) {
    const father = draft.father ?? emptyPerson("father");
    return (
      <PersonFields
        value={father}
        onChange={(next) => patch({ father: next })}
        locale={locale}
        currentHouseholdId={draft.householdId}
        showPhone
        showJob
      />
    );
  }

  if (step === 5) {
    return (
      <StepMothers
        values={draft.mothers}
        onChange={(next) => patch({ mothers: next })}
        locale={locale}
        currentHouseholdId={draft.householdId}
      />
    );
  }

  if (step === 6) {
    return (
      <StepChildren
        values={draft.children}
        onChange={(next) => patch({ children: next })}
        hasNoChildren={draft.hasNoChildren}
        onHasNoChildrenChange={(value) => patch({ hasNoChildren: value })}
        mothers={draft.mothers
          .filter((mother) => mother.id !== null)
          .map((mother) => ({ id: mother.id ?? "", name: mother.fullName }))}
        locale={locale}
        currentHouseholdId={draft.householdId}
      />
    );
  }

  return (
    <StepReview
      draft={draft}
      largeFamilyName={largeFamily?.name ?? ""}
      smallFamilyName={
        largeFamily?.smallFamilies.find(
          (family) => family.id === draft.smallFamilyId
        )?.name ?? ""
      }
      locale={locale}
      onEditStep={setStep}
    />
  );
}
