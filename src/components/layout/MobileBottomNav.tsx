// The agent's phone navigation: two destinations and nothing else. Register a
// household is the raised, primary one because it is what an agent does all
// day. Language, theme and sign-out live in the top bar, so this stays a
// two-thumb-reach bar rather than a menu.

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

  return (
    <nav className="border-line bg-surface fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] lg:hidden print:hidden">
      <ul className="flex items-stretch">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.href;
          const isPrimary = item.key === "register";

          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 px-2 text-center",
                  isActive ? "text-indigo" : "text-ink-muted"
                )}
              >
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="bg-ochre absolute inset-x-6 top-0 h-[3px] rounded-b-full"
                  />
                ) : null}

                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full",
                    isPrimary && "bg-indigo text-white"
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-small leading-tight">
                  {t(item.key)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
