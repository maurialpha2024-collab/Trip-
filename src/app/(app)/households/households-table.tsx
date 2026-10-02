// Desktop view of the households list. The family name carries the link and
// stretches over the whole row, so the row is clickable without inventing a
// second, invisible control for screen readers.

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  StatusBadge,
  type HouseholdStatus,
} from "@/components/census/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { wilayas, type Locale } from "@/lib/constants";

export type HouseholdListRow = {
  id: string;
  familyName: string;
  largeFamilyName: string;
  smallFamilyName: string;
  personCount: number;
  wilaya: string | null;
  status: HouseholdStatus;
  date: string;
};

export function wilayaLabel(key: string | null, locale: Locale): string {
  if (key === null) {
    return "—";
  }
  return wilayas.find((item) => item.key === key)?.[locale] ?? key;
}

type TableProps = {
  rows: HouseholdListRow[];
  locale: Locale;
};

export async function HouseholdsTable({ rows, locale }: TableProps) {
  const t = await getTranslations("list");

  return (
    <div className="rounded-card border-line bg-surface hidden overflow-hidden border lg:block">
      <Table>
        <TableHeader className="bg-surface sticky top-0 z-10">
          <TableRow>
            <TableHead className="text-start">{t("familyName")}</TableHead>
            <TableHead className="text-start">{t("lineage")}</TableHead>
            <TableHead className="text-start">{t("people")}</TableHead>
            <TableHead className="text-start">{t("wilaya")}</TableHead>
            <TableHead className="text-start">{t("status")}</TableHead>
            <TableHead className="text-start">{t("date")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-indigo-soft/40 relative">
              <TableCell className="text-start">
                <Link
                  href={`/households/${row.id}`}
                  className="text-title-family text-ink after:absolute after:inset-0 hover:underline"
                >
                  {row.familyName}
                </Link>
              </TableCell>
              <TableCell className="text-small text-ink-muted text-start">
                {row.largeFamilyName} <span className="text-ochre">›</span>{" "}
                {row.smallFamilyName}
              </TableCell>
              <TableCell className="text-start">{row.personCount}</TableCell>
              <TableCell className="text-start">
                {wilayaLabel(row.wilaya, locale)}
              </TableCell>
              <TableCell className="text-start">
                <StatusBadge status={row.status} />
              </TableCell>
              <TableCell className="text-small text-ink-muted text-start">
                {row.date}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
