// Shown inside the frame while any signed-in page fetches its data. The
// database is slow to reach from here, so without this a tap on a link looks
// like nothing happened. The shape follows what most pages have: a title, a
// row of cards, then a list.

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

const cards = ["first", "second", "third", "fourth"];
const rows = ["first", "second", "third", "fourth", "fifth"];

export default function AppLoading() {
  const t = useTranslations("common");

  return (
    <div role="status" className="space-y-6">
      <span className="sr-only">{t("loading")}</span>

      <div className="border-line space-y-3 border-b pb-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Skeleton key={card} className="rounded-card h-24" />
        ))}
      </div>

      <div className="rounded-card border-line bg-surface divide-line divide-y border">
        {rows.map((row) => (
          <div key={row} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-40 max-w-full" />
              <Skeleton className="h-4 w-56 max-w-full" />
            </div>
            <Skeleton className="h-6 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
