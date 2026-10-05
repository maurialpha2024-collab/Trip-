// The agent's two pages as tabs in the desktop top bar. Agents have no sidebar:
// a whole column for two links wasted the width the registration form needs.
// On phones the same two links live in the bottom bar instead.

"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { activeHref, navItemsForRole } from "./NavItems";

export function AgentTabs() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const items = navItemsForRole("agent");
  const current = activeHref(
    pathname,
    items.map((item) => item.href)
  );

  return (
    <nav aria-label={t("label")} className="hidden h-full lg:block">
      <ul className="flex h-full items-stretch gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.href;

          return (
            <li key={item.key} className="flex">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-label relative flex items-center gap-2 px-4 transition-colors",
                  isActive ? "text-indigo" : "text-ink-muted hover:text-ink"
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {t(item.key)}
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="animate-sweep bg-ochre absolute inset-x-3 bottom-0 h-[3px] rounded-t-full"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
