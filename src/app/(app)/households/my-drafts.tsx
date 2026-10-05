// The top of أسرتي: households the agent started and has not finished, each
// with the step it stopped at and a way straight back into it. Shown first
// because an unfinished household is the one thing the agent still owes.

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/lib/supabase/types";
import { stepKeys } from "./new/types";

type MyDraftsProps = {
  rows: Tables<"my_households">[];
  total: number;
};

export async function MyDrafts({ rows, total }: MyDraftsProps) {
  const t = await getTranslations();
  const locale = await getLocale();
  // The arrow points the way the text reads: left in Arabic, right in French.
  const ForwardIcon = locale === "ar" ? ArrowLeftIcon : ArrowRightIcon;

  return (
    <section aria-labelledby="drafts-title" className="space-y-3">
      <h2 id="drafts-title" className="text-heading text-ink flex items-center gap-2 text-start">
        {t("mine.draftsTitle")}
        <span className="text-small bg-ochre/15 text-ink rounded-control px-2 py-0.5 font-medium tabular-nums">
          {total}
        </span>
      </h2>

      <ul className="stagger-rise grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => {
          const step = Math.min(Math.max(row.last_step ?? 3, 1), 7);

          return (
            <li
              key={row.id}
              className="rounded-card border-line bg-surface border-s-ochre flex flex-col gap-4 border border-s-4 p-4 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-20px_var(--indigo)]"
            >
              <div className="min-w-0 space-y-1 text-start">
                <p className="text-title-family text-ink truncate">
                  {row.family_name}
                </p>
                <p className="text-small text-ink-muted truncate">
                  {row.large_family_name}{" "}
                  <span className="text-ochre">›</span> {row.small_family_name}
                </p>
                <p className="text-small text-ink pt-1">
                  {t("mine.stoppedAt", {
                    step: String(step),
                    name: t(`steps.${stepKeys[step - 1]}`),
                  })}
                </p>
              </div>

              <Button asChild variant="outline" className="mt-auto w-full active:scale-[0.98]">
                <Link href={`/households/new?draft=${row.id}`}>
                  {t("mine.continue")}
                  <ForwardIcon aria-hidden="true" />
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
