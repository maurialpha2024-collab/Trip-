// Desktop sidebar. Sits on the right in Arabic and the left in French, because
// every offset here is logical (start/end) rather than left/right.

"use client";

import { LogOutIcon, PanelLeftIcon, PanelRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, setSidebarState } from "@/app/(app)/actions";
import { GeoPattern } from "@/components/census/geo-pattern";
import { Button } from "@/components/ui/button";
import type { SidebarState } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { activeHref, navItemsForRole, type NavItem, type NavRole } from "./NavItems";

type SidebarProps = {
  role: NavRole;
  fullName: string;
  state: SidebarState;
};

export function Sidebar({ role, fullName, state }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const collapsed = state === "collapsed";

  const items = navItemsForRole(role);
  const current = activeHref(
    pathname,
    items.map((item) => item.href)
  );

  const mainItems = items.filter((item) => item.group === "main");
  const adminItems = items.filter((item) => item.group === "admin");

  return (
    <aside
      className={cn(
        "bg-indigo-deep hidden shrink-0 flex-col lg:flex print:hidden",
        collapsed ? "w-18" : "w-66"
      )}
    >
      <div className="text-ochre relative h-14 shrink-0 overflow-hidden">
        <GeoPattern className="absolute inset-0 opacity-40" />
        <div className="relative flex h-full items-center px-4">
          {!collapsed ? (
            <span className="text-title-family truncate text-white">
              {t("app.name")}
            </span>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {mainItems.map((item) => (
            <li key={item.key}>
              <SidebarLink
                item={item}
                label={t(`nav.${item.key}`)}
                isActive={current === item.href}
                collapsed={collapsed}
              />
            </li>
          ))}
        </ul>

        {adminItems.length > 0 ? (
          <>
            <hr className="my-3 border-white/10" />
            <ul className="space-y-1">
              {adminItems.map((item) => (
                <li key={item.key}>
                  <SidebarLink
                    item={item}
                    label={t(`nav.${item.key}`)}
                    isActive={current === item.href}
                    collapsed={collapsed}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        <form
          action={async () => {
            await setSidebarState(collapsed ? "expanded" : "collapsed");
          }}
        >
          <Button
            type="submit"
            variant="ghost"
            className={cn(
              "w-full text-white/80 hover:bg-white/10 hover:text-white",
              collapsed ? "justify-center px-0" : "justify-start"
            )}
            aria-label={
              collapsed ? t("topBar.expandSidebar") : t("topBar.collapseSidebar")
            }
          >
            {collapsed ? <PanelLeftIcon /> : <PanelRightIcon />}
            {!collapsed ? <span>{t("topBar.collapseSidebar")}</span> : null}
          </Button>
        </form>

        {!collapsed ? (
          <div className="px-1">
            <p className="text-label truncate text-white">{fullName}</p>
            <p className="text-small text-white/60">
              {role === "admin" ? t("roles.admin") : t("roles.agent")}
            </p>
          </div>
        ) : null}

        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className={cn(
              "w-full text-white/80 hover:bg-white/10 hover:text-white",
              collapsed ? "justify-center px-0" : "justify-start"
            )}
            aria-label={t("topBar.signOut")}
          >
            <LogOutIcon />
            {!collapsed ? <span>{t("topBar.signOut")}</span> : null}
          </Button>
        </form>
      </div>
    </aside>
  );
}

type SidebarLinkProps = {
  item: NavItem;
  label: string;
  isActive: boolean;
  collapsed: boolean;
};

function SidebarLink({ item, label, isActive, collapsed }: SidebarLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "text-label rounded-control relative flex h-11 items-center gap-3 px-3 transition-[color,background-color,scale] duration-200 active:scale-[0.98]",
        isActive
          ? "bg-indigo-soft text-indigo"
          : "text-white/80 hover:bg-white/10 hover:text-white",
        collapsed && "justify-center px-0"
      )}
    >
      {isActive ? (
        <span
          aria-hidden="true"
          className="animate-in fade-in zoom-in-50 bg-ochre absolute start-0 top-1 bottom-1 w-[3px] rounded-full duration-300"
        />
      ) : null}
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {collapsed ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="truncate">{label}</span>
      )}
    </Link>
  );
}
