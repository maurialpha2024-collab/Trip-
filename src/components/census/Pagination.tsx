// Previous / next with "page 2 of 5" between them, shared by the admin list and
// the agent's own list. Renders nothing when everything fits on one page.

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  hrefFor: (page: number) => string;
};

export async function Pagination({
  currentPage,
  totalPages,
  hrefFor,
}: PaginationProps) {
  const t = await getTranslations("list");

  if (totalPages <= 1) {
    return null;
  }

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav className="flex items-center justify-between gap-3">
      <Button asChild={hasPrevious} variant="outline" disabled={!hasPrevious}>
        {hasPrevious ? (
          <Link href={hrefFor(currentPage - 1)}>{t("previous")}</Link>
        ) : (
          <span>{t("previous")}</span>
        )}
      </Button>

      <span className="text-small text-ink-muted">
        {t("page", {
          page: String(currentPage),
          total: String(totalPages),
        })}
      </span>

      <Button asChild={hasNext} variant="outline" disabled={!hasNext}>
        {hasNext ? (
          <Link href={hrefFor(currentPage + 1)}>{t("next")}</Link>
        ) : (
          <span>{t("next")}</span>
        )}
      </Button>
    </nav>
  );
}
