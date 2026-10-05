// The agent's finished households: one quiet list, name and lineage on the
// start side, size and date on the end side. Rows do not link anywhere because
// once a household is finished only the admin may open it.

import { UsersIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import type { Tables } from "@/lib/supabase/types";

type MyFinishedListProps = {
  rows: Tables<"my_households">[];
  total: number;
  // The pagination, placed under the list.
  footer: ReactNode;
};

export async function MyFinishedList({ rows, total, footer }: MyFinishedListProps) {
  const t = await getTranslations("mine");

  return (
    <section aria-labelledby="done-title" className="space-y-3">
      <h2 id="done-title" className="text-heading text-ink flex items-center gap-2 text-start">
        {t("doneTitle")}
        <span className="text-small bg-indigo-soft text-indigo rounded-control px-2 py-0.5 font-medium tabular-nums">
          {total}
        </span>
      </h2>

      {rows.length === 0 ? (
        <p className="text-body text-ink-muted rounded-card border-line border border-dashed p-6 text-center">
          {t("doneEmpty")}
        </p>
      ) : (
        <ul className="stagger-rise rounded-card border-line bg-surface divide-line divide-y overflow-hidden border">
          {rows.map((row) => (
            <li
              key={row.id}
              className="hover:bg-indigo-soft/40 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 transition-colors"
            >
              <div className="min-w-0 text-start">
                <p className="text-title-family text-ink truncate">
                  {row.family_name}
                </p>
                <p className="text-small text-ink-muted truncate">
                  {row.large_family_name}{" "}
                  <span className="text-ochre">›</span> {row.small_family_name}
                </p>
              </div>

              <div className="text-small text-ink-muted flex shrink-0 items-center gap-4 tabular-nums">
                <span className="flex items-center gap-1.5">
                  <UsersIcon className="size-4" aria-hidden="true" />
                  {t("people", { count: String(Number(row.person_count ?? 0)) })}
                </span>
                {row.created_at ? (
                  <time dateTime={row.created_at}>
                    {new Date(row.created_at).toLocaleDateString("en-GB")}
                  </time>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {footer}
    </section>
  );
}
