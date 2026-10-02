// How each agent is doing. Any column can be sorted, and a row opens that
// agent's households.

"use client";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type AgentRow = {
  id: string;
  fullName: string;
  complete: number;
  drafts: number;
  lastEntry: string | null;
};

type SortKey = keyof Pick<
  AgentRow,
  "fullName" | "complete" | "drafts" | "lastEntry"
>;

export function AgentsTable({ agents }: { agents: AgentRow[] }) {
  const t = useTranslations("dashboard");
  const [sortKey, setSortKey] = useState<SortKey>("complete");
  const [ascending, setAscending] = useState(false);

  const sorted = [...agents].sort((a, b) => {
    const left = a[sortKey] ?? "";
    const right = b[sortKey] ?? "";
    const result =
      typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right));

    return ascending ? result : -result;
  });

  function toggle(key: SortKey) {
    if (key === sortKey) {
      setAscending((current) => !current);
      return;
    }
    setSortKey(key);
    setAscending(false);
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "fullName", label: t("agentName") },
    { key: "complete", label: t("complete") },
    { key: "drafts", label: t("drafts") },
    { key: "lastEntry", label: t("lastEntry") },
  ];

  return (
    <section className="rounded-card border-line bg-surface space-y-3 border p-4">
      <h2 className="text-heading text-ink text-start">{t("agents")}</h2>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className="text-start">
                <button
                  type="button"
                  onClick={() => toggle(column.key)}
                  className="flex h-11 items-center gap-1"
                  aria-label={column.label}
                >
                  {column.label}
                  {sortKey === column.key ? (
                    ascending ? (
                      <ChevronUpIcon className="size-3" aria-hidden="true" />
                    ) : (
                      <ChevronDownIcon className="size-3" aria-hidden="true" />
                    )
                  ) : null}
                </button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {sorted.map((agent) => (
            <TableRow key={agent.id} className="hover:bg-indigo-soft/40 relative">
              <TableCell className="text-start">
                <Link
                  href={`/households?agent=${agent.id}`}
                  className="text-ink after:absolute after:inset-0 hover:underline"
                >
                  {agent.fullName}
                </Link>
              </TableCell>
              <TableCell className="text-start">{agent.complete}</TableCell>
              <TableCell className="text-start">{agent.drafts}</TableCell>
              <TableCell className="text-small text-ink-muted text-start">
                {agent.lastEntry ?? t("never")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
