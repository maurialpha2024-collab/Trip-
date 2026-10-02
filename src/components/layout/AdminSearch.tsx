// The admin's household search in the desktop top bar. Agents do not get it:
// their only list is أسرتي, which has its own search box.

"use client";

import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";

export function AdminSearch() {
  const t = useTranslations("topBar");
  const router = useRouter();
  const [query, setQuery] = useState("");

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/households?q=${encodeURIComponent(trimmed)}` : "/households"
    );
  }

  return (
    <form onSubmit={search} className="hidden flex-1 lg:block">
      <label htmlFor="household-search" className="sr-only">
        {t("search")}
      </label>
      <div className="relative max-w-md">
        <SearchIcon
          className="text-ink-muted pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          id="household-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search")}
          className="ps-9"
        />
      </div>
    </form>
  );
}
