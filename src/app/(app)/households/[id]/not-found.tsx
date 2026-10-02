// Shown when a household does not exist, and when Row Level Security has made
// another agent's household invisible. Both look the same on purpose: the page
// must not reveal that a record exists but belongs to someone else.

import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/census/empty-state";
import { Button } from "@/components/ui/button";

export default async function HouseholdNotFound() {
  const t = await getTranslations("detail");

  return (
    <EmptyState
      icon={SearchXIcon}
      message={t("notFound")}
      action={
        <Button asChild>
          <Link href="/households">{t("backToList")}</Link>
        </Button>
      }
    />
  );
}
