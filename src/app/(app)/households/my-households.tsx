// "أسرتي": what this agent has registered, as a ledger hanging off the ochre
// rail. A finished household is a filled dot, a draft is a ring with a way to
// continue it. Nothing here shows a person: no names, NNI or phone numbers.
// The data comes from the my_households view, which cannot expose them.

import { ClipboardListIcon, UserPlusIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/census/empty-state";
import { PageHeader } from "@/components/census/page-header";
import { Pagination } from "@/components/census/Pagination";
import { StatusBadge } from "@/components/census/status-badge";
import { Button } from "@/components/ui/button";
import { normalizeArabic } from "@/lib/arabic";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { HouseholdsFilters } from "./households-filters";
import { listHref, pageFrom, pageSize, type ListParams } from "./list-params";

// % and _ are wildcards in ILIKE, so a typed one must not widen the search.
function escapeForLike(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export async function MyHouseholds({ params }: { params: ListParams }) {
  const supabase = await createClient();
  const t = await getTranslations("mine");
  const tList = await getTranslations("list");
  const tNav = await getTranslations("nav");

  const currentPage = pageFrom(params.page);
  const from = (currentPage - 1) * pageSize;

  let query = supabase
    .from("my_households")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (params.q) {
    query = query.ilike(
      "search_text",
      `%${escapeForLike(normalizeArabic(params.q))}%`
    );
  }
  if (params.status === "complete" || params.status === "draft") {
    query = query.eq("status", params.status);
  }

  const { data, count } = await query;
  const rows = data ?? [];

  const total = count ?? 0;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const hasFilters = Boolean(params.q || params.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("count", { count: String(total) })}
        actions={
          <Button asChild>
            <Link href="/households/new">
              <UserPlusIcon />
              {tNav("register")}
            </Link>
          </Button>
        }
      />

      <HouseholdsFilters
        largeFamilies={null}
        agents={null}
        locale="ar"
        searchPlaceholder={t("search")}
      />

      {rows.length === 0 ? (
        hasFilters ? (
          <p className="text-body text-ink-muted rounded-card border-line bg-surface border border-dashed p-6 text-center">
            {tList("noResults")}
          </p>
        ) : (
          <EmptyState
            icon={ClipboardListIcon}
            message={t("empty")}
            action={
              <Button asChild>
                <Link href="/households/new">{t("registerFirst")}</Link>
              </Button>
            }
          />
        )
      ) : (
        <>
          <ol className="border-ochre/40 ms-2 space-y-3 border-s-2">
            {rows.map((row) => {
              const isDraft = row.status !== "complete";

              return (
                <li key={row.id} className="relative ps-6">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "border-ochre absolute top-6 -start-[7px] size-3 rounded-full border-2",
                      isDraft ? "bg-canvas" : "bg-ochre"
                    )}
                  />

                  <div className="rounded-card border-line bg-surface flex flex-wrap items-center justify-between gap-3 border p-4">
                    <div className="min-w-0 text-start">
                      <p className="text-title-family text-ink truncate">
                        {row.family_name}
                      </p>
                      <p className="text-small text-ink-muted">
                        {row.large_family_name}{" "}
                        <span className="text-ochre">›</span>{" "}
                        {row.small_family_name}
                      </p>
                      <p className="text-small text-ink-muted mt-1">
                        {isDraft
                          ? t("draftStep", { step: String(row.last_step ?? 3) })
                          : t("people", {
                              count: String(Number(row.person_count ?? 0)),
                            })}
                        {" · "}
                        {row.created_at
                          ? new Date(row.created_at).toLocaleDateString("en-GB")
                          : ""}
                      </p>
                    </div>

                    {isDraft ? (
                      <Button asChild variant="outline">
                        <Link href={`/households/new?draft=${row.id}`}>
                          {t("continue")}
                        </Link>
                      </Button>
                    ) : (
                      <StatusBadge status="complete" />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hrefFor={(page) => listHref(params, page)}
          />
        </>
      )}
    </div>
  );
}
