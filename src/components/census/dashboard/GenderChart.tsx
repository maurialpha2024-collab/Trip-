// Gender split as one two-part bar. The numbers and percentages are written on
// it, so colour is never the only way to read the chart.

import { getTranslations } from "next-intl/server";

type GenderChartProps = {
  males: number;
  females: number;
};

export async function GenderChart({ males, females }: GenderChartProps) {
  const t = await getTranslations("dashboard");
  const total = Math.max(males + females, 1);
  const malePercent = Math.round((males / total) * 100);

  return (
    <section className="rounded-card border-line bg-surface space-y-3 border p-4">
      <h2 className="text-heading text-ink text-start">{t("gender")}</h2>

      <div className="flex h-8 overflow-hidden rounded-full">
        <div
          className="bg-indigo flex items-center justify-center"
          style={{ width: `${malePercent}%` }}
        />
        <div className="bg-chart-3 flex-1" />
      </div>

      <dl className="text-small grid grid-cols-2 gap-2">
        <div className="text-start">
          <dt className="text-ink-muted">{t("males")}</dt>
          <dd className="text-ink">
            {males} · {malePercent}%
          </dd>
        </div>
        <div className="text-start">
          <dt className="text-ink-muted">{t("females")}</dt>
          <dd className="text-ink">
            {females} · {100 - malePercent}%
          </dd>
        </div>
      </dl>
    </section>
  );
}
