// One household, shown as a family. Row Level Security means another agent's
// household simply is not found, which is what the 404 here says.

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { StatusBadge } from "@/components/census/status-badge";
import { Button } from "@/components/ui/button";
import { defaultLocale, isLocale } from "@/i18n/locale";
import { requireProfile } from "@/lib/auth";
import { phonePrefix, wilayas } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { draftFromRows } from "../new/types";
import { FamilyTree } from "./family-tree";
import { HouseholdActions } from "./household-actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function HouseholdPage({ params }: PageProps) {
  const profile = await requireProfile();

  // Agents never open a saved household: the database already hides its people
  // from them, and this page is all people. They get their own list instead.
  if (profile.role !== "admin") {
    redirect("/households");
  }

  const { id } = await params;
  const supabase = await createClient();
  const t = await getTranslations();

  const localeValue = await getLocale();
  const locale = isLocale(localeValue) ? localeValue : defaultLocale;

  // The two queries do not depend on each other, so they go out together.
  const [{ data: household }, { data: smallFamilies }] = await Promise.all([
    supabase
      .from("households")
      .select(
        "id, family_name, wilaya, city, address_notes, status, has_no_children, small_family_id, created_at, updated_at, persons(*), small_families(id, name, large_families(id, name)), recorder:profiles!households_created_by_fkey(full_name)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("small_families").select("id, name").order("name"),
  ]);

  if (!household) {
    notFound();
  }

  const largeFamily = household.small_families?.large_families;
  const draft = draftFromRows(
    household,
    household.persons,
    largeFamily?.id ?? "",
    phonePrefix
  );

  const isAdmin = profile.role === "admin";
  const isDraft = household.status === "draft";
  const males = household.persons.filter(
    (person) => person.gender === "male"
  ).length;

  const wilayaLabel =
    wilayas.find((item) => item.key === household.wilaya)?.[locale] ?? null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-small text-ink-muted text-start">
          {largeFamily?.name} <span className="text-ochre">›</span>{" "}
          {household.small_families?.name}
        </p>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-title-page text-ink text-start">
              {household.family_name}
            </h1>
            <p className="text-small text-ink-muted flex flex-wrap items-center gap-2 text-start">
              {[wilayaLabel, household.city].filter(Boolean).join("، ") ||
                t("fields.empty")}
              <StatusBadge status={isDraft ? "draft" : "complete"} />
            </p>
          </div>

          <HouseholdActions
            householdId={household.id}
            locale={locale}
            isAdmin={isAdmin}
            canDelete={isAdmin || isDraft}
            smallFamilies={smallFamilies ?? []}
            details={{
              smallFamilyId: household.small_family_id,
              familyName: household.family_name,
              wilaya: household.wilaya ?? "",
              city: household.city ?? "",
              addressNotes: household.address_notes ?? "",
            }}
          />
        </div>
      </div>

      {isDraft ? (
        <div className="bg-warning/10 rounded-control flex flex-wrap items-center justify-between gap-3 p-3 print:hidden">
          <p className="text-small text-warning text-start">
            {t("detail.draftBar")}
          </p>
          <Button asChild variant="outline">
            <Link href={`/households/new?draft=${household.id}`}>
              {t("detail.continueRegistration")}
            </Link>
          </Button>
        </div>
      ) : null}

      <FamilyTree
        householdId={household.id}
        father={draft.father}
        mothers={draft.mothers}
        childPeople={draft.children}
        locale={locale}
        canEdit
        continueHref={`/households/new?draft=${household.id}`}
      />

      <footer className="border-line space-y-1 border-t pt-4">
        <p className="text-small text-ink-muted text-start">
          {t("detail.summary", {
            people: String(household.persons.length),
            males: String(males),
            females: String(household.persons.length - males),
          })}
        </p>
        <p className="text-small text-ink-muted text-start">
          {t("detail.recordedBy", {
            agent: household.recorder?.full_name ?? "—",
            date: new Date(household.created_at).toLocaleDateString("en-GB"),
          })}
          {" · "}
          {t("detail.lastEdit", {
            date: new Date(household.updated_at).toLocaleDateString("en-GB"),
          })}
        </p>
      </footer>
    </div>
  );
}
