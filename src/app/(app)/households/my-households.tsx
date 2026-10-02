// "أسرتي": what this agent has registered. Unfinished drafts come first so the
// agent sees what is still owed, then the finished households, paged. Nothing
// here shows a person: no names, NNI or phone numbers. The data comes from the
// my_households view, which cannot expose them.

import { ClipboardListIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/census/empty-state";
import { PageHeader } from "@/components/census/page-header";
import { Pagination } from "@/components/census/Pagination";
import { Button } from "@/components/ui/button";
import { normalizeArabic } from "@/lib/arabic";
import { createClient } from "@/lib/supabase/server";
import { HouseholdsFilters } from "./households-filters";
import { listHref, pageFrom, pageSize, type ListParams } from "./list-params";
import { MyDrafts } from "./my-drafts";
import { MyFinishedList } from "./my-finished-list";

// An agent rarely has more than a few drafts open; this only stops a runaway
// list from pushing the finished households off the screen.
const draftLimit = 12;

// % and _ are wildcards in ILIKE, so a typed one must not widen the search.
function escapeForLike(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export async function MyHouseholds({ params }: { params: ListParams }) {
  const supabase = await createClient();
  const t = await getTranslations("mine");
  const tList = await getTranslations("list");

  const currentPage = pageFrom(params.page);
  const from = (currentPage - 1) * pageSize;
  const pattern = params.q
    ? `%${escapeForLike(normalizeArabic(params.q))}%`
    : null;

  // One builder per status, so the search applies to both sections alike.
  function byStatus(status: "draft" | "complete") {
    const query = supabase
      .from("my_households")
      .select("*", { count: "exact" })
      .eq("status", status)
      .order("created_at", { ascending: false });

    return pattern ? query.ilike("search_text", pattern) : query;
  }

  const [drafts, finished] = await Promise.all([
    byStatus("draft").limit(draftLimit),
    byStatus("complete").range(from, from + pageSize - 1),
  ]);

  const draftRows = drafts.data ?? [];
  const finishedRows = finished.data ?? [];
  const draftTotal = drafts.count ?? 0;
  const finishedTotal = finished.count ?? 0;
  const total = draftTotal + finishedTotal;
  const totalPages = Math.max(Math.ceil(finishedTotal / pageSize), 1);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("title")}
        description={t("count", { count: String(total) })}
      />

      <HouseholdsFilters
        largeFamilies={null}
        agents={null}
        locale="ar"
        searchPlaceholder={t("search")}
        showStatus={false}
      />

      {total === 0 ? (
        params.q ? (
          <p className="text-body text-ink-muted rounded-card border-line bg-surface border border-dashed p-6 text-center">
            {tList("noResults")}
          </p>
        ) : (
          <EmptyState
            icon={ClipboardListIcon}
            message={t("empty")}
            action={
              <Button asChild size="lg">
                <Link href="/households/new">{t("registerFirst")}</Link>
              </Button>
            }
          />
        )
      ) : (
        <>
          {draftRows.length > 0 ? (
            <MyDrafts rows={draftRows} total={draftTotal} />
          ) : null}

          <MyFinishedList
            rows={finishedRows}
            total={finishedTotal}
            footer={
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                hrefFor={(page) => listHref(params, page)}
              />
            }
          />
        </>
      )}
    </div>
  );
}
