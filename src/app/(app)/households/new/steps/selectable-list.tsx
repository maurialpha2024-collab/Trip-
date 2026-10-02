// Search box plus big tappable tiles, shared by the large-family and
// small-family steps. Tiles are at least 64px so they are easy to hit with a
// thumb, sit two across from tablet width up, and the search folds Arabic
// spelling differences.

"use client";

import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { matchesSearch } from "@/lib/arabic";
import { cn } from "@/lib/utils";

export type SelectableItem = {
  id: string;
  name: string;
  detail?: string;
};

type SelectableListProps = {
  items: SelectableItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchLabel: string;
};

export function SelectableList({
  items,
  selectedId,
  onSelect,
  searchLabel,
}: SelectableListProps) {
  const t = useTranslations("register");
  const searchId = useId();
  const [query, setQuery] = useState("");

  const visible = items.filter((item) => matchesSearch(item.name, query));

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={searchId} className="text-label text-ink">
          {searchLabel}
        </Label>
        <Input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search")}
        />
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {visible.map((item) => {
          const isSelected = selectedId === item.id;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={isSelected}
                className={cn(
                  "rounded-card border-line bg-surface flex min-h-16 w-full items-center justify-between gap-3 border px-4 py-3 text-start transition active:scale-[0.99]",
                  isSelected
                    ? "border-indigo bg-indigo-soft"
                    : "hover:border-indigo/40 hover:bg-indigo-soft/40"
                )}
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-title-family text-ink truncate">
                    {item.name}
                  </span>
                  {item.detail ? (
                    <span className="text-small text-ink-muted">
                      {item.detail}
                    </span>
                  ) : null}
                </span>
                {isSelected ? (
                  <CheckIcon
                    className="text-indigo size-5 shrink-0"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
