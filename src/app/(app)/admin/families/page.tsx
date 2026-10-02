// The family structure agents pick from in steps 1 and 2 of the registration
// form. Admin only, enforced on the server.

import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/census/page-header";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FamiliesTree, type TreeLargeFamily } from "./families-tree";

export default async function AdminFamiliesPage() {
  await requireAdmin();

  const supabase = await createClient();
  const t = await getTranslations();

  const [{ data: largeFamilies }, { data: smallFamilies }, { data: households }] =
    await Promise.all([
      supabase.from("large_families").select("id, name, notes").order("name"),
      supabase
        .from("small_families")
        .select("id, name, notes, large_family_id")
        .order("name"),
      supabase.from("households").select("small_family_id"),
    ]);

  const perSmallFamily = new Map<string, number>();
  for (const row of households ?? []) {
    perSmallFamily.set(
      row.small_family_id,
      (perSmallFamily.get(row.small_family_id) ?? 0) + 1
    );
  }

  const families: TreeLargeFamily[] = (largeFamilies ?? []).map((family) => ({
    id: family.id,
    name: family.name,
    notes: family.notes ?? "",
    smallFamilies: (smallFamilies ?? [])
      .filter((small) => small.large_family_id === family.id)
      .map((small) => ({
        id: small.id,
        name: small.name,
        notes: small.notes ?? "",
        households: perSmallFamily.get(small.id) ?? 0,
      })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.families")}
        description={t("families.summary", {
          large: String(families.length),
          small: String((smallFamilies ?? []).length),
        })}
      />

      <FamiliesTree families={families} />
    </div>
  );
}
