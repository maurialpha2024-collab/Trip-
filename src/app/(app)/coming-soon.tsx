// Placeholder body for routes that later tasks fill in, so every link in the
// navigation already opens a real page.

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/census/page-header";

export function ComingSoon({ title }: { title: string }) {
  const t = useTranslations("common");

  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <p className="text-body text-ink-muted text-start">{t("soon")}</p>
    </div>
  );
}
