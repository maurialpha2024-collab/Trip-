// Phone view of the households list: one card per household.

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { StatusBadge } from "@/components/census/status-badge";
import type { Locale } from "@/lib/constants";
import { wilayaLabel, type HouseholdListRow } from "./households-table";

type CardsProps = {
  rows: HouseholdListRow[];
  locale: Locale;
};

export async function HouseholdsCards({ rows, locale }: CardsProps) {
  const t = await getTranslations("list");

  return (
    <ul className="stagger-rise space-y-2 lg:hidden">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            href={`/households/${row.id}`}
            className="rounded-card border-line bg-surface hover:border-indigo/40 block border p-4 text-start transition active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-title-family text-ink">
                {row.familyName}
              </span>
              <StatusBadge status={row.status} />
            </div>

            <p className="text-small text-ink-muted mt-1">
              {row.largeFamilyName} <span className="text-ochre">›</span>{" "}
              {row.smallFamilyName}
            </p>

            <p className="text-small text-ink-muted mt-1">
              {t("people")}: {row.personCount} ·{" "}
              {wilayaLabel(row.wilaya, locale)} · {row.date}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
