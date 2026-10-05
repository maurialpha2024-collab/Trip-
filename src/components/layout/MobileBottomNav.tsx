// The agent's phone navigation: two destinations and nothing else. Registering
// a household is a solid button because it is what an agent does all day; the
// other is a plain tab. Language, theme and sign-out live in the top bar, so
// this stays a thumb-reach bar rather than a menu.

"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { activeHref, navItemsForRole, type NavRole } from "./NavItems";

export function MobileBottomNav({ role }: { role: NavRole }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const items = navItemsForRole(role);
  const current = activeHref(
    pathname,
    items.map((item) => item.href)
  );
  const activeIndex = items.findIndex((item) => item.href === current);

  return (
    <nav
      aria-label={t("label")}
      className="border-line bg-surface/95 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden print:hidden"
    >
      {/* One marker for the whole bar. This bar lives in the layout and is not
          rebuilt between pages, so the marker slides from one half to the
          other instead of jumping. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute start-0 top-0 flex w-1/2 justify-center transition-[translate,opacity] duration-300 ease-out",
          activeIndex === 1 && "translate-x-full rtl:-translate-x-full",
          activeIndex === -1 && "opacity-0"
        )}
      >
        <span className="bg-ochre h-[3px] w-12 rounded-b-full" />
      </span>

      <ul className="grid grid-cols-2 gap-2 p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.href;
          const isPrimary = item.key === "register";

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-label rounded-control relative flex h-13 items-center justify-center gap-2 overflow-hidden px-3 transition active:scale-[0.98]",
                  isPrimary
                    ? "bg-indigo text-primary-foreground"
                    : isActive
                      ? "bg-indigo-soft text-indigo"
                      : "text-ink-muted"
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="truncate">{t(item.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
