// The four headline numbers across the top of the dashboard.

import { getTranslations } from "next-intl/server";
import { StatCard } from "@/components/census/stat-card";

type TotalsRowProps = {
  households: number;
  persons: number;
  largeFamilies: number;
  smallFamilies: number;
  thisWeek: number;
  drafts: number;
};

export async function TotalsRow({
  households,
  persons,
  largeFamilies,
  smallFamilies,
  thisWeek,
  drafts,
}: TotalsRowProps) {
  const t = await getTranslations("dashboard");

  return (
    <div className="stagger-rise grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t("households")}
        value={households}
        change={t("newCount", { count: String(thisWeek) })}
      />
      <StatCard label={t("persons")} value={persons} />
      <StatCard
        label={t("largeFamilies")}
        value={largeFamilies}
        change={t("smallFamiliesCount", { count: String(smallFamilies) })}
      />
      <StatCard
        label={t("thisWeek")}
        value={thisWeek}
        change={t("draftsCount", { count: String(drafts) })}
      />
    </div>
  );
}
