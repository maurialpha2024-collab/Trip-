// Loads the family tree, plus any draft being resumed, and hands both to the
// wizard. Row Level Security means an agent can only ever load their own draft.

import { getLocale } from "next-intl/server";
import { defaultLocale, isLocale } from "@/i18n/locale";
import { requireProfile } from "@/lib/auth";
import { phonePrefix } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { draftFromRows, emptyDraft, type LargeFamilyOption } from "./types";
import { Wizard } from "./wizard";

type PageProps = {
  searchParams: Promise<{ draft?: string; small?: string }>;
};

export default async function NewHouseholdPage({ searchParams }: PageProps) {
  const profile = await requireProfile();
  const isAdmin = profile.role === "admin";

  const params = await searchParams;
  const supabase = await createClient();
  const localeValue = await getLocale();
  const locale = isLocale(localeValue) ? localeValue : defaultLocale;

  // How many households each family already has is census information, so only
  // an admin gets it; an agent just picks a family.
  const [{ data: largeFamilies }, { data: stats }] = await Promise.all([
    supabase
      .from("large_families")
      .select("id, name, small_families(id, name)")
      .order("name"),
    isAdmin
      ? supabase.from("large_family_stats").select("id, household_count")
      : Promise.resolve({ data: null }),
  ]);

  const families: LargeFamilyOption[] = (largeFamilies ?? []).map((family) => ({
    id: family.id,
    name: family.name,
    smallFamilies: family.small_families.map((small) => ({
      id: small.id,
      name: small.name,
    })),
    householdCount: isAdmin
      ? Number(stats?.find((row) => row.id === family.id)?.household_count ?? 0)
      : null,
  }));

  function largeFamilyOf(smallFamilyId: string): string | null {
    return (
      families.find((family) =>
        family.smallFamilies.some((small) => small.id === smallFamilyId)
      )?.id ?? null
    );
  }

  if (params.draft) {
    const { data: household } = await supabase
      .from("households")
      .select(
        "id, status, small_family_id, family_name, wilaya, city, address_notes, has_no_children, last_step, persons(*)"
      )
      .eq("id", params.draft)
      .maybeSingle();

    // An agent can only pick up a draft. A finished household has no readable
    // people for them, so opening it here would show an empty form.
    if (household && (household.status === "draft" || isAdmin)) {
      return (
        <Wizard
          families={families}
          locale={locale}
          initialStep={household.last_step}
          initialDraft={draftFromRows(
            household,
            household.persons,
            largeFamilyOf(household.small_family_id) ?? "",
            phonePrefix
          )}
        />
      );
    }
  }

  // "Register another household in this small family" arrives here, with the
  // first two steps already answered.
  if (params.small) {
    const largeFamilyId = largeFamilyOf(params.small);

    if (largeFamilyId) {
      return (
        <Wizard
          families={families}
          locale={locale}
          initialStep={3}
          initialDraft={{
            ...emptyDraft(),
            largeFamilyId,
            smallFamilyId: params.small,
          }}
        />
      );
    }
  }

  return (
    <Wizard
      families={families}
      locale={locale}
      initialStep={1}
      initialDraft={emptyDraft()}
    />
  );
}
