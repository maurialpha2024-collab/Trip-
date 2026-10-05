// Shown straight after a household is completed: confirmation, a head count,
// and the two things an agent does next. The count comes from my_households,
// because once a household is complete its people are no longer readable by
// the agent who registered it.

import { CheckCircle2Icon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function HouseholdSavedPage({ params }: PageProps) {
  await requireProfile();

  const { id } = await params;
  const supabase = await createClient();
  const t = await getTranslations("saved");

  const [{ data: household }, { data: summary }] = await Promise.all([
    supabase
      .from("households")
      .select("id, family_name, small_family_id, small_families(name)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("my_households")
      .select("person_count")
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (!household) {
    notFound();
  }

  return (
    <div className="stagger-rise mx-auto max-w-lg space-y-6 py-8 text-center">
      <div className="bg-success/10 mx-auto flex size-24 items-center justify-center rounded-full">
        <CheckCircle2Icon
          className="animate-pop text-success size-14"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-1">
        <h1 className="text-heading text-ink">{t("title")}</h1>
        <p className="text-title-page text-ink">{household.family_name}</p>
        <p className="text-small text-ink-muted">
          {t("summary", { count: String(Number(summary?.person_count ?? 0)) })}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Button asChild>
          <Link href={`/households/new?small=${household.small_family_id}`}>
            {t("another", { family: household.small_families?.name ?? "" })}
          </Link>
        </Button>

        <Button asChild variant="outline">
          <Link href="/households">{t("view")}</Link>
        </Button>
      </div>
    </div>
  );
}
