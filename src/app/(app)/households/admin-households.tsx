// The admin's view of every household: full search across names, NNI and phone,
// and every filter. Agents never reach this; they get MyHouseholds instead.

import { UsersIcon } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/census/empty-state";
import { PageHeader } from "@/components/census/page-header";
import { Pagination } from "@/components/census/Pagination";
import { Button } from "@/components/ui/button";
import { defaultLocale, isLocale } from "@/i18n/locale";
import { normalizeArabic } from "@/lib/arabic";
import { createClient } from "@/lib/supabase/server";
import { HouseholdsCards } from "./households-cards";
import { HouseholdsFilters, type FilterFamily } from "./households-filters";
import { HouseholdsTable, type HouseholdListRow } from "./households-table";
import { listHref, pageFrom, pageSize, type ListParams } from "./list-params";

// % and _ are wildcards in ILIKE, so a typed one must not widen the search.
function escapeForLike(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export async function AdminHouseholds({ params }: { params: ListParams }) {
  const supabase = await createClient();
  const t = await getTranslations("list");
  const tNav = await getTranslations("nav");

  const localeValue = await getLocale();
  const locale = isLocale(localeValue) ? localeValue : defaultLocale;

  const currentPage = pageFrom(params.page);
  const from = (currentPage - 1) * pageSize;

  let query = supabase
    .from("household_search")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (params.q) {
    query = query.ilike(
      "search_all",
      `%${escapeForLike(normalizeArabic(params.q))}%`
    );
  }
  if (params.large) {
    query = query.eq("large_family_id", params.large);
  }
  if (params.small) {
    query = query.eq("small_family_id", params.small);
  }
  if (params.wilaya) {
    query = query.eq("wilaya", params.wilaya);
  }
  if (params.status) {
    query = query.eq("status", params.status);
  }
  if (params.agent) {
    query = query.eq("created_by", params.agent);
  }

  const [{ data, count }, { data: largeFamilies }, { data: agentRows }] =
    await Promise.all([
      query,
      supabase
        .from("large_families")
        .select("id, name, small_families(id, name)")
        .order("name"),
      supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "agent")
        .order("full_name"),
    ]);

  const rows: HouseholdListRow[] = (data ?? []).map((row) => ({
    id: row.id ?? "",
    familyName: row.family_name ?? "",
    largeFamilyName: row.large_family_name ?? "",
    smallFamilyName: row.small_family_name ?? "",
    personCount: Number(row.person_count ?? 0),
    wilaya: row.wilaya,
    status: row.status === "complete" ? "complete" : "draft",
    date: row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-GB")
      : "",
  }));

  const filterFamilies: FilterFamily[] = (largeFamilies ?? []).map(
    (family) => ({
      id: family.id,
      name: family.name,
      smallFamilies: family.small_families,
    })
  );

  const total = count ?? 0;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const hasFilters = ["q", "large", "small", "wilaya", "status", "agent"].some(
    (key) => params[key]
  );

  return (
    <div className="stagger-rise space-y-6">
      <PageHeader
        title={tNav("households")}
        description={t("count", { count: String(total) })}
        actions={
          <Button asChild>
            <Link href="/households/new">{tNav("register")}</Link>
          </Button>
        }
      />

      <HouseholdsFilters
        largeFamilies={filterFamilies}
        locale={locale}
        agents={(agentRows ?? []).map((agent) => ({
          id: agent.id,
          fullName: agent.full_name,
        }))}
      />

      {rows.length === 0 ? (
        hasFilters ? (
          <p className="text-body text-ink-muted rounded-card border-line bg-surface border border-dashed p-6 text-center">
            {t("noResults")}
          </p>
        ) : (
          <EmptyState
            icon={UsersIcon}
            message={t("empty")}
            action={
              <Button asChild>
                <Link href="/households/new">{tNav("register")}</Link>
              </Button>
            }
          />
        )
      ) : (
        <>
          <HouseholdsTable rows={rows} locale={locale} />
          <HouseholdsCards rows={rows} locale={locale} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hrefFor={(page) => listHref(params, page)}
          />
        </>
      )}
    </div>
  );
}
