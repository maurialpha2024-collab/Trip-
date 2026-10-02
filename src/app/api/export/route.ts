// Builds the census export. Admin only, and generated on the server so the raw
// rows never travel through the browser. Every download is written to
// audit_log with the filters used, but never with the data itself.

import { getLocale, getTranslations } from "next-intl/server";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/locale";
import { requireAdmin } from "@/lib/auth";
import {
  educationLevels,
  maritalStatuses,
  wilayas,
  type Locale,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { ageFromStoredDate } from "@/lib/validation/person";
import { buildWorkbook } from "./workbook";

const spreadsheetType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function labelFrom(
  list: { key: string; ar: string; fr: string }[],
  key: string | null,
  locale: Locale
): string {
  if (key === null) {
    return "";
  }
  return list.find((item) => item.key === key)?.[locale] ?? key;
}

export async function GET(request: NextRequest) {
  await requireAdmin();

  const params = request.nextUrl.searchParams;
  const large = params.get("large");
  const small = params.get("small");
  const completeOnly = params.get("status") !== "all";
  const hideSensitive = params.get("hide") === "1";

  const localeValue = await getLocale();
  const locale = isLocale(localeValue) ? localeValue : defaultLocale;
  const t = await getTranslations("export");
  const tStatus = await getTranslations("status");

  const supabase = await createClient();

  let query = supabase
    .from("households")
    .select(
      "id, family_name, wilaya, city, status, created_at, small_family_id, small_families!inner(id, name, large_family_id, large_families!inner(id, name)), recorder:profiles!households_created_by_fkey(full_name)"
    )
    .order("created_at");

  if (completeOnly) {
    query = query.eq("status", "complete");
  }
  if (small) {
    query = query.eq("small_family_id", small);
  }
  if (large) {
    query = query.eq("small_families.large_family_id", large);
  }

  const { data: households } = await query;
  const chosen = households ?? [];
  const chosenIds = new Set(chosen.map((household) => household.id));

  // Filtering in memory rather than sending thousands of ids back as a URL
  // filter, which PostgREST would refuse for length.
  const { data: allPeople } = await supabase
    .from("persons")
    .select(
      "household_id, role, full_name, gender, birth_date, birth_date_precision, nni, phone, wilaya, job, education_level, marital_status, is_alive, sort_order"
    )
    .order("sort_order");

  const people = (allPeople ?? []).filter((person) =>
    chosenIds.has(person.household_id)
  );

  const byHousehold = new Map(chosen.map((household) => [household.id, household]));
  const peopleCount = new Map<string, number>();
  for (const person of people) {
    peopleCount.set(
      person.household_id,
      (peopleCount.get(person.household_id) ?? 0) + 1
    );
  }

  const columns = (key: string) => t(`columns.${key}`);

  const householdSheet = {
    name: t("sheetHouseholds"),
    headers: [
      columns("largeFamily"),
      columns("smallFamily"),
      columns("familyName"),
      columns("wilaya"),
      columns("city"),
      columns("persons"),
      columns("status"),
      columns("agent"),
      columns("date"),
    ],
    rows: chosen.map((household) => [
      household.small_families.large_families.name,
      household.small_families.name,
      household.family_name,
      labelFrom(wilayas, household.wilaya, locale),
      household.city ?? "",
      peopleCount.get(household.id) ?? 0,
      household.status === "complete" ? tStatus("complete") : tStatus("draft"),
      household.recorder?.full_name ?? "",
      household.created_at.slice(0, 10),
    ]),
  };

  function roleLabel(role: string, gender: string | null): string {
    if (role === "father") {
      return t("roles.father");
    }
    if (role === "mother") {
      return t("roles.mother");
    }
    return gender === "female" ? t("roles.daughter") : t("roles.son");
  }

  const personSheet = {
    name: t("sheetPersons"),
    headers: [
      columns("largeFamily"),
      columns("smallFamily"),
      columns("familyName"),
      columns("role"),
      columns("fullName"),
      columns("gender"),
      columns("birthDate"),
      columns("age"),
      columns("nni"),
      columns("phone"),
      columns("wilaya"),
      columns("job"),
      columns("education"),
      columns("maritalStatus"),
      columns("alive"),
    ],
    rows: people.map((person) => {
      const household = byHousehold.get(person.household_id);
      const age = ageFromStoredDate(
        person.birth_date,
        person.birth_date_precision
      );

      return [
        household?.small_families.large_families.name ?? "",
        household?.small_families.name ?? "",
        household?.family_name ?? "",
        roleLabel(person.role, person.gender),
        person.full_name,
        person.gender === "female" ? t("roles.daughter") : t("roles.son"),
        person.birth_date_precision === "year"
          ? (person.birth_date?.slice(0, 4) ?? "")
          : (person.birth_date ?? ""),
        age ?? "",
        hideSensitive ? "" : (person.nni ?? ""),
        hideSensitive ? "" : (person.phone ?? ""),
        labelFrom(wilayas, person.wilaya, locale),
        person.job ?? "",
        labelFrom(educationLevels, person.education_level, locale),
        person.marital_status
          ? (maritalStatuses.find((item) => item.key === person.marital_status)?.[
              locale
            ][person.gender === "female" ? "female" : "male"] ?? "")
          : "",
        person.is_alive ? t("yes") : t("no"),
      ];
    }),
  };

  await supabase.from("audit_log").insert({
    action: "export",
    table_name: "households",
    details: {
      large,
      small,
      status: completeOnly ? "complete" : "all",
      hideSensitive,
      households: chosen.length,
      persons: people.length,
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const scope = large
    ? (chosen[0]?.small_families.large_families.name ?? "all")
    : "all";
  const asciiName = `census-${today}.xlsx`;
  const fullName = `census-${scope}-${today}.xlsx`;

  return new NextResponse(buildWorkbook([householdSheet, personSheet]), {
    headers: {
      "Content-Type": spreadsheetType,
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fullName)}`,
    },
  });
}
