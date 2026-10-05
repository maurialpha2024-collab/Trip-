// Export the census to Excel, and see who exported what recently.

import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/census/page-header";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ExportForm, type ExportFamily } from "./export-form";

const recentLimit = 10;

export default async function AdminExportPage() {
  await requireAdmin();

  const supabase = await createClient();
  const t = await getTranslations("export");
  const tNav = await getTranslations("nav");

  const [{ data: largeFamilies }, { data: recent }] = await Promise.all([
    supabase
      .from("large_families")
      .select("id, name, small_families(id, name)")
      .order("name"),
    supabase
      .from("audit_log")
      .select("id, at, details, actor:profiles!audit_log_actor_fkey(full_name)")
      .eq("action", "export")
      .order("at", { ascending: false })
      .limit(recentLimit),
  ]);

  const families: ExportFamily[] = (largeFamilies ?? []).map((family) => ({
    id: family.id,
    name: family.name,
    smallFamilies: family.small_families,
  }));

  return (
    <div className="stagger-rise space-y-6">
      <PageHeader title={tNav("export")} />

      <ExportForm families={families} />

      <section className="space-y-3">
        <h2 className="text-heading text-ink text-start">{t("recent")}</h2>

        {(recent ?? []).length === 0 ? (
          <p className="text-body text-ink-muted rounded-card border-line bg-surface border border-dashed p-6 text-start">
            {t("noRecent")}
          </p>
        ) : (
          <ul className="stagger-rise rounded-card border-line bg-surface divide-line divide-y border">
            {(recent ?? []).map((entry) => {
              const details =
                entry.details === null || typeof entry.details !== "object"
                  ? {}
                  : (entry.details as Record<string, unknown>);

              return (
                <li key={entry.id} className="p-4 text-start">
                  <p className="text-label text-ink">
                    {entry.actor?.full_name ?? "—"}
                  </p>
                  <p className="text-small text-ink-muted">
                    {new Date(entry.at).toLocaleString("en-GB")} ·{" "}
                    {t("preview", {
                      households: String(details.households ?? 0),
                      persons: String(details.persons ?? 0),
                    })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
