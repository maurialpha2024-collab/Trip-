// Server actions for the app shell: display preferences and signing out.
// All three preferences live in cookies, so they must be set on the server.

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { localeCookieName, type Locale } from "@/i18n/locale";
import {
  sidebarCookieName,
  themeCookieName,
  type SidebarState,
  type Theme,
} from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

const oneYearInSeconds = 60 * 60 * 24 * 365;

async function remember(name: string, value: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(name, value, {
    path: "/",
    maxAge: oneYearInSeconds,
    sameSite: "lax",
  });
}

export async function setLocale(locale: Locale): Promise<void> {
  await remember(localeCookieName, locale);
  revalidatePath("/", "layout");
}

export async function setTheme(theme: Theme): Promise<void> {
  await remember(themeCookieName, theme);
  revalidatePath("/", "layout");
}

export async function setSidebarState(state: SidebarState): Promise<void> {
  await remember(sidebarCookieName, state);
  revalidatePath("/", "layout");
}

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
