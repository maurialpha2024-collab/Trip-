// Search box plus big tappable rows, shared by the large-family and
// small-family steps. Rows are at least 56px so they are easy to hit with a
// thumb, and the search folds Arabic spelling differences.

"use client";

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

      <ul className="space-y-2">
        {visible.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              aria-pressed={selectedId === item.id}
              className={cn(
                "rounded-card border-line bg-surface flex min-h-14 w-full flex-col justify-center gap-0.5 border px-4 py-3 text-start transition-colors",
                selectedId === item.id
                  ? "border-indigo bg-indigo-soft"
                  : "hover:border-indigo/40"
              )}
            >
              <span className="text-title-family text-ink">{item.name}</span>
              {item.detail ? (
                <span className="text-small text-ink-muted">{item.detail}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
