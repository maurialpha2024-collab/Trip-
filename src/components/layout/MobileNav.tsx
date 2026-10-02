// Phone navigation for admins: the full list, and the account actions, in a
// sheet behind ☰. Agents have a separate two-item bar (MobileBottomNav).

"use client";

import { LogOutIcon, MenuIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { setLocale, setTheme, signOut } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Locale } from "@/i18n/locale";
import type { Theme } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { activeHref, navItemsForRole, type NavRole } from "./NavItems";

type SheetProps = {
  role: NavRole;
  fullName: string;
  locale: Locale;
  theme: Theme;
  trigger: ReactNode;
};

function NavSheet({ role, fullName, locale, theme, trigger }: SheetProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const items = navItemsForRole(role);
  const current = activeHref(
    pathname,
    items.map((item) => item.href)
  );

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={locale === "ar" ? "right" : "left"} className="p-0">
        <SheetHeader className="border-line border-b">
          <SheetTitle className="text-title-family text-ink text-start">
            {t("app.name")}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = current === item.href;

              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "text-label rounded-control flex h-11 items-center gap-3 px-3",
                      isActive
                        ? "bg-indigo-soft text-indigo font-semibold"
                        : "text-ink hover:bg-indigo-soft/50"
                    )}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden="true" />
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-line space-y-2 border-t p-3">
          <div className="px-1">
            <p className="text-label text-ink truncate">{fullName}</p>
            <p className="text-small text-ink-muted">
              {role === "admin" ? t("roles.admin") : t("roles.agent")}
            </p>
          </div>

          <div className="flex gap-2">
            <form
              className="flex-1"
              action={async () => {
                await setLocale(locale === "ar" ? "fr" : "ar");
              }}
            >
              <Button type="submit" variant="outline" className="w-full">
                {locale === "ar" ? "FR" : "ع"}
              </Button>
            </form>

            <form
              className="flex-1"
              action={async () => {
                await setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              <Button type="submit" variant="outline" className="w-full">
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                {theme === "dark" ? t("topBar.lightMode") : t("topBar.darkMode")}
              </Button>
            </form>
          </div>

          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full justify-start">
              <LogOutIcon />
              {t("topBar.signOut")}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MobileMenuSheet(props: Omit<SheetProps, "trigger">) {
  const t = useTranslations();

  return (
    <NavSheet
      {...props}
      trigger={
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("topBar.openMenu")}>
          <MenuIcon />
        </Button>
      }
    />
  );
}
