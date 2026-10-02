// Step 1: choose the large family. Picking a row moves straight to step 2.

"use client";

import { useTranslations } from "next-intl";
import type { LargeFamilyOption } from "../types";
import { SelectableList } from "./selectable-list";

type StepLargeFamilyProps = {
  families: LargeFamilyOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function StepLargeFamily({
  families,
  selectedId,
  onSelect,
}: StepLargeFamilyProps) {
  const t = useTranslations();

  return (
    <SelectableList
      searchLabel={t("steps.largeFamily")}
      selectedId={selectedId}
      onSelect={onSelect}
      items={families.map((family) => ({
        id: family.id,
        name: family.name,
        detail:
          family.householdCount === null
            ? t("register.smallCount", {
                small: String(family.smallFamilies.length),
              })
            : t("register.familyCounts", {
                small: String(family.smallFamilies.length),
                households: String(family.householdCount),
              }),
      }))}
    />
  );
}
