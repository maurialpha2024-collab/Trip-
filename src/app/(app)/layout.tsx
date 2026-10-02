// The frame around every signed-in page: sidebar on the outer edge, top bar
// above it, and a bottom bar on phones for agents.

import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import type { NavRole } from "@/components/layout/NavItems";
import { SessionTimer } from "@/components/layout/SessionTimer";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Toaster } from "@/components/ui/sonner";
import { defaultLocale, isLocale } from "@/i18n/locale";
import { requireProfile } from "@/lib/auth";
import {
  defaultSidebarState,
  defaultTheme,
  isSidebarState,
  isTheme,
  sidebarCookieName,
  themeCookieName,
} from "@/lib/preferences";

export default async function AppLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const profile = await requireProfile();
  const role: NavRole = profile.role === "admin" ? "admin" : "agent";

  const localeValue = await getLocale();
  const locale = isLocale(localeValue) ? localeValue : defaultLocale;

  const cookieStore = await cookies();
  const storedTheme = cookieStore.get(themeCookieName)?.value;
  const theme = isTheme(storedTheme) ? storedTheme : defaultTheme;
  const storedSidebar = cookieStore.get(sidebarCookieName)?.value;
  const sidebarState = isSidebarState(storedSidebar)
    ? storedSidebar
    : defaultSidebarState;

  const isAgent = role === "agent";

  return (
    <div className="bg-canvas flex min-h-dvh">
      <SessionTimer />
      <Toaster position="top-center" />

      <Sidebar role={role} fullName={profile.full_name} state={sidebarState} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          role={role}
          fullName={profile.full_name}
          locale={locale}
          theme={theme}
        />

        <main
          className={`flex-1 px-4 py-6 lg:px-8 lg:pb-8 ${isAgent ? "pb-24" : "pb-6"}`}
        >
          <div className="mx-auto w-full max-w-[1200px]">{children}</div>
        </main>
      </div>

      {isAgent ? (
        <MobileBottomNav role={role} />
      ) : null}
    </div>
  );
}
