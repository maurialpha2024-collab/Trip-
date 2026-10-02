// Step 2: choose the small family inside the chosen large family.

"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { LargeFamilyOption } from "../types";
import { SelectableList } from "./selectable-list";

type StepSmallFamilyProps = {
  largeFamily: LargeFamilyOption;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChangeLargeFamily: () => void;
};

export function StepSmallFamily({
  largeFamily,
  selectedId,
  onSelect,
  onChangeLargeFamily,
}: StepSmallFamilyProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-title-family text-ink text-start">
          {largeFamily.name}
        </p>
        <Button variant="ghost" onClick={onChangeLargeFamily}>
          {t("register.changeLargeFamily")}
        </Button>
      </div>

      {largeFamily.smallFamilies.length === 0 ? (
        <p className="text-body text-ink-muted rounded-card border-line bg-surface border border-dashed p-6 text-start">
          {t("register.noSmallFamilies")}
        </p>
      ) : (
        <SelectableList
          searchLabel={t("steps.smallFamily")}
          selectedId={selectedId}
          onSelect={onSelect}
          items={largeFamily.smallFamilies.map((family) => ({
            id: family.id,
            name: family.name,
          }))}
        />
      )}
    </div>
  );
}
