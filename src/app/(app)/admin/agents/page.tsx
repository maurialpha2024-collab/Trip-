// Staff accounts. There is no public sign-up: every account is made here or
// with npm run create-user.

import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/census/page-header";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AgentsTable, type StaffRow } from "./agents-table";

// Enough recent sign-ins to find the latest one per account without reading the
// whole audit trail.
const recentLoginLimit = 2000;

export default async function AdminStaffPage() {
  await requireAdmin();

  const supabase = await createClient();
  const t = await getTranslations("nav");

  const [{ data: profiles }, { data: households }, { data: logins }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, username, role, is_active")
        .order("full_name"),
      supabase.from("households").select("created_by"),
      supabase
        .from("audit_log")
        .select("actor, at")
        .eq("action", "login")
        .order("at", { ascending: false })
        .limit(recentLoginLimit),
    ]);

  const householdsPerAgent = new Map<string, number>();
  for (const row of households ?? []) {
    householdsPerAgent.set(
      row.created_by,
      (householdsPerAgent.get(row.created_by) ?? 0) + 1
    );
  }

  // The rows arrive newest first, so the first one seen for an account is its
  // most recent sign-in.
  const lastLogin = new Map<string, string>();
  for (const row of logins ?? []) {
    if (row.actor && !lastLogin.has(row.actor)) {
      lastLogin.set(row.actor, row.at);
    }
  }

  const staff: StaffRow[] = (profiles ?? []).map((profile) => ({
    id: profile.id,
    fullName: profile.full_name,
    username: profile.username,
    role: profile.role === "admin" ? "admin" : "agent",
    isActive: profile.is_active,
    households: householdsPerAgent.get(profile.id) ?? 0,
    lastLogin: lastLogin.has(profile.id)
      ? new Date(lastLogin.get(profile.id) ?? "").toLocaleDateString("en-GB")
      : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title={t("staff")} />
      <AgentsTable staff={staff} />
    </div>
  );
}
