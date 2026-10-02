// Top bar: household search, language and theme switches, and the user menu.
// On phones it also carries the ☰ button that opens the admin navigation.

"use client";

import { LogOutIcon, MoonIcon, SearchIcon, SunIcon, UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setLocale, setTheme, signOut } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/locale";
import type { Theme } from "@/lib/preferences";
import { MobileMenuSheet } from "./MobileNav";
import type { NavRole } from "./NavItems";

type TopBarProps = {
  role: NavRole;
  fullName: string;
  locale: Locale;
  theme: Theme;
};

export function TopBar({ role, fullName, locale, theme }: TopBarProps) {
  const t = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const roleLabel = role === "admin" ? t("roles.admin") : t("roles.agent");

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/households?q=${encodeURIComponent(trimmed)}` : "/households"
    );
  }

  return (
    <header className="border-line bg-surface flex h-14 shrink-0 items-center gap-2 border-b px-4 print:hidden">
      {role === "admin" ? (
        <MobileMenuSheet
          role={role}
          fullName={fullName}
          locale={locale}
          theme={theme}
        />
      ) : null}

      <span className="text-title-family text-ink truncate lg:hidden">
        {t("app.name")}
      </span>

      <form onSubmit={search} className="hidden flex-1 lg:block">
        <label htmlFor="household-search" className="sr-only">
          {t("topBar.search")}
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
            placeholder={t("topBar.search")}
            className="ps-9"
          />
        </div>
      </form>

      <div className="ms-auto flex items-center gap-1">
        <form
          action={async () => {
            await setLocale(locale === "ar" ? "fr" : "ar");
          }}
        >
          <Button type="submit" variant="ghost" aria-label={t("topBar.language")}>
            {locale === "ar" ? "FR" : "ع"}
          </Button>
        </form>

        <form
          action={async () => {
            await setTheme(theme === "dark" ? "light" : "dark");
          }}
        >
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label={
              theme === "dark" ? t("topBar.lightMode") : t("topBar.darkMode")
            }
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </Button>
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("topBar.userMenu")}>
              <UserIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52">
            <DropdownMenuLabel>
              <span className="block truncate">{fullName}</span>
              <span className="text-small text-ink-muted block">
                {roleLabel}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex h-11 w-full items-center gap-2 text-start"
                >
                  <LogOutIcon className="size-4" aria-hidden="true" />
                  {t("topBar.signOut")}
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
