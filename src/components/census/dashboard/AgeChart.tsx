// Age groups as horizontal bars, each labelled with its own count.

import { getTranslations } from "next-intl/server";

export type AgeBucket = {
  label: string;
  count: number;
};

export async function AgeChart({ buckets }: { buckets: AgeBucket[] }) {
  const t = await getTranslations("dashboard");
  const largest = Math.max(...buckets.map((bucket) => bucket.count), 1);

  return (
    <section className="rounded-card border-line bg-surface space-y-3 border p-4">
      <h2 className="text-heading text-ink text-start">{t("ageGroups")}</h2>

      <ul className="space-y-2">
        {buckets.map((bucket) => (
          <li key={bucket.label} className="space-y-1">
            <span className="text-small text-ink-muted block text-start">
              {bucket.label}
            </span>
            <span className="flex items-center gap-2">
              <span
                className="bg-indigo h-3 rounded-full"
                style={{
                  width: `${Math.max((bucket.count / largest) * 100, 2)}%`,
                }}
              />
              <span className="text-small text-ink shrink-0">
                {bucket.count}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
