// Whether a household record is finished or still a draft.

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

export type HouseholdStatus = "complete" | "draft";

export function StatusBadge({ status }: { status: HouseholdStatus }) {
  const t = useTranslations("status");

  return (
    <Badge
      className={
        status === "complete"
          ? "bg-success/15 text-success"
          : "bg-warning/15 text-warning"
      }
    >
      {t(status)}
    </Badge>
  );
}
