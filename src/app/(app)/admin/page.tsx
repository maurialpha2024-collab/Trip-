// Admin dashboard: how far the census has come, which families are covered,
// and how each agent is doing.

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/census/page-header";
import { AgeChart } from "@/components/census/dashboard/AgeChart";
import { AgentsTable, type AgentRow } from "@/components/census/dashboard/AgentsTable";
import {
  FamilyTreeChart,
  type FamilyBar,
} from "@/components/census/dashboard/FamilyTreeChart";
import { GenderChart } from "@/components/census/dashboard/GenderChart";
import { TotalsRow } from "@/components/census/dashboard/TotalsRow";
import {
  WeeklyChart,
  type DailyPoint,
} from "@/components/census/dashboard/WeeklyChart";
import { EmptyState } from "@/components/census/empty-state";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ageFromStoredDate } from "@/lib/validation/person";
import { GitBranchIcon } from "lucide-react";

const chartDays = 30;

export default async function AdminDashboardPage() {
  await requireAdmin();

  const supabase = await createClient();
  const t = await getTranslations("dashboard");
  const tNav = await getTranslations("nav");

  // One round of queries for everything. An empty census wastes a few cheap
  // queries, but a census with data no longer waits for the totals first.
  const [
    { data: totals },
    { data: familyStats },
    { data: smallFamilies },
    { data: householdRows },
    { data: people },
    { data: agentStats },
    { count: draftCount },
  ] = await Promise.all([
    supabase.from("census_totals").select("*").maybeSingle(),
    supabase.from("large_family_stats").select("*").order("name"),
    supabase.from("small_families").select("id, name, large_family_id"),
    supabase.from("households").select("small_family_id, status, created_at"),
    supabase.from("persons").select("gender, birth_date, birth_date_precision"),
    supabase.from("agent_stats").select("*"),
    supabase
      .from("households")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft"),
  ]);

  const householdCount = Number(totals?.household_count ?? 0);

  if (householdCount === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title={tNav("dashboard")} />
        <EmptyState
          icon={GitBranchIcon}
          message={t("empty")}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/admin/families">{tNav("families")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/agents">{tNav("staff")}</Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const perSmallFamily = new Map<string, number>();
  for (const row of householdRows ?? []) {
    perSmallFamily.set(
      row.small_family_id,
      (perSmallFamily.get(row.small_family_id) ?? 0) + 1
    );
  }

  const families: FamilyBar[] = (familyStats ?? [])
    .map((family) => ({
      id: family.id ?? "",
      name: family.name ?? "",
      households: Number(family.household_count ?? 0),
      smallFamilies: (smallFamilies ?? [])
        .filter((small) => small.large_family_id === family.id)
        .map((small) => ({
          id: small.id,
          name: small.name,
          households: perSmallFamily.get(small.id) ?? 0,
        }))
        .sort((a, b) => b.households - a.households),
    }))
    .sort((a, b) => b.households - a.households);

  const males = (people ?? []).filter((p) => p.gender === "male").length;
  const females = (people ?? []).filter((p) => p.gender === "female").length;

  const ages = (people ?? [])
    .map((person) =>
      ageFromStoredDate(person.birth_date, person.birth_date_precision)
    )
    .filter((age): age is number => age !== null);

  const buckets = [
    { label: "0–14", count: ages.filter((age) => age <= 14).length },
    {
      label: "15–24",
      count: ages.filter((age) => age >= 15 && age <= 24).length,
    },
    {
      label: "25–59",
      count: ages.filter((age) => age >= 25 && age <= 59).length,
    },
    { label: "60+", count: ages.filter((age) => age >= 60).length },
  ];

  const perDay = new Map<string, number>();
  for (const row of householdRows ?? []) {
    if (row.status !== "complete") {
      continue;
    }
    const key = row.created_at.slice(0, 10);
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }

  const points: DailyPoint[] = Array.from({ length: chartDays }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (chartDays - 1 - index));
    const key = day.toISOString().slice(0, 10);

    return {
      date: `${key.slice(8, 10)}/${key.slice(5, 7)}`,
      count: perDay.get(key) ?? 0,
    };
  });

  const agents: AgentRow[] = (agentStats ?? []).map((agent) => ({
    id: agent.agent_id ?? "",
    fullName: agent.full_name ?? "",
    complete: Number(agent.complete_households ?? 0),
    drafts: Number(agent.draft_households ?? 0),
    lastEntry: agent.last_entry_at
      ? new Date(agent.last_entry_at).toLocaleDateString("en-GB")
      : null,
  }));

  return (
    <div className="stagger-rise space-y-6">
      <PageHeader title={tNav("dashboard")} />

      <TotalsRow
        households={householdCount}
        persons={Number(totals?.person_count ?? 0)}
        largeFamilies={Number(totals?.large_family_count ?? 0)}
        smallFamilies={(smallFamilies ?? []).length}
        thisWeek={Number(totals?.households_last_7_days ?? 0)}
        drafts={draftCount ?? 0}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <FamilyTreeChart families={families} />
        </div>

        <div className="space-y-4">
          <WeeklyChart points={points} />
          <GenderChart males={males} females={females} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AgeChart buckets={buckets} />
        <AgentsTable agents={agents} />
      </div>
    </div>
  );
}
