// One source of truth for navigation, so the sidebar, the phone bar and the
// admin sheet can never drift apart. Labels live in the message files; only
// the key is stored here.

import type { LucideIcon } from "lucide-react";
import {
  ClipboardListIcon,
  DownloadIcon,
  GitBranchIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

export type NavRole = "admin" | "agent";

export type NavItem = {
  key: string;
  href: string;
  icon: LucideIcon;
  roles: NavRole[];
  group: "main" | "admin";
};

// Agents get exactly two pages: register a household, and the list of what they
// registered. The order here is the order each role sees.
export const navItems: NavItem[] = [
  {
    key: "dashboard",
    href: "/admin",
    icon: LayoutDashboardIcon,
    roles: ["admin"],
    group: "main",
  },
  {
    key: "households",
    href: "/households",
    icon: UsersIcon,
    roles: ["admin"],
    group: "main",
  },
  {
    key: "register",
    href: "/households/new",
    icon: UserPlusIcon,
    roles: ["agent", "admin"],
    group: "main",
  },
  {
    key: "mine",
    href: "/households",
    icon: ClipboardListIcon,
    roles: ["agent"],
    group: "main",
  },
  {
    key: "families",
    href: "/admin/families",
    icon: GitBranchIcon,
    roles: ["admin"],
    group: "admin",
  },
  {
    key: "staff",
    href: "/admin/agents",
    icon: ShieldCheckIcon,
    roles: ["admin"],
    group: "admin",
  },
  {
    key: "export",
    href: "/admin/export",
    icon: DownloadIcon,
    roles: ["admin"],
    group: "admin",
  },
];

export function navItemsForRole(role: NavRole): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role));
}

// Longest match wins, so /households/new does not also light up /households.
export function activeHref(pathname: string, hrefs: string[]): string | null {
  const matches = hrefs.filter(
    (href) => pathname === href || pathname.startsWith(`${href}/`)
  );

  return matches.sort((a, b) => b.length - a.length)[0] ?? null;
}
